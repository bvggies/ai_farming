const { getSql } = require('../_db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Auth check
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const sql = getSql();
  const userId = decoded.userId;

  // Update reminder
  if (req.method === 'PUT') {
    try {
      const { reminderId, isCompleted } = req.body;
      
      if (!reminderId) {
        return res.status(400).json({ message: 'Reminder ID is required' });
      }

      await sql`
        UPDATE reminders 
        SET is_completed = ${isCompleted !== undefined ? isCompleted : false}
        WHERE id = ${reminderId} AND user_id = ${userId}
      `;

      return res.json({ message: 'Reminder updated successfully' });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  // Delete reminder
  if (req.method === 'DELETE') {
    try {
      const { reminderId } = req.body;
      
      if (!reminderId) {
        return res.status(400).json({ message: 'Reminder ID is required' });
      }

      await sql`DELETE FROM reminders WHERE id = ${reminderId} AND user_id = ${userId}`;
      return res.json({ message: 'Reminder deleted successfully' });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

