import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User, OtpChallenge } from '../src/models/index.js';
import { devOtpStore } from '../src/services/emailService.js';

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({ email: { $in: ['tester@customer.et', 'shopowner@retail.et'] } });
  await OtpChallenge.deleteMany({ email: { $in: ['tester@customer.et', 'shopowner@retail.et'] } });
});

afterAll(async () => {
  await disconnectDB();
});

describe('Authentication & Email OTP Suite', () => {
  const customerEmail = 'tester@customer.et';
  const ownerEmail = 'shopowner@retail.et';

  it('1. should register a customer account and send an OTP', async () => {
    const res = await request(app)
      .post('/api/auth/customer/register')
      .send({
        fullName: 'Test Customer',
        email: customerEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({ email: customerEmail });
    expect(user).toBeDefined();
    expect(user.emailVerified).toBe(false);
  });

  it('2. should reject duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/customer/register')
      .send({
        fullName: 'Duplicate Customer',
        email: customerEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('3. should verify customer email using OTP', async () => {
    const otp = devOtpStore.get(`${customerEmail}:Email Verification`);
    expect(otp).toBeDefined();

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({
        email: customerEmail,
        otpCode: otp,
        purpose: 'email_verification'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({ email: customerEmail });
    expect(user.emailVerified).toBe(true);
  });

  it('4. should log in verified customer and set session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: customerEmail,
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(customerEmail);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('5. should register company owner, create company, and verify email', async () => {
    const res = await request(app)
      .post('/api/auth/company/register')
      .send({
        businessName: 'Addis Tech Retailers',
        email: ownerEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const otp = devOtpStore.get(`${ownerEmail}:Company Registration Verification`);
    expect(otp).toBeDefined();

    const verifyRes = await request(app)
      .post('/api/auth/verify-email')
      .send({
        email: ownerEmail,
        otpCode: otp,
        purpose: 'email_verification'
      });

    expect(verifyRes.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: ownerEmail,
        password: 'Password123!'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.memberships.length).toBe(1);
    expect(loginRes.body.memberships[0].role).toBe('owner');
  });
});

