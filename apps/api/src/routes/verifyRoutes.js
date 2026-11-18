import express from 'express';
import crypto from 'node:crypto';
import { QrToken, Warranty } from '../models/index.js';
import { verifyWarrantyIntegrity } from '../services/signatureService.js';
import { WARRANTY_STATUS } from '@ewnet/shared';

const router = express.Router();

/**
 * Public QR Verification endpoint (Zero customer PII)
 */
router.get('/:token', async (req, res, next) => {
  try {
    const rawToken = req.params.token;
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const qrRecord = await QrToken.findOne({ tokenHash });
    if (!qrRecord) {
      return res.status(404).json({
        success: false,
        verificationStatus: 'INVALID_TOKEN',
        message: 'The scanned QR code is invalid or does not match any registered warranty.'
      });
    }

    if (qrRecord.status === 'revoked') {
      return res.status(200).json({
        success: true,
        verificationStatus: 'QR_REVOKED',
        message: 'This QR token has been revoked by the issuing retailer.'
      });
    }

    const warranty = await Warranty.findById(qrRecord.warrantyId);
    if (!warranty) {
      return res.status(404).json({
        success: false,
        verificationStatus: 'RECORD_NOT_FOUND',
        message: 'The associated warranty record was not found.'
      });
    }

    // Perform cryptographic integrity check
    const integrity = verifyWarrantyIntegrity(warranty);

    const now = new Date();
    const expiryDate = new Date(warranty.warranty.expiryDate);
    const isExpired = now > expiryDate;
    const isRevoked = warranty.recordStatus === WARRANTY_STATUS.REVOKED;

    let overallStatus = 'VALID';
    if (!integrity.isValid) {
      overallStatus = 'TAMPER_DETECTED';
    } else if (isRevoked) {
      overallStatus = 'REVOKED';
    } else if (isExpired) {
      overallStatus = 'EXPIRED';
    }

    const daysRemaining = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));

    // Sanitized public payload: ZERO PII
    res.status(200).json({
      success: true,
      verificationStatus: overallStatus,
      warrantyNumber: warranty.warrantyNumber,
      trustLabel: 'Seller registered',
      company: {
        businessName: warranty.companySnapshot?.businessName || 'Authorized Retailer',
        contactEmail: warranty.companySnapshot?.contactEmail || ''
      },
      product: {
        brand: warranty.product?.brand,
        name: warranty.product?.name,
        model: warranty.product?.model
      },
      warranty: {
        startDate: warranty.warranty?.startDate,
        expiryDate: warranty.warranty?.expiryDate,
        duration: warranty.warranty?.duration,
        durationUnit: warranty.warranty?.durationUnit,
        daysRemaining
      },
      policySummary: {
        policyName: warranty.policySnapshot?.name,
        clauseCount: warranty.policySnapshot?.clauses?.length || 0
      },
      cryptographicIntegrity: {
        algorithm: warranty.recordIntegrity?.algorithm,
        hashMatches: integrity.hashMatches,
        signatureValid: integrity.signatureValid,
        keyId: warranty.recordIntegrity?.keyId
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

