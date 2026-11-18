import express from 'express';
import { 
  SupportTicket, 
  ClaimDecision, 
  Warranty, 
  Notification 
} from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS, TICKET_STATUS, CLAIM_DECISION } from '@ewnet/shared';
import { claimDecisionSchema } from '@ewnet/validation';
import { logAuditEvent, createWarrantyEvent } from '../services/auditService.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * Record human warranty claim decision (Owner/Admin only)
 */
router.post('/tickets/:id/decisions', authenticate, requirePermission(PERMISSIONS.DECIDE_CLAIMS), async (req, res, next) => {
  try {
    const { decision, decisionReason } = claimDecisionSchema.parse(req.body);

    const ticket = await SupportTicket.findOne({ _id: req.params.id, companyId: req.companyId })
      .populate('customerId', 'fullName email')
      .populate('warrantyId');

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Support ticket not found.' });
    }

    // Find previous decision to chain history if modifying
    const previousDecision = await ClaimDecision.findOne({ ticketId: ticket._id }).sort({ createdAt: -1 });

    const decisionRecord = await ClaimDecision.create({
      ticketId: ticket._id,
      warrantyId: ticket.warrantyId._id,
      companyId: req.companyId,
      decision,
      decisionReason,
      decidedBy: req.user._id,
      previousDecisionId: previousDecision?._id || null
    });

    // Update ticket status
    if (decision === CLAIM_DECISION.MORE_INFO_REQUIRED) {
      ticket.status = TICKET_STATUS.WAITING_FOR_CUSTOMER;
    } else {
      ticket.status = TICKET_STATUS.DECISION_MADE;
    }
    await ticket.save();

    // Create append-only warranty audit event
    await createWarrantyEvent({
      warrantyId: ticket.warrantyId._id,
      companyId: req.companyId,
      eventType: 'CLAIM_DECIDED',
      actorUserId: req.user._id,
      metadata: {
        ticketNumber: ticket.ticketNumber,
        decision,
        reason: decisionReason
      }
    });

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'CLAIM_DECISION_RECORDED',
      resourceType: 'ClaimDecision',
      resourceId: decisionRecord._id,
      metadata: { decision, ticketNumber: ticket.ticketNumber },
      req
    });

    // Send in-app notification to customer
    await Notification.create({
      recipientUserId: ticket.customerId._id,
      companyId: req.companyId,
      type: 'CLAIM_DECISION',
      title: `Warranty Claim Decision: ${decision.toUpperCase()}`,
      message: `Your retailer has recorded a decision for Ticket ${ticket.ticketNumber} (${decision}): "${decisionReason}"`,
      relatedResourceType: 'SupportTicket',
      relatedResourceId: ticket._id
    });

    // Send email notification to customer
    if (ticket.customerId?.email) {
      sendEmail({
        to: ticket.customerId.email,
        subject: `Update on your Ewnet Support Request (${ticket.ticketNumber})`,
        text: `Your retailer has reviewed your warranty support request and recorded the following decision: ${decision.toUpperCase()}.\n\nReason:\n${decisionReason}\n\nYou can log in to your Ewnet customer portal to review details.`
      }).catch(e => console.error('[Decision Notification Email Failed]', e.message));
    }

    res.status(200).json({
      success: true,
      message: `Decision recorded as '${decision}'. The customer has been notified.`,
      decision: decisionRecord
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get decision history for a ticket
 */
router.get('/tickets/:id/decisions', authenticate, async (req, res, next) => {
  try {
    const decisions = await ClaimDecision.find({ ticketId: req.params.id })
      .populate('decidedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, decisions });
  } catch (err) {
    next(err);
  }
});

export default router;

