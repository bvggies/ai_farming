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

// Create post
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, content, type } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((file) => cloudinary.uploader.upload_stream({ folder: 'aifarming/posts' }, (err, result) => {}))
      );
    }

    // Fallback upload using temp file buffer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'aifarming/posts' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          stream.end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
    }

    const post = await prisma.post.create({
      data: {
        authorId: req.user.id,
        title,
        content,
        type: (type || 'question'),
        images: {
          create: imageUrls.map((url) => ({ url }))
        }
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

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
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

// Get single post
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

// Add comment
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

