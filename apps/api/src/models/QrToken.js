import mongoose from 'mongoose';

const qrTokenSchema = new mongoose.Schema({
  warrantyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warranty', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  revokedAt: { type: Date },
  expiresAt: { type: Date }
}, { timestamps: true });

export const QrToken = mongoose.model('QrToken', qrTokenSchema);

