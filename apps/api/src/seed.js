import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { connectDB, disconnectDB } from './config/db.js';
import { 
  User, 
  Company, 
  CompanyMember, 
  Product, 
  WarrantyPolicy, 
  WarrantyPolicyVersion, 
  Warranty, 
  QrToken, 
  WarrantyEvent,
  SupportTicket,
  SupportMessage
} from './models/index.js';
import { ROLES, WARRANTY_STATUS, TICKET_STATUS, generateWarrantyNumber, computeRecordHash } from '@ewnet/shared';
import { signWarrantyRecord } from './services/signatureService.js';

export async function seedDatabase(isQuiet = false) {
  if (!isQuiet) console.log('--> Seeding Ewnet database with realistic demo records...');
  await connectDB();

  // Clean existing records
  await Promise.all([
    User.deleteMany(),
    Company.deleteMany(),
    CompanyMember.deleteMany(),
    Product.deleteMany(),
    WarrantyPolicy.deleteMany(),
    WarrantyPolicyVersion.deleteMany(),
    Warranty.deleteMany(),
    QrToken.deleteMany(),
    WarrantyEvent.deleteMany(),
    SupportTicket.deleteMany(),
    SupportMessage.deleteMany()
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Platform Admin
  const admin = await User.create({
    fullName: 'System Administrator',
    email: 'admin@ewnet.et',
    passwordHash,
    emailVerified: true,
    isPlatformAdmin: true
  });

  // 2. Company Owner
  const owner = await User.create({
    fullName: 'Dawit Electronics Retail',
    email: 'owner@bole-electronics.et',
    passwordHash,
    emailVerified: true
  });

  const company = await Company.create({
    businessName: 'Bole Electronics',
    email: 'owner@bole-electronics.et',
    phone: '+251 91 122 3344',
    address: 'Bole Medhanialem Mall, 2nd Floor, Addis Ababa',
    description: 'Premier independent technology and electronics retailer in Addis Ababa.',
    ownerUserId: owner._id
  });

  await CompanyMember.create({
    companyId: company._id,
    userId: owner._id,
    role: ROLES.OWNER
  });

  // 3. Employee (Warranty Officer)
  const officer = await User.create({
    fullName: 'Sara Haile',
    email: 'sara@bole-electronics.et',
    passwordHash,
    emailVerified: true
  });

  await CompanyMember.create({
    companyId: company._id,
    userId: officer._id,
    role: ROLES.WARRANTY_OFFICER,
    invitedBy: owner._id
  });

  // 4. Customer
  const customer = await User.create({
    fullName: 'Abebe Kebede',
    email: 'abebe@example.com',
    passwordHash,
    emailVerified: true
  });

  // 5. Products
  const phone = await Product.create({
    companyId: company._id,
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    model: 'SM-S928B',
    category: 'Smartphones',
    description: 'Titanium Gray 512GB flagship smartphone.',
    serialNumberRequired: true
  });

  const laptop = await Product.create({
    companyId: company._id,
    name: 'MacBook Pro 16',
    brand: 'Apple',
    model: 'M3 Pro 36GB',
    category: 'Laptops',
    description: 'Space Black M3 Pro professional laptop.',
    serialNumberRequired: true
  });

  // 6. Policy & Version
  const policy = await WarrantyPolicy.create({
    companyId: company._id,
    name: 'Bole Premium 12-Month Hardware Guarantee',
    description: 'Comprehensive hardware and motherboard protection.',
    status: 'published',
    createdBy: owner._id
  });

  const clauses = [
    {
      clauseId: 'cov-motherboard',
      title: 'Motherboard & Internal Component Defect',
      text: 'Covers internal hardware failures, defective motherboards, processors, and factory assembly defects occurring under normal operational conditions.',
      type: 'coverage'
    },
    {
      clauseId: 'cov-display',
      title: 'Display and Screen Hardware Defect',
      text: 'Covers internal display panel malfunctions, pixel lines, and touch sensor failure not resulting from external physical impact.',
      type: 'coverage'
    },
    {
      clauseId: 'excl-liquid',
      title: 'Liquid and Moisture Damage',
      text: 'Excludes damage caused by water ingress, spills, high humidity, condensation, or immersion.',
      type: 'exclusion'
    },
    {
      clauseId: 'excl-drop',
      title: 'Physical Impact and Accidental Damage',
      text: 'Excludes cracked screens, bent chassis, dented enclosures, or internal breakage resulting from drops, falls, or excessive pressure.',
      type: 'exclusion'
    }
  ];

  const policyVersion = await WarrantyPolicyVersion.create({
    companyId: company._id,
    policyId: policy._id,
    versionNumber: 1,
    duration: 12,
    durationUnit: 'months',
    startDateRule: 'purchase_date',
    clauses,
    status: 'published',
    publishedBy: owner._id,
    publishedAt: new Date()
  });

  policy.currentPublishedVersionId = policyVersion._id;
  await policy.save();

  // 7. Issued Warranty
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2); // 2 months ago
  const expiryDate = new Date(startDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const warrantyDraft = {
    warrantyNumber: generateWarrantyNumber(1),
    companyId: company._id,
    customerId: customer._id,
    companySnapshot: {
      businessName: company.businessName,
      contactEmail: company.email
    },
    customerSnapshot: {
      fullName: customer.fullName,
      email: customer.email,
      phone: '+251 92 334 4556'
    },
    issuedBy: {
      userId: officer._id,
      role: ROLES.WARRANTY_OFFICER
    },
    product: {
      productId: phone._id,
      name: phone.name,
      brand: phone.brand,
      model: phone.model,
      serialNumber: 'R5CW30ABC99'
    },
    purchase: {
      purchaseDate: startDate,
      invoiceReference: 'INV-2026-0899'
    },
    warranty: {
      startDate,
      expiryDate,
      duration: 12,
      durationUnit: 'months'
    },
    policySnapshot: {
      policyId: policy._id,
      policyVersionId: policyVersion._id,
      name: policy.name,
      duration: policyVersion.duration,
      durationUnit: policyVersion.durationUnit,
      startDateRule: policyVersion.startDateRule,
      clauses,
      snapshotHash: computeRecordHash(clauses)
    },
    recordStatus: WARRANTY_STATUS.CLAIMED,
    issuedAt: startDate
  };

  const integrity = signWarrantyRecord(warrantyDraft);
  warrantyDraft.recordIntegrity = {
    algorithm: integrity.algorithm,
    recordHash: integrity.recordHash,
    signature: integrity.signature,
    keyId: integrity.keyId
  };

  const warranty = await Warranty.create(warrantyDraft);

  // QR Token
  const demoQrToken = 'demo-qr-token-bole-galaxy-2026';
  const qrHash = crypto.createHash('sha256').update(demoQrToken).digest('hex');
  await QrToken.create({
    warrantyId: warranty._id,
    tokenHash: qrHash,
    status: 'active'
  });

  await WarrantyEvent.create({
    warrantyId: warranty._id,
    companyId: company._id,
    eventType: 'WARRANTY_ISSUED',
    actorUserId: officer._id,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    eventHash: integrity.recordHash,
    metadata: { warrantyNumber: warranty.warrantyNumber }
  });

  // 8. Sample Support Ticket
  const ticket = await SupportTicket.create({
    ticketNumber: 'TCK-2026-00001',
    companyId: company._id,
    customerId: customer._id,
    warrantyId: warranty._id,
    requestType: 'warranty_claim',
    subject: 'Display flickering and vertical line issue',
    description: 'A thin green vertical line appeared on the right side of the screen yesterday during normal use. The phone was never dropped or wet.',
    status: TICKET_STATUS.OPEN
  });

  await SupportMessage.create({
    ticketId: ticket._id,
    senderId: customer._id,
    senderRole: 'customer',
    message: ticket.description,
    visibility: 'customer_visible'
  });

  if (!isQuiet) {
    console.log('--> Seed completed successfully!');
    console.log('---------------------------------------------------------');
    console.log('Demo Accounts Created:');
    console.log('1. Platform Admin: admin@ewnet.et / Password123!');
    console.log('2. Company Owner:  owner@bole-electronics.et / Password123!');
    console.log('3. Staff Officer:  sara@bole-electronics.et / Password123!');
    console.log('4. Customer User:  abebe@example.com / Password123!');
    console.log(`Demo QR Verify Link: /verify/${demoQrToken}`);
    console.log('---------------------------------------------------------');
  }
}

// If executed directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase(false)
    .then(() => disconnectDB())
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

