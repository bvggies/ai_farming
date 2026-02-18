/**
 * Posts API: create, list, get one post; like; add comment.
 * All write operations require auth. Images can be uploaded (Cloudinary) when creating a post.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../prismaClient');
const cloudinary = require('cloudinary').v2;
const { auth } = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// POST / — create a new post (auth required; optional images via multipart)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, content, type } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(503).json({ message: 'Image upload is not configured. Set CLOUDINARY_* environment variables.' });
      }
      for (const file of req.files) {
        try {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: 'appah-farms/posts' }, (error, result) => {
              if (error) return reject(error);
              resolve(result);
            });
            stream.end(file.buffer);
          });
          if (result?.secure_url) imageUrls.push(result.secure_url);
        } catch (uploadErr) {
          return res.status(502).json({ message: 'Image upload failed. Check Cloudinary config.', error: uploadErr.message });
        }
      }
    }

    const post = await prisma.post.create({
      data: {
        authorId: req.user.id,
        title,
        content,
        type: (type || 'question'),
        ...(imageUrls.length > 0 && { images: { create: imageUrls.map((url) => ({ url })) } })
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        images: true,
        likes: true,
        comments: true
      }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all posts (optional: search, limit)
router.get('/', async (req, res) => {
  try {
    const { search, limit } = req.query;
    const where = { isApproved: true };
    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } }
      ];
    }
    const take = limit ? Math.min(Math.max(1, parseInt(limit, 10)), 100) : undefined;
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        author: { select: { id: true, name: true, email: true } },
        images: true,
        likes: true,
        comments: { include: { author: { select: { id: true, name: true } } } }
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /:id — get one post by ID with author, images, likes, comments
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        images: true,
        likes: true,
        comments: { include: { author: { select: { id: true, name: true } } } }
      }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id }, include: { likes: true } });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: req.params.id, userId: req.user.id } }
    });

    if (existingLike) {
      await prisma.postLike.delete({ where: { postId_userId: { postId: req.params.id, userId: req.user.id } } });
    } else {
      await prisma.postLike.create({ data: { postId: req.params.id, userId: req.user.id } });
    }

    const updated = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true } },
        images: true,
        likes: true,
        comments: { include: { author: { select: { id: true, name: true } } } }
      }
    });

    // Notification can be implemented via Prisma in notifications route later
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update post (author only)
router.patch('/:id', auth, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'You can only edit your own post' });
    const { title, content, type } = req.body;
    const data = {};
    if (title !== undefined) data.title = String(title).trim();
    if (content !== undefined) data.content = String(content).trim();
    if (type !== undefined && ['question', 'tip', 'experience'].includes(type)) data.type = type;
    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
        images: true,
        likes: true,
        comments: { include: { author: { select: { id: true, name: true } } } }
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete post (author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'You can only delete your own post' });
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /:id/comment — add a comment to a post (auth required); notifies post author
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    await prisma.postComment.create({
      data: {
        postId: req.params.id,
        authorId: req.user.id,
        content
      }
    });

    // Notify post author (if not commenting on own post)
    if (post.authorId !== req.user.id) {
      try {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'comment',
            title: 'New comment on your post',
            message: `${req.user.name || 'Someone'} commented on "${post.title}".`,
            link: `/posts/${post.id}`
          }
        });
      } catch (e) { /* ignore notification errors */ }
    }

    const updated = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true } },
        images: true,
        likes: true,
        comments: { include: { author: { select: { id: true, name: true } } } }
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

