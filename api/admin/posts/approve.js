const { getSql } = require('../../_db');
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
  const admin = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
  if (!admin[0] || admin[0].role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.method === 'PUT') {
    try {
      const { postId, isApproved } = req.body;
      
      if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
      }

      await sql`
        UPDATE posts 
        SET is_approved = ${isApproved !== false}
        WHERE id = ${postId}
      `;

      const updated = await sql`
        SELECT p.*, u.name as author_name, u.email as author_email
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.id = ${postId}
      `;

      if (updated.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }

      return res.json({
        id: updated[0].id,
        title: updated[0].title,
        isApproved: updated[0].is_approved,
        author: {
          name: updated[0].author_name,
          email: updated[0].author_email
        }
      });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

