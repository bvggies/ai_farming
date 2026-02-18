/**
 * User routes: update current user profile (name, language, etc.).
 * All routes require auth. Used by the Profile page.
 */
const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prismaClient');
const { auth } = require('../middleware/auth');

const router = express.Router();

// PUT /api/users/profile — update the logged-in user's profile
router.put('/profile', auth, [
  body('name').optional().trim().notEmpty(),
  body('farmSize').optional().trim(),
  body('poultryType').optional().trim(),
  body('preferredLanguage').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, farmSize, poultryType, preferredLanguage } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (farmSize !== undefined) updates.farmSize = farmSize;
    if (poultryType !== undefined) updates.poultryType = poultryType;
    // Preferred language: only English (en) or Twi (tw)
    if (preferredLanguage !== undefined) updates.preferredLanguage = preferredLanguage === 'tw' ? 'tw' : 'en';

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        farmSize: true,
        poultryType: true,
        preferredLanguage: true,
        role: true
      }
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        farmSize: user.farmSize,
        poultryType: user.poultryType,
        preferredLanguage: user.preferredLanguage,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/users/profile — get current user's profile (auth required)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        farmSize: true,
        poultryType: true,
        preferredLanguage: true,
        role: true
      }
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

