const { getSql } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const sql = getSql();
    
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
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM users WHERE is_active = true`,
      sql`SELECT COUNT(*) as count FROM posts`,
      sql`SELECT COUNT(*) as count FROM posts WHERE is_approved = true`,
      sql`SELECT COUNT(*) as count FROM posts WHERE is_approved = false`,
      sql`SELECT COUNT(*) as count FROM knowledge_base`,
      sql`SELECT COUNT(*) as count FROM notifications`,
      sql`SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '7 days'`
    ]);

    // Get posts by type
    const postsByType = await sql`
      SELECT type, COUNT(*) as count 
      FROM posts 
      WHERE is_approved = true 
      GROUP BY type
    `;

    // Get users by role
    const usersByRole = await sql`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `;

    // Get knowledge by category
    const knowledgeByCategory = await sql`
      SELECT category, COUNT(*) as count 
      FROM knowledge_base 
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `;

    return res.json({
      overview: {
        totalUsers: Number(totalUsers[0]?.count || 0),
        activeUsers: Number(activeUsers[0]?.count || 0),
        totalPosts: Number(totalPosts[0]?.count || 0),
        approvedPosts: Number(approvedPosts[0]?.count || 0),
        pendingPosts: Number(pendingPosts[0]?.count || 0),
        totalKnowledge: Number(totalKnowledge[0]?.count || 0),
        totalNotifications: Number(totalNotifications[0]?.count || 0),
        newUsersLast7Days: Number(recentUsers[0]?.count || 0)
      },
      breakdown: {
        postsByType: postsByType.map(p => ({ type: p.type, count: Number(p.count) })),
        usersByRole: usersByRole.map(u => ({ role: u.role, count: Number(u.count) })),
        knowledgeByCategory: knowledgeByCategory.map(k => ({ category: k.category, count: Number(k.count) }))
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

