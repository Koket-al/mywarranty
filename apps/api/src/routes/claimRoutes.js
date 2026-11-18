import express from 'express';
import crypto from 'node:crypto';
import { 
  Warranty, 
  QrToken, 
  WarrantyAccountClaim, 
  OtpChallenge, 
  User 
} from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireCustomer } from '../middleware/rbacMiddleware.js';
import { generateOtp, hashOtp, sendOtpEmail } from '../services/emailService.js';
import { createWarrantyEvent, logAuditEvent } from '../services/auditService.js';
import { WARRANTY_STATUS } from '@ewnet/shared';

const router = express.Router();

/**
 * Step 1: Customer initiates warranty account claim (via QR Token or Warranty Number)
 */
router.post('/initiate', authenticate, requireCustomer, async (req, res, next) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'QR Token or Warranty Number is required.' });
    }

    // Try finding by warranty number first
    let warranty = await Warranty.findOne({ warrantyNumber: identifier.trim() });

    // If not found, try finding by QR Token hash
    if (!warranty) {
      const tokenHash = crypto.createHash('sha256').update(identifier.trim()).digest('hex');
      const qrRecord = await QrToken.findOne({ tokenHash, status: 'active' });
      if (qrRecord) {
        warranty = await Warranty.findById(qrRecord.warrantyId);
      }
    }

    if (!warranty) {
      return res.status(404).json({ success: false, error: 'Warranty not found. Please verify the QR or warranty number.' });
    }

    if (warranty.recordStatus === WARRANTY_STATUS.REVOKED) {
      return res.status(400).json({ success: false, error: 'This warranty has been revoked by the retailer and cannot be claimed.' });
    }

    // Check if already claimed by this customer
    if (warranty.customerId && String(warranty.customerId) === String(req.user._id)) {
      return res.status(200).json({
        success: true,
        alreadyClaimedByMe: true,
        message: 'This warranty is already claimed in your account.',
        warrantyId: warranty._id
      });
    }

    // Check if claimed by another customer
    if (warranty.customerId && String(warranty.customerId) !== String(req.user._id)) {
      return res.status(409).json({
        success: false,
        error: 'This warranty has already been claimed by another account. If you believe this is an error, please request company-assisted verification.'
      });
    }

    const recordedEmail = warranty.customerSnapshot?.email;

    // Fast-path: if authenticated user's email exactly matches the email recorded at issuance
    if (recordedEmail && req.user.email.toLowerCase() === recordedEmail.toLowerCase()) {
      warranty.customerId = req.user._id;
      warranty.recordStatus = WARRANTY_STATUS.CLAIMED;
      await warranty.save();

      await createWarrantyEvent({
        warrantyId: warranty._id,
        companyId: warranty.companyId,
        eventType: 'CLAIM_VERIFIED',
        actorUserId: req.user._id,
        metadata: { method: 'email_match' }
      });

      return res.status(200).json({
        success: true,
        claimed: true,
        message: 'Warranty successfully added to your account!',
        warrantyId: warranty._id
      });
    }

    // Otherwise, generate OTP to the recorded email to verify ownership
    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await OtpChallenge.create({
      email: recordedEmail,
      otpHash,
      purpose: 'claim_verification',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    await WarrantyAccountClaim.create({
      warrantyId: warranty._id,
      requestingUserId: req.user._id,
      method: identifier.startsWith('EWN-') ? 'warranty_number' : 'qr',
      status: 'pending_otp'
    });

    await sendOtpEmail(recordedEmail, otp, 'Warranty Account Claim Verification');

    res.status(200).json({
      success: true,
      requiresOtp: true,
      message: `A verification code has been sent to the customer email recorded at purchase (${recordedEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}).`,
      warrantyId: warranty._id,
      recordedEmailMasked: recordedEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Step 2: Customer enters OTP to complete warranty claim
 */
router.post('/verify-otp', authenticate, requireCustomer, async (req, res, next) => {
  try {
    const { warrantyId, otpCode } = req.body;
    if (!warrantyId || !otpCode) {
      return res.status(400).json({ success: false, error: 'Warranty ID and OTP code are required.' });
    }

    const warranty = await Warranty.findById(warrantyId);
    if (!warranty) {
      return res.status(404).json({ success: false, error: 'Warranty record not found.' });
    }

    const recordedEmail = warranty.customerSnapshot?.email;
    const otpHash = hashOtp(otpCode);

    const challenge = await OtpChallenge.findOne({
      email: recordedEmail,
      purpose: 'claim_verification',
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!challenge || challenge.otpHash !== otpHash) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' });
    }

    // Verification successful: link warranty
    challenge.verifiedAt = new Date();
    await challenge.save();

    warranty.customerId = req.user._id;
    warranty.recordStatus = WARRANTY_STATUS.CLAIMED;
    await warranty.save();

    await WarrantyAccountClaim.findOneAndUpdate(
      { warrantyId: warranty._id, requestingUserId: req.user._id },
      { status: 'verified', verifiedAt: new Date() }
    );

    await createWarrantyEvent({
      warrantyId: warranty._id,
      companyId: warranty.companyId,
      eventType: 'CLAIM_VERIFIED',
      actorUserId: req.user._id,
      metadata: { method: 'otp_verified' }
    });

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: warranty.companyId,
      action: 'WARRANTY_CLAIMED',
      resourceType: 'Warranty',
      resourceId: warranty._id,
      req
    });

    res.status(200).json({
      success: true,
      message: 'Warranty successfully claimed and linked to your account!',
      warrantyId: warranty._id
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Customer portal: List claimed warranties
 */
router.get('/my-warranties', authenticate, requireCustomer, async (req, res, next) => {
  try {
    const warranties = await Warranty.find({ customerId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, warranties });
  } catch (err) {
    next(err);
  }
});

/**
 * Customer portal: View warranty detail (with original policy snapshot)
 */
router.get('/my-warranties/:id', authenticate, requireCustomer, async (req, res, next) => {
  try {
    const warranty = await Warranty.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!warranty) {
      return res.status(404).json({ success: false, error: 'Warranty not found in your account.' });
    }

    res.status(200).json({ success: true, warranty });
  } catch (err) {
    next(err);
  }
});

export default router;

