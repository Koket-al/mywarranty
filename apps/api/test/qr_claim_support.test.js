import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { 
  User, 
  Company, 
  CompanyMember, 
  Product, 
  WarrantyPolicy, 
  WarrantyPolicyVersion, 
  Warranty, 
  QrToken, 
  Session,
  Notification 
} from '../src/models/index.js';
import { ROLES, computeRecordHash } from '@ewnet/shared';
import { signWarrantyRecord } from '../src/services/signatureService.js';
import { devOtpStore } from '../src/services/emailService.js';

let company, owner, customer, tokenOwner, tokenCustomer;
let warranty, rawQrToken, ticketId;

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({ email: { $in: ['boss@shop.et', 'yared@gmail.com'] } });
  await Company.deleteMany({ email: 'boss@shop.et' });
  await Warranty.deleteMany({ warrantyNumber: 'EWN-2026-999001' });
  await QrToken.deleteMany({});
  await Product.deleteMany({ name: 'Earbuds Pro' });
  await WarrantyPolicy.deleteMany({ name: 'Audio Guarantee' });
  await WarrantyPolicyVersion.deleteMany({});
  await Session.deleteMany({});
  await Notification.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123!', 10);

  owner = await User.create({ fullName: 'Owner Boss', email: 'boss@shop.et', passwordHash, emailVerified: true });
  company = await Company.create({ businessName: 'Piazza Gadgets', email: 'boss@shop.et', ownerUserId: owner._id });
  await CompanyMember.create({ companyId: company._id, userId: owner._id, role: ROLES.OWNER });

  customer = await User.create({ fullName: 'Yared Tesfaye', email: 'yared@gmail.com', passwordHash, emailVerified: true });

  const product = await Product.create({
    companyId: company._id,
    name: 'Earbuds Pro',
    brand: 'Sony',
    model: 'WF-1000XM5',
    category: 'Audio'
  });

  const clauses = [
    { clauseId: 'cov-sound', title: 'Driver Failure', text: 'Covers internal speaker driver failure.', type: 'coverage' },
    { clauseId: 'excl-liquid', title: 'Water Damage', text: 'Excludes liquid immersion or water damage.', type: 'exclusion' }
  ];

  const policy = await WarrantyPolicy.create({ companyId: company._id, name: 'Audio Guarantee', status: 'published', createdBy: owner._id });
  const version = await WarrantyPolicyVersion.create({
    companyId: company._id,
    policyId: policy._id,
    versionNumber: 1,
    duration: 12,
    durationUnit: 'months',
    startDateRule: 'purchase_date',
    clauses,
    status: 'published'
  });
  policy.currentPublishedVersionId = version._id;
  await policy.save();

  // Create warranty issued to yared@gmail.com (initially unclaimed)
  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const draft = {
    warrantyNumber: 'EWN-2026-999001',
    companyId: company._id,
    customerId: null, // Unclaimed initially
    companySnapshot: { businessName: company.businessName, contactEmail: company.email },
    customerSnapshot: { fullName: 'Yared Tesfaye', email: 'yared@gmail.com', phone: '' },
    issuedBy: { userId: owner._id, role: ROLES.OWNER },
    product: { productId: product._id, name: product.name, brand: product.brand, model: product.model, serialNumber: 'SONY-0099' },
    purchase: { purchaseDate: startDate, invoiceReference: 'INV-SONY-01' },
    warranty: { startDate, expiryDate, duration: 12, durationUnit: 'months' },
    policySnapshot: {
      policyId: policy._id,
      policyVersionId: version._id,
      name: policy.name,
      duration: 12,
      durationUnit: 'months',
      startDateRule: 'purchase_date',
      clauses,
      snapshotHash: computeRecordHash(clauses)
    },
    recordStatus: 'issued',
    issuedAt: startDate
  };

  const integrity = signWarrantyRecord(draft);
  draft.recordIntegrity = {
    algorithm: integrity.algorithm,
    recordHash: integrity.recordHash,
    signature: integrity.signature,
    keyId: integrity.keyId
  };

  warranty = await Warranty.create(draft);

  rawQrToken = 'test-token-sony-earbuds-xyz';
  const qrHash = crypto.createHash('sha256').update(rawQrToken).digest('hex');
  await QrToken.create({ warrantyId: warranty._id, tokenHash: qrHash, status: 'active' });

  async function createSession(user, companyId = null) {
    const raw = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    await Session.create({
      tokenHash,
      userId: user._id,
      activeCompanyId: companyId,
      expiresAt: new Date(Date.now() + 86400000)
    });
    return raw;
  }

  tokenOwner = await createSession(owner, company._id);
  tokenCustomer = await createSession(customer);
});

