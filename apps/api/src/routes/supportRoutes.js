import express from 'express';
import multer from 'multer';
import { 
  SupportTicket, 
  SupportMessage, 
  SupportEvidence, 
  Warranty, 
  AiInvestigation, 
  AiRecommendation 
} from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { supportTicketCreateSchema, supportMessageCreateSchema } from '@ewnet/validation';
import { generateTicketNumber, TICKET_STATUS } from '@ewnet/shared';
import { saveFile } from '../services/storageService.js';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

/**
 * Customer creates a support request for a claimed warranty
 */
router.post('/tickets', authenticate, async (req, res, next) => {
  try {
    const data = supportTicketCreateSchema.parse(req.body);

    // Verify customer owns this warranty (or company staff creating on behalf)
    let warranty;
    if (req.companyId) {
      warranty = await Warranty.findOne({ _id: data.warrantyId, companyId: req.companyId });
    } else {
      warranty = await Warranty.findOne({ _id: data.warrantyId, customerId: req.user._id });
    }

    if (!warranty) {
      return res.status(404).json({ success: false, error: 'Associated warranty not found in your account.' });
    }

    const count = await SupportTicket.countDocuments();
    const ticketNumber = generateTicketNumber(count + 1);

    const ticket = await SupportTicket.create({
      ticketNumber,
      companyId: warranty.companyId,
      customerId: warranty.customerId || req.user._id,
      warrantyId: warranty._id,
      requestType: data.requestType,
      subject: data.subject,
      description: data.description,
      status: TICKET_STATUS.OPEN
    });

    // Create initial message
    await SupportMessage.create({
      ticketId: ticket._id,
      senderId: req.user._id,
      senderRole: req.companyId ? 'company' : 'customer',
      message: data.description,
      visibility: 'customer_visible'
    });

    await logAuditEvent({
      actorUserId: req.user._id,
      companyId: warranty.companyId,
      action: 'SUPPORT_TICKET_CREATED',
      resourceType: 'SupportTicket',
      resourceId: ticket._id,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket opened successfully',
      ticket
    });
  } catch (err) {
    next(err);
  }
});

/**
 * List support tickets (Customer sees own; Company sees company tickets)
 */
router.get('/tickets', authenticate, async (req, res, next) => {
  try {
    const filter = {};
    if (req.companyId) {
      filter.companyId = req.companyId;
    } else {
      filter.customerId = req.user._id;
    }

    const tickets = await SupportTicket.find(filter)
      .populate('warrantyId', 'warrantyNumber product warranty')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
});

/**
 * Get ticket details with messages and evidence
 */
router.get('/tickets/:id', authenticate, async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.companyId) {
      filter.companyId = req.companyId;
    } else {
      filter.customerId = req.user._id;
    }

    const ticket = await SupportTicket.findOne(filter)
      .populate('warrantyId')
      .populate('customerId', 'fullName email')
      .populate('assignedTo', 'fullName email');

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Support ticket not found.' });
    }

    // Message query: customers NEVER see company_internal notes!
    const messageFilter = { ticketId: ticket._id };
    if (!req.companyId && !req.user.isPlatformAdmin) {
      messageFilter.visibility = 'customer_visible';
    }

    const messages = await SupportMessage.find(messageFilter)
      .populate('senderId', 'fullName email')
      .sort({ createdAt: 1 });

    const evidence = await SupportEvidence.find({ ticketId: ticket._id }).sort({ createdAt: 1 });

    // Latest AI investigation report if available (Company view)
    let aiReport = null;
    if (req.companyId || req.user.isPlatformAdmin) {
      const investigation = await AiInvestigation.findOne({ ticketId: ticket._id })
        .populate('recommendationId')
        .sort({ createdAt: -1 });
      aiReport = investigation?.recommendationId || null;
    }

    res.status(200).json({
      success: true,
      ticket,
      messages,
      evidence,
      aiReport
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Send a message on a ticket
 */
router.post('/tickets/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { message, visibility = 'customer_visible' } = supportMessageCreateSchema.parse(req.body);

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found.' });
    }

    // Role check: customers cannot post internal notes
    const isCompanyStaff = !!req.companyId && String(ticket.companyId) === String(req.companyId);
    const finalVisibility = (isCompanyStaff && visibility === 'company_internal') ? 'company_internal' : 'customer_visible';

    const msg = await SupportMessage.create({
      ticketId: ticket._id,
      senderId: req.user._id,
      senderRole: isCompanyStaff ? 'company' : 'customer',
      message,
      visibility: finalVisibility
    });

    // Update ticket status
    if (!isCompanyStaff && ticket.status === TICKET_STATUS.WAITING_FOR_CUSTOMER) {
      ticket.status = TICKET_STATUS.UNDER_REVIEW;
      await ticket.save();
    }

    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    next(err);
  }
});

/**
 * Upload evidence file (Photo/PDF receipt)
 */
router.post('/tickets/:id/evidence', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found.' });
    }

    const saved = await saveFile({
      buffer: req.file.buffer,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype
    });

    const evidence = await SupportEvidence.create({
      ticketId: ticket._id,
      uploadedBy: req.user._id,
      storageKey: saved.storageKey,
      originalFilename: saved.originalFilename,
      mimeType: saved.mimeType,
      size: saved.size,
      url: saved.url
    });

    res.status(201).json({ success: true, message: 'Evidence uploaded successfully', evidence });
  } catch (err) {
    next(err);
  }
});

export default router;

