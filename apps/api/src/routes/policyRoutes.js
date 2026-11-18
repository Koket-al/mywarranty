import express from 'express';
import { WarrantyPolicy, WarrantyPolicyVersion } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '@ewnet/shared';
import { policyDraftSchema } from '@ewnet/validation';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

/**
 * List policies for company
 */
router.get('/', authenticate, requirePermission(PERMISSIONS.VIEW_POLICIES), async (req, res, next) => {
  try {
    const policies = await WarrantyPolicy.find({ companyId: req.companyId, status: { $ne: 'archived' } })
      .populate('currentPublishedVersionId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, policies });
  } catch (err) {
    next(err);
  }
});

/**
 * Create a new warranty policy draft (Version 1)
 */
router.post('/', authenticate, requirePermission(PERMISSIONS.CREATE_POLICY), async (req, res, next) => {
  try {
    const data = policyDraftSchema.parse(req.body);

    const policy = await WarrantyPolicy.create({
      companyId: req.companyId,
      name: data.name,
      description: data.description,
      status: 'draft',
      createdBy: req.user._id
    });

    const version = await WarrantyPolicyVersion.create({
      companyId: req.companyId,
      policyId: policy._id,
      versionNumber: 1,
      duration: data.duration,
      durationUnit: data.durationUnit,
      startDateRule: data.startDateRule,
      clauses: data.clauses,
      status: 'draft'
    });

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'POLICY_DRAFT_CREATED',
      resourceType: 'WarrantyPolicy',
      resourceId: policy._id,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Policy draft created',
      policy,
      version
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get policy with all historical versions
 */
router.get('/:id', authenticate, requirePermission(PERMISSIONS.VIEW_POLICIES), async (req, res, next) => {
  try {
    const policy = await WarrantyPolicy.findOne({ _id: req.params.id, companyId: req.companyId })
      .populate('currentPublishedVersionId');

    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found.' });
    }

    const versions = await WarrantyPolicyVersion.find({ policyId: policy._id, companyId: req.companyId })
      .sort({ versionNumber: -1 });

    res.status(200).json({ success: true, policy, versions });
  } catch (err) {
    next(err);
  }
});

/**
 * Create a new draft version for an existing policy
 */
router.post('/:id/versions', authenticate, requirePermission(PERMISSIONS.UPDATE_POLICY_DRAFT), async (req, res, next) => {
  try {
    const policy = await WarrantyPolicy.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found.' });
    }

    // Check if an un-published draft version already exists
    const existingDraft = await WarrantyPolicyVersion.findOne({ policyId: policy._id, status: 'draft' });
    if (existingDraft) {
      return res.status(409).json({ 
        success: false, 
        error: 'An unpublished draft version already exists. Please publish or update that draft.',
        draftVersionId: existingDraft._id
      });
    }

    const latestVersion = await WarrantyPolicyVersion.findOne({ policyId: policy._id }).sort({ versionNumber: -1 });
    const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    const data = policyDraftSchema.parse(req.body);

    const newVersion = await WarrantyPolicyVersion.create({
      companyId: req.companyId,
      policyId: policy._id,
      versionNumber: nextVersionNumber,
      duration: data.duration,
      durationUnit: data.durationUnit,
      startDateRule: data.startDateRule,
      clauses: data.clauses,
      status: 'draft'
    });

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'POLICY_NEW_VERSION_DRAFTED',
      resourceType: 'WarrantyPolicyVersion',
      resourceId: newVersion._id,
      req
    });

    res.status(201).json({ success: true, message: `Draft Version ${nextVersionNumber} created`, version: newVersion });
  } catch (err) {
    next(err);
  }
});

/**
 * Update an existing draft version (Never updates published versions!)
 */
router.patch('/:id/drafts/:versionId', authenticate, requirePermission(PERMISSIONS.UPDATE_POLICY_DRAFT), async (req, res, next) => {
  try {
    const version = await WarrantyPolicyVersion.findOne({
      _id: req.params.versionId,
      policyId: req.params.id,
      companyId: req.companyId
    });

    if (!version) {
      return res.status(404).json({ success: false, error: 'Policy version not found.' });
    }

    // Immutability Rule: Cannot edit published version!
    if (version.status === 'published') {
      return res.status(403).json({
        success: false,
        error: 'Rule violation: Published policy versions are immutable and cannot be modified. Create a new draft version instead.'
      });
    }

    const data = policyDraftSchema.partial().parse(req.body);

    if (data.name) {
      await WarrantyPolicy.findByIdAndUpdate(req.params.id, { name: data.name, description: data.description });
    }

    if (data.duration) version.duration = data.duration;
    if (data.durationUnit) version.durationUnit = data.durationUnit;
    if (data.startDateRule) version.startDateRule = data.startDateRule;
    if (data.clauses) version.clauses = data.clauses;

    await version.save();

    res.status(200).json({ success: true, message: 'Draft updated', version });
  } catch (err) {
    next(err);
  }
});

/**
 * Publish a policy version (Immutable milestone)
 */
router.post('/:id/publish', authenticate, requirePermission(PERMISSIONS.PUBLISH_POLICY), async (req, res, next) => {
  try {
    const { versionId } = req.body;
    const version = await WarrantyPolicyVersion.findOne({
      _id: versionId,
      policyId: req.params.id,
      companyId: req.companyId
    });

    if (!version) {
      return res.status(404).json({ success: false, error: 'Policy version not found.' });
    }

    if (version.status === 'published') {
      return res.status(400).json({ success: false, error: 'This version is already published.' });
    }

    // Mark version as published
    version.status = 'published';
    version.publishedBy = req.user._id;
    version.publishedAt = new Date();
    await version.save();

    // Set as current published version on parent policy
    const policy = await WarrantyPolicy.findByIdAndUpdate(
      req.params.id,
      {
        currentPublishedVersionId: version._id,
        status: 'published'
      },
      { new: true }
    );

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'POLICY_VERSION_PUBLISHED',
      resourceType: 'WarrantyPolicyVersion',
      resourceId: version._id,
      metadata: { versionNumber: version.versionNumber },
      req
    });

    res.status(200).json({
      success: true,
      message: `Policy Version ${version.versionNumber} is now published and active for future warranties.`,
      policy,
      version
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Retrieve specific policy version snapshot (Used for verification and AI investigation)
 */
router.get('/versions/:versionId', authenticate, async (req, res, next) => {
  try {
    const version = await WarrantyPolicyVersion.findById(req.params.versionId).populate('policyId', 'name description');
    if (!version) {
      return res.status(404).json({ success: false, error: 'Policy version not found.' });
    }

    res.status(200).json({ success: true, version });
  } catch (err) {
    next(err);
  }
});

export default router;

