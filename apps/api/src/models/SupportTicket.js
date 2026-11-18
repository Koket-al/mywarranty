import mongoose from 'mongoose';
import { TICKET_STATUS } from '@ewnet/shared';

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  warrantyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warranty', required: true, index: true },
  requestType: { 
    type: String, 
    enum: ['warranty_claim', 'product_issue', 'warranty_question', 'document_correction'], 
    default: 'warranty_claim' 
  },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: [
      TICKET_STATUS.OPEN, 
      TICKET_STATUS.UNDER_REVIEW, 
      TICKET_STATUS.WAITING_FOR_CUSTOMER, 
      TICKET_STATUS.DECISION_MADE, 
      TICKET_STATUS.CLOSED
    ], 
    default: TICKET_STATUS.OPEN 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

