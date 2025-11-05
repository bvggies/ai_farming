const { getSql } = require('../../_db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
  const admin = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
  if (!admin[0] || admin[0].role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.method === 'PUT') {
    try {
      const { userId, ...updates } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (updates.name) {
        updateFields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.email) {
        updateFields.push(`email = $${paramCount++}`);
        values.push(updates.email.toLowerCase());
      }
      if (updates.farmSize !== undefined) {
        updateFields.push(`farm_size = $${paramCount++}`);
        values.push(updates.farmSize);
      }
      if (updates.poultryType !== undefined) {
        updateFields.push(`poultry_type = $${paramCount++}`);
        values.push(updates.poultryType);
      }
      if (updates.preferredLanguage !== undefined) {
        updateFields.push(`preferred_language = $${paramCount++}`);
        values.push(updates.preferredLanguage);
      }
      if (updates.role) {
        updateFields.push(`role = $${paramCount++}`);
        values.push(updates.role);
      }
      if (updates.isActive !== undefined) {
        updateFields.push(`is_active = $${paramCount++}`);
        values.push(updates.isActive);
      }
      if (updates.password) {
        const hashed = await bcrypt.hash(updates.password, 10);
        updateFields.push(`password = $${paramCount++}`);
        values.push(hashed);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }

      // Build dynamic update query
      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount}`;
      values.push(userId);

      await sql.unsafe(updateQuery, values);

      const updated = await sql`SELECT * FROM users WHERE id = ${userId}`;
      if (updated.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = updated[0];
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        farmSize: user.farm_size,
        poultryType: user.poultry_type,
        preferredLanguage: user.preferred_language,
        role: user.role,
        isActive: user.is_active
      });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      await sql`DELETE FROM users WHERE id = ${userId}`;
      return res.json({ message: 'User deleted successfully' });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

