import mongoose from 'mongoose';

const warrantyFormSchemaDef = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  name: { type: String, required: true, trim: true },
  currentPublishedVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarrantyFormVersion' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
}, { timestamps: true });

export const WarrantyFormSchema = mongoose.model('WarrantyFormSchema', warrantyFormSchemaDef);

