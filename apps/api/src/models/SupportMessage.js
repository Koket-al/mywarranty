import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['customer', 'company', 'system'], required: true },
  message: { type: String, required: true, trim: true },
  attachments: [{ type: String }],
  visibility: { type: String, enum: ['customer_visible', 'company_internal'], default: 'customer_visible', index: true }
}, { timestamps: true });

export const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);

