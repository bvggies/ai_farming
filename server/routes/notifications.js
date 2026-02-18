/**
 * Notifications API: list, mark read, mark all read, unread count.
 * All routes require auth. Notifications are scoped to the current user.
 */
const express = require('express');
const prisma = require('../prismaClient');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET / — list current user's notifications (optional ?unreadOnly=true)
router.get('/', auth, async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
        ...(unreadOnly === 'true' ? { isRead: false } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /:id/read — mark one notification as read (only if it belongs to current user)
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true }
    });
    if (notification.count === 0) return res.status(404).json({ message: 'Notification not found' });
    const updated = await prisma.notification.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /read-all — mark all current user's notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /unread-count — number of unread notifications (for navbar badge)
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

