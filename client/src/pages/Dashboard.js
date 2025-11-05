import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMessageSquare, FiBook, FiSettings, FiArrowRight, FiTrendingUp,
  FiCalendar, FiClock, FiBell, FiActivity, FiBarChart2, FiPlus,
  FiCheckCircle, FiX
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

  const [activeTab, setActiveTab] = useState('overview'); // overview | activity
  const [feedingSchedules, setFeedingSchedules] = useState([]);
  const [farmLogs, setFarmLogs] = useState([]);
  const [feedingForm, setFeedingForm] = useState({ timeOfDay: '08:00', feedType: '', rationGrams: 0, notes: '' });
  const [farmForm, setFarmForm] = useState({ logDate: '', numBirds: '', feedType: '', dailyFeedKg: '', mortality: '', notes: '' });
  const [activityAnalytics, setActivityAnalytics] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [postsRes, remindersRes, activityRes] = await Promise.all([
        api.get('/posts?limit=5').catch(() => ({ data: [] })),
        api.get('/reminders').catch(() => ({ data: [] })),
        api.get('/activity').catch(() => ({ data: { feedingSchedules: [], farmLogs: [], aggregates: {}, analytics: null, history: [] } }))
      ]);
      
      setRecentPosts(postsRes.data);
      setReminders(remindersRes.data || []);
      setFeedingSchedules(activityRes.data.feedingSchedules || []);
      setFarmLogs(activityRes.data.farmLogs || []);
      setActivityAnalytics(activityRes.data.analytics || null);
      setActivityHistory(activityRes.data.history || []);
      
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

  const handleAddFeedingSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/activity', { kind: 'feeding', ...feedingForm });
      setFeedingForm({ timeOfDay: '08:00', feedType: '', rationGrams: 0, notes: '' });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add feeding schedule');
    }
  };

  const handleAddFarmLog = async (e) => {
    e.preventDefault();
    try {
      await api.post('/activity', { kind: 'farm', ...farmForm });
      setFarmForm({ logDate: '', numBirds: '', feedType: '', dailyFeedKg: '', mortality: '', notes: '' });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save farm data');
    }
  };

  const maxFeed = activityAnalytics?.days?.reduce((m, d) => Math.max(m, d.feedKg), 0) || 1;
  const maxMort = activityAnalytics?.days?.reduce((m, d) => Math.max(m, d.mortality), 0) || 1;

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

      <div className="admin-tabs" style={{ marginBottom: 20 }}>
        <button className={activeTab === 'overview' ? 'tab-active' : ''} onClick={() => setActiveTab('overview')}>
          <FiTrendingUp /> Overview
        </button>
        <button className={activeTab === 'activity' ? 'tab-active' : ''} onClick={() => setActiveTab('activity')}>
          <FiActivity /> Activity
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
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
                    const daysUntil = Math.ceil((new Date(reminder.reminderDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={reminder.id} className="reminder-item">
                        <div className="reminder-icon">{reminder.type === 'vaccination' ? '💉' : reminder.type === 'feeding' ? '🌾' : reminder.type === 'medication' ? '💊' : '📅'}</div>
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
                          <button className="btn-icon btn-success" onClick={() => handleCompleteReminder(reminder.id)} title="Mark Complete">
                            <FiCheckCircle />
                          </button>
                          <button className="btn-icon btn-danger" onClick={() => handleDeleteReminder(reminder.id)} title="Delete">
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
        </>
      )}

      {activeTab === 'activity' && (
        <div className="dashboard-grid">
          {/* Analytics */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2><FiBarChart2 /> Activity Analytics (7 days)</h2>
            </div>
            {activityAnalytics ? (
              <>
                <div className="stats-grid">
                  <div className="stat-card stat-blue">
                    <div className="stat-icon"><FiBarChart2 /></div>
                    <div className="stat-info">
                      <h3>Total Feed (kg)</h3>
                      <p className="stat-value">{activityAnalytics.totalFeedKg7d}</p>
                    </div>
                  </div>
                  <div className="stat-card stat-green">
                    <div className="stat-icon"><FiActivity /></div>
                    <div className="stat-info">
                      <h3>Avg Feed/Day (kg)</h3>
                      <p className="stat-value">{activityAnalytics.avgFeedKg7d}</p>
                    </div>
                  </div>
                  <div className="stat-card stat-purple">
                    <div className="stat-icon"><FiActivity /></div>
                    <div className="stat-info">
                      <h3>Feed/Bird/Day (kg)</h3>
                      <p className="stat-value">{activityAnalytics.feedPerBirdAvg}</p>
                    </div>
                  </div>
                  <div className="stat-card stat-orange">
                    <div className="stat-icon"><FiActivity /></div>
                    <div className="stat-info">
                      <h3>Mortality (7d)</h3>
                      <p className="stat-value">{activityAnalytics.totalMortality7d}</p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card" style={{ padding: 0 }}>
                  <div style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Feed (kg) by Day</h3>
                    {activityAnalytics.days && activityAnalytics.days.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
                        {activityAnalytics.days.map((d, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{ height: 80, width: '100%', background: '#f0f0f0', borderRadius: 6, display: 'flex', alignItems: 'flex-end' }}>
                              <div style={{ width: '100%', height: `${maxFeed ? (d.feedKg / maxFeed) * 100 : 0}%`, background: 'linear-gradient(90deg, #4CAF50, #45a049)', borderRadius: 6 }} />
                            </div>
                            <small style={{ color: '#666' }}>{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#666' }}>No data</p>
                    )}
                  </div>

                  <div style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Mortality by Day</h3>
                    {activityAnalytics.days && activityAnalytics.days.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
                        {activityAnalytics.days.map((d, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{ height: 80, width: '100%', background: '#f0f0f0', borderRadius: 6, display: 'flex', alignItems: 'flex-end' }}>
                              <div style={{ width: '100%', height: `${maxMort ? (d.mortality / maxMort) * 100 : 0}%`, background: 'linear-gradient(90deg, #ff9800, #fb8c00)', borderRadius: 6 }} />
                            </div>
                            <small style={{ color: '#666' }}>{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#666' }}>No data</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No analytics yet. Add farm data to see insights.</p>
              </div>
            )}
          </div>

          {/* History */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2><FiActivity /> Activity History</h2>
            </div>
            {activityHistory && activityHistory.length > 0 ? (
              <div className="posts-list">
                {activityHistory.map(ev => (
                  <div key={ev.id} className="post-item">
                    <h4>{ev.title}</h4>
                    <p className="post-meta">{new Date(ev.date).toLocaleDateString()}</p>
                    <p className="post-excerpt">{ev.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No activity yet. Add farm data to see history.</p>
              </div>
            )}
          </div>

          {/* Feeding Schedules */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2><FiClock /> Feeding Schedules</h2>
            </div>
            <form onSubmit={handleAddFeedingSchedule} style={{ marginBottom: 20 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Time of Day *</label>
                  <input type="time" value={feedingForm.timeOfDay} onChange={(e) => setFeedingForm({ ...feedingForm, timeOfDay: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Feed Type</label>
                  <input type="text" value={feedingForm.feedType} onChange={(e) => setFeedingForm({ ...feedingForm, feedType: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ration (grams per bird)</label>
                  <input type="number" min="0" value={feedingForm.rationGrams} onChange={(e) => setFeedingForm({ ...feedingForm, rationGrams: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <input type="text" value={feedingForm.notes} onChange={(e) => setFeedingForm({ ...feedingForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Add Schedule</button>
              </div>
            </form>

            {feedingSchedules.length > 0 ? (
              <div className="posts-list">
                {feedingSchedules.map(s => (
                  <div key={s.id} className="post-item">
                    <h4>{String(s.timeOfDay).slice(0,5)} • {s.feedType || 'Feed'}</h4>
                    <p className="post-meta">Ration: {s.rationGrams || 0} g/bird</p>
                    {s.notes && <p className="post-excerpt">{s.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No feeding schedules yet.</p>
              </div>
            )}
          </div>

          {/* Farm Data */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2><FiBarChart2 /> Farm Data</h2>
            </div>
            <form onSubmit={handleAddFarmLog} style={{ marginBottom: 20 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={farmForm.logDate} onChange={(e) => setFarmForm({ ...farmForm, logDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Number of Birds</label>
                  <input type="number" min="0" value={farmForm.numBirds} onChange={(e) => setFarmForm({ ...farmForm, numBirds: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Feed Type</label>
                  <input type="text" value={farmForm.feedType} onChange={(e) => setFarmForm({ ...farmForm, feedType: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Daily Feed (kg)</label>
                  <input type="number" min="0" step="0.01" value={farmForm.dailyFeedKg} onChange={(e) => setFarmForm({ ...farmForm, dailyFeedKg: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mortality</label>
                  <input type="number" min="0" value={farmForm.mortality} onChange={(e) => setFarmForm({ ...farmForm, mortality: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <input type="text" value={farmForm.notes} onChange={(e) => setFarmForm({ ...farmForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>

            {farmLogs.length > 0 ? (
              <div className="posts-list">
                {farmLogs.map(l => (
                  <div key={l.id} className="post-item">
                    <h4>{new Date(l.logDate).toLocaleDateString()} • Birds: {l.numBirds || 0}</h4>
                    <p className="post-meta">Feed: {l.feedType || '-'} • {l.dailyFeedKg || 0} kg</p>
                    <p className="post-excerpt">Mortality: {l.mortality || 0}</p>
                    {l.notes && <p className="post-excerpt">{l.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No farm data yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

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
