const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getSql } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password, farmSize = '', poultryType = '', preferredLanguage = 'en' } = req.body || {};
    
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Invalid input. Name, email, and password (min 6 chars) are required.',
        received: { name: !!name, email: !!email, passwordLength: password?.length || 0 }
      });
    }

    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return res.status(500).json({ message: 'Server configuration error: DATABASE_URL missing' });
    }

    const sql = getSql();

    // Check if user exists
    let existing;
    try {
      existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
    } catch (err) {
      console.error('Database query error:', err);
      // Check if table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists
      `;
      if (!tableCheck[0]?.exists) {
        return res.status(500).json({ 
          message: 'Database table not found. Please run the SQL schema in Neon SQL Editor.',
          error: 'users table does not exist'
        });
      }
      throw err;
    }

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);
    let inserted;
    try {
      inserted = await sql`
        INSERT INTO users (name, email, password, farm_size, poultry_type, preferred_language, role, is_active)
        VALUES (${name}, ${email.toLowerCase().trim()}, ${hashed}, ${farmSize}, ${poultryType}, ${preferredLanguage}, 'farmer', true)
        RETURNING id, name, email, farm_size, poultry_type, preferred_language, role
      `;
    } catch (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ 
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    if (!inserted || !inserted[0]) {
      return res.status(500).json({ message: 'Failed to create user - no data returned' });
    }

    const user = inserted[0];
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        farmSize: user.farm_size || '',
        poultryType: user.poultry_type || '',
        preferredLanguage: user.preferred_language || 'en',
        role: user.role || 'farmer'
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      hint: err.message?.includes('table') ? 'Make sure you ran the SQL schema in Neon SQL Editor' : undefined
    });
  }
};
