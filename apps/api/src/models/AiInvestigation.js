import mongoose from 'mongoose';

const aiInvestigationSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  warrantyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warranty', required: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  status: { type: String, enum: ['pending', 'retrieving_context', 'analyzing', 'awaiting_human_review', 'completed', 'failed'], default: 'pending' },
  model: { type: String, default: 'ewnet-assistant-v1' },
  recommendationId: { type: mongoose.Schema.Types.ObjectId, ref: 'AiRecommendation' },
  failureReason: { type: String, default: '' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

export const AiInvestigation = mongoose.model('AiInvestigation', aiInvestigationSchema);

