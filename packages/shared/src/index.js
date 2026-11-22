import crypto from 'node:crypto';

// ============================================================================
// Roles and Permissions Matrix
// ============================================================================

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  WARRANTY_OFFICER: 'warranty_officer',
  SUPPORT_AGENT: 'support_agent',
  VIEWER: 'viewer',
  PLATFORM_ADMIN: 'platform_admin'
};

export const PERMISSIONS = {
  // Company
  MANAGE_COMPANY_PROFILE: 'company:manage_profile',
  INVITE_EMPLOYEES: 'employees:invite',
  MANAGE_EMPLOYEES: 'employees:manage',

  // Products
  CREATE_PRODUCT: 'products:create',
  UPDATE_PRODUCT: 'products:update',
  VIEW_PRODUCTS: 'products:view',

  // Policies
  CREATE_POLICY: 'policies:create',
  UPDATE_POLICY_DRAFT: 'policies:update_draft',
  PUBLISH_POLICY: 'policies:publish',
  VIEW_POLICIES: 'policies:view',

  // Forms
  MANAGE_FORMS: 'forms:manage',
  VIEW_FORMS: 'forms:view',

  // Warranties
  ISSUE_WARRANTY: 'warranties:create',
  VIEW_WARRANTIES: 'warranties:view',
  CORRECT_WARRANTY: 'warranties:correct',
  REVOKE_WARRANTY: 'warranties:revoke',

  // Claims & Decisions
  REVIEW_CLAIMS: 'claims:review',
  DECIDE_CLAIMS: 'claims:decide',

  // Support
  MANAGE_SUPPORT: 'support:manage',

  // Reports
  VIEW_REPORTS: 'reports:view'
};

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS),

  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.UPDATE_PRODUCT,
    PERMISSIONS.VIEW_POLICIES,
    PERMISSIONS.CREATE_POLICY,
    PERMISSIONS.UPDATE_POLICY_DRAFT,
    PERMISSIONS.PUBLISH_POLICY,
    PERMISSIONS.VIEW_FORMS,
    PERMISSIONS.MANAGE_FORMS,
    PERMISSIONS.VIEW_WARRANTIES,
    PERMISSIONS.ISSUE_WARRANTY,
    PERMISSIONS.CORRECT_WARRANTY,
    PERMISSIONS.REVIEW_CLAIMS,
    PERMISSIONS.DECIDE_CLAIMS,
    PERMISSIONS.MANAGE_SUPPORT,
    PERMISSIONS.VIEW_REPORTS
  ],

  [ROLES.WARRANTY_OFFICER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_POLICIES,
    PERMISSIONS.VIEW_FORMS,
    PERMISSIONS.VIEW_WARRANTIES,
    PERMISSIONS.ISSUE_WARRANTY,
    PERMISSIONS.REVIEW_CLAIMS
  ],

  [ROLES.SUPPORT_AGENT]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_POLICIES,
    PERMISSIONS.VIEW_FORMS,
    PERMISSIONS.VIEW_WARRANTIES,
    PERMISSIONS.MANAGE_SUPPORT,
    PERMISSIONS.REVIEW_CLAIMS
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_POLICIES,
    PERMISSIONS.VIEW_FORMS,
    PERMISSIONS.VIEW_WARRANTIES,
    PERMISSIONS.VIEW_REPORTS
  ]
};

export function hasPermission(role, permission) {
  if (!role) return false;
  if (role === ROLES.PLATFORM_ADMIN) return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

// ============================================================================
// Lifecycle & Business Statuses
// ============================================================================

export const WARRANTY_STATUS = {
  ISSUED: 'issued',
  CLAIMED: 'claimed',
  EXPIRED: 'expired',
  REVOKED: 'revoked'
};

export const TICKET_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  WAITING_FOR_CUSTOMER: 'waiting_for_customer',
  DECISION_MADE: 'decision_made',
  CLOSED: 'closed'
};

export const AI_RECOMMENDATION = {
  RECOMMEND_APPROVAL: 'recommend_approval',
  RECOMMEND_REJECTION: 'recommend_rejection',
  REQUEST_MORE_INFORMATION: 'request_more_information',
  NEEDS_MANUAL_INVESTIGATION: 'needs_manual_investigation'
};

export const CLAIM_DECISION = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
  MORE_INFO_REQUIRED: 'more_information_required'
};

// ============================================================================
// Canonical JSON Serialization & Hashing
// ============================================================================

/**
 * Deterministically sorts object keys for reproducible hashing
 * @param {*} obj - Target payload to serialize
 * @param {WeakSet} [seen] - Set of circular reference markers
 * @returns {string} Canonical JSON string
 */
export function canonicalStringify(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (obj instanceof Date) {
    return JSON.stringify(obj.toISOString());
  }
  if (typeof obj.toHexString === 'function') {
    return JSON.stringify(obj.toHexString());
  }
  if (typeof obj.toJSON === 'function') {
    return canonicalStringify(obj.toJSON(), seen);
  }
  if (seen.has(obj)) {
    return 'null';
  }
  seen.add(obj);

  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalStringify(item, seen)).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).filter(k => !k.startsWith('$')).sort();
  const pairs = sortedKeys.map(k => `${JSON.stringify(k)}:${canonicalStringify(obj[k], seen)}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Computes SHA-256 hash of canonical JSON string
 */
export function computeRecordHash(payload) {
  const canonical = canonicalStringify(payload);
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/**
 * Signs data using RSA/ECDSA private key (PEM string)
 */
export function signPayload(canonicalString, privateKeyPem) {
  const sign = crypto.createSign('SHA256');
  sign.update(canonicalString);
  sign.end();
  return sign.sign(privateKeyPem, 'hex');
}

/**
 * Verifies signature using RSA/ECDSA public key (PEM string)
 */
export function verifySignature(canonicalString, signatureHex, publicKeyPem) {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(canonicalString);
    verify.end();
    return verify.verify(publicKeyPem, signatureHex, 'hex');
  } catch (err) {
    return false;
  }
}

/**
 * Formats a unique warranty number
 */
export function generateWarrantyNumber(sequence = 1) {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(6, '0');
  return `EWN-${year}-${padded}`;
}

/**
 * Formats a support ticket number
 */
export function generateTicketNumber(sequence = 1) {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(5, '0');
  return `TCK-${year}-${padded}`;
}

