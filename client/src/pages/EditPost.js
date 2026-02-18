/**
 * Edit Post page: edit title, content, and type of your own post (no image change).
 * Loads the post by ID on mount; only the author can edit. Submits via PATCH /posts/:id.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditPost = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Form state; loading = fetching post, saving = submitting update
  const [formData, setFormData] = useState({ title: '', content: '', type: 'question' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  /** Load post by ID on mount; if not author, set error and do not populate form */
  useEffect(() => {
    let cancelled = false;
    api.get(`/posts/${id}`)
      .then((res) => {
        if (!cancelled) {
          const post = res.data;
          if (post.authorId !== user?.id) {
            setError('You can only edit your own post');
            return;
          }
          setFormData({
            title: post.title || '',
            content: post.content || '',
            type: post.type || 'question'
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load post');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, user?.id]);

  /** Update form field when user types */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /** Submit update via PATCH; on success navigate to the post detail page */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.title?.trim() || !formData.content?.trim()) {
      setError('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/posts/${id}`, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type
      });
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

  return (
    <div className="container">
      <h1>Edit Post</h1>
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
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Title" />
          </div>
          <div className="form-group">
            <label>Content *</label>
            <textarea name="content" value={formData.content} onChange={handleChange} required rows="8" placeholder="Content" />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(`/posts/${id}`)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
