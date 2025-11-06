import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiMessageSquare, FiBook, FiUser, FiCpu, FiSettings } from 'react-icons/fi';
import './MobileBar.css';

const MobileBar = ({ user }) => {
  const location = useLocation();

  const tabs = [
    { to: '/dashboard', icon: FiHome, label: 'Home' },
    { to: '/posts', icon: FiMessageSquare, label: 'Posts' },
    { to: '/ai-chat', icon: FiCpu, label: 'AI' },
    { to: '/knowledge', icon: FiBook, label: 'KB' },
    { to: '/profile', icon: FiUser, label: 'Me' }
  ];

  if (user?.role === 'admin') {
    tabs.splice(4, 0, { to: '/admin', icon: FiSettings, label: 'Admin' });
  }

  return (
    <div className="mobile-bar" role="navigation" aria-label="Bottom navigation">
      <div className="mobile-bar__container">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`mobile-bar__item ${isActive ? 'is-active' : ''}`}
              aria-label={tab.label}
            >
              <span className="mobile-bar__icon">
                <Icon size={20} />
              </span>
              <span className="mobile-bar__label">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBar;


