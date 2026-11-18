import mongoose from 'mongoose';
import { CLAIM_DECISION } from '@ewnet/shared';

const claimDecisionSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  warrantyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warranty', required: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  decision: { 
    type: String, 
    enum: [CLAIM_DECISION.APPROVED, CLAIM_DECISION.REJECTED, CLAIM_DECISION.MORE_INFO_REQUIRED], 
    required: true 
  },
  decisionReason: { type: String, required: true },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  decidedAt: { type: Date, default: Date.now },
  aiRecommendationId: { type: mongoose.Schema.Types.ObjectId, ref: 'AiRecommendation' },
  previousDecisionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClaimDecision' }
}, { timestamps: true });

export const ClaimDecision = mongoose.model('ClaimDecision', claimDecisionSchema);

