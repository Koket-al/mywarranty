import express from 'express';
import { Product } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '@ewnet/shared';
import { productSchema } from '@ewnet/validation';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

/**
 * List products for active company (Tenant Isolated)
 */
router.get('/', authenticate, requirePermission(PERMISSIONS.VIEW_PRODUCTS), async (req, res, next) => {
  try {
    const products = await Product.find({ companyId: req.companyId, status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
});

/**
 * Create new product
 */
router.post('/', authenticate, requirePermission(PERMISSIONS.CREATE_PRODUCT), async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);

    const product = await Product.create({
      ...data,
      companyId: req.companyId
    });

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'PRODUCT_CREATED',
      resourceType: 'Product',
      resourceId: product._id,
      req
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (err) {
    next(err);
  }
});

/**
 * Get product detail (Company scoped)
 */
router.get('/:id', authenticate, requirePermission(PERMISSIONS.VIEW_PRODUCTS), async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found in your company catalog.' });
    }
    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

/**
 * Update product
 */
router.patch('/:id', authenticate, requirePermission(PERMISSIONS.UPDATE_PRODUCT), async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { $set: data },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'PRODUCT_UPDATED',
      resourceType: 'Product',
      resourceId: product._id,
      req
    });

    res.status(200).json({ success: true, message: 'Product updated', product });
  } catch (err) {
    next(err);
  }
});

/**
 * Archive product
 */
router.post('/:id/archive', authenticate, requirePermission(PERMISSIONS.UPDATE_PRODUCT), async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { status: 'archived' },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'PRODUCT_ARCHIVED',
      resourceType: 'Product',
      resourceId: product._id,
      req
    });

    res.status(200).json({ success: true, message: 'Product archived.' });
  } catch (err) {
    next(err);
  }
});

export default router;

