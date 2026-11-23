import crypto from 'node:crypto';
import { Session, User, CompanyMember } from '../models/index.js';

/**
 * Authenticates request via HTTP-only cookie or Bearer authorization header.
 * Resolves active session, user identity, and tenant company context.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authenticate(req, res, next) {
  try {
    // Check cookie or Bearer header
    const token = req.cookies?.mw_session || req.cookies?.ewnet_session || req.headers?.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await Session.findOne({ tokenHash, expiresAt: { $gt: new Date() } });

    if (!session) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid. Please log in again.' });
    }

    const user = await User.findById(session.userId);
    if (!user || user.status === 'suspended') {
      return res.status(401).json({ success: false, error: 'Account suspended or not found.' });
    }

    req.user = user;
    req.session = session;

    // Load active company memberships
    const memberships = await CompanyMember.find({ userId: user._id, status: 'active' }).populate('companyId');
    req.memberships = memberships;

    // Resolve active company context
    const requestedCompanyId = req.headers['x-company-id'] || session.activeCompanyId;
    let activeMembership = null;

    if (requestedCompanyId) {
      activeMembership = memberships.find(m => String(m.companyId._id || m.companyId) === String(requestedCompanyId));
    } else if (memberships.length > 0) {
      activeMembership = memberships[0];
    }

    if (activeMembership) {
      req.activeMembership = activeMembership;
      req.companyId = activeMembership.companyId._id || activeMembership.companyId;
      req.company = activeMembership.companyId;
      req.role = activeMembership.role;
    } else if (user.isPlatformAdmin) {
      req.role = 'platform_admin';
    } else {
      req.role = 'customer';
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication: attaches user if session exists, but doesn't block unauthenticated guests
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies?.mw_session || req.cookies?.ewnet_session || req.headers?.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return next();

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await Session.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
    if (!session) return next();

    const user = await User.findById(session.userId);
    if (user && user.status === 'active') {
      req.user = user;
      req.session = session;
    }
    next();
  } catch (err) {
    next();
  }
}

