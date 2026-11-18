import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedResourceType: { type: String },
  relatedResourceId: { type: mongoose.Schema.Types.ObjectId },
  readAt: { type: Date }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);

