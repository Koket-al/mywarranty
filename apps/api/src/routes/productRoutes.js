import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Product } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '@ewnet/shared';
import { productSchema } from '@ewnet/validation';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

async function saveBase64ProductImage(base64Str) {
  if (!base64Str) return '';
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let buffer;
  let extension = '.jpg';
  if (matches) {
    const mime = matches[1];
    extension = mime.includes('png') ? '.png' : mime.includes('webp') ? '.webp' : mime.includes('gif') ? '.gif' : '.jpg';
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(base64Str, 'base64');
  }

  const uploadDir = path.resolve(process.cwd(), 'uploads', 'products');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `prod-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
  const filePath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `/api/uploads/products/${filename}`;
}

/**
 * Upload product image endpoint
 */
router.post('/upload-image', authenticate, requirePermission(PERMISSIONS.CREATE_PRODUCT), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided.' });
    }

    const uploadDir = path.resolve(process.cwd(), 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `prod-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, req.file.buffer);

    const imageUrl = `/api/uploads/products/${filename}`;
    res.status(200).json({ success: true, imageUrl, filename });
  } catch (err) {
    next(err);
  }
});

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
router.post('/', authenticate, requirePermission(PERMISSIONS.CREATE_PRODUCT), upload.single('image'), async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);

    let finalImageUrl = data.imageUrl || '';

    // If file was attached via multipart
    if (req.file) {
      const uploadDir = path.resolve(process.cwd(), 'uploads', 'products');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `prod-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      await fs.promises.writeFile(path.join(uploadDir, filename), req.file.buffer);
      finalImageUrl = `/api/uploads/products/${filename}`;
    } else if (data.imageBase64 && !finalImageUrl) {
      finalImageUrl = await saveBase64ProductImage(data.imageBase64);
    }

    const product = await Product.create({
      name: data.name,
      brand: data.brand,
      model: data.model,
      category: data.category,
      description: data.description,
      imageUrl: finalImageUrl,
      imageKey: data.imageKey || '',
      serialNumberRequired: data.serialNumberRequired,
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

