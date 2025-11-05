import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getSql } from '../_db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, password, farmSize = '', poultryType = '', preferredLanguage = 'en' } = req.body || {};
    if (!name || !email || !password || password.length < 6) {
      res.status(400).json({ message: 'Invalid input' });
      return;
    }

    const sql = getSql();

    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const inserted = await sql`
      INSERT INTO users (name, email, password, farm_size, poultry_type, preferred_language, role, is_active)
      VALUES (${name}, ${email}, ${hashed}, ${farmSize}, ${poultryType}, ${preferredLanguage}, 'farmer', true)
      RETURNING id, name, email, farm_size, poultry_type, preferred_language, role
    `;

    const user = inserted[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

    res.status(201).json({
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


