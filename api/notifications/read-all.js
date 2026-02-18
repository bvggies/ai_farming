/**
 * PUT /api/notifications/read-all
 * Mark all current user's notifications as read (JWT required).
 */
const jwt = require('jsonwebtoken');
const { getSql } = require('../_db');

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

    const sql = getSql();

    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'notifications'
      ) as exists
    `;
    if (!tableCheck[0]?.exists) {
      return res.json({ message: 'All notifications marked as read' });
    }

    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE user_id = ${userId} AND is_read = false
    `;

    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
