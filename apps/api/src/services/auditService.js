import { AuditLog, WarrantyEvent } from '../models/index.js';
import crypto from 'node:crypto';

/**
 * Records an immutable audit log entry for compliance tracking
 * @param {Object} options
 * @param {string} options.actorUserId - ID of user triggering the action
 * @param {string} [options.companyId] - Tenant ID if in company scope
 * @param {string} options.action - Action verb identifier
 * @param {string} options.resourceType - Domain entity type
 * @param {string} [options.resourceId] - Target entity identifier
 * @param {Object} [options.metadata] - Supplemental details
 * @param {Object} [options.req] - Express request object for client IP resolution
 */
export async function logAuditEvent({ actorUserId, companyId, action, resourceType, resourceId, metadata = {}, req }) {
  try {
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '';
    return await AuditLog.create({
      actorUserId,
      companyId,
      action,
      resourceType,
      resourceId: String(resourceId || ''),
      metadata,
      ipAddress
    });
  } catch (err) {
    console.error('[AuditService] Failed to record audit log:', err.message);
  }
}

/**
 * Creates an append-only cryptographically chained warranty event
 */
export async function createWarrantyEvent({ warrantyId, companyId, eventType, actorUserId, metadata = {} }) {
  try {
    // Find previous event for this warranty to chain hashes
    const lastEvent = await WarrantyEvent.findOne({ warrantyId }).sort({ createdAt: -1 });
    const previousHash = lastEvent?.eventHash || '0000000000000000000000000000000000000000000000000000000000000000';

    const eventPayload = {
      warrantyId: String(warrantyId),
      companyId: String(companyId),
      eventType,
      actorUserId: actorUserId ? String(actorUserId) : 'system',
      previousHash,
      timestamp: Date.now()
    };

    const eventHash = crypto.createHash('sha256').update(JSON.stringify(eventPayload)).digest('hex');

    return await WarrantyEvent.create({
      warrantyId,
      companyId,
      eventType,
      actorUserId,
      metadata,
      previousHash,
      eventHash
    });
  } catch (err) {
    console.error('[AuditService] Failed to record warranty event:', err.message);
  }
}

