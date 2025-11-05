// Test endpoint to verify database connection
const { getSql } = require('./_db');

module.exports = async (req, res) => {
  try {
    const sql = getSql();
    
    // Test 1: Check if we can connect
    const testQuery = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    
    // Test 2: Check if users table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as table_exists
    `;
    
    // Test 3: Count users
    let userCount = 0;
    try {
      const countResult = await sql`SELECT COUNT(*) as count FROM users`;
      userCount = countResult[0]?.count || 0;
    } catch (err) {
      // Table might not exist
    }
    
    // Test 4: Check env vars
    const hasDbUrl = !!process.env.DATABASE_URL;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    
    return res.status(200).json({
      success: true,
      database: {
        connected: true,
        current_time: testQuery[0]?.current_time,
        database_name: testQuery[0]?.db_name,
        users_table_exists: tableCheck[0]?.table_exists || false,
        user_count: userCount
      },
      environment: {
        has_database_url: hasDbUrl,
        has_jwt_secret: hasJwtSecret,
        node_env: process.env.NODE_ENV
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

