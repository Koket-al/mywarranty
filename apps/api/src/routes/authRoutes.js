import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { User, Company, CompanyMember, OtpChallenge, Session } from '../models/index.js';
import { customerRegisterSchema, companyRegisterSchema, loginSchema, otpVerifySchema } from '@ewnet/validation';
import { generateOtp, hashOtp, sendOtpEmail } from '../services/emailService.js';
import { logAuditEvent } from '../services/auditService.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { ROLES } from '@ewnet/shared';

const router = express.Router();

/**
 * Register a customer account
 */
router.post('/customer/register', async (req, res, next) => {
  try {
    const data = customerRegisterSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      emailVerified: false
    });

    // Generate and send OTP
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    await OtpChallenge.create({
      email: user.email,
      otpHash,
      purpose: 'email_verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOtpEmail(user.email, otp, 'Email Verification');
    await logAuditEvent({ actorUserId: user._id, action: 'USER_REGISTERED', resourceType: 'User', resourceId: user._id, req });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please enter the OTP sent to your email.',
      email: user.email
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Register a company owner and company record
 */
router.post('/company/register', async (req, res, next) => {
  try {
    const data = companyRegisterSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      fullName: data.businessName,
      email: data.email,
      passwordHash,
      emailVerified: false
    });

    const company = await Company.create({
      businessName: data.businessName,
      email: data.email,
      ownerUserId: user._id
    });

    await CompanyMember.create({
      companyId: company._id,
      userId: user._id,
      role: ROLES.OWNER
    });

    // Generate and send OTP
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    await OtpChallenge.create({
      email: user.email,
      otpHash,
      purpose: 'email_verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOtpEmail(user.email, otp, 'Company Registration Verification');
    await logAuditEvent({ 
      actorUserId: user._id, 
      companyId: company._id, 
      action: 'COMPANY_REGISTERED', 
      resourceType: 'Company', 
      resourceId: company._id, 
      req 
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully. Please enter the OTP sent to your email to activate issuance.',
      email: user.email,
      companyId: company._id
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Verify Email OTP
 */
router.post('/verify-email', async (req, res, next) => {
  try {
    const { email, otpCode, purpose } = otpVerifySchema.parse(req.body);
    const otpHash = hashOtp(otpCode);

    const challenge = await OtpChallenge.findOne({
      email,
      purpose,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!challenge) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' });
    }

    if (challenge.attempts >= 5) {
      return res.status(429).json({ success: false, error: 'Too many failed attempts. Please request a new code.' });
    }

    if (challenge.otpHash !== otpHash) {
      challenge.attempts += 1;
      await challenge.save();
      return res.status(400).json({ success: false, error: 'Incorrect verification code.' });
    }

    // Mark user verified
    challenge.verifiedAt = new Date();
    await challenge.save();

    const user = await User.findOneAndUpdate(
      { email },
      { emailVerified: true },
      { new: true }
    );

    await logAuditEvent({ actorUserId: user?._id, action: 'EMAIL_VERIFIED', resourceType: 'User', resourceId: user?._id, req });

    res.status(200).json({
      success: true,
      message: 'Email successfully verified. You can now log in.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Resend OTP
 */
router.post('/resend-otp', async (req, res, next) => {
  try {
    const { email, purpose = 'email_verification' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Do not reveal email existence
      return res.status(200).json({ success: true, message: 'If an account exists, a new code has been sent.' });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await OtpChallenge.create({
      email: user.email,
      otpHash,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOtpEmail(user.email, otp, purpose);

    res.status(200).json({ success: true, message: 'Verification code resent.' });
  } catch (err) {
    next(err);
  }
});

/**
 * Login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in.',
        requiresEmailVerification: true,
        email: user.email
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.' });
    }

    // Create session token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const memberships = await CompanyMember.find({ userId: user._id, status: 'active' }).populate('companyId');
    const activeCompanyId = memberships.length > 0 ? (memberships[0].companyId._id || memberships[0].companyId) : null;

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await Session.create({
      tokenHash,
      userId: user._id,
      activeCompanyId,
      userAgent: req.headers['user-agent'] || '',
      expiresAt
    });

    // Set secure cookie
    res.cookie('ewnet_session', rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt
    });

    await logAuditEvent({ actorUserId: user._id, action: 'USER_LOGIN', resourceType: 'Session', resourceId: user._id, req });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token: rawToken, // Provided for mobile/SPA clients
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isPlatformAdmin: user.isPlatformAdmin
      },
      memberships: memberships.map(m => ({
        companyId: m.companyId._id || m.companyId,
        businessName: m.companyId.businessName || 'Company',
        role: m.role
      }))
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Logout
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    if (req.session) {
      await Session.findByIdAndDelete(req.session._id);
    }
    res.clearCookie('ewnet_session');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * Current User Profile & Context
 */
router.get('/me', authenticate, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      isPlatformAdmin: req.user.isPlatformAdmin
    },
    activeCompany: req.company ? {
      id: req.company._id,
      businessName: req.company.businessName,
      email: req.company.email,
      role: req.role
    } : null,
    memberships: req.memberships.map(m => ({
      companyId: m.companyId._id || m.companyId,
      businessName: m.companyId.businessName || 'Company',
      role: m.role
    }))
  });
});

export default router;

