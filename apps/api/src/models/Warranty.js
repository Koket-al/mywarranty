import mongoose from 'mongoose';
import { WARRANTY_STATUS } from '@ewnet/shared';

const warrantySchema = new mongoose.Schema({
  warrantyNumber: { type: String, required: true, unique: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },

  companySnapshot: {
    businessName: { type: String, required: true },
    contactEmail: { type: String, required: true }
  },

  customerSnapshot: {
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' }
  },

  issuedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true }
  },

  product: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String, default: '' }
  },

  purchase: {
    purchaseDate: { type: Date, required: true },
    invoiceReference: { type: String, default: '' }
  },

  warranty: {
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    durationUnit: { type: String, default: 'months' }
  },

  policySnapshot: {
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarrantyPolicy', required: true },
    policyVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarrantyPolicyVersion', required: true },
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    durationUnit: { type: String, required: true },
    startDateRule: { type: String, required: true },
    clauses: [{
      clauseId: { type: String },
      title: { type: String },
      text: { type: String },
      type: { type: String }
    }],
    snapshotHash: { type: String, required: true }
  },

  formSnapshot: {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarrantyFormSchema' },
    versionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarrantyFormVersion' },
    fields: []
  },

  customFieldValues: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },

  recordIntegrity: {
    algorithm: { type: String, default: 'SHA-256' },
    recordHash: { type: String, required: true },
    signature: { type: String, required: true },
    keyId: { type: String, required: true }
  },

  recordStatus: { 
    type: String, 
    enum: [WARRANTY_STATUS.ISSUED, WARRANTY_STATUS.CLAIMED, WARRANTY_STATUS.EXPIRED, WARRANTY_STATUS.REVOKED], 
    default: WARRANTY_STATUS.ISSUED 
  },

  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Warranty = mongoose.model('Warranty', warrantySchema);

