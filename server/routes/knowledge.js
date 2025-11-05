const express = require('express');
const prisma = require('../prismaClient');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Search knowledge base
router.get('/search', async (req, res) => {
  try {
    const { q, category } = req.query;

    const results = await prisma.knowledgeBase.findMany({
      where: {
        AND: [
          category ? { category } : {},
          q
            ? {
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { content: { contains: q, mode: 'insensitive' } },
                  { tags: { hasSome: q.split(/\s+/) } },
                  { keywords: { hasSome: q.split(/\s+/) } }
                ]
              }
            : {}
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all knowledge base entries
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const entries = await prisma.knowledgeBase.findMany({
      where: category ? { category } : {},
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await prisma.knowledgeBase.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } }
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create entry (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, content, category, tags, keywords, isAIVerified } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const entry = await prisma.knowledgeBase.create({
      data: {
        title,
        content,
        category: category || 'general',
        tags: tags || [],
        keywords: keywords || [],
        isAIVerified: isAIVerified || false,
        createdById: req.user.id
      }
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update entry (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, content, category, tags, keywords, isAIVerified } = req.body;
    const entry = await prisma.knowledgeBase.update({
      where: { id: req.params.id },
      data: {
        title: title ?? undefined,
        content: content ?? undefined,
        category: category ?? undefined,
        tags: tags ?? undefined,
        keywords: keywords ?? undefined,
        isAIVerified: isAIVerified ?? undefined,
        updatedAt: new Date()
      }
    });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete entry (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await prisma.knowledgeBase.delete({ where: { id: req.params.id } });
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

