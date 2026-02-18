import React, { useState } from 'react';
import { FiUser, FiMail, FiShield, FiCalendar, FiEdit3, FiSave, FiX, FiSettings, FiGlobe, FiLogOut } from 'react-icons/fi';
import { authService } from '../services/authService';
import './Profile.css';

const Profile = ({ user, setUser, onLogout }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    preferredLanguage: user.preferredLanguage || 'en'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      preferredLanguage: user.preferredLanguage || 'en'
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return '#f59e0b';
    if (role === 'manager') return '#0891b2';
    if (role === 'supervisor') return '#d97706';
    return '#4CAF50'; // worker
  };

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Administrator';
    if (role === 'manager') return 'Manager';
    if (role === 'supervisor') return 'Supervisor';
    if (role === 'farmer' || role === 'farm_supervisor') return role === 'farm_supervisor' ? 'Manager' : 'Worker'; // legacy
    return 'Worker';
  };

  const getLanguageName = (code) => {
    const languages = {
      en: 'English',
      tw: 'Twi',
      es: 'Spanish',
      fr: 'French',
      sw: 'Swahili'
    };
    return languages[code] || code;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="profile-page">
      {/* Header Section with Avatar */}
      <div className="profile-header-section">
        <div className="profile-avatar-large">
          <div className="avatar-circle">
            {getInitials(user.name || 'User')}
          </div>
          {!isEditing && (
            <button 
              className="edit-avatar-btn"
              onClick={() => setIsEditing(true)}
              title="Edit profile"
            >
              <FiEdit3 size={16} />
            </button>
          )}
        </div>
        <h1 className="profile-name">{user.name || 'User'}</h1>
        <p className="profile-email-text">{user.email}</p>
        <div className="profile-badge-container">
          <span 
            className="profile-role-badge"
            style={{ backgroundColor: getRoleBadgeColor(user.role) }}
          >
            <FiShield size={14} /> {getRoleLabel(user.role)}
          </span>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="profile-alert profile-alert-error">
          {error}
        </div>
      )}
      {success && (
        <div className="profile-alert profile-alert-success">
          {success}
        </div>
      )}

      {/* Profile Sections */}
      <div className="profile-sections">
        {/* Personal Information */}
        <div className="profile-section-card">
          <div className="section-header">
            <div className="section-title">
              <FiUser className="section-icon" />
              <span>Personal Information</span>
            </div>
            {!isEditing && (
              <button 
                className="section-edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit3 size={18} />
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="section-content">
              <div className="info-row">
                <div className="info-label">
                  <FiUser size={16} />
                  <span>Full Name</span>
                </div>
                <div className="info-value">{formData.name || 'Not set'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">
                  <FiGlobe size={16} />
                  <span>Preferred Language</span>
                </div>
                <div className="info-value">{getLanguageName(formData.preferredLanguage)}</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="form-field">
                <label htmlFor="name">
                  <FiUser size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="form-input-modern"
                />
              </div>

              <div className="form-field">
                <label htmlFor="preferredLanguage">
                  <FiGlobe size={16} />
                  Preferred Language
                </label>
                <select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="form-input-modern"
                >
                  <option value="en">English</option>
                  <option value="tw">Twi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>

              <div className="form-actions-modern">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <FiX size={18} /> Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-save" 
                  disabled={loading}
                >
                  <FiSave size={18} /> {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Information */}
        <div className="profile-section-card">
          <div className="section-header">
            <div className="section-title">
              <FiSettings className="section-icon" />
              <span>Account Information</span>
            </div>
          </div>
          <div className="section-content">
            <div className="info-row">
              <div className="info-label">
                <FiMail size={16} />
                <span>Email Address</span>
              </div>
              <div className="info-value">{user.email}</div>
            </div>
            <div className="info-row">
              <div className="info-label">
                <FiShield size={16} />
                <span>Account Type</span>
              </div>
              <div className="info-value">{getRoleLabel(user.role)}</div>
            </div>
            <div className="info-row">
              <div className="info-label">
                <FiCalendar size={16} />
                <span>Member Since</span>
              </div>
              <div className="info-value">
                {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sign out - especially for mobile where navbar is hidden */}
        {onLogout && (
          <div className="profile-section-card profile-logout-section">
            <button type="button" className="profile-logout-btn" onClick={onLogout}>
              <FiLogOut size={20} /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
