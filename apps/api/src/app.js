import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'node:path';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import productRoutes from './routes/productRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import formRoutes from './routes/formRoutes.js';
import warrantyRoutes from './routes/warrantyRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import decisionRoutes from './routes/decisionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

export const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS Configuration
const allowedOrigins = [
  env.WEB_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev convenience
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving for local evidence viewing
app.use('/api/support/evidence-file', express.static(path.resolve(process.cwd(), 'uploads')));

// Health Check
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ewnet-api',
    time: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api', employeeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/warranty-forms', formRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/support', decisionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Central error handler
app.use(errorHandler);

export default app;

