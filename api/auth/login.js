const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getSql } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, name, email, password, farm_size, poultry_type, preferred_language, role, is_active
      FROM users WHERE email = ${email} LIMIT 1
    `;
    const user = rows[0];
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        farmSize: user.farm_size,
        poultryType: user.poultry_type,
        preferredLanguage: user.preferred_language,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


