import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMessageSquare, FiBook, FiSettings, FiArrowRight, FiTrendingUp,
  FiCalendar, FiClock, FiBell, FiActivity, FiBarChart2, FiPlus,
  FiCheckCircle, FiX, FiAlertCircle
} from 'react-icons/fi';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    type: 'vaccination',
    title: '',
    description: '',
    reminderDate: '',
    reminderTime: '08:00'
  });

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [postsRes, remindersRes] = await Promise.all([
        api.get('/posts?limit=5').catch(() => ({ data: [] })),
        api.get('/reminders').catch(() => ({ data: [] }))
      ]);
      
      setRecentPosts(postsRes.data);
      setReminders(remindersRes.data || []);
      
      // Calculate stats
      const today = new Date();
      const upcomingReminders = remindersRes.data?.filter(r => {
        const reminderDate = new Date(r.reminderDate);
        return reminderDate >= today && !r.isCompleted;
      }) || [];
      
      setStats({
        totalPosts: postsRes.data.length,
        upcomingReminders: upcomingReminders.length,
        completedReminders: remindersRes.data?.filter(r => r.isCompleted).length || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reminders', reminderForm);
      setShowReminderModal(false);
      setReminderForm({
        type: 'vaccination',
        title: '',
        description: '',
        reminderDate: '',
        reminderTime: '08:00'
      });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create reminder');
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      await api.put('/reminders/update', { reminderId, isCompleted: true });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to update reminder');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await api.delete('/reminders/update', { data: { reminderId } });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to delete reminder');
    }
  };

  const getUpcomingReminders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return reminders
      .filter(r => {
        const reminderDate = new Date(r.reminderDate);
        reminderDate.setHours(0, 0, 0, 0);
        return reminderDate >= today && !r.isCompleted;
      })
      .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate))
      .slice(0, 5);
  };

  const getReminderTypeIcon = (type) => {
    switch(type) {
      case 'vaccination': return '💉';
      case 'feeding': return '🌾';
      case 'medication': return '💊';
      default: return '📅';
    }
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(date);
    reminderDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.name}! 👋</h1>
          <p>Your poultry farming dashboard</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowReminderModal(true)}>
            <FiPlus /> Add Reminder
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon"><FiMessageSquare /></div>
          <div className="stat-info">
            <h3>Recent Posts</h3>
            <p className="stat-value">{stats?.totalPosts || 0}</p>
          </div>
        </div>

        <div className="stat-card stat-orange">
          <div className="stat-icon"><FiBell /></div>
          <div className="stat-info">
            <h3>Upcoming</h3>
            <p className="stat-value">{stats?.upcomingReminders || 0}</p>
            <small>Reminders</small>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon"><FiCheckCircle /></div>
          <div className="stat-info">
            <h3>Completed</h3>
            <p className="stat-value">{stats?.completedReminders || 0}</p>
            <small>Tasks</small>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon"><FiActivity /></div>
          <div className="stat-info">
            <h3>Activity</h3>
            <p className="stat-value">Active</p>
            <small>This week</small>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-card">
          <h2><FiSettings /> Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/create-post" className="action-item">
              <FiMessageSquare size={24} />
              <span>Share Experience</span>
            </Link>
            <Link to="/ai-chat" className="action-item">
              <FiSettings size={24} />
              <span>AI Assistant</span>
            </Link>
            <Link to="/knowledge" className="action-item">
              <FiBook size={24} />
              <span>Knowledge Base</span>
            </Link>
            <Link to="/profile" className="action-item">
              <FiActivity size={24} />
              <span>My Profile</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><FiCalendar /> Upcoming Reminders</h2>
            <button className="btn-icon" onClick={() => setShowReminderModal(true)}>
              <FiPlus />
            </button>
          </div>
          {getUpcomingReminders().length > 0 ? (
            <div className="reminders-list">
              {getUpcomingReminders().map(reminder => {
                const daysUntil = getDaysUntil(reminder.reminderDate);
                return (
                  <div key={reminder.id} className="reminder-item">
                    <div className="reminder-icon">{getReminderTypeIcon(reminder.type)}</div>
                    <div className="reminder-content">
                      <h4>{reminder.title}</h4>
                      <p>{reminder.description}</p>
                      <small>
                        <FiClock /> {new Date(reminder.reminderDate).toLocaleDateString()} at {reminder.reminderTime}
                        {daysUntil === 0 && <span className="urgent"> • Today!</span>}
                        {daysUntil === 1 && <span className="soon"> • Tomorrow</span>}
                        {daysUntil > 1 && <span> • In {daysUntil} days</span>}
                      </small>
                    </div>
                    <div className="reminder-actions">
                      <button 
                        className="btn-icon btn-success" 
                        onClick={() => handleCompleteReminder(reminder.id)}
                        title="Mark Complete"
                      >
                        <FiCheckCircle />
                      </button>
                      <button 
                        className="btn-icon btn-danger" 
                        onClick={() => handleDeleteReminder(reminder.id)}
                        title="Delete"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <FiBell size={48} color="#ccc" />
              <p>No upcoming reminders</p>
              <button className="btn btn-outline" onClick={() => setShowReminderModal(true)}>
                Create Reminder
              </button>
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><FiTrendingUp /> Recent Community Posts</h2>
            <Link to="/posts" className="btn-link">View All</Link>
          </div>
          {recentPosts.length > 0 ? (
            <div className="posts-list">
              {recentPosts.map(post => (
                <div key={post.id || post._id} className="post-item">
                  <h4>{post.title}</h4>
                  <p className="post-meta">
                    By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <p className="post-excerpt">{post.content.substring(0, 100)}...</p>
                  <Link to={`/posts/${post.id || post._id}`} className="post-link">
                    Read more <FiArrowRight />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No posts yet. Be the first to share!</p>
              <Link to="/create-post" className="btn btn-primary">Create Post</Link>
            </div>
          )}
        </div>

        {/* Profile Summary */}
        <div className="dashboard-card">
          <h2><FiActivity /> Your Profile</h2>
          <div className="profile-summary">
            <div className="profile-item">
              <strong>Farm Size:</strong>
              <span>{user.farmSize || 'Not specified'}</span>
            </div>
            <div className="profile-item">
              <strong>Poultry Type:</strong>
              <span>{user.poultryType || 'Not specified'}</span>
            </div>
            <div className="profile-item">
              <strong>Language:</strong>
              <span>{user.preferredLanguage || 'English'}</span>
            </div>
            <Link to="/profile" className="btn btn-outline" style={{ marginTop: '15px' }}>
              Update Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Reminder</h2>
            <form onSubmit={handleCreateReminder}>
              <div className="form-group">
                <label>Type *</label>
                <select
                  value={reminderForm.type}
                  onChange={(e) => setReminderForm({ ...reminderForm, type: e.target.value })}
                  required
                >
                  <option value="vaccination">Vaccination</option>
                  <option value="feeding">Feeding Schedule</option>
                  <option value="medication">Medication</option>
                  <option value="general">General Reminder</option>
                </select>
              </div>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                  placeholder="e.g., Vaccinate against Newcastle disease"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={reminderForm.description}
                  onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                  rows="3"
                  placeholder="Additional details..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={reminderForm.reminderDate}
                    onChange={(e) => setReminderForm({ ...reminderForm, reminderDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={reminderForm.reminderTime}
                    onChange={(e) => setReminderForm({ ...reminderForm, reminderTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Create Reminder</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowReminderModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
