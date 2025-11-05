import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiBook, FiSettings, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';

const Dashboard = ({ user }) => {
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, knowledgeRes] = await Promise.all([
          api.get('/posts?limit=5'),
          api.get('/knowledge?limit=5')
        ]);
        setRecentPosts(postsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <h1 style={welcomeStyle}>Welcome, {user.name}! 👋</h1>
      <p style={subtitleStyle}>Your poultry farming community dashboard</p>

      <div style={quickActionsStyle}>
        <Link to="/create-post" style={actionCardStyle}>
          <FiMessageSquare size={32} color="#4CAF50" />
          <h3>Share Your Experience</h3>
          <p>Post a question or tip</p>
        </Link>

        <Link to="/ai-chat" style={actionCardStyle}>
          <FiSettings size={32} color="#2196F3" />
          <h3>Ask AI Assistant</h3>
          <p>Get instant farming advice</p>
        </Link>

        <Link to="/knowledge" style={actionCardStyle}>
          <FiBook size={32} color="#FF9800" />
          <h3>Browse Knowledge</h3>
          <p>Learn from experts</p>
        </Link>
      </div>

      <div className="card">
        <h2>Recent Community Posts</h2>
        {recentPosts.length > 0 ? (
          <div>
            {recentPosts.map(post => (
              <div key={post._id} style={postItemStyle}>
                <h3 style={postTitleStyle}>{post.title}</h3>
                <p style={postMetaStyle}>
                  By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p style={postContentStyle}>{post.content.substring(0, 150)}...</p>
                <Link to={`/posts/${post._id}`} style={readMoreStyle}>
                  Read more <FiArrowRight />
                </Link>
              </div>
            ))}
            <Link to="/posts" className="btn btn-primary" style={{ marginTop: '20px' }}>
              View All Posts
            </Link>
          </div>
        ) : (
          <p>No posts yet. Be the first to share!</p>
        )}
      </div>

      <div className="card">
        <h2>Your Profile</h2>
        <div style={profileInfoStyle}>
          <p><strong>Farm Size:</strong> {user.farmSize || 'Not specified'}</p>
          <p><strong>Poultry Type:</strong> {user.poultryType || 'Not specified'}</p>
          <p><strong>Language:</strong> {user.preferredLanguage || 'English'}</p>
        </div>
        <Link to="/profile" className="btn btn-outline">
          Update Profile
        </Link>
      </div>
    </div>
  );
};

const welcomeStyle = {
  fontSize: '32px',
  marginBottom: '10px',
  color: '#333'
};

const subtitleStyle = {
  fontSize: '18px',
  color: '#666',
  marginBottom: '30px'
};

const quickActionsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const actionCardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '12px',
  textDecoration: 'none',
  color: '#333',
  textAlign: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s',
  display: 'block'
};

const postItemStyle = {
  padding: '20px 0',
  borderBottom: '1px solid #eee'
};

const postTitleStyle = {
  fontSize: '20px',
  marginBottom: '8px',
  color: '#333'
};

const postMetaStyle = {
  fontSize: '14px',
  color: '#666',
  marginBottom: '10px'
};

const postContentStyle = {
  color: '#555',
  marginBottom: '10px',
  lineHeight: '1.6'
};

const readMoreStyle = {
  color: '#4CAF50',
  textDecoration: 'none',
  fontWeight: '500',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px'
};

const profileInfoStyle = {
  marginBottom: '20px',
  lineHeight: '2'
};

export default Dashboard;

