import mongoose from 'mongoose';

const formFieldDef = new mongoose.Schema({
  fieldId: { type: String, required: true },
  label: { type: String, required: true },
  fieldType: { 
    type: String, 
    enum: ['text', 'textarea', 'number', 'date', 'select', 'checkbox'], 
    required: true 
  },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  helpText: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 }
}, { _id: false });

const warrantyFormVersionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarrantyFormSchema', required: true, index: true },
  versionNumber: { type: Number, required: true },
  fields: [formFieldDef],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date }
}, { timestamps: true });

warrantyFormVersionSchema.index({ formId: 1, versionNumber: 1 }, { unique: true });

export const WarrantyFormVersion = mongoose.model('WarrantyFormVersion', warrantyFormVersionSchema);

