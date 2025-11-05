const { getSql } = require('./_db');

module.exports = async (req, res) => {
  const sql = getSql();

  // Get knowledge entries (public, no auth required)
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

      // If ID is provided in query, return single entry
      if (req.query.id) {
        const entry = await sql`
          SELECT * FROM knowledge_base WHERE id = ${req.query.id}
        `;

        if (entry.length === 0) {
          return res.status(404).json({ message: 'Entry not found' });
        }

        const e = entry[0];

        // Increment view count
        try {
          await sql`
            UPDATE knowledge_base 
            SET views = COALESCE(views, 0) + 1 
            WHERE id = ${req.query.id}
          `;
        } catch (err) {
          // Ignore view update errors
        }

        return res.json({
          _id: e.id,
          id: e.id,
          title: e.title,
          content: e.content,
          category: e.category,
          tags: e.tags || [],
          keywords: e.keywords || [],
          isAIVerified: e.is_ai_verified,
          views: (e.views || 0) + 1,
          createdAt: e.created_at,
          updatedAt: e.updated_at
        });
      }

      // Otherwise, return all entries
      const entries = await sql`
        SELECT * FROM knowledge_base
        ORDER BY created_at DESC
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
      console.error('Knowledge base error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

