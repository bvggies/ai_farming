const { getSql } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const query = req.query.q || '';
    
    if (!query) {
      return res.json([]);
    }

    const sql = getSql();

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

    const searchTerm = `%${query.toLowerCase()}%`;

    // Search in title, content, tags, and keywords
    const entries = await sql`
      SELECT * FROM knowledge_base
      WHERE 
        LOWER(title) LIKE ${searchTerm}
        OR LOWER(content) LIKE ${searchTerm}
        OR EXISTS (
          SELECT 1 FROM unnest(tags) AS tag 
          WHERE LOWER(tag) LIKE ${searchTerm}
        )
        OR EXISTS (
          SELECT 1 FROM unnest(keywords) AS keyword 
          WHERE LOWER(keyword) LIKE ${searchTerm}
        )
      ORDER BY 
        CASE 
          WHEN LOWER(title) LIKE ${searchTerm} THEN 1
          ELSE 2
        END,
        created_at DESC
    `;
    
    return res.json(entries.map(e => ({
      _id: e.id,
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
    console.error('Knowledge search error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

