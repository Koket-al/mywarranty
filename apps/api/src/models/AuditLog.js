import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  action: { type: String, required: true },
  resourceType: { type: String, required: true },
  resourceId: { type: String },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

