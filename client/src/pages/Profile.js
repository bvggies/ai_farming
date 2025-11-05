import React, { useState } from 'react';
import { authService } from '../services/authService';

const Profile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    farmSize: user.farmSize || '',
    poultryType: user.poultryType || '',
    preferredLanguage: user.preferredLanguage || 'en'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.updateProfile(formData);
      setUser(response.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>My Profile</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Update your profile information</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div style={infoSectionStyle}>
          <h3>Account Information</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Member since:</strong> {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <h3 style={{ marginTop: '30px', marginBottom: '20px' }}>Profile Details</h3>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Farm Size</label>
            <input
              type="text"
              name="farmSize"
              value={formData.farmSize}
              onChange={handleChange}
              placeholder="e.g., Small (50-200 birds), Medium (200-1000), Large (1000+)"
            />
          </div>

          <div className="form-group">
            <label>Poultry Type</label>
            <select
              name="poultryType"
              value={formData.poultryType}
              onChange={handleChange}
            >
              <option value="">Select poultry type</option>
              <option value="Layers">Layers (Egg production)</option>
              <option value="Broilers">Broilers (Meat production)</option>
              <option value="Mixed">Mixed</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Preferred Language</label>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="sw">Swahili</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

const infoSectionStyle = {
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  marginBottom: '20px'
};

export default Profile;

