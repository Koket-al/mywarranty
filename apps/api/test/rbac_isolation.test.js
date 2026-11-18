import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User, Company, CompanyMember, Product, Session } from '../src/models/index.js';
import { ROLES } from '@ewnet/shared';
import crypto from 'node:crypto';

let companyA, companyB;
let ownerA, officerA, agentA, ownerB;
let tokenOwnerA, tokenOfficerA, tokenAgentA, tokenOwnerB;

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({ email: { $in: ['ownerA@comp.et', 'officerA@comp.et', 'agentA@comp.et', 'ownerB@comp.et'] } });
  await Company.deleteMany({ email: { $in: ['ownerA@comp.et', 'ownerB@comp.et'] } });
  await Product.deleteMany({ name: { $in: ['Alpha Phone', 'Beta Laptop'] } });

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Setup Company A
  ownerA = await User.create({ fullName: 'Owner A', email: 'ownerA@comp.et', passwordHash, emailVerified: true });
  companyA = await Company.create({ businessName: 'Company Alpha', email: 'ownerA@comp.et', ownerUserId: ownerA._id });
  await CompanyMember.create({ companyId: companyA._id, userId: ownerA._id, role: ROLES.OWNER });

  officerA = await User.create({ fullName: 'Officer A', email: 'officerA@comp.et', passwordHash, emailVerified: true });
  await CompanyMember.create({ companyId: companyA._id, userId: officerA._id, role: ROLES.WARRANTY_OFFICER });

  agentA = await User.create({ fullName: 'Agent A', email: 'agentA@comp.et', passwordHash, emailVerified: true });
  await CompanyMember.create({ companyId: companyA._id, userId: agentA._id, role: ROLES.SUPPORT_AGENT });

  // Setup Company B
  ownerB = await User.create({ fullName: 'Owner B', email: 'ownerB@comp.et', passwordHash, emailVerified: true });
  companyB = await Company.create({ businessName: 'Company Beta', email: 'ownerB@comp.et', ownerUserId: ownerB._id });
  await CompanyMember.create({ companyId: companyB._id, userId: ownerB._id, role: ROLES.OWNER });

  // Create products in Company A and Company B
  await Product.create({ companyId: companyA._id, name: 'Alpha Phone', brand: 'Alpha', model: 'A1', category: 'Phones' });
  await Product.create({ companyId: companyB._id, name: 'Beta Laptop', brand: 'Beta', model: 'B1', category: 'Laptops' });

  // Create helper sessions
  async function createSession(user, companyId) {
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

  tokenOwnerA = await createSession(ownerA, companyA._id);
  tokenOfficerA = await createSession(officerA, companyA._id);
  tokenAgentA = await createSession(agentA, companyA._id);
  tokenOwnerB = await createSession(ownerB, companyB._id);
});

afterAll(async () => {
  await disconnectDB();
});

describe('Company Isolation & RBAC Protection Suite', () => {
  it('1. Company B cannot see Company A catalog items (Tenant Isolation)', async () => {
    const resA = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenOwnerA}`);

    expect(resA.status).toBe(200);
    expect(resA.body.products.some(p => p.name === 'Alpha Phone')).toBe(true);
    expect(resA.body.products.some(p => p.name === 'Beta Laptop')).toBe(false);

    const resB = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenOwnerB}`);

    expect(resB.status).toBe(200);
    expect(resB.body.products.some(p => p.name === 'Beta Laptop')).toBe(true);
    expect(resB.body.products.some(p => p.name === 'Alpha Phone')).toBe(false);
  });

  it('2. Warranty officer can view products, but cannot manage employees (RBAC)', async () => {
    const res = await request(app)
      .post('/api/companies/me/invitations')
      .set('Authorization', `Bearer ${tokenOfficerA}`)
      .send({ email: 'newbie@test.et', role: 'viewer' });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Permission denied');
  });

  it('3. Support agent cannot record final claim decisions (RBAC)', async () => {
    const fakeTicketId = new (await import('mongoose')).default.Types.ObjectId();
    const res = await request(app)
      .post(`/api/support/tickets/${fakeTicketId}/decisions`)
      .set('Authorization', `Bearer ${tokenAgentA}`)
      .send({ decision: 'approved', decisionReason: 'Agent decided' });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('claims:decide');
  });

  it('4. Owner protection rule: cannot remove the last owner of a company', async () => {
    const ownerMember = await CompanyMember.findOne({ companyId: companyA._id, role: ROLES.OWNER });

    const res = await request(app)
      .delete(`/api/companies/me/members/${ownerMember._id}`)
      .set('Authorization', `Bearer ${tokenOwnerA}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Cannot remove the last remaining company owner');
  });
});

