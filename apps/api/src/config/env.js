import dotenv from 'dotenv';
import path from 'node:path';
import crypto from 'node:crypto';

// Load .env from root or current dir
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

// Ensure development RSA keypair exists if not provided
let defaultPrivateKey = process.env.WARRANTY_SIGNING_PRIVATE_KEY;
let defaultPublicKey = process.env.WARRANTY_SIGNING_PUBLIC_KEY;

if (!defaultPrivateKey || !defaultPublicKey) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  defaultPrivateKey = privateKey;
  defaultPublicKey = publicKey;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  WEB_URL: process.env.WEB_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:5000',
  
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ewnet_db',
  SESSION_SECRET: process.env.SESSION_SECRET || 'ewnet-dev-session-secret-at-least-32-chars-long',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'console',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '2525', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Ewnet Support <no-reply@ewnet.et>',

  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'ewnet-evidence',
  R2_PUBLIC_ENDPOINT: process.env.R2_PUBLIC_ENDPOINT || '',

  AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'mock',

  WARRANTY_SIGNING_PRIVATE_KEY: defaultPrivateKey,
  WARRANTY_SIGNING_PUBLIC_KEY: defaultPublicKey,
  WARRANTY_SIGNING_KEY_ID: process.env.WARRANTY_SIGNING_KEY_ID || 'ewnet-key-2026-v1',

  BOOTSTRAP_ADMIN_EMAIL: process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@ewnet.et',
  BOOTSTRAP_ADMIN_SECRET: process.env.BOOTSTRAP_ADMIN_SECRET || 'Admin123456!'
};

