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
      return res.status(400).json({ message: 'Invalid input. Name, email, and password (min 6 chars) are required.' });
    }

    const sql = getSql();

    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const inserted = await sql`
      INSERT INTO users (name, email, password, farm_size, poultry_type, preferred_language, role, is_active)
      VALUES (${name}, ${email}, ${hashed}, ${farmSize}, ${poultryType}, ${preferredLanguage}, 'farmer', true)
      RETURNING id, name, email, farm_size, poultry_type, preferred_language, role
    `;

    if (!inserted || !inserted[0]) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    const user = inserted[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

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
    return res.status(500).json({ message: 'Server error' });
  }
};


