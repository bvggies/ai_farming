import React, { useState } from 'react';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { authService } from '../services/authService';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const data = await authService.login(formData.email, formData.password);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shape login-bg-shape--1" aria-hidden="true" />
      <div className="login-bg-shape login-bg-shape--2" aria-hidden="true" />

      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo">
            <span className="login-card__logo-icon">🐔</span>
          </div>
          <h1 className="login-card__title">Appah Farms</h1>
          <p className="login-card__subtitle">Knowledge Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error" role="alert">
              <span className="login-error__text">{error}</span>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="login-email" className="login-field__label">Email</label>
            <div className="login-field__input-wrap">
              <FiMail className="login-field__icon" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="login-field__input"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-field__label">Password</label>
            <div className="login-field__input-wrap">
              <FiLock className="login-field__icon" aria-hidden="true" />
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="login-field__input"
              />
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <span className="login-submit__spinner" aria-hidden="true" />
            ) : (
              <>
                <FiLogIn className="login-submit__icon" aria-hidden="true" />
                Sign in
              </>
            )}
          </button>
        </form>

        <p className="login-footer">
          For Appah Farm workers, managers & supervisors. Contact your administrator for access.
        </p>
      </div>
    </div>
  );
};

export default Login;

