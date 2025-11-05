const { getSql } = require('../_db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Get auth token
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

  // Check if user is admin
  const sql = getSql();
  const user = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
  if (!user[0] || user[0].role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      // Check if table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'posts'
        ) as exists
      `;
      
      if (!tableCheck[0]?.exists) {
        return res.json([]);
      }

      const posts = await sql`
        SELECT p.*, u.name as author_name, u.email as author_email
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
      `;
      
      return res.json(posts.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        type: p.type,
        isApproved: p.is_approved,
        createdAt: p.created_at,
        author: {
          name: p.author_name,
          email: p.author_email
        }
      })));
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

