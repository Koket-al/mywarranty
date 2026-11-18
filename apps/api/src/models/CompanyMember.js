import mongoose from 'mongoose';
import { ROLES } from '@ewnet/shared';

const companyMemberSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { 
    type: String, 
    enum: [ROLES.OWNER, ROLES.ADMIN, ROLES.WARRANTY_OFFICER, ROLES.SUPPORT_AGENT, ROLES.VIEWER], 
    required: true 
  },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

companyMemberSchema.index({ companyId: 1, userId: 1 }, { unique: true });

export const CompanyMember = mongoose.model('CompanyMember', companyMemberSchema);

