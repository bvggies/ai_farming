/**
 * GET /api/notifications
 * List all notifications for the current user (JWT required). Optional ?unreadOnly=true.
 */
const jwt = require('jsonwebtoken');
const { getSql } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
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

    const sql = getSql();
    const { unreadOnly } = req.query;

    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'notifications'
      ) as exists
    `;
    if (!tableCheck[0]?.exists) {
      return res.json([]);
    }

    let result;
    if (unreadOnly === 'true') {
      result = await sql`
        SELECT id, user_id, type, title, message, link, is_read, created_at
        FROM notifications
        WHERE user_id = ${userId} AND is_read = false
        ORDER BY created_at DESC
        LIMIT 50
      `;
    } else {
      result = await sql`
        SELECT id, user_id, type, title, message, link, is_read, created_at
        FROM notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 50
      `;
    }

    return res.json(result.map((r) => ({
      id: r.id,
      userId: r.user_id,
      type: r.type,
      title: r.title,
      message: r.message,
      link: r.link || '',
      isRead: r.is_read,
      createdAt: r.created_at,
    })));
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
