import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiMessageSquare, FiBook, FiUser, FiSettings } from 'react-icons/fi';
import api from '../services/api';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const [, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notifications/unread-count');
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const navLinks = [
    { path: '/dashboard', icon: FiHome, label: 'Home' },
    { path: '/posts', icon: FiMessageSquare, label: 'Community' },
    { path: '/ai-chat', icon: FiSettings, label: 'AI Assistant' },
    { path: '/knowledge', icon: FiBook, label: 'Knowledge' },
    { path: '/profile', icon: FiUser, label: 'Profile' }
  ];

  if (user?.role === 'admin') {
    navLinks.push({ path: '/admin', icon: FiSettings, label: 'Admin' });
  }

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__logo">
          <span className="navbar__logoText">🐔 Appah Farms Knowledge Hub</span>
        </div>
        <div className="navbar__links">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__link ${isActive ? 'is-active' : ''}`}
              >
                <Icon className="navbar__icon" />
                <span className="navbar__label">{link.label}</span>
              </Link>
            );
          })}
          <button onClick={onLogout} className="navbar__logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

