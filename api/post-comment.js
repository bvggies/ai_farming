/**
 * POST /api/post-comment?postId=:id
 * Add a comment to a post (auth required). Body: { content }.
 * Called via rewrite from /api/posts/:id/comment.
 * Returns updated post with author, images, likes, comments.
 */
const jwt = require('jsonwebtoken');
const { getSql } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const userId = decoded.userId;

    const postId = req.query.postId || req.query.id || req.body?.postId;
    const content = (req.body && req.body.content) ? String(req.body.content).trim() : '';
    if (!postId) return res.status(400).json({ message: 'Post ID required' });
    if (!content) return res.status(400).json({ message: 'Comment content is required' });

    const sql = getSql();

    const postRows = await sql`SELECT id, author_id, title, content, type, created_at, is_approved FROM posts WHERE id = ${postId} AND is_approved = true`;
    if (postRows.length === 0) return res.status(404).json({ message: 'Post not found' });

    const commentsTableCheck = await sql`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_comments') as exists
    `;
    if (!commentsTableCheck[0]?.exists) {
      return res.status(500).json({ message: 'Comments not available' });
    }

    await sql`
      INSERT INTO post_comments (post_id, author_id, content)
      VALUES (${postId}, ${userId}, ${content})
    `;

    const likesData = await sql`SELECT user_id FROM post_likes WHERE post_id = ${postId}`;
    const commentsData = await sql`
      SELECT c.id, c.content, c.created_at, u.name as author_name
      FROM post_comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at ASC
    `;
    const authorRow = await sql`SELECT id, name FROM users WHERE id = ${postRows[0].author_id}`;
    let images = [];
    try {
      const imgCheck = await sql`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_images') as exists`;
      if (imgCheck[0]?.exists) {
        const imgRows = await sql`SELECT url FROM post_images WHERE post_id = ${postId}`;
        images = imgRows.map((r) => ({ url: r.url }));
      }
    } catch (_) {}

    const p = postRows[0];
    return res.json({
      id: p.id,
      authorId: p.author_id,
      title: p.title,
      content: p.content,
      type: p.type,
      createdAt: p.created_at,
      isApproved: p.is_approved,
      author: { id: authorRow[0]?.id, name: authorRow[0]?.name },
      images,
      likes: likesData.map((r) => ({ userId: r.user_id })),
      comments: commentsData.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.created_at,
        author: { name: c.author_name },
      })),
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
