import mongoose from 'mongoose';
import { ROLES } from '@ewnet/shared';

const companyInvitationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  role: { 
    type: String, 
    enum: [ROLES.ADMIN, ROLES.WARRANTY_OFFICER, ROLES.SUPPORT_AGENT, ROLES.VIEWER], 
    required: true 
  },
  tokenHash: { type: String, required: true, unique: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'expired', 'revoked'], default: 'pending' },
  expiresAt: { type: Date, required: true },
  acceptedAt: { type: Date }
}, { timestamps: true });

export const CompanyInvitation = mongoose.model('CompanyInvitation', companyInvitationSchema);

