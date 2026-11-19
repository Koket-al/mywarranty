import express from 'express';
import crypto from 'node:crypto';
import { 
  Warranty, 
  Product, 
  WarrantyPolicy, 
  WarrantyPolicyVersion, 
  WarrantyFormSchema, 
  WarrantyFormVersion,
  QrToken, 
  User, 
  Company 
} from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS, WARRANTY_STATUS, generateWarrantyNumber, computeRecordHash } from '@ewnet/shared';
import { warrantyIssueSchema } from '@ewnet/validation';
import { signWarrantyRecord, verifyWarrantyIntegrity } from '../services/signatureService.js';
import { createWarrantyEvent, logAuditEvent } from '../services/auditService.js';
import { generateWarrantyPdf } from '../services/pdfService.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * Calculate reliable expiration date based on duration and unit
 */
function calculateDates(purchaseDateStr, duration, durationUnit = 'months') {
  const startDate = new Date(purchaseDateStr);
  const expiryDate = new Date(startDate);

  if (durationUnit === 'days') {
    expiryDate.setDate(expiryDate.getDate() + Number(duration));
  } else if (durationUnit === 'years') {
    expiryDate.setFullYear(expiryDate.getFullYear() + Number(duration));
  } else {
    // Months (handles end of month and leap years cleanly)
    expiryDate.setMonth(expiryDate.getMonth() + Number(duration));
  }

  return { startDate, expiryDate };
}

/**
 * Issue individual digital warranty
 */
