import jwt from 'jsonwebtoken';
import { getSql } from '../_db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      res.status(401).json({ message: 'No token' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const userId = decoded.userId;

    const sql = getSql();
    const rows = await sql`
      SELECT id, name, email, farm_size, poultry_type, preferred_language, role FROM users WHERE id = ${userId}
    `;
    const user = rows[0];
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    res.json({
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
    res.status(401).json({ message: 'Invalid token' });
  }
}


