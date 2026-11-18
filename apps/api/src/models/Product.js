import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  imageKey: { type: String, default: '' },
  serialNumberRequired: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);

