import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User, Company, CompanyMember, Product, WarrantyPolicy, WarrantyPolicyVersion, Warranty, Session } from '../src/models/index.js';
import { ROLES } from '@ewnet/shared';
import { verifyWarrantyIntegrity } from '../src/services/signatureService.js';

let company, owner, token, product, policy, publishedVersion;

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({ email: 'lead@shop.et' });
  await Company.deleteMany({ email: 'lead@shop.et' });
  await Product.deleteMany({ name: 'Pro Laptop' });
  await WarrantyPolicy.deleteMany({ name: 'Acer 12-Month Hardware Guarantee' });
  await Warranty.deleteMany({ 'product.serialNumber': 'ACER-SN-882910' });

  const passwordHash = await bcrypt.hash('Password123!', 10);

  owner = await User.create({ fullName: 'Warranty Lead', email: 'lead@shop.et', passwordHash, emailVerified: true });
  company = await Company.create({ businessName: 'Addis Smart Shop', email: 'lead@shop.et', ownerUserId: owner._id });
  await CompanyMember.create({ companyId: company._id, userId: owner._id, role: ROLES.OWNER });

  product = await Product.create({
    companyId: company._id,
    name: 'Pro Laptop',
    brand: 'Acer',
    model: 'Swift 5',
    category: 'Laptops',
    serialNumberRequired: true
  });

  const raw = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  await Session.create({
    tokenHash,
    userId: owner._id,
    activeCompanyId: company._id,
    expiresAt: new Date(Date.now() + 86400000)
  });
  token = raw;
});

afterAll(async () => {
  await disconnectDB();
});

describe('Policy Versioning, Warranty Issuance & Digital Signing Suite', () => {
  it('1. should create policy draft and publish it (Immutability milestone)', async () => {
    // Create draft
    const draftRes = await request(app)
      .post('/api/policies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Acer 12-Month Hardware Guarantee',
        duration: 12,
        durationUnit: 'months',
        startDateRule: 'purchase_date',
        clauses: [
          { clauseId: 'cov-screen', title: 'Screen Coverage', text: 'Covers internal panel defects.', type: 'coverage' },
          { clauseId: 'excl-drop', title: 'Drop Exclusion', text: 'Excludes accidental falls.', type: 'exclusion' }
        ]
      });

    expect(draftRes.status).toBe(201);
    policy = draftRes.body.policy;
    const version = draftRes.body.version;

    // Publish version
    const pubRes = await request(app)
      .post(`/api/policies/${policy._id}/publish`)
      .set('Authorization', `Bearer ${token}`)
      .send({ versionId: version._id });

    expect(pubRes.status).toBe(200);
    expect(pubRes.body.version.status).toBe('published');
    publishedVersion = pubRes.body.version;
  });

  it('2. should reject editing a published policy version in-place (Non-negotiable immutability rule)', async () => {
    const editRes = await request(app)
      .patch(`/api/policies/${policy._id}/drafts/${publishedVersion._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ duration: 24 });

    expect(editRes.status).toBe(403);
    expect(editRes.body.error).toContain('Published policy versions are immutable');
  });

  it('3. should issue individual warranty with snapshot, SHA-256 hash, and digital signature', async () => {
    const purchaseDate = '2026-03-15';
    const res = await request(app)
      .post('/api/warranties')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id,
        customerName: 'Kalkidan Mengistu',
        customerEmail: 'kalkidan@customer.et',
        serialNumber: 'ACER-SN-882910',
        purchaseDate,
        invoiceReference: 'INV-ACER-01',
        policyId: policy._id
      });

    if (res.status !== 201) {
      console.error('WARRANTY ISSUE ERROR:', res.status, res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.warranty.warrantyNumber).toMatch(/^EWN-\d{4}-\d{6}$/);
    expect(res.body.warranty.recordHash).toBeDefined();

    const storedWarranty = await Warranty.findById(res.body.warranty.id);
    expect(storedWarranty).toBeDefined();

    // Verify calculated dates: 12 months from 2026-03-15 is 2027-03-15
    const exp = new Date(storedWarranty.warranty.expiryDate);
    expect(exp.getFullYear()).toBe(2027);
    expect(exp.getMonth()).toBe(2); // March (0-indexed 2)

    // Verify signature passes
    const report = verifyWarrantyIntegrity(storedWarranty);
    expect(report.isValid).toBe(true);
    expect(report.hashMatches).toBe(true);
    expect(report.signatureValid).toBe(true);
  });

  it('4. should detect tampering if stored warranty attributes are modified', async () => {
    const warranty = await Warranty.findOne({ 'product.serialNumber': 'ACER-SN-882910' });
    expect(warranty).toBeDefined();

    // Verify original is valid
    expect(verifyWarrantyIntegrity(warranty).isValid).toBe(true);

    // Tamper with purchase date in database
    const tamperedWarranty = warranty.toObject();
    tamperedWarranty.purchase.purchaseDate = new Date('2025-01-01');

    // Verification must fail!
    const tamperReport = verifyWarrantyIntegrity(tamperedWarranty);
    expect(tamperReport.isValid).toBe(false);
    expect(tamperReport.hashMatches).toBe(false);
  });
});

