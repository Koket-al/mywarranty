import { AuditLog, WarrantyEvent } from '../models/index.js';
import crypto from 'node:crypto';

/**
 * Creates an immutable audit log entry
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

