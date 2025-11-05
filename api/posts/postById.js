const { getSql } = require('../_db');

module.exports = async (req, res) => {
  const sql = getSql();

  if (req.method === 'GET') {
    try {
      // Get post ID from query (Vercel will pass it via rewrites)
      const postId = req.query.id || req.query.postId;
      
      if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
      }

      // Ensure table exists
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

      // Get post with author
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
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

