import express from 'express';
import { Notification } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Get current user notifications
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientUserId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipientUserId: req.user._id, readAt: null });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
});

/**
 * Mark notification as read
 */
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientUserId: req.user._id },
      { readAt: new Date() }
    );
    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
});

/**
 * Mark all notifications as read
 */
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientUserId: req.user._id, readAt: null },
      { readAt: new Date() }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
});

export default router;

