import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  businessName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  logo: { type: String, default: '' },
  description: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  website: { type: String, default: '' },
  timezone: { type: String, default: 'Africa/Addis_Ababa' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Company = mongoose.model('Company', companySchema);

