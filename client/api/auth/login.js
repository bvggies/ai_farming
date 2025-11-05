import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getSql } from '../_db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ message: 'Invalid input' });
      return;
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, name, email, password, farm_size, poultry_type, preferred_language, role, is_active
      FROM users WHERE email = ${email} LIMIT 1
    `;
    const user = rows[0];
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ message: 'Account is inactive' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.json({
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
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


