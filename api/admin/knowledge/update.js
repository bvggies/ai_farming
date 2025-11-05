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
  const user = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
  if (!user[0] || user[0].role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.method === 'PUT') {
    try {
      const { id, title, content, category, tags, keywords, isAIVerified } = req.body;
      
      if (!id || !title || !content) {
        return res.status(400).json({ message: 'ID, title, and content are required' });
      }

      const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean)) : [];
      const keywordsArray = keywords ? (Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim()).filter(Boolean)) : [];

      await sql`
        UPDATE knowledge_base 
        SET 
          title = ${title},
          content = ${content},
          category = ${category || 'general'},
          tags = ${tagsArray},
          keywords = ${keywordsArray},
          is_ai_verified = ${isAIVerified !== undefined ? isAIVerified : false},
          updated_at = NOW()
        WHERE id = ${id}
      `;

      const updated = await sql`SELECT * FROM knowledge_base WHERE id = ${id}`;
      return res.json({
        id: updated[0].id,
        title: updated[0].title,
        content: updated[0].content,
        category: updated[0].category,
        tags: updated[0].tags || [],
        keywords: updated[0].keywords || [],
        isAIVerified: updated[0].is_ai_verified
      });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'ID is required' });
      }

      await sql`DELETE FROM knowledge_base WHERE id = ${id}`;
      return res.json({ message: 'Entry deleted successfully' });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

