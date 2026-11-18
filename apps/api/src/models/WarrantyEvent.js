import mongoose from 'mongoose';

const warrantyEventSchema = new mongoose.Schema({
  warrantyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warranty', required: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  eventType: { 
    type: String, 
    required: true,
    enum: [
      'WARRANTY_ISSUED',
      'QR_GENERATED',
      'QR_REVOKED',
      'CLAIM_REQUESTED',
      'CLAIM_VERIFIED',
      'CLAIM_REJECTED',
      'WARRANTY_CORRECTED',
      'WARRANTY_REVOKED'
    ]
  },
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  previousHash: { type: String, default: '0000000000000000000000000000000000000000000000000000000000000000' },
  eventHash: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const WarrantyEvent = mongoose.model('WarrantyEvent', warrantyEventSchema);

