import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiMessageSquare, FiBook, FiUser, FiSettings } from 'react-icons/fi';
import api from '../services/api';

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
    <nav style={navbarStyle}>
      <div style={navContainerStyle}>
        <div style={logoStyle}>
          <span style={logoTextStyle}>🐔 AI Farming</span>
        </div>
        
        <div style={navLinksStyle}>
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...navLinkStyle,
                  ...(isActive ? activeNavLinkStyle : {})
                }}
              >
                <Icon style={{ marginRight: '8px' }} />
                {link.label}
              </Link>
            );
          })}
          
          <button onClick={onLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const navbarStyle = {
  backgroundColor: '#4CAF50',
  color: 'white',
  padding: '12px 0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const navContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const logoStyle = {
  fontSize: '20px',
  fontWeight: 'bold'
};

const logoTextStyle = {
  fontSize: '20px'
};

const navLinksStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  transition: 'background-color 0.3s',
  fontSize: '14px'
};

const activeNavLinkStyle = {
  backgroundColor: 'rgba(255,255,255,0.2)'
};

const logoutButtonStyle = {
  backgroundColor: 'rgba(255,255,255,0.2)',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

export default Navbar;

