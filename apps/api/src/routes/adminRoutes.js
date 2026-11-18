import express from 'express';
import { Company, User, Warranty, AuditLog } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePlatformAdmin } from '../middleware/rbacMiddleware.js';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

/**
 * Platform system metrics
 */
router.get('/metrics', authenticate, requirePlatformAdmin, async (req, res, next) => {
  try {
    const [companiesCount, usersCount, warrantiesCount, auditCount] = await Promise.all([
      Company.countDocuments(),
      User.countDocuments(),
      Warranty.countDocuments(),
      AuditLog.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalCompanies: companiesCount,
        totalUsers: usersCount,
        totalWarrantiesIssued: warrantiesCount,
        totalAuditEvents: auditCount
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * List all companies (Platform Admin)
 */
router.get('/companies', authenticate, requirePlatformAdmin, async (req, res, next) => {
  try {
    const companies = await Company.find()
      .populate('ownerUserId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, companies });
  } catch (err) {
    next(err);
  }
});

/**
 * Suspend or reactivate company
 */
router.patch('/companies/:id/status', authenticate, requirePlatformAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be active or suspended' });
    }

    const company = await Company.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: company._id,
      action: `COMPANY_${status.toUpperCase()}`,
      resourceType: 'Company',
      resourceId: company._id,
      req
    });

    res.status(200).json({ success: true, message: `Company status changed to ${status}`, company });
  } catch (err) {
    next(err);
  }
});

/**
 * List all users
 */
router.get('/users', authenticate, requirePlatformAdmin, async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
});

/**
 * Audit log explorer
 */
router.get('/audit-logs', authenticate, requirePlatformAdmin, async (req, res, next) => {
  try {
    const { action, resourceType } = req.query;
    const filter = {};
    if (action) filter.action = new RegExp(action, 'i');
    if (resourceType) filter.resourceType = resourceType;

    const logs = await AuditLog.find(filter)
      .populate('actorUserId', 'fullName email')
      .populate('companyId', 'businessName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, logs });
  } catch (err) {
    next(err);
  }
});

export default router;

