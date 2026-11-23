import { hasPermission } from '@ewnet/shared';

/**
 * Enforces specific company permission (e.g. warranties:create, claims:decide)
 * @param {string} permission - Granular action permission identifier from @ewnet/shared
 * @returns {import('express').RequestHandler}
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (req.user.isPlatformAdmin) {
      return next();
    }

    if (!req.companyId || !req.role) {
      return res.status(403).json({ 
        success: false, 
        error: 'Active company membership required for this operation' 
      });
    }

    if (!hasPermission(req.role, permission)) {
      return res.status(403).json({ 
        success: false, 
        error: `Permission denied. Your role (${req.role}) does not have permission '${permission}'.` 
      });
    }

    next();
  };
}

/**
 * Enforces platform administrator role
 */
export function requirePlatformAdmin(req, res, next) {
  if (!req.user || !req.user.isPlatformAdmin) {
    return res.status(403).json({ 
      success: false, 
      error: 'Platform administrator access required' 
    });
  }
  next();
}

/**
 * Ensures user is an authenticated customer
 */
export function requireCustomer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Customer login required' });
  }
  next();
}

