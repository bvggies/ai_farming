import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiFileText, FiBook, FiTrendingUp, FiCheckCircle, FiXCircle, 
  FiEdit, FiTrash2, FiPlus, FiBarChart2, FiClock, FiShield, FiSettings,
  FiSearch, FiFilter, FiRefreshCw, FiEye, FiEyeOff
} from 'react-icons/fi';
import api from '../services/api';
import './AdminPanel.css';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'tip' });
  const [knowledgeFilter, setKnowledgeFilter] = useState('all'); // all | faq | other

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'posts') fetchPosts();
    if (activeTab === 'knowledge') fetchKnowledge();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/knowledge');
      setKnowledge(response.data);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', formData);
      setShowUserModal(false);
      setFormData({});
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await api.put('/admin/users/update', { userId, ...updates });
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete('/admin/users/update', { data: { userId } });
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCreateKnowledge = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean) : []
      };
      
      if (editingItem) {
        await api.put('/admin/knowledge/update', { id: editingItem.id, ...data });
      } else {
        await api.post('/admin/knowledge', data);
      }
      setShowKnowledgeModal(false);
      setEditingItem(null);
      setFormData({});
      fetchKnowledge();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save entry');
    }
  };

  const handleUpdateKnowledge = (entry) => {
    setEditingItem(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      category: entry.category,
      tags: (entry.tags || []).join(', '),
      keywords: (entry.keywords || []).join(', '),
      isAIVerified: entry.isAIVerified
    });
    setShowKnowledgeModal(true);
  };

  const handleDeleteKnowledge = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.delete('/admin/knowledge/update', { data: { id } });
      fetchKnowledge();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete entry');
    }
  };

  const handlePostApprove = async (postId, isApproved) => {
    try {
      await api.put('/admin/posts/approve', { postId, isApproved });
      fetchPosts();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update post');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/posts/create', postForm);
      setShowPostModal(false);
      setPostForm({ title: '', content: '', type: 'tip' });
      fetchPosts();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create post');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const knowledgeFiltered = knowledge.filter(k => {
    const matchesSearch = k.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.content.toLowerCase().includes(searchTerm.toLowerCase());
    if (knowledgeFilter === 'faq') return matchesSearch && (k.category || '').toLowerCase() === 'faq';
    if (knowledgeFilter === 'other') return matchesSearch && (k.category || '').toLowerCase() !== 'faq';
    return matchesSearch;
  });

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1><FiShield /> Admin Dashboard</h1>
        <p>Manage your farming community platform</p>
      </div>

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && stats && (
        <div className="dashboard-overview">
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon"><FiUsers /></div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.overview.totalUsers}</p>
                <small>{stats.overview.activeUsers} active</small>
              </div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-icon"><FiFileText /></div>
              <div className="stat-content">
                <h3>Total Posts</h3>
                <p className="stat-number">{stats.overview.totalPosts}</p>
                <small>{stats.overview.approvedPosts} approved</small>
              </div>
            </div>

            <div className="stat-card stat-info">
              <div className="stat-icon"><FiBook /></div>
              <div className="stat-content">
                <h3>Knowledge Base</h3>
                <p className="stat-number">{stats.overview.totalKnowledge}</p>
                <small>entries</small>
              </div>
            </div>

            <div className="stat-card stat-warning">
              <div className="stat-icon"><FiClock /></div>
              <div className="stat-content">
                <h3>New Users</h3>
                <p className="stat-number">{stats.overview.newUsersLast7Days}</p>
                <small>last 7 days</small>
              </div>
            </div>

            <div className="stat-card stat-danger">
              <div className="stat-icon"><FiXCircle /></div>
              <div className="stat-content">
                <h3>Pending Posts</h3>
                <p className="stat-number">{stats.overview.pendingPosts}</p>
                <small>awaiting approval</small>
              </div>
            </div>

            <div className="stat-card stat-secondary">
              <div className="stat-icon"><FiTrendingUp /></div>
              <div className="stat-content">
                <h3>Notifications</h3>
                <p className="stat-number">{stats.overview.totalNotifications}</p>
                <small>total sent</small>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3><FiBarChart2 /> Posts by Type</h3>
              <div className="chart-content">
                {(stats.breakdown.postsByType || []).map((item, idx) => (
                  <div key={idx} className="chart-item">
                    <span>{item.type}</span>
                    <div className="chart-bar">
                      <div 
                        className="chart-fill" 
                        style={{ width: `${stats.overview.totalPosts ? (item.count / stats.overview.totalPosts) * 100 : 0}%` }}
                      />
                    </div>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3><FiBarChart2 /> Users by Role</h3>
              <div className="chart-content">
                {(stats.breakdown.usersByRole || []).map((item, idx) => (
                  <div key={idx} className="chart-item">
                    <span>{item.role}</span>
                    <div className="chart-bar">
                      <div 
                        className="chart-fill" 
                        style={{ width: `${stats.overview.totalUsers ? (item.count / stats.overview.totalUsers) * 100 : 0}%` }}
                      />
                    </div>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3><FiBarChart2 /> Top Knowledge Categories</h3>
              <div className="chart-content">
                {(stats.breakdown.knowledgeByCategory || []).slice(0, 5).map((item, idx) => (
                  <div key={idx} className="chart-item">
                    <span>{item.category}</span>
                    <div className="chart-bar">
                      <div 
                        className="chart-fill" 
                        style={{ width: `${stats.overview.totalKnowledge ? (item.count / stats.overview.totalKnowledge) * 100 : 0}%` }}
                      />
                    </div>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'tab-active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          <FiBarChart2 /> Dashboard
        </button>
        <button
          className={activeTab === 'users' ? 'tab-active' : ''}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers /> Users
        </button>
        <button
          className={activeTab === 'posts' ? 'tab-active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          <FiFileText /> Posts
        </button>
        <button
          className={activeTab === 'knowledge' ? 'tab-active' : ''}
          onClick={() => setActiveTab('knowledge')}
        >
          <FiBook /> Knowledge Base
        </button>
        <button onClick={fetchStats} className="refresh-btn">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Search Bar */}
      {(activeTab !== 'dashboard') && (
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Content Sections */}
      {loading && <div className="loading">Loading...</div>}

      {activeTab === 'users' && !loading && (
        <div className="content-section">
          <div className="section-header">
            <h2>User Management</h2>
            <button className="btn btn-primary" onClick={() => { setShowUserModal(true); setFormData({}); setEditingItem(null); }}>
              <FiPlus /> Add User
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Farm Size</th>
                  <th>Poultry Type</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(userItem => (
                  <tr key={userItem.id}>
                    <td>{userItem.name}</td>
                    <td>{userItem.email}</td>
                    <td>{userItem.farmSize || '-'}</td>
                    <td>{userItem.poultryType || '-'}</td>
                    <td>
                      <span className={`badge badge-${userItem.role === 'admin' ? 'danger' : 'primary'}`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${userItem.isActive ? 'success' : 'warning'}`}>
                        {userItem.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => handleUpdateUser(userItem.id, { isActive: !userItem.isActive })}
                          title={userItem.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {userItem.isActive ? <FiEyeOff /> : <FiEye />}
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleUpdateUser(userItem.id, { role: userItem.role === 'admin' ? 'farmer' : 'admin' })}
                          title="Toggle Role"
                        >
                          <FiShield />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDeleteUser(userItem.id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'posts' && !loading && (
        <div className="content-section">
          <div className="section-header">
            <h2>Post Management</h2>
            <div className="filter-buttons" style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setSearchTerm('')}>
                <FiFilter /> Clear Filter
              </button>
              <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>
                <FiPlus /> Add Post
              </button>
            </div>
          </div>

          <div className="posts-grid">
            {filteredPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <h3>{post.title}</h3>
                  <span className={`badge badge-${post.isApproved ? 'success' : 'warning'}`}>
                    {post.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <p className="post-meta">By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}</p>
                <p className="post-content">{post.content.substring(0, 150)}...</p>
                <div className="post-actions">
                  {!post.isApproved && (
                    <button className="btn btn-success" onClick={() => handlePostApprove(post.id, true)}>
                      <FiCheckCircle /> Approve
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={() => handlePostApprove(post.id, false)}>
                    <FiXCircle /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && !loading && (
        <div className="content-section">
          <div className="section-header">
            <h2>Knowledge Base Management</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select value={knowledgeFilter} onChange={(e) => setKnowledgeFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="faq">FAQs</option>
                <option value="other">Other</option>
              </select>
              <button className="btn btn-primary" onClick={() => { setShowKnowledgeModal(true); setFormData({ category: 'faq' }); setEditingItem(null); }}>
                <FiPlus /> Add FAQ
              </button>
              <button className="btn btn-outline" onClick={() => { setShowKnowledgeModal(true); setFormData({}); setEditingItem(null); }}>
                <FiPlus /> Add Entry
              </button>
            </div>
          </div>

          <div className="knowledge-grid">
            {knowledgeFiltered.map(entry => (
              <div key={entry.id} className="knowledge-card">
                <div className="knowledge-header">
                  <h3>{entry.title}</h3>
                  {entry.isAIVerified && <span className="badge badge-success"><FiCheckCircle /> Verified</span>}
                </div>
                <p className="knowledge-category">{entry.category}</p>
                <p className="knowledge-content">{entry.content.substring(0, 200)}...</p>
                <div className="knowledge-actions">
                  <button className="btn btn-secondary" onClick={() => handleUpdateKnowledge(entry)}>
                    <FiEdit /> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeleteKnowledge(entry.id)}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => { setShowUserModal(false); setFormData({}); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit User' : 'Create User'}</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password {!editingItem && '*'}</label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingItem}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role || 'farmer'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="farmer">Farmer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-outline" onClick={() => { setShowUserModal(false); setFormData({}); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Knowledge Modal */}
      {showKnowledgeModal && (
        <div className="modal-overlay" onClick={() => { setShowKnowledgeModal(false); setFormData({}); setEditingItem(null); }}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Knowledge Entry' : (formData.category === 'faq' ? 'Create FAQ' : 'Create Knowledge Entry')}</h2>
            <form onSubmit={handleCreateKnowledge}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="10"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category || 'general'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <small style={{ color: '#666' }}>Use 'faq' to add to FAQs section</small>
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags || ''}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="feeding, nutrition, health"
                />
              </div>
              <div className="form-group">
                <label>Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={formData.keywords || ''}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="chicken feed, layer diet"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAIVerified || false}
                    onChange={(e) => setFormData({ ...formData, isAIVerified: e.target.checked })}
                  />
                  AI Verified
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-outline" onClick={() => { setShowKnowledgeModal(false); setFormData({}); setEditingItem(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Post</h2>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  rows="8"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={postForm.type}
                  onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}
                >
                  <option value="tip">Tip</option>
                  <option value="question">Question</option>
                  <option value="experience">Experience</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowPostModal(false)}>
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

export default AdminPanel;
