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

  // Get all knowledge entries
  if (req.method === 'GET') {
    try {
      // Check if table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'knowledge_base'
        ) as exists
      `;
      
      if (!tableCheck[0]?.exists) {
        return res.json([]);
      }

      const entries = await sql`
        SELECT * FROM knowledge_base
        ORDER BY created_at DESC
      `;
      
      return res.json(entries.map(e => ({
        id: e.id,
        title: e.title,
        content: e.content,
        category: e.category,
        tags: e.tags || [],
        keywords: e.keywords || [],
        isAIVerified: e.is_ai_verified,
        views: e.views || 0,
        createdAt: e.created_at,
        updatedAt: e.updated_at
      })));
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  // Create knowledge entry
  if (req.method === 'POST') {
    try {
      const { title, content, category, tags, keywords, isAIVerified } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const inserted = await sql`
        INSERT INTO knowledge_base (title, content, category, tags, keywords, is_ai_verified, created_by_id)
        VALUES (${title}, ${content}, ${category || 'general'}, ${tags || []}, ${keywords || []}, ${isAIVerified || false}, ${decoded.userId})
        RETURNING *
      `;

      return res.status(201).json({
        id: inserted[0].id,
        title: inserted[0].title,
        content: inserted[0].content,
        category: inserted[0].category,
        tags: inserted[0].tags || [],
        keywords: inserted[0].keywords || [],
        isAIVerified: inserted[0].is_ai_verified,
        createdAt: inserted[0].created_at
      });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

