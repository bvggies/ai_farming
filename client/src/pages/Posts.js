import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiHeart, FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';

const Posts = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts');
      let filteredPosts = response.data;
      
      if (filter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.type === filter);
      }
      
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(post => post._id === postId ? response.data : post));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading posts...</div></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Community Posts</h1>
        <Link to="/create-post" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <FiPlus /> Create Post
        </Link>
      </div>

      <div style={filterStyle}>
        <button
          className={filter === 'all' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setFilter('all')}
          style={{ marginRight: '10px' }}
        >
          All
        </button>
        <button
          className={filter === 'question' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setFilter('question')}
          style={{ marginRight: '10px' }}
        >
          Questions
        </button>
        <button
          className={filter === 'tip' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setFilter('tip')}
          style={{ marginRight: '10px' }}
        >
          Tips
        </button>
        <button
          className={filter === 'experience' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setFilter('experience')}
        >
          Experiences
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>No posts found. Be the first to share!</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post._id} className="card">
            <div style={postHeaderStyle}>
              <div>
                <h2 style={postTitleStyle}>{post.title}</h2>
                <p style={postMetaStyle}>
                  By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                  {post.type && <span style={badgeStyle}>{post.type}</span>}
                </p>
              </div>
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
                onClick={() => handleLike(post._id)}
                style={{
                  ...actionButtonStyle,
                  color: post.likes?.some(like => like._id === user.id || like === user.id) ? '#f44336' : '#666'
                }}
              >
                <FiHeart /> {post.likes?.length || 0}
              </button>
              <Link to={`/posts/${post._id}`} style={actionButtonStyle}>
                <FiMessageCircle /> {post.comments?.length || 0} Comments
              </Link>
              <Link to={`/posts/${post._id}`} style={{ ...actionButtonStyle, marginLeft: 'auto' }}>
                Read More <FiArrowRight />
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const filterStyle = {
  marginBottom: '20px'
};

const postHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '15px'
};

const postTitleStyle = {
  fontSize: '24px',
  marginBottom: '8px',
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
  marginBottom: '15px',
  whiteSpace: 'pre-wrap'
};

const imagesStyle = {
  display: 'flex',
  gap: '10px',
  marginBottom: '15px',
  flexWrap: 'wrap'
};

const imageStyle = {
  maxWidth: '200px',
  maxHeight: '200px',
  borderRadius: '8px',
  objectFit: 'cover'
};

const postActionsStyle = {
  display: 'flex',
  gap: '15px',
  alignItems: 'center',
  paddingTop: '15px',
  borderTop: '1px solid #eee'
};

const actionButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  color: '#666',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px'
};

export default Posts;

