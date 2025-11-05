const { getSql } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const sql = getSql();
    
    // Helper to safely query tables
    const safeQuery = async (query, defaultValue = 0) => {
      try {
        const result = await query;
        return Number(result[0]?.count || defaultValue);
      } catch (err) {
        return defaultValue;
      }
    };

    // Get comprehensive stats
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      approvedPosts,
      pendingPosts,
      totalKnowledge,
      totalNotifications,
      recentUsers
    ] = await Promise.all([
      safeQuery(sql`SELECT COUNT(*) as count FROM users`),
      safeQuery(sql`SELECT COUNT(*) as count FROM users WHERE is_active = true`),
      safeQuery(sql`SELECT COUNT(*) as count FROM posts`),
      safeQuery(sql`SELECT COUNT(*) as count FROM posts WHERE is_approved = true`),
      safeQuery(sql`SELECT COUNT(*) as count FROM posts WHERE is_approved = false`),
      safeQuery(sql`SELECT COUNT(*) as count FROM knowledge_base`),
      safeQuery(sql`SELECT COUNT(*) as count FROM notifications`),
      safeQuery(sql`SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '7 days'`)
    ]);

    // Get posts by type
    let postsByType = [];
    try {
      const result = await sql`
        SELECT type, COUNT(*) as count 
        FROM posts 
        WHERE is_approved = true 
        GROUP BY type
      `;
      postsByType = result.map(p => ({ type: p.type, count: Number(p.count) }));
    } catch (err) {
      // Table might not exist
    }

    // Get users by role
    let usersByRole = [];
    try {
      const result = await sql`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `;
      usersByRole = result.map(u => ({ role: u.role, count: Number(u.count) }));
    } catch (err) {
      // Should not happen, but handle gracefully
    }

    // Get knowledge by category
    let knowledgeByCategory = [];
    try {
      const result = await sql`
        SELECT category, COUNT(*) as count 
        FROM knowledge_base 
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      `;
      knowledgeByCategory = result.map(k => ({ category: k.category, count: Number(k.count) }));
    } catch (err) {
      // Table might not exist
    }

    return res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalPosts,
        approvedPosts,
        pendingPosts,
        totalKnowledge,
        totalNotifications,
        newUsersLast7Days: recentUsers
      },
      breakdown: {
        postsByType,
        usersByRole,
        knowledgeByCategory
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

