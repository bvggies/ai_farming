const { getSql } = require('../_db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Auth check helper
const checkAdmin = async (req) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (!token) {
    throw new Error('Unauthorized');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  const sql = getSql();
  const user = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
  
  if (!user[0] || user[0].role !== 'admin') {
    throw new Error('Admin access required');
  }

  return decoded;
};

// Get all users
module.exports = async (req, res) => {
  try {
    await checkAdmin(req);
  } catch (err) {
    return res.status(err.message === 'Unauthorized' ? 401 : 403).json({ message: err.message });
  }

  if (req.method === 'GET') {
    try {
      const sql = getSql();
      // Ensure users table exists; if not, return empty list gracefully
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists
      `;
      if (!tableCheck[0]?.exists) {
        return res.json([]);
      }
      const users = await sql`
        SELECT id, name, email, farm_size, poultry_type, preferred_language, role, is_active, created_at
        FROM users
        ORDER BY created_at DESC
      `;
      
      return res.json(users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        farmSize: u.farm_size,
        poultryType: u.poultry_type,
        preferredLanguage: u.preferred_language,
        role: u.role,
        isActive: u.is_active,
        createdAt: u.created_at
      })));
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  // Create user (admin only)
  if (req.method === 'POST') {
    try {
      const { name, email, password, farmSize, poultryType, preferredLanguage, role } = req.body || {};
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      const sql = getSql();
      // Ensure users table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists
      `;
      if (!tableCheck[0]?.exists) {
        return res.status(400).json({ message: 'Users table not found. Run initial SQL setup.' });
      }

      // Check if user exists
      const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
      if (existing.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const inserted = await sql`
        INSERT INTO users (name, email, password, farm_size, poultry_type, preferred_language, role, is_active)
        VALUES (${name}, ${email.toLowerCase().trim()}, ${hashed}, ${farmSize || ''}, ${poultryType || ''}, ${preferredLanguage || 'en'}, ${role || 'farmer'}, true)
        RETURNING id, name, email, role, is_active
      `;

      return res.status(201).json({
        id: inserted[0].id,
        name: inserted[0].name,
        email: inserted[0].email,
        role: inserted[0].role,
        isActive: inserted[0].is_active
      });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

