/**
 * PUT /api/notification-read?id=:id
 * Mark one notification as read (only if it belongs to current user). Called via rewrite from /api/notifications/:id/read.
 */
const jwt = require('jsonwebtoken');
const { getSql } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const userId = decoded.userId;

    const notificationId = req.query.id || req.query.notificationId;
    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID required' });
    }

    const sql = getSql();

    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'notifications'
      ) as exists
    `;
    if (!tableCheck[0]?.exists) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const result = await sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${notificationId} AND user_id = ${userId}
      RETURNING id, user_id, type, title, message, link, is_read, created_at
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const n = result[0];
    return res.json({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link || '',
      isRead: n.is_read,
      createdAt: n.created_at,
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