afterAll(async () => {
  await disconnectDB();
});

describe('Public QR Verification, Customer Claiming & AI Support Suite', () => {
  it('1. Public QR verification returns sanitized details with ZERO customer PII', async () => {
    const res = await request(app).get(`/api/verify/${rawQrToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.verificationStatus).toBe('VALID');
    expect(res.body.trustLabel).toBe('Seller registered');
    expect(res.body.product.brand).toBe('Sony');

    // Strict privacy verification: customer PII must NEVER be leaked in public endpoint
    expect(res.body.customerSnapshot).toBeUndefined();
    expect(res.body.customerEmail).toBeUndefined();
    expect(res.body.phone).toBeUndefined();
    expect(res.body.customerName).toBeUndefined();
  });

  it('2. Customer claims warranty using QR token with email match/OTP', async () => {
    const res = await request(app)
      .post('/api/claims/initiate')
      .set('Authorization', `Bearer ${tokenCustomer}`)
      .send({ identifier: rawQrToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await Warranty.findById(warranty._id);
    expect(String(updated.customerId)).toBe(String(customer._id));
    expect(updated.recordStatus).toBe('claimed');
  });

  it('3. Customer opens a support ticket on their claimed warranty', async () => {
    const res = await request(app)
      .post('/api/support/tickets')
      .set('Authorization', `Bearer ${tokenCustomer}`)
      .send({
        warrantyId: warranty._id,
        requestType: 'warranty_claim',
        subject: 'Left earbud driver has no sound',
        description: 'Left earbud stopped producing sound completely yesterday. No physical damage or liquid contact.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.ticket.ticketNumber).toBeDefined();
    ticketId = res.body.ticket._id;
  });

  it('4. Staff posts internal note - customer CANNOT see internal notes', async () => {
    // Staff posts internal note
    const staffNoteRes = await request(app)
      .post(`/api/support/tickets/${ticketId}/messages`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({
        message: 'Internal check: Serial SONY-0099 batch has known solder defect on left earbud.',
        visibility: 'company_internal'
      });

    expect(staffNoteRes.status).toBe(201);

    // Customer views ticket
    const customerView = await request(app)
      .get(`/api/support/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${tokenCustomer}`);

    expect(customerView.status).toBe(200);
    // Must NOT contain internal note!
    const hasInternalNote = customerView.body.messages.some(m => m.visibility === 'company_internal');
    expect(hasInternalNote).toBe(false);

    // Staff views ticket -> sees internal note!
    const staffView = await request(app)
      .get(`/api/support/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${tokenOwner}`);

    expect(staffView.status).toBe(200);
    const staffSeesInternal = staffView.body.messages.some(m => m.visibility === 'company_internal');
    expect(staffSeesInternal).toBe(true);
  });

  it('5. AI Support Agent runs structured investigation citing policy clauses', async () => {
    const res = await request(app)
      .post(`/api/ai/investigate/${ticketId}`)
      .set('Authorization', `Bearer ${tokenOwner}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.recommendation.recommendation).toBeDefined();
    expect(res.body.recommendation.humanDecisionRequired).toBe(true);
    expect(res.body.recommendation.policyReferences.length).toBeGreaterThan(0);
  });

  it('6. Retailer owner records human decision and customer receives notification', async () => {
    const res = await request(app)
      .post(`/api/support/tickets/${ticketId}/decisions`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({
        decision: 'approved',
        decisionReason: 'Driver hardware defect covered under clause cov-sound. Please bring to store for replacement unit.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.decision.decision).toBe('approved');

    // Verify customer received in-app notification
    const notification = await Notification.findOne({ recipientUserId: customer._id });
    expect(notification).toBeDefined();
    expect(notification.title).toContain('APPROVED');
  });
});

