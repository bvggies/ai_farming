/**
 * Top navigation bar (shown on desktop/tablet; hidden on small screens where MobileBar is used).
 * Shows logo, links to Dashboard, Posts, AI Chat, Knowledge, Profile, and Admin (if admin). Includes Logout.
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiMessageSquare, FiBook, FiUser, FiMessageCircle, FiShield } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  // Main nav items; Admin link appended below for admin users
  const navLinks = [
    { path: '/dashboard', icon: FiHome, label: 'Home' },
    { path: '/posts', icon: FiMessageSquare, label: 'Community' },
    { path: '/ai-chat', icon: FiMessageCircle, label: 'AI Assistant' },
    { path: '/knowledge', icon: FiBook, label: 'Knowledge' },
    { path: '/profile', icon: FiUser, label: 'Profile' }
  ];

  if (user?.role === 'admin') {
    navLinks.push({ path: '/admin', icon: FiShield, label: 'Admin' });
  }

  // Detect mobile viewport to shorten logo text
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const logoText = isMobile ? '🐔 Appah Farms' : '🐔 Appah Farms Knowledge Hub';

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__logo">
          <span className="navbar__logoText">{logoText}</span>
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

