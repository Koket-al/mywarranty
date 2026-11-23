import { canonicalStringify, computeRecordHash, signPayload, verifySignature } from '@ewnet/shared';
import { env } from '../config/env.js';

/**
 * Creates canonical payload for warranty issuance and cryptographically signs it using RSA-SHA256
 * @param {Object} warrantyData - Input warranty parameters
 * @returns {{algorithm: string, recordHash: string, signature: string, keyId: string, canonicalString: string}}
 */
export function signWarrantyRecord(warrantyData) {
  const canonicalPayload = {
    warrantyNumber: warrantyData.warrantyNumber,
    companyId: String(warrantyData.companyId),
    customerEmail: warrantyData.customerSnapshot?.email,
    productId: String(warrantyData.product?.productId),
    serialNumber: warrantyData.product?.serialNumber || '',
    purchaseDate: new Date(warrantyData.purchase?.purchaseDate).toISOString().slice(0, 10),
    startDate: new Date(warrantyData.warranty?.startDate).toISOString().slice(0, 10),
    expiryDate: new Date(warrantyData.warranty?.expiryDate).toISOString().slice(0, 10),
    duration: warrantyData.warranty?.duration,
    durationUnit: warrantyData.warranty?.durationUnit,
    policySnapshotHash: warrantyData.policySnapshot?.snapshotHash,
    issuedAt: new Date(warrantyData.issuedAt || Date.now()).toISOString()
  };

  const canonicalString = canonicalStringify(canonicalPayload);
  const recordHash = computeRecordHash(canonicalPayload);
  const signature = signPayload(canonicalString, env.WARRANTY_SIGNING_PRIVATE_KEY);

  return {
    algorithm: 'RSA-SHA256',
    recordHash,
    signature,
    keyId: env.WARRANTY_SIGNING_KEY_ID,
    canonicalString
  };
}

/**
 * Verifies the integrity of a stored warranty record against its signature
 */
export function verifyWarrantyIntegrity(warranty) {
  const canonicalPayload = {
    warrantyNumber: warranty.warrantyNumber,
    companyId: String(warranty.companyId),
    customerEmail: warranty.customerSnapshot?.email,
    productId: String(warranty.product?.productId),
    serialNumber: warranty.product?.serialNumber || '',
    purchaseDate: new Date(warranty.purchase?.purchaseDate).toISOString().slice(0, 10),
    startDate: new Date(warranty.warranty?.startDate).toISOString().slice(0, 10),
    expiryDate: new Date(warranty.warranty?.expiryDate).toISOString().slice(0, 10),
    duration: warranty.warranty?.duration,
    durationUnit: warranty.warranty?.durationUnit,
    policySnapshotHash: warranty.policySnapshot?.snapshotHash,
    issuedAt: new Date(warranty.issuedAt).toISOString()
  };

  const canonicalString = canonicalStringify(canonicalPayload);
  const recomputedHash = computeRecordHash(canonicalPayload);

  // Check if hash matches
  const hashMatches = (recomputedHash === warranty.recordIntegrity?.recordHash);

  // Verify digital signature
  const signatureValid = verifySignature(
    canonicalString, 
    warranty.recordIntegrity?.signature, 
    env.WARRANTY_SIGNING_PUBLIC_KEY
  );

  return {
    isValid: hashMatches && signatureValid,
    hashMatches,
    signatureValid,
    recomputedHash,
    storedHash: warranty.recordIntegrity?.recordHash,
    keyId: warranty.recordIntegrity?.keyId
  };
}

