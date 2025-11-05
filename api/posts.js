const { getSql } = require('./_db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  const sql = getSql();

  if (req.method === 'GET') {
    try {
      // Check if requesting single post (via query param or URL path)
      let postId = req.query.id;
      
      // If no query param, try to extract from URL path
      if (!postId && req.url) {
        const urlParts = req.url.split('/').filter(p => p && p !== 'api' && p !== 'posts');
        if (urlParts.length > 0 && urlParts[urlParts.length - 1].length > 10) {
          postId = urlParts[urlParts.length - 1];
        }
      }

      // If postId exists, return single post
      if (postId) {
        const tableCheck = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'posts'
          ) as exists
        `;
        if (!tableCheck[0]?.exists) {
          return res.status(404).json({ message: 'Post not found' });
        }

        const post = await sql`
          SELECT p.*, u.name as author_name, u.id as author_id
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          WHERE p.id = ${postId} AND p.is_approved = true
        `;

        if (post.length === 0) {
          return res.status(404).json({ message: 'Post not found' });
        }

        const p = post[0];

        // Get likes
        let likes = [];
        try {
          const likesCheck = await sql`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'post_likes'
            ) as exists
          `;
          if (likesCheck[0]?.exists) {
            const likesData = await sql`
              SELECT user_id FROM post_likes WHERE post_id = ${postId}
            `;
            likes = likesData.map(l => l.user_id);
          }
        } catch (err) {
          // Likes table might not exist
        }

        // Get comments
        let comments = [];
        try {
          const commentsCheck = await sql`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'post_comments'
            ) as exists
          `;
          if (commentsCheck[0]?.exists) {
            const commentsData = await sql`
              SELECT c.*, u.name as author_name
              FROM post_comments c
              LEFT JOIN users u ON c.author_id = u.id
              WHERE c.post_id = ${postId}
              ORDER BY c.created_at ASC
            `;
            comments = commentsData.map(c => ({
              _id: c.id,
              id: c.id,
              content: c.content,
              author: { name: c.author_name },
              createdAt: c.created_at
            }));
          }
        } catch (err) {
          // Comments table might not exist
        }

        // Get images
        let images = [];
        try {
          const imagesCheck = await sql`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'post_images'
            ) as exists
          `;
          if (imagesCheck[0]?.exists) {
            const imagesData = await sql`
              SELECT url FROM post_images WHERE post_id = ${postId}
            `;
            images = imagesData.map(img => img.url);
          }
        } catch (err) {
          // Images table might not exist
        }

        return res.json({
          _id: p.id,
          id: p.id,
          title: p.title,
          content: p.content,
          type: p.type,
          createdAt: p.created_at,
          isApproved: p.is_approved,
          author: { 
            _id: p.author_id,
            id: p.author_id,
            name: p.author_name 
          },
          likes: likes || [],
          comments: comments || [],
          images: images || []
        });
      }

      // Otherwise, return list of posts
      // Optional: ?limit=5
      const limit = Math.max(1, Math.min(parseInt(req.query.limit || '20', 10), 50));

      // Ensure table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'posts'
        ) as exists
      `;
      if (!tableCheck[0]?.exists) {
        return res.json([]);
      }

      const rows = await sql`
        SELECT p.*, u.name as author_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.is_approved = true
        ORDER BY p.created_at DESC
        LIMIT ${limit}
      `;

      return res.json(rows.map(r => ({
        id: r.id,
        _id: r.id,
        title: r.title,
        content: r.content,
        type: r.type,
        createdAt: r.created_at,
        isApproved: r.is_approved,
        author: { name: r.author_name }
      })));
    } catch (err) {
      return res.status(500).json({ message: 'Failed to load posts', error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      // Auth required
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ message: 'Unauthorized' });
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      } catch (e) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Expect JSON body
      const { title, content, type = 'question', imageUrls = [] } = req.body || {};
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      // Ensure posts table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'posts'
        ) as exists
      `;
      if (!tableCheck[0]?.exists) {
        return res.status(500).json({ message: 'Posts table does not exist. Please run admin_schema.sql' });
      }

      const inserted = await sql`
        INSERT INTO posts (author_id, title, content, type, is_approved)
        VALUES (${decoded.userId}, ${title}, ${content}, ${type}, ${true})
        RETURNING id, title, content, type, is_approved, created_at
      `;

      const post = inserted[0];

      // Optionally insert image URLs if provided and table exists
      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        try {
          const imgTableCheck = await sql`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'post_images'
            ) as exists
          `;
          if (imgTableCheck[0]?.exists) {
            for (const url of imageUrls) {
              await sql`INSERT INTO post_images (post_id, url) VALUES (${post.id}, ${url})`;
            }
          }
        } catch (_) {
          // ignore image errors
        }
      }

      return res.status(201).json({
        id: post.id,
        title: post.title,
        content: post.content,
        type: post.type,
        isApproved: post.is_approved,
        createdAt: post.created_at
      });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to create post', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};
