import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    farmSize: '',
    poultryType: '',
    preferredLanguage: 'en'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.register(formData);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Create Your Account</h1>
        <p style={subtitleStyle}>Join our farming community</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
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
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password * (min. 6 characters)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Create a password"
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

          <button type="submit" className="btn btn-primary" style={buttonStyle} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={linkStyle}>
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '20px'
};

const cardStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '40px',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const titleStyle = {
  fontSize: '28px',
  marginBottom: '10px',
  textAlign: 'center',
  color: '#333'
};

const subtitleStyle = {
  textAlign: 'center',
  color: '#666',
  marginBottom: '30px'
};

const buttonStyle = {
  width: '100%',
  marginTop: '10px'
};

const linkStyle = {
  textAlign: 'center',
  marginTop: '20px',
  color: '#666'
};

export default Register;

