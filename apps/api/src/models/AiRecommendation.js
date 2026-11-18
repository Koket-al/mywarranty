import mongoose from 'mongoose';
import { AI_RECOMMENDATION } from '@ewnet/shared';

const aiRecommendationSchema = new mongoose.Schema({
  investigationId: { type: mongoose.Schema.Types.ObjectId, ref: 'AiInvestigation', required: true, index: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  recommendation: { 
    type: String, 
    enum: [
      AI_RECOMMENDATION.RECOMMEND_APPROVAL, 
      AI_RECOMMENDATION.RECOMMEND_REJECTION, 
      AI_RECOMMENDATION.REQUEST_MORE_INFORMATION, 
      AI_RECOMMENDATION.NEEDS_MANUAL_INVESTIGATION
    ], 
    required: true 
  },
  summary: { type: String, required: true },
  reasoning: { type: String, required: true },
  policyReferences: [{
    policyVersionId: { type: String },
    clauseId: { type: String },
    quotedOrReferencedText: { type: String },
    explanation: { type: String }
  }],
  evidenceReviewed: [{
    evidenceId: { type: String },
    observation: { type: String }
  }],
  missingInformation: [{ type: String }],
  contradictions: [{ type: String }],
  suggestedNextStep: { type: String, required: true },
  humanDecisionRequired: { type: Boolean, default: true }
}, { timestamps: true });

export const AiRecommendation = mongoose.model('AiRecommendation', aiRecommendationSchema);

