import mongoose from 'mongoose';

const supportEvidenceSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storageKey: { type: String, required: true },
  originalFilename: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true }
}, { timestamps: true });

export const SupportEvidence = mongoose.model('SupportEvidence', supportEvidenceSchema);

