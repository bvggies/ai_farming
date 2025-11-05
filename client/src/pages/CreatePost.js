import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreatePost = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'question',
    images: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      // For now, send JSON only. Images uploading will be added later.
      if (formData.images && formData.images.length > 0) {
        alert('Image uploading will be added soon. Your post will be created without images.');
      }

      await api.post('/posts', {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        imageUrls: []
      });

      navigate('/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Create New Post</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Share your question, tip, or experience with the community</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Post Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="question">Question</option>
              <option value="tip">Tip</option>
              <option value="experience">Experience</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a clear title"
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Share your question, tip, or experience..."
              rows="8"
            />
          </div>

          <div className="form-group">
            <label>Images (optional, coming soon)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ padding: '8px' }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              Image upload support will be added soon.
            </small>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Post'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/posts')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;

