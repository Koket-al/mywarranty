import express from 'express';
import { Company, Warranty, Product, SupportTicket, WarrantyEvent } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS, TICKET_STATUS, WARRANTY_STATUS } from '@ewnet/shared';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

/**
 * Get company profile
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    if (!req.companyId) {
      return res.status(404).json({ success: false, error: 'No active company profile found for this account.' });
    }

    const company = await Company.findById(req.companyId);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    res.status(200).json({ success: true, company });
  } catch (err) {
    next(err);
  }
});

/**
 * Update company profile
 */
router.patch('/me', authenticate, requirePermission(PERMISSIONS.MANAGE_COMPANY_PROFILE), async (req, res, next) => {
  try {
    const { businessName, phone, address, website, timezone, description, logo } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.companyId,
      {
        ...(businessName && { businessName }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(website !== undefined && { website }),
        ...(timezone && { timezone }),
        ...(description !== undefined && { description }),
        ...(logo !== undefined && { logo })
      },
      { new: true }
    );

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'COMPANY_PROFILE_UPDATED',
      resourceType: 'Company',
      resourceId: req.companyId,
      req
    });

    res.status(200).json({ success: true, message: 'Profile updated successfully', company });
  } catch (err) {
    next(err);
  }
});

/**
 * Company Dashboard Metrics (Real database aggregation)
 */
router.get('/me/dashboard', authenticate, async (req, res, next) => {
  try {
    if (!req.companyId) {
      return res.status(400).json({ success: false, error: 'Company context required' });
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalWarranties,
      activeWarranties,
      expiredWarranties,
      upcomingExpirations,
      productCount,
      openTickets,
      claimsAwaitingReview,
      recentEvents
    ] = await Promise.all([
      Warranty.countDocuments({ companyId: req.companyId }),
      Warranty.countDocuments({ companyId: req.companyId, 'warranty.expiryDate': { $gt: now }, recordStatus: { $ne: WARRANTY_STATUS.REVOKED } }),
      Warranty.countDocuments({ companyId: req.companyId, 'warranty.expiryDate': { $lte: now } }),
      Warranty.countDocuments({ 
        companyId: req.companyId, 
        'warranty.expiryDate': { $gt: now, $lte: thirtyDaysFromNow },
        recordStatus: { $ne: WARRANTY_STATUS.REVOKED }
      }),
      Product.countDocuments({ companyId: req.companyId, status: 'active' }),
      SupportTicket.countDocuments({ companyId: req.companyId, status: { $in: [TICKET_STATUS.OPEN, TICKET_STATUS.UNDER_REVIEW] } }),
      SupportTicket.countDocuments({ companyId: req.companyId, status: TICKET_STATUS.UNDER_REVIEW }),
      WarrantyEvent.find({ companyId: req.companyId }).sort({ createdAt: -1 }).limit(10).populate('actorUserId', 'fullName email')
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalWarranties,
        activeWarranties,
        expiredWarranties,
        upcomingExpirations,
        productCount,
        openTickets,
        claimsAwaitingReview
      },
      recentEvents: recentEvents.map(e => ({
        id: e._id,
        eventType: e.eventType,
        actor: e.actorUserId?.fullName || 'System',
        createdAt: e.createdAt,
        metadata: e.metadata
      }))
    });
  } catch (err) {
    next(err);
  }
});

export default router;

