import mongoose from 'mongoose';

const otpChallengeSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  otpHash: { type: String, required: true },
  purpose: { 
    type: String, 
    enum: ['email_verification', 'claim_verification', 'password_reset'], 
    default: 'email_verification' 
  },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  verifiedAt: { type: Date }
}, { timestamps: true });

export const OtpChallenge = mongoose.model('OtpChallenge', otpChallengeSchema);

