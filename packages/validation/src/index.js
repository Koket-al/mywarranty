import { z } from 'zod';

export const customerRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Valid email is required').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const companyRegisterSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Valid business email is required').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
});

export const otpVerifySchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otpCode: z.string().min(4).max(8),
  purpose: z.enum(['email_verification', 'claim_verification', 'password_reset']).default('email_verification')
});

export const inviteEmployeeSchema = z.object({
  email: z.string().email('Valid employee email is required').toLowerCase().trim(),
  role: z.enum(['admin', 'warranty_officer', 'support_agent', 'viewer'])
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().default(''),
  serialNumberRequired: z.boolean().default(true)
});

export const policyClauseSchema = z.object({
  clauseId: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
  type: z.enum(['coverage', 'exclusion', 'procedure', 'general']).default('general')
});

export const policyDraftSchema = z.object({
  name: z.string().min(2, 'Policy name is required'),
  description: z.string().optional().default(''),
  duration: z.coerce.number().positive('Duration must be positive'),
  durationUnit: z.enum(['days', 'months', 'years']).default('months'),
  startDateRule: z.enum(['purchase_date', 'issuance_date']).default('purchase_date'),
  clauses: z.array(policyClauseSchema).min(1, 'At least one policy clause is required')
});

export const formFieldSchema = z.object({
  fieldId: z.string().min(1),
  label: z.string().min(1),
  fieldType: z.enum(['text', 'textarea', 'number', 'date', 'select', 'checkbox']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional().default([]),
  helpText: z.string().optional().default(''),
  displayOrder: z.number().default(0)
});

export const formSchema = z.object({
  name: z.string().min(2, 'Form schema name is required'),
  fields: z.array(formFieldSchema).default([])
});

export const warrantyIssueSchema = z.object({
  productId: z.string().min(1, 'Product selection is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Valid customer email is required').toLowerCase().trim(),
  customerPhone: z.string().optional().default(''),
  serialNumber: z.string().optional().default(''),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  invoiceReference: z.string().optional().default(''),
  policyId: z.string().min(1, 'Policy selection is required'),
  formSchemaId: z.string().optional(),
  customFieldValues: z.record(z.any()).optional().default({})
});

export const warrantyAccountClaimSchema = z.object({
  warrantyIdOrToken: z.string().min(1, 'Warranty ID or QR Token is required')
});

export const supportTicketCreateSchema = z.object({
  warrantyId: z.string().min(1, 'Warranty reference is required'),
  requestType: z.enum(['warranty_claim', 'product_issue', 'warranty_question', 'document_correction']).default('warranty_claim'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters')
});

export const supportMessageCreateSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  visibility: z.enum(['customer_visible', 'company_internal']).default('customer_visible')
});

export const claimDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'more_information_required']),
  decisionReason: z.string().min(5, 'A clear decision explanation is required')
});

