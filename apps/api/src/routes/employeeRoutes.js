import express from 'express';
import crypto from 'node:crypto';
import { CompanyInvitation, CompanyMember, User, Company } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS, ROLES } from '@ewnet/shared';
import { inviteEmployeeSchema } from '@ewnet/validation';
import { sendInvitationEmail } from '../services/emailService.js';
import { logAuditEvent } from '../services/auditService.js';
import { env } from '../config/env.js';

const router = express.Router();

/**
 * Invite an employee to company
 */
router.post('/companies/me/invitations', authenticate, requirePermission(PERMISSIONS.INVITE_EMPLOYEES), async (req, res, next) => {
  try {
    const { email, role } = inviteEmployeeSchema.parse(req.body);

    // Check if user is already a member of this company
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingMember = await CompanyMember.findOne({ companyId: req.companyId, userId: existingUser._id, status: 'active' });
      if (existingMember) {
        return res.status(409).json({ success: false, error: 'User is already an active member of this company.' });
      }
    }

    // Check if active pending invitation already exists
    const existingInvite = await CompanyInvitation.findOne({
      companyId: req.companyId,
      email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvite) {
      return res.status(409).json({ success: false, error: 'A pending invitation for this email already exists.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const invitation = await CompanyInvitation.create({
      companyId: req.companyId,
      email,
      role,
      tokenHash,
      invitedBy: req.user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    const company = await Company.findById(req.companyId);
    const inviteLink = `${env.WEB_URL}/invitations/${rawToken}`;

    await sendInvitationEmail({
      to: email,
      businessName: company?.businessName || 'Ewnet Retailer',
      role,
      invitationLink: inviteLink
    });

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'EMPLOYEE_INVITED',
      resourceType: 'CompanyInvitation',
      resourceId: invitation._id,
      metadata: { email, role },
      req
    });

    res.status(201).json({
      success: true,
      message: `Invitation successfully sent to ${email}`,
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * List pending invitations for active company
 */
router.get('/companies/me/invitations', authenticate, requirePermission(PERMISSIONS.INVITE_EMPLOYEES), async (req, res, next) => {
  try {
    const invitations = await CompanyInvitation.find({ companyId: req.companyId, status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('invitedBy', 'fullName email');

    res.status(200).json({ success: true, invitations });
  } catch (err) {
    next(err);
  }
});

/**
 * Revoke an invitation
 */
router.delete('/companies/me/invitations/:id', authenticate, requirePermission(PERMISSIONS.INVITE_EMPLOYEES), async (req, res, next) => {
  try {
    const invitation = await CompanyInvitation.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { status: 'revoked' },
      { new: true }
    );

    if (!invitation) {
      return res.status(404).json({ success: false, error: 'Invitation not found' });
    }

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'EMPLOYEE_INVITATION_REVOKED',
      resourceType: 'CompanyInvitation',
      resourceId: invitation._id,
      req
    });

    res.status(200).json({ success: true, message: 'Invitation revoked.' });
  } catch (err) {
    next(err);
  }
});

/**
 * Public route to inspect invitation by token
 */
router.get('/invitations/:token', async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const invitation = await CompanyInvitation.findOne({
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('companyId', 'businessName email logo description');

    if (!invitation) {
      return res.status(404).json({ success: false, error: 'Invalid or expired invitation token.' });
    }

    res.status(200).json({
      success: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        company: invitation.companyId,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Accept invitation (Authenticated user)
 */
router.post('/invitations/:token/accept', authenticate, async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const invitation = await CompanyInvitation.findOne({
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(400).json({ success: false, error: 'Invalid or expired invitation token.' });
    }

    // Verify email match (or allow user confirmation)
    if (invitation.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ 
        success: false, 
        error: `This invitation was issued for ${invitation.email}. You are currently logged in as ${req.user.email}.` 
      });
    }

    // Create or reactivate membership
    let membership = await CompanyMember.findOne({ companyId: invitation.companyId, userId: req.user._id });
    if (membership) {
      membership.role = invitation.role;
      membership.status = 'active';
      await membership.save();
    } else {
      membership = await CompanyMember.create({
        companyId: invitation.companyId,
        userId: req.user._id,
        role: invitation.role,
        invitedBy: invitation.invitedBy
      });
    }

    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: invitation.companyId,
      action: 'EMPLOYEE_INVITATION_ACCEPTED',
      resourceType: 'CompanyMember',
      resourceId: membership._id,
      metadata: { role: invitation.role },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully. You now have access to the company dashboard.',
      companyId: invitation.companyId,
      role: invitation.role
    });
  } catch (err) {
    next(err);
  }
});

/**
 * List active company members
 */
router.get('/companies/me/members', authenticate, async (req, res, next) => {
  try {
    const members = await CompanyMember.find({ companyId: req.companyId, status: 'active' })
      .populate('userId', 'fullName email status createdAt')
      .sort({ role: 1, createdAt: 1 });

    res.status(200).json({ success: true, members });
  } catch (err) {
    next(err);
  }
});

/**
 * Update member role (Owner only)
 */
router.patch('/companies/me/members/:id/role', authenticate, requirePermission(PERMISSIONS.MANAGE_EMPLOYEES), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (![ROLES.ADMIN, ROLES.WARRANTY_OFFICER, ROLES.SUPPORT_AGENT, ROLES.VIEWER].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role specified.' });
    }

    const member = await CompanyMember.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!member) {
      return res.status(404).json({ success: false, error: 'Company member not found.' });
    }

    // Owner protection rule: cannot demote owner via ordinary member role edit
    if (member.role === ROLES.OWNER) {
      return res.status(403).json({ success: false, error: 'Company owner role cannot be changed here.' });
    }

    member.role = role;
    await member.save();

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'EMPLOYEE_ROLE_UPDATED',
      resourceType: 'CompanyMember',
      resourceId: member._id,
      metadata: { newRole: role },
      req
    });

    res.status(200).json({ success: true, message: 'Role updated successfully', member });
  } catch (err) {
    next(err);
  }
});

/**
 * Remove an employee (Owner only with Owner Protection)
 */
router.delete('/companies/me/members/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_EMPLOYEES), async (req, res, next) => {
  try {
    const member = await CompanyMember.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!member) {
      return res.status(404).json({ success: false, error: 'Company member not found.' });
    }

    // Owner protection rule:
    if (member.role === ROLES.OWNER) {
      const ownerCount = await CompanyMember.countDocuments({ companyId: req.companyId, role: ROLES.OWNER, status: 'active' });
      if (ownerCount <= 1) {
        return res.status(403).json({
          success: false,
          error: 'Protection rule: Cannot remove the last remaining company owner. The company cannot become ownerless.'
        });
      }
    }

    member.status = 'suspended';
    await member.save();

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'EMPLOYEE_REMOVED',
      resourceType: 'CompanyMember',
      resourceId: member._id,
      req
    });

    res.status(200).json({ success: true, message: 'Employee access revoked.' });
  } catch (err) {
    next(err);
  }
});

export default router;