router.post('/', authenticate, requirePermission(PERMISSIONS.ISSUE_WARRANTY), async (req, res, next) => {
  try {
    const data = warrantyIssueSchema.parse(req.body);

    // 1. Verify Product belongs to this company
    const product = await Product.findOne({ _id: data.productId, companyId: req.companyId, status: 'active' });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found in your company catalog.' });
    }

    if (product.serialNumberRequired && !data.serialNumber) {
      return res.status(400).json({ success: false, error: `Serial number is mandatory for ${product.name}.` });
    }

    // 2. Verify Policy and Published Version
    const policy = await WarrantyPolicy.findOne({ _id: data.policyId, companyId: req.companyId });
    if (!policy || !policy.currentPublishedVersionId) {
      return res.status(400).json({ success: false, error: 'Selected policy does not have an active published version.' });
    }

    const policyVersion = await WarrantyPolicyVersion.findById(policy.currentPublishedVersionId);
    if (!policyVersion || policyVersion.status !== 'published') {
      return res.status(400).json({ success: false, error: 'Published policy version not found.' });
    }

    // 3. Optional Form Schema Snapshot
    let formSnapshot = null;
    if (data.formSchemaId) {
      const formSchemaDoc = await WarrantyFormSchema.findOne({ _id: data.formSchemaId, companyId: req.companyId });
      if (formSchemaDoc?.currentPublishedVersionId) {
        const formVersion = await WarrantyFormVersion.findById(formSchemaDoc.currentPublishedVersionId);
        if (formVersion) {
          formSnapshot = {
            formId: formSchemaDoc._id,
            versionId: formVersion._id,
            fields: formVersion.fields
          };
        }
      }
    }

    // 4. Calculate Dates
    const { startDate, expiryDate } = calculateDates(
      data.purchaseDate, 
      policyVersion.duration, 
      policyVersion.durationUnit
    );

    // 5. Generate Warranty Number
    const count = await Warranty.countDocuments();
    const warrantyNumber = generateWarrantyNumber(count + 1);

    // 6. Check if customer already has a verified Ewnet account
    const existingCustomer = await User.findOne({ 
      email: data.customerEmail.toLowerCase().trim(), 
      emailVerified: true 
    });

    const company = await Company.findById(req.companyId);

    // 7. Create immutable policy snapshot
    const sanitizedClauses = policyVersion.clauses.map(c => ({
      clauseId: c.clauseId,
      title: c.title,
      text: c.text,
      type: c.type
    }));

    const policySnapshot = {
      policyId: policy._id,
      policyVersionId: policyVersion._id,
      name: policy.name,
      duration: policyVersion.duration,
      durationUnit: policyVersion.durationUnit,
      startDateRule: policyVersion.startDateRule,
      clauses: sanitizedClauses,
      snapshotHash: computeRecordHash(sanitizedClauses)
    };

    // 8. Prepare Warranty Record Draft for Signing
    const warrantyDraft = {
      warrantyNumber,
      companyId: req.companyId,
      customerId: existingCustomer ? existingCustomer._id : null,
      companySnapshot: {
        businessName: company?.businessName || 'Authorized Retailer',
        contactEmail: company?.email || req.user.email
      },
      customerSnapshot: {
        fullName: data.customerName,
        email: data.customerEmail.toLowerCase().trim(),
        phone: data.customerPhone || ''
      },
      issuedBy: {
        userId: req.user._id,
        role: req.role
      },
      product: {
        productId: product._id,
        name: product.name,
        brand: product.brand,
        model: product.model,
        serialNumber: data.serialNumber || '',
        imageUrl: product.imageUrl || ''
      },
      purchase: {
        purchaseDate: new Date(data.purchaseDate),
        invoiceReference: data.invoiceReference || ''
      },
      warranty: {
        startDate,
        expiryDate,
        duration: policyVersion.duration,
        durationUnit: policyVersion.durationUnit
      },
      policySnapshot,
      formSnapshot,
      customFieldValues: data.customFieldValues || {},
      recordStatus: existingCustomer ? WARRANTY_STATUS.CLAIMED : WARRANTY_STATUS.ISSUED,
      issuedAt: new Date()
    };

    // 9. Sign Record with RSA-SHA256
    const integrity = signWarrantyRecord(warrantyDraft);
    warrantyDraft.recordIntegrity = {
      algorithm: integrity.algorithm,
      recordHash: integrity.recordHash,
      signature: integrity.signature,
      keyId: integrity.keyId
    };

    // 10. Persist Warranty
    const warranty = await Warranty.create(warrantyDraft);

    // 11. Generate Random QR Token and hash it in DB
    const rawQrToken = crypto.randomBytes(32).toString('hex');
    const qrTokenHash = crypto.createHash('sha256').update(rawQrToken).digest('hex');
    await QrToken.create({
      warrantyId: warranty._id,
      tokenHash: qrTokenHash,
      status: 'active'
    });

    // 12. Create Chained Audit Event
    await createWarrantyEvent({
      warrantyId: warranty._id,
      companyId: req.companyId,
      eventType: 'WARRANTY_ISSUED',
      actorUserId: req.user._id,
      metadata: {
        warrantyNumber: warranty.warrantyNumber,
        recordHash: integrity.recordHash,
        customerEmail: data.customerEmail
      }
    });

    // 13. Dispatch customer notification email
    sendEmail({
      to: data.customerEmail,
      subject: `Your Digital Warranty Certificate: ${warranty.warrantyNumber}`,
      text: `Your digital warranty for ${product.brand} ${product.name} has been issued by ${company?.businessName}. Warranty Number: ${warranty.warrantyNumber}. Valid until ${expiryDate.toLocaleDateString()}.`
    }).catch(e => console.error('[Notification Email Failed]', e.message));

    res.status(201).json({
      success: true,
      message: 'Warranty successfully issued',
      warranty: {
        id: warranty._id,
        warrantyNumber: warranty.warrantyNumber,
        product: warranty.product,
        expiryDate: warranty.warranty.expiryDate,
        recordHash: warranty.recordIntegrity.recordHash,
        qrToken: rawQrToken // Returned to issuing employee to preview/download QR
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * List issued warranties for active company
 */
router.get('/', authenticate, requirePermission(PERMISSIONS.VIEW_WARRANTIES), async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = { companyId: req.companyId };

    if (status) {
      filter.recordStatus = status;
    }

    if (search) {
      filter.$or = [
        { warrantyNumber: new RegExp(search, 'i') },
        { 'customerSnapshot.email': new RegExp(search, 'i') },
        { 'customerSnapshot.fullName': new RegExp(search, 'i') },
        { 'product.serialNumber': new RegExp(search, 'i') },
        { 'product.name': new RegExp(search, 'i') }
      ];
    }

    const warranties = await Warranty.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, warranties });
  } catch (err) {
    next(err);
  }
});

/**
 * Get warranty detail
 */
router.get('/:id', authenticate, requirePermission(PERMISSIONS.VIEW_WARRANTIES), async (req, res, next) => {
  try {
    const warranty = await Warranty.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!warranty) {
      return res.status(404).json({ success: false, error: 'Warranty not found.' });
    }

    // Verify cryptographic integrity
    const integrityReport = verifyWarrantyIntegrity(warranty);

    res.status(200).json({
      success: true,
      warranty,
      integrityReport
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Download printable PDF warranty document
 */
router.get('/:id/pdf', authenticate, async (req, res, next) => {
  try {
    // Authorized for company employee or the owning customer
    let warranty;
    if (req.companyId) {
      warranty = await Warranty.findOne({ _id: req.params.id, companyId: req.companyId });
    } else {
      warranty = await Warranty.findOne({ _id: req.params.id, customerId: req.user._id });
    }

    if (!warranty) {
      return res.status(404).json({ success: false, error: 'Warranty document not accessible.' });
    }

    // Retrieve active QR token for this warranty or generate lookup token
    const activeQr = await QrToken.findOne({ warrantyId: warranty._id, status: 'active' });
    const qrDisplayToken = activeQr?.tokenHash.slice(0, 16) || 'verify';

    const pdfBuffer = await generateWarrantyPdf(warranty, qrDisplayToken);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${warranty.warrantyNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

/**
 * Revoke warranty (Manager/Owner only, append-only revocation event)
 */
router.post('/:id/revoke', authenticate, requirePermission(PERMISSIONS.REVOKE_WARRANTY), async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'A clear revocation reason is required.' });
    }

    const warranty = await Warranty.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!warranty) {
      return res.status(404).json({ success: false, error: 'Warranty not found.' });
    }

    warranty.recordStatus = WARRANTY_STATUS.REVOKED;
    await warranty.save();

    // Revoke QR Token
    await QrToken.updateMany({ warrantyId: warranty._id }, { status: 'revoked', revokedAt: new Date() });

    // Append-only revocation event
    await createWarrantyEvent({
      warrantyId: warranty._id,
      companyId: req.companyId,
      eventType: 'WARRANTY_REVOKED',
      actorUserId: req.user._id,
      metadata: { reason }
    });

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: req.companyId,
      action: 'WARRANTY_REVOKED',
      resourceType: 'Warranty',
      resourceId: warranty._id,
      metadata: { reason },
      req
    });

    res.status(200).json({ success: true, message: 'Warranty revoked.', warranty });
  } catch (err) {
    next(err);
  }
});

export default router;

