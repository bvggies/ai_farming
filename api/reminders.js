const { getSql } = require('./_db');
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

  // Get reminders
  if (req.method === 'GET') {
    try {
      const reminders = await sql`
        SELECT * FROM reminders 
        WHERE user_id = ${userId}
        ORDER BY reminder_date ASC, reminder_time ASC
      `;
      
      return res.json(reminders.map(r => ({
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description,
        reminderDate: r.reminder_date,
        reminderTime: r.reminder_time,
        isCompleted: r.is_completed,
        createdAt: r.created_at
      })));
    } catch (err) {
      // Table might not exist yet
      return res.json([]);
    }
  }

  // Create reminder
  if (req.method === 'POST') {
    try {
      const { type, title, description, reminderDate, reminderTime } = req.body;
      
      if (!type || !title || !reminderDate) {
        return res.status(400).json({ message: 'Type, title, and date are required' });
      }

      const inserted = await sql`
        INSERT INTO reminders (user_id, type, title, description, reminder_date, reminder_time, is_completed)
        VALUES (${userId}, ${type}, ${title}, ${description || ''}, ${reminderDate}, ${reminderTime || '08:00'}, false)
        RETURNING *
      `;

      return res.status(201).json({
        id: inserted[0].id,
        type: inserted[0].type,
        title: inserted[0].title,
        description: inserted[0].description,
        reminderDate: inserted[0].reminder_date,
        reminderTime: inserted[0].reminder_time,
        isCompleted: inserted[0].is_completed
      });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

