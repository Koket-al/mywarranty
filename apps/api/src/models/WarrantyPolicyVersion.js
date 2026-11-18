import mongoose from 'mongoose';

const clauseSchema = new mongoose.Schema({
  clauseId: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['coverage', 'exclusion', 'procedure', 'general'], default: 'general' }
}, { _id: false });

const warrantyPolicyVersionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarrantyPolicy', required: true, index: true },
  versionNumber: { type: Number, required: true },
  duration: { type: Number, required: true, min: 1 },
  durationUnit: { type: String, enum: ['days', 'months', 'years'], default: 'months' },
  startDateRule: { type: String, enum: ['purchase_date', 'issuance_date'], default: 'purchase_date' },
  clauses: [clauseSchema],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date }
}, { timestamps: true });

warrantyPolicyVersionSchema.index({ policyId: 1, versionNumber: 1 }, { unique: true });

export const WarrantyPolicyVersion = mongoose.model('WarrantyPolicyVersion', warrantyPolicyVersionSchema);

