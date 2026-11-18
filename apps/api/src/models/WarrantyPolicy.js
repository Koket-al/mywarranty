import mongoose from 'mongoose';

const warrantyPolicySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  currentPublishedVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarrantyPolicyVersion' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const WarrantyPolicy = mongoose.model('WarrantyPolicy', warrantyPolicySchema);

