import mongoose from 'mongoose';

const warrantyAccountClaimSchema = new mongoose.Schema({
  warrantyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warranty', required: true, index: true },
  requestingUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  method: { type: String, enum: ['qr', 'warranty_number'], required: true },
  status: { 
    type: String, 
    enum: ['pending_otp', 'verified', 'company_review_required', 'approved', 'rejected'], 
    default: 'pending_otp' 
  },
  verificationMethod: { type: String, enum: ['customer_email_otp', 'company_assisted'], default: 'customer_email_otp' },
  verifiedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String, default: '' }
}, { timestamps: true });

export const WarrantyAccountClaim = mongoose.model('WarrantyAccountClaim', warrantyAccountClaimSchema);

