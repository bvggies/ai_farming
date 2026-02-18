/**
 * Notifications page: lists the current user's notifications.
 * Users can mark individual or all as read; notifications with a link navigate when clicked.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import './Notifications.css';

// Human-readable labels for notification types
const typeLabels = { post_response: 'Post response', comment: 'Comment', ai_suggestion: 'AI suggestion', reminder: 'Reminder' };

const Notifications = ({ user }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /** Load all notifications for the current user from the API */
  const fetchNotifications = async () => {
    try {
      setError('');
      const res = await api.get('/notifications');
      setList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  /** Mark a single notification as read and update local state */
  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setList(list.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  /** Mark all notifications as read and update local state */
  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setList(list.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const unreadCount = list.filter(n => !n.isRead).length;

  if (loading) return <div className="container notifications-page"><div className="loading">Loading...</div></div>;

  return (
    <div className="container notifications-page">
      <div className="notifications-header">
        <h1><FiBell /> Notifications</h1>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-secondary" onClick={markAllRead}><FiCheckCircle /> Mark all read</button>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {list.length === 0 ? (
        <div className="card notifications-empty empty-state">
          <FiBell className="empty-state-icon" size={48} />
          <h3>No notifications yet</h3>
          <p>When someone comments or the AI has a suggestion, you will see it here.</p>
        </div>
      ) : (
        <ul className="notifications-list">
          {list.map((n) => (
            <li key={n.id} className={`notification-item card ${n.isRead ? 'is-read' : ''}`}>
              <div className="notification-body">
                {n.link ? (
                  <Link to={n.link} className="notification-link" onClick={() => !n.isRead && markRead(n.id)}>
                    <span className="notification-type">{typeLabels[n.type] || n.type}</span>
                    <strong className="notification-title">{n.title}</strong>
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-date">{new Date(n.createdAt).toLocaleString()}</span>
                  </Link>
                ) : (
                  <div>
                    <span className="notification-type">{typeLabels[n.type] || n.type}</span>
                    <strong className="notification-title">{n.title}</strong>
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-date">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                )}
                {!n.isRead && (
                  <button type="button" className="notification-mark-read" onClick={() => markRead(n.id)} title="Mark as read"><FiCheck /></button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
