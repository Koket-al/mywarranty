import express from 'express';
import { 
  SupportTicket, 
  Warranty, 
  SupportEvidence, 
  AiInvestigation, 
  AiRecommendation 
} from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS, TICKET_STATUS } from '@ewnet/shared';
import { investigateSupportCase, answerCustomerQuery, suggestPolicyClauses } from '@ewnet/ai';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

/**
 * Run AI Investigation on a Support Case (Company Agent)
 */
router.post('/investigate/:ticketId', authenticate, requirePermission(PERMISSIONS.REVIEW_CLAIMS), async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.ticketId, companyId: req.companyId });
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Support ticket not found.' });
    }

    const warranty = await Warranty.findById(ticket.warrantyId);
    if (!warranty) {
      return res.status(404).json({ success: false, error: 'Associated warranty record not found.' });
    }

    const evidence = await SupportEvidence.find({ ticketId: ticket._id });

    // Create investigation tracking record
    const investigation = await AiInvestigation.create({
      ticketId: ticket._id,
      warrantyId: warranty._id,
      companyId: req.companyId,
      status: 'analyzing',
      startedAt: new Date()
    });

    // Run AI analysis using exact policy snapshot
    const report = await investigateSupportCase({
      ticket,
      warranty,
      policySnapshot: warranty.policySnapshot,
      evidence
    });

    // Persist structured recommendation
    const recommendation = await AiRecommendation.create({
      investigationId: investigation._id,
      ticketId: ticket._id,
      recommendation: report.recommendation,
      summary: report.summary,
      reasoning: report.reasoning,
      policyReferences: report.policyReferences,
      evidenceReviewed: report.evidenceReviewed,
      missingInformation: report.missingInformation,
      contradictions: report.contradictions,
      suggestedNextStep: report.suggestedNextStep,
      humanDecisionRequired: true
    });

    investigation.status = 'awaiting_human_review';
    investigation.recommendationId = recommendation._id;
    investigation.completedAt = new Date();
    await investigation.save();

    // Move ticket to under_review
    ticket.status = TICKET_STATUS.UNDER_REVIEW;
    await ticket.save();

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'AI_INVESTIGATION_COMPLETED',
      resourceType: 'AiInvestigation',
      resourceId: investigation._id,
      metadata: { recommendation: report.recommendation },
      req
    });

    res.status(200).json({
      success: true,
      message: 'AI investigation completed. Structured report prepared for human retailer decision.',
      recommendation
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Customer Warranty Assistant
 * Scoped strictly to authenticated customer's own warranties
 */
router.post('/customer-assistant', authenticate, async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required.' });
    }

    // Retrieve only authenticated customer's claimed warranties
    const customerWarranties = await Warranty.find({ customerId: req.user._id });

    const result = await answerCustomerQuery({
      query,
      warranties: customerWarranties
    });

    res.status(200).json({
      success: true,
      query,
      response: result
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Company Policy Assistant
 * Suggests structured policy clauses
 */
router.post('/policy-assistant', authenticate, requirePermission(PERMISSIONS.CREATE_POLICY), async (req, res, next) => {
  try {
    const { category, durationMonths } = req.body;
    const suggestions = await suggestPolicyClauses({ category, durationMonths });

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (err) {
    next(err);
  }
});

export default router;

