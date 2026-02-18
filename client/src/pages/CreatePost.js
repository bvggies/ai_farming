/**
 * Create Post page: form to add a new community post (title, content, type, optional images).
 * Sends multipart/form-data when images are selected so the server can upload them (e.g. Cloudinary).
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;

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

  /** Update a form field (title, content, type) when user types */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /** Handle file input: validate count (max 5) and size (5MB each), then store in form state */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed. Only the first ${MAX_IMAGES} will be used.`);
      setFormData({ ...formData, images: files.slice(0, MAX_IMAGES) });
      return;
    }
    const tooBig = files.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (tooBig) {
      setError(`Each image must be under ${MAX_FILE_SIZE_MB}MB. "${tooBig.name}" is too large.`);
      return;
    }
    setError('');
    setFormData({ ...formData, images: files });
  };

  /** Remove one selected image from the list by index */
  const removeImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  /** Submit the post: send as FormData when there are images, so server receives multipart uploads */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title?.trim() || !formData.content?.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      const hasImages = formData.images && formData.images.length > 0;

      if (hasImages) {
        const fd = new FormData();
        fd.append('title', formData.title.trim());
        fd.append('content', formData.content.trim());
        fd.append('type', formData.type);
        formData.images.forEach((file) => fd.append('images', file));
        await api.post('/posts', fd);
      } else {
        await api.post('/posts', {
          title: formData.title.trim(),
          content: formData.content.trim(),
          type: formData.type
        });
      }

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
            <label>Images (optional, max {MAX_IMAGES}, {MAX_FILE_SIZE_MB}MB each)</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleImageChange}
              style={{ padding: '8px' }}
            />
            {formData.images.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.images.map((file, idx) => (
                  <span key={idx} style={{ fontSize: '13px', color: '#555', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {file.name}
                    <button type="button" onClick={() => removeImage(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', padding: '0 4px' }} aria-label="Remove">×</button>
                  </span>
                ))}
              </div>
            )}
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

