# Ewnet (እውነት) — Full Deployment Guide

This document provides step-by-step instructions for deploying the Ewnet Digital Warranty Platform across production environments.

---

## 1. Architecture Overview

- **Frontend**: Next.js 14 App Router, hosted on [Vercel](https://vercel.com) or as a Node.js container.
- **Backend API**: Express.js REST API, hosted on [Render](https://render.com), [Railway](https://railway.app), or [AWS ECS/Fly.io](https://fly.io).
- **Database**: MongoDB Atlas (Cloud Managed M0/M10+).
- **Storage**: Cloudflare R2 / AWS S3 (for receipts and PDF storage) or persistent local disk storage.
- **Email**: SendGrid / Resend / AWS SES / Mailgun (SMTP).

---

## 2. Setting Up MongoDB Atlas

1. Visit [cloud.mongodb.com](https://cloud.mongodb.com/) and register or log in.
2. Click **Create a Deployment** -> Select **M0 Free** (Shared).
3. Select your preferred Cloud Provider and Region (e.g. AWS / Frankfurt or Ireland for East Africa proximity).
4. **Security Quickstart**:
   - Create a database user:
     - Username: `ewnet_app`
     - Password: Save a strong 24-character password.
   - Network Access:
     - Click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`) so dynamic cloud IPs can connect.
5. In your cluster dashboard, click **Connect** -> **Drivers** -> Select **Node.js**.
6. Copy the connection string:
   ```
   mongodb+srv://ewnet_app:<password>@cluster0.abcde.mongodb.net/ewnet?retryWrites=true&w=majority
   ```

---

## 3. Cryptographic Key Generation

Ewnet uses RSA-SHA256 asymmetric signing to generate tamper-evident signatures on issued warranties.

Generate your production 2048-bit RSA keypair:

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem
```

You can encode them to base64 or single line format with `\n` to set as environment variables:

```bash
# In Linux / macOS:
export RSA_PRIVATE_KEY="$(cat private.pem)"
export RSA_PUBLIC_KEY="$(cat public.pem)"
```

---

## 4. Backend Deployment (Render.com)

1. Sign up at [Render.com](https://render.com) and link your GitHub account.
2. Click **New +** -> **Web Service**.
3. Connect your repository: `https://github.com/Koket-al/mywarranty`.
4. Configure service settings:
   - **Name**: `ewnet-api`
   - **Region**: Frankfurt (EU Central)
   - **Branch**: `main`
   - **Root Directory**: `apps/api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** -> **Add Environment Variable**:
   | Variable | Example Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGODB_URI` | `mongodb+srv://...` |
   | `CLIENT_URL` | `https://ewnet.vercel.app` |
   | `COOKIE_SECRET` | *random 32+ character string* |
   | `RSA_PRIVATE_KEY` | *content of private.pem* |
   | `RSA_PUBLIC_KEY` | *content of public.pem* |
   | `EMAIL_PROVIDER` | `smtp` |
   | `SMTP_HOST` | `smtp.sendgrid.net` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | `apikey` |
   | `SMTP_PASS` | *your SendGrid API key* |
   | `EMAIL_FROM` | `Ewnet <support@yourdomain.com>` |
   | `STORAGE_PROVIDER` | `local` |
   | `GEMINI_API_KEY` | *your Google AI Gemini API key* |
6. Click **Create Web Service**. Render will build and deploy your Express API.

---

## 5. Frontend Deployment (Vercel)

1. Sign up at [Vercel.com](https://vercel.com) and link your GitHub account.
2. Click **Add New...** -> **Project** -> Import `mywarranty`.
3. In **Project Configuration**:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click edit and select `apps/web`
4. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL` = `https://ewnet-api.onrender.com/api`
5. Click **Deploy**.
6. When deployment finishes, note your Vercel URL (e.g., `https://ewnet.vercel.app`) and ensure it matches the `CLIENT_URL` in your backend Render settings.

---

## 6. Verifying Production Deployment

1. Visit `https://ewnet-api.onrender.com/api/health` to verify the backend is running and connected to MongoDB.
2. Open `https://ewnet.vercel.app` in your browser.
3. Register a test company account at `/register-company`.
4. Enter the email OTP to verify the account.
5. Issue your first warranty, scan the QR code with your mobile camera, and verify the cryptographic integrity badge!

