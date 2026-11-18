import express from 'express';
import { WarrantyFormSchema, WarrantyFormVersion } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '@ewnet/shared';
import { formSchema } from '@ewnet/validation';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

/**
 * List form schemas for active company
 */
router.get('/', authenticate, requirePermission(PERMISSIONS.VIEW_FORMS), async (req, res, next) => {
  try {
    const forms = await WarrantyFormSchema.find({ companyId: req.companyId, status: 'active' })
      .populate('currentPublishedVersionId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, forms });
  } catch (err) {
    next(err);
  }
});

/**
 * Create new form schema draft
 */
router.post('/', authenticate, requirePermission(PERMISSIONS.MANAGE_FORMS), async (req, res, next) => {
  try {
    const data = formSchema.parse(req.body);

    const form = await WarrantyFormSchema.create({
      companyId: req.companyId,
      name: data.name
    });

    const version = await WarrantyFormVersion.create({
      companyId: req.companyId,
      formId: form._id,
      versionNumber: 1,
      fields: data.fields,
      status: 'draft'
    });

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'FORM_SCHEMA_CREATED',
      resourceType: 'WarrantyFormSchema',
      resourceId: form._id,
      req
    });

    res.status(201).json({ success: true, message: 'Form schema created', form, version });
  } catch (err) {
    next(err);
  }
});

/**
 * Get form schema detail with versions
 */
router.get('/:id', authenticate, requirePermission(PERMISSIONS.VIEW_FORMS), async (req, res, next) => {
  try {
    const form = await WarrantyFormSchema.findOne({ _id: req.params.id, companyId: req.companyId })
      .populate('currentPublishedVersionId');

    if (!form) {
      return res.status(404).json({ success: false, error: 'Form schema not found.' });
    }

    const versions = await WarrantyFormVersion.find({ formId: form._id, companyId: req.companyId })
      .sort({ versionNumber: -1 });

    res.status(200).json({ success: true, form, versions });
  } catch (err) {
    next(err);
  }
});

/**
 * Publish form schema version
 */
router.post('/:id/publish', authenticate, requirePermission(PERMISSIONS.MANAGE_FORMS), async (req, res, next) => {
  try {
    const { versionId } = req.body;
    const version = await WarrantyFormVersion.findOne({
      _id: versionId,
      formId: req.params.id,
      companyId: req.companyId
    });

    if (!version) {
      return res.status(404).json({ success: false, error: 'Form version not found.' });
    }

    version.status = 'published';
    version.publishedBy = req.user._id;
    version.publishedAt = new Date();
    await version.save();

    const form = await WarrantyFormSchema.findByIdAndUpdate(
      req.params.id,
      { currentPublishedVersionId: version._id },
      { new: true }
    );

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'FORM_VERSION_PUBLISHED',
      resourceType: 'WarrantyFormVersion',
      resourceId: version._id,
      req
    });

    res.status(200).json({ success: true, message: 'Form version published', form, version });
  } catch (err) {
    next(err);
  }
});

export default router;

