import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiGlobe } from 'react-icons/fi';
import { authService } from '../services/authService';
import './Register.css';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    preferredLanguage: 'en'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
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
    <div className="register-page">
      <div className="register-bg-shape register-bg-shape--1" aria-hidden="true" />
      <div className="register-bg-shape register-bg-shape--2" aria-hidden="true" />

      <div className="register-card">
        <div className="register-card__header">
          <div className="register-card__logo">
            <span className="register-card__logo-icon">🐔</span>
          </div>
          <h1 className="register-card__title">Join Appah Farms</h1>
          <p className="register-card__subtitle">Create your worker account</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="register-error" role="alert">
              <span className="register-error__text">{error}</span>
            </div>
          )}

          <div className="register-field">
            <label htmlFor="register-name" className="register-field__label">Full name *</label>
            <div className="register-field__input-wrap">
              <FiUser className="register-field__icon" aria-hidden="true" />
              <input
                id="register-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                autoComplete="name"
                className="register-field__input"
              />
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="register-email" className="register-field__label">Email *</label>
            <div className="register-field__input-wrap">
              <FiMail className="register-field__icon" aria-hidden="true" />
              <input
                id="register-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="register-field__input"
              />
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="register-password" className="register-field__label">Password * (min 6 characters)</label>
            <div className="register-field__input-wrap">
              <FiLock className="register-field__icon" aria-hidden="true" />
              <input
                id="register-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                autoComplete="new-password"
                className="register-field__input"
              />
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="register-lang" className="register-field__label">Preferred language</label>
            <div className="register-field__input-wrap">
              <FiGlobe className="register-field__icon" aria-hidden="true" />
              <select
                id="register-lang"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="register-field__input register-field__select"
              >
                <option value="en">English</option>
                <option value="tw">Twi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="sw">Swahili</option>
              </select>
            </div>
          </div>

          <button type="submit" className="register-submit" disabled={loading}>
            {loading ? (
              <span className="register-submit__spinner" aria-hidden="true" />
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login" className="register-footer__link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
