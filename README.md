# MW (My Warranty) — Digital Warranty Management & Customer Support Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Cryptographic-Integrity](https://img.shields.io/badge/Integrity-RSA--SHA256-blueviolet.svg)](https://en.wikipedia.org/wiki/Digital_signature)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **"Your warranty. Make that story verifiable."**
>
> *MW (My Warranty)* is a multi-tenant digital warranty management and customer support platform designed for independent electronics and technology retailers, distributors, and businesses. It eliminates fraudulent and paper warranties through cryptographic tamper-evidence, structured AI-assisted investigations, dynamic warranty form definitions, and human-in-the-loop decisions.

---

## 📑 Table of Contents

- [Core Principles](#-core-principles)
- [Architecture & Monorepo Layout](#-architecture--monorepo-layout)
- [Key Features](#-key-features)
  - [1. Authentication & Onboarding](#1-authentication--onboarding)
  - [2. Multi-Tenant Role-Based Access Control (RBAC)](#2-multi-tenant-role-based-access-control-rbac)
  - [3. Company-Specific Warranty Policies](#3-company-specific-warranty-policies)
  - [4. Dynamic Warranty Form Builder](#4-dynamic-warranty-form-builder)
  - [5. Individual Warranty Issuance](#5-individual-warranty-issuance)
  - [6. Public QR Verification (Zero PII)](#6-public-qr-verification-zero-pii)
  - [7. Customer Warranty Claiming](#7-customer-warranty-claiming)
  - [8. Customer Support & Ticketing with Internal Notes](#8-customer-support--ticketing-with-internal-notes)
  - [9. AI Investigations & Human Decision Making](#9-ai-investigations--human-decision-making)
  - [10. Cryptographic Tamper-Evidence (RSA-SHA256)](#10-cryptographic-tamper-evidence-rsa-sha256)
- [Local Quickstart (Zero External Dependencies)](#-local-quickstart-zero-external-dependencies)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
- [Deployment Guide](#-deployment-guide)
  - [Database: MongoDB Atlas](#1-mongodb-atlas-setup)
  - [Backend: Render or Railway](#2-deploying-the-backend-render--railway)
  - [Frontend: Vercel](#3-deploying-the-frontend-vercel)
- [API Reference](#-api-reference)
- [Security & Privacy Specifications](#-security--privacy-specifications)

---

## 🛡️ Core Principles

1. **Company Autonomy**: Each business manages its own products, terms, form fields, and warranty policies. Ewnet never imposes universal warranty policies.
2. **Immutable History**: Issued warranties freeze the exact policy version and form definition that applied at issuance time. Future policy revisions do not retroactively alter previously issued warranties.
3. **AI Recommends, Humans Decide**: AI models investigate support claims, identify relevant clauses, and check coverage timelines, but an authorized company human officer makes every binding warranty decision.
4. **Privacy by Design**: Scanning a public warranty QR code verifies authenticity, model, and expiration without exposing sensitive customer PII (phone number, email, address, or purchase receipt).
5. **No Fake Functionality**: Full-stack integration with genuine database persistence, session security, cryptographic signatures, and robust test suites.

---

## 🏛️ Architecture & Monorepo Layout

Ewnet is built as a clean, modular JavaScript monorepo managed with native npm workspaces:

```
ewnet/
├── apps/
│   ├── api/                   # Express.js REST API modular monolith
│   │   ├── src/
│   │   │   ├── config/        # Environment, DB (with memory fallback), keys
│   │   │   ├── middleware/    # Auth, RBAC, error handler
│   │   │   ├── models/        # 18 Mongoose models
│   │   │   ├── routes/        # Modular Express REST route handlers
│   │   │   ├── services/      # Email, S3/local storage, RSA signing, PDF, audit
│   │   │   ├── app.js         # Express app initialization
│   │   │   ├── server.js      # HTTP listener & gracefull shutdown
│   │   │   └── seed.js        # Comprehensive multi-role demo seeder
│   │   └── test/              # Vitest + Supertest integration test suites
│   └── web/                   # Next.js 14 App Router full-featured frontend
│       ├── app/               # Public, Customer, Company, and Admin pages
│       ├── components/        # Reusable UI components & modals
│       ├── context/           # Session & Auth state provider
│       └── services/          # Fetch client wrapper
├── packages/
│   ├── shared/                # Canonical hashing, RSA cryptography, RBAC matrix, ID generators
│   ├── validation/            # Zod validation schemas for all requests
│   └── ai/                    # Structured Gemini AI investigation & assistance engines
├── docs/                      # In-depth architectural & deployment documentation
├── package.json               # Root monorepo workspace configuration
└── .env.example               # Complete environment variable template
```

---

## 🚀 Key Features

### 1. Authentication & Onboarding
- **Passwordless Email OTP**: Secure, 6-digit numeric OTP sent via email (or logged to console in dev mode).
- **Company Instant Activation**: Email verification is sufficient for a company to begin issuing digital warranties immediately without bureaucratic onboarding delays.
- **Secure Sessions**: HTTP-only cryptographically signed cookies with SHA-256 session token hashing in the database.

### 2. Multi-Tenant Role-Based Access Control (RBAC)
Five predefined company roles ensure strict operational segregation of duties:
| Role | Products & Forms | Policies | Issue Warranties | Support & Internal Notes | Final Claim Decisions | Manage Staff |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Owner** | Full | Full | Yes | Yes | Yes | Yes |
| **Admin** | Full | Full | Yes | Yes | Yes | Yes |
| **Warranty Officer** | Read | Read | Yes | Yes | View only | No |
| **Support Agent** | Read | Read | No | Yes | View only | No |
| **Viewer** | Read | Read | No | View only | View only | No |

*Platform Administrators* possess global oversight over all registered companies, platform-wide metrics, and audit logs.

### 3. Company-Specific Warranty Policies
- Policies are created as drafts with granular structured clauses:
  - Clause title, description, and clause type (`coverage`, `exclusion`, `condition`, `claim_procedure`, `void_condition`).
  - Required evidence tags (e.g., `["device_photo", "serial_photo", "error_video"]`).
  - Standard duration (months) and optional grace period (days).
- **Immutable Versioning**: When published, the policy becomes versioned (e.g. `v1.0.0`). Once published, a version can never be edited or deleted. Changes require publishing a new version.

### 4. Dynamic Warranty Form Builder
- Companies configure bespoke registration forms tailored to specific product categories (e.g., Smartphones, Laptops, Television sets, Home Appliances).
- Supported field types: `text`, `number`, `date`, `dropdown`, `checkbox`, `textarea`, `file_upload`.
- Configurable field rules: label, description, required toggle, regex validation, min/max length, min/max values.

### 5. Individual Warranty Issuance
- Salespersons or warranty officers select the product, published policy version, and published form version.
- Serial number uniqueness is validated per product.
- Form inputs are validated against the dynamic schema.
- Automatic computation of warranty expiration dates (taking into account warranty duration and purchase date).
- Generates a unique warranty number (e.g., `WTY-2026-ABC12345`), a unique QR verification token, and an instant printable PDF certificate with an embedded verification QR code.

### 6. Public QR Verification (Zero PII)
- Anyone (prospective buyer, customer, technician) can scan the physical or digital QR code or visit `/verify/[token]`.
- Displays authoritative verification status, company name, product title, model, warranty status (`active`, `expired`, `voided`, `pending`), issued date, expiry date, and coverage summary.
- **Strict Privacy**: Customer name, phone number, email address, serial number, and purchase receipt are never disclosed on the public endpoint.

### 7. Customer Warranty Claiming
- Customers add an issued warranty to their personal account dashboard by entering the Warranty ID or scanning the QR code, followed by verifying ownership via an email OTP sent to the registered customer email.
- Once claimed, the customer gains full access to view complete warranty terms, download the signed PDF certificate, and file support tickets.

### 8. Customer Support & Ticketing with Internal Notes
- Customers can file support claims specifying the issue, symptom date, and uploading diagnostic evidence (photos/videos).
- Two-way messaging between customer and company support staff.
- **Company Internal Notes**: Staff can post internal notes (`isInternal: true`) that are filtered out and strictly invisible to customers, allowing private team collaboration on warranty disputes.

### 9. AI Investigations & Human Decision Making
- When a claim is submitted, the **AI Support Investigation Agent** analyzes:
  - The exact policy version and clauses bound to the warranty.
  - The warranty coverage period vs. issue date.
  - The customer's problem description and uploaded evidence.
- The AI produces a structured investigation report:
  - Chronological timeline check (valid vs expired).
  - Applicable clauses cited by exact clause ID and title.
  - Identified missing information or evidence.
  - Confidence score, risk assessment, and non-binding preliminary recommendation.
- **Human Decision Lock**: The AI is explicitly barred from making decisions. Only an authorized human employee (Owner or Admin) records the final binding claim decision (`approved`, `rejected`, `more_information_required`) with an obligatory human rationale note.

### 10. Cryptographic Tamper-Evidence (RSA-SHA256)
- Every issued warranty generates a canonical JSON representation containing its immutable core attributes (warranty number, company ID, product ID, policy version ID, purchase date, expiry date, and serial number).
- A **SHA-256 record hash** is calculated from the canonical payload.
- The record hash is digitally signed using an **RSA-SHA256 private key**.
- The signature and public key ID are stored on the warranty record.
- Any party with the public key can independently verify that the warranty was issued by the platform and has not been altered or tampered with in the database.

---

## 💻 Local Quickstart (Zero External Dependencies)

Ewnet is built to start up immediately on any machine with Node.js installed. If you don't have a local MongoDB running, Ewnet automatically launches an in-memory MongoDB server!

### Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Koket-al/mywarranty.git
cd mywarranty
npm install
```

### 2. Configure Environment (Optional for local dev)
Copy the template file:
```bash
cp .env.example apps/api/.env
```
*(By default, without any configuration, Ewnet will run with an in-memory database, auto-generated RSA keys, and console email logging!)*

### 3. Seed Demo Data
Populate the database with pre-configured companies, products, policies, staff, and warranties:
```bash
npm run seed --workspace=apps/api
```

### 4. Start the Development Servers
Run both backend API and frontend Next.js app concurrently:
```bash
npm run dev
```

The services will be live at:
- **Frontend Web Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing & Quality Assurance

Ewnet includes 4 comprehensive integration test suites using **Vitest** and **Supertest** covering all major domain logic:

```bash
# Run all backend test suites
npm test --workspace=apps/api

# Run test suites with code coverage
npm run test:coverage --workspace=apps/api
```

### Included Test Suites:
1. `auth.test.js`:
   - Passwordless registration with OTP challenge generation.
   - OTP verification and session token issuance.
   - Duplicate user handling and secure session cookie authentication.
   - Company owner onboarding workflow.
2. `rbac_isolation.test.js`:
   - Multi-tenant boundary verification (Company A cannot view or alter Company B records).
   - Predefined role permission gating (`viewer` denied issuance; `warranty_officer` permitted).
   - Employee invitation acceptance and protection against removing the last owner.
3. `policy_warranty_signing.test.js`:
   - Policy drafting, clause definition, and immutable version publishing.
   - Rejection of edits to published policy versions.
   - Individual warranty issuance and expiration calculation.
   - RSA-SHA256 digital signature generation and verification.
   - Tamper-detection test (verifies signature fails if serial or expiry is altered).
4. `qr_claim_support.test.js`:
   - Public QR verification test (asserts 200 OK and validates zero PII is leaked).
   - Customer warranty claiming via QR token and OTP.
   - Support ticket creation and two-way messaging.
   - Company internal note privacy (asserts customer cannot read internal notes).
   - Structured AI investigation generation.
   - Human claim decision recording with human rationale.

---

## 🔑 Pre-Seeded Demo Accounts

When you run `npm run seed --workspace=apps/api`, the following accounts are ready to use:

| Role | Email | Password | Description |
|---|---|---|---|
| **Platform Admin** | `admin@ewnet.et` | `AdminSecure123!` | Global platform administrator |
| **Company Owner** | `owner@technova.et` | `OwnerSecure123!` | Owner of TechNova Electronics |
| **Warranty Officer** | `officer@technova.et` | `OfficerSecure123!` | Warranty Officer at TechNova |
| **Customer** | `customer@example.com` | `CustomerSecure123!` | End customer with claimed warranties |

*Note: For passwordless login via OTP in development mode (`EMAIL_PROVIDER=console`), the 6-digit OTP code is printed directly to your backend terminal logs and stored in the dev challenge store.*

---

## 🌐 Deployment Guide

### 1. MongoDB Atlas Setup
1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user (e.g., `ewnet_user`) with read/write privileges.
3. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere) so cloud providers can connect.
4. Click **Connect** -> **Connect your application** -> Copy the connection string:
   ```
   mongodb+srv://ewnet_user:<password>@cluster0.xxxxx.mongodb.net/ewnet?retryWrites=true&w=majority
   ```

### 2. Deploying the Backend (Render / Railway)
You can deploy the backend to [Render](https://render.com) or [Railway](https://railway.app) in 3 minutes:

1. Connect your GitHub repository (`mywarranty`).
2. Set **Root Directory**: `apps/api`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Configure the following **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://ewnet_user:<password>@cluster0.xxxxx.mongodb.net/ewnet?retryWrites=true&w=majority
   CLIENT_URL=https://your-frontend-app.vercel.app
   COOKIE_SECRET=generate-a-strong-32-character-secret-key-here
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-smtp-api-key
   EMAIL_FROM="Ewnet Support <support@yourdomain.com>"
   STORAGE_PROVIDER=local
   GEMINI_API_KEY=your-gemini-api-key
   ```
6. Deploy the web service and copy your public backend URL (e.g., `https://ewnet-api.onrender.com`).

### 3. Deploying the Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and import the `mywarranty` repository.
2. Select **Root Directory**: `apps/web`
3. Framework Preset: **Next.js**
4. Configure **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://ewnet-api.onrender.com/api
   ```
5. Click **Deploy**. Vercel will build and launch your production frontend!

---

## 📡 API Reference

A sample of core REST endpoints available in the backend:

### Authentication
- `POST /api/auth/register` — Request registration with email OTP
- `POST /api/auth/login` — Request login with password or OTP
- `POST /api/auth/verify-otp` — Verify 6-digit OTP code and receive session cookie
- `GET /api/auth/me` — Retrieve active authenticated user profile & active company
- `POST /api/auth/logout` — Invalidate session token

### Companies & Employees
- `POST /api/companies` — Register a new company (creates default roles & assigns Owner)
- `GET /api/companies/current` — Get current active company profile
- `POST /api/employees/invite` — Invite employee by email with a predefined role
- `GET /api/employees` — List all members of the active company

### Policies & Forms
- `POST /api/policies` — Create draft policy
- `POST /api/policies/:id/clauses` — Add structured clause to policy draft
- `POST /api/policies/:id/publish` — Publish draft into an immutable policy version
- `POST /api/forms` — Create and publish dynamic warranty registration form

### Warranties & Verification
- `POST /api/warranties` — Issue an individual digital warranty with RSA digital signature
- `GET /api/warranties` — List company warranties (with search & filters)
- `GET /api/warranties/:id` — Get warranty details with audit timeline and policy snapshot
- `GET /api/warranties/:id/pdf` — Download official printable PDF certificate
- `GET /api/verify/:token` — **Public QR verification** (cryptographic badge, zero PII)

### Customer Portal
- `POST /api/claim/request-otp` — Request claim OTP for a warranty ID / QR token
- `POST /api/claim/verify` — Claim warranty into customer account
- `GET /api/claim/my-warranties` — List all warranties claimed by authenticated customer

### Support & AI Investigations
- `POST /api/support/tickets` — Submit a new warranty claim/support ticket
- `GET /api/support/tickets/:id` — View ticket messages (filters internal notes for customers)
- `POST /api/support/tickets/:id/messages` — Post customer reply or company internal note
- `POST /api/ai/investigate-case` — Run structured AI investigation on support case
- `POST /api/decisions` — Record binding human claim decision (Owner/Admin only)

---

## 🔒 Security & Privacy Specifications

- **PII Shielding**: Public verification endpoints use an explicit projection denying access to customer email, phone, address, and upload receipts.
- **Internal Note Air-Gapping**: MongoDB queries for customer ticket views strictly enforce `{ isInternal: false }`. Internal company notes cannot leak over the network.
- **Asymmetric Signature Verification**: Every warranty contains a canonical SHA-256 fingerprint signed with the platform's private RSA key. The public verification endpoint checks the cryptographic validity against the public key.
- **Session Security**: Sessions use cryptographically random 256-bit tokens, stored only as SHA-256 hashes in the database. Cookies are configured with `HttpOnly`, `SameSite=Lax`, and `Secure` (in production).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

