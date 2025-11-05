import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';

const PostDetail = ({ user }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${id}/like`);
      setPost(response.data);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/posts/${id}/comment`, { content: comment });
      setPost(response.data);
      setComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading post...</div></div>;
  }

  if (!post) {
    return <div className="container"><div className="alert alert-error">Post not found</div></div>;
  }

  const isLiked = post.likes?.some(like => like._id === user.id || like === user.id);

  return (
    <div className="container">
      <Link to="/posts" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#4CAF50', textDecoration: 'none' }}>
        <FiArrowLeft /> Back to Posts
      </Link>

      <div className="card">
        <div style={postHeaderStyle}>
          <h1 style={postTitleStyle}>{post.title}</h1>
          <p style={postMetaStyle}>
            By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
            {post.type && <span style={badgeStyle}>{post.type}</span>}
          </p>
        </div>

        <p style={postContentStyle}>{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div style={imagesStyle}>
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img}`}
                alt={`Post image ${idx + 1}`}
                style={imageStyle}
              />
            ))}
          </div>
        )}

        <div style={postActionsStyle}>
          <button
            onClick={handleLike}
            style={{
              ...actionButtonStyle,
              color: isLiked ? '#f44336' : '#666'
            }}
          >
            <FiHeart /> {post.likes?.length || 0} Likes
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Comments ({post.comments?.length || 0})</h2>
        
        <form onSubmit={handleComment} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {post.comments && post.comments.length > 0 ? (
          <div style={commentsStyle}>
            {post.comments.map((comment, idx) => (
              <div key={idx} style={commentStyle}>
                <div style={commentHeaderStyle}>
                  <strong>{comment.author?.name || 'Unknown'}</strong>
                  <span style={commentDateStyle}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={commentContentStyle}>{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center' }}>No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

const postHeaderStyle = {
  marginBottom: '20px'
};

const postTitleStyle = {
  fontSize: '28px',
  marginBottom: '10px',
  color: '#333'
};

const postMetaStyle = {
  fontSize: '14px',
  color: '#666',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const badgeStyle = {
  backgroundColor: '#e3f2fd',
  color: '#1976d2',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '500'
};

const postContentStyle = {
  color: '#555',
  lineHeight: '1.8',
  marginBottom: '20px',
  whiteSpace: 'pre-wrap',
  fontSize: '16px'
};

const imagesStyle = {
  display: 'flex',
  gap: '10px',
  marginBottom: '20px',
  flexWrap: 'wrap'
};

const imageStyle = {
  maxWidth: '300px',
  maxHeight: '300px',
  borderRadius: '8px',
  objectFit: 'cover'
};

const postActionsStyle = {
  display: 'flex',
  gap: '15px',
  paddingTop: '15px',
  borderTop: '1px solid #eee'
};

const actionButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '500'
};

const commentsStyle = {
  marginTop: '20px'
};

const commentStyle = {
  padding: '15px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  marginBottom: '15px'
};

const commentHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px'
};

const commentDateStyle = {
  fontSize: '12px',
  color: '#666'
};

const commentContentStyle = {
  color: '#555',
  lineHeight: '1.6'
};

export default PostDetail;

