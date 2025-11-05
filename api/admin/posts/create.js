const { getSql } = require('../../_db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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
    const me = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
    if (!me[0] || me[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { title, content, type = 'tip', authorId } = req.body || {};
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const author = authorId || decoded.userId;

    // Ensure posts table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'posts'
      ) as exists
    `;
    if (!tableCheck[0]?.exists) {
      return res.status(500).json({ message: 'Posts table does not exist. Please run admin_schema.sql' });
    }

    const inserted = await sql`
      INSERT INTO posts (author_id, title, content, type, is_approved)
      VALUES (${author}, ${title}, ${content}, ${type}, ${true})
      RETURNING id, title, content, type, is_approved, created_at
    `;

    const post = inserted[0];
    return res.status(201).json({
      id: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      isApproved: post.is_approved,
      createdAt: post.created_at
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
