/**
 * POST /api/admin/knowledge/remove-duplicates
 * Remove duplicate knowledge base entries based on title (case-insensitive).
 * Keeps the oldest entry and deletes newer duplicates.
 */
const { getSql } = require('../../_db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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

    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'knowledge_base'
      ) as exists
    `;
    
    if (!tableCheck[0]?.exists) {
      return res.json({ message: 'Knowledge base table does not exist', removed: 0 });
    }

    // Find duplicates by title (case-insensitive)
    const duplicates = await sql`
      SELECT LOWER(TRIM(title)) as normalized_title, 
             COUNT(*) as count,
             ARRAY_AGG(id ORDER BY created_at ASC) as ids
      FROM knowledge_base
      GROUP BY LOWER(TRIM(title))
      HAVING COUNT(*) > 1
    `;

    if (duplicates.length === 0) {
      return res.json({ message: 'No duplicates found', removed: 0 });
    }

    let totalRemoved = 0;
    const removedIds = [];

    // For each duplicate group, keep the oldest (first in array) and delete the rest
    for (const dup of duplicates) {
      const ids = dup.ids;
      // Keep the first one (oldest), delete the rest
      const idsToDelete = ids.slice(1);
      
      for (const idToDelete of idsToDelete) {
        await sql`DELETE FROM knowledge_base WHERE id = ${idToDelete}`;
        removedIds.push(idToDelete);
        totalRemoved++;
      }
    }

    return res.json({
      message: `Removed ${totalRemoved} duplicate entries`,
      removed: totalRemoved,
      duplicateGroups: duplicates.length,
      removedIds: removedIds
    });
  } catch (err) {
    console.error('Error removing duplicates:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
