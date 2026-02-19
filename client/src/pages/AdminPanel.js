/**
 * Admin panel: for users with role "admin" only. Tabs: Dashboard (stats + charts), Users, Posts, Knowledge.
 * - Dashboard: overview stats, posts by type, users by role, knowledge categories, recent activity.
 * - Users: table of users; add, edit role, activate/deactivate, delete.
 * - Posts: card list; approve/reject; add post.
 * - Knowledge: list entries; filter by category; add/edit/delete; export.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FiUsers, FiFileText, FiBook, FiTrendingUp, FiCheckCircle, FiXCircle, 
  FiEdit, FiTrash2, FiPlus, FiBarChart2, FiClock, FiShield,
  FiSearch, FiFilter, FiRefreshCw, FiEye, FiEyeOff, FiDownload, FiSun, FiMoon, FiChevronDown
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import './AdminPanel.css';

const AdminPanel = ({ user }) => {
  // Which tab is active and data for each section
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState({ users: false, posts: false, knowledge: false });
  // Modals and forms
  const [showUserModal, setShowUserModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'tip' });
  const [knowledgeFilter, setKnowledgeFilter] = useState('all'); // 'all' | 'faq' | 'other'
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('admin_dark') === '1');
  const [showExportMenu, setShowExportMenu] = useState({ users: false, posts: false, knowledge: false });
  const exportMenuRefs = { users: useRef(null), posts: useRef(null), knowledge: useRef(null) };

  // Load overview stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // When switching tabs, load that tab's data (users, posts, or knowledge)
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'posts') fetchPosts();
    if (activeTab === 'knowledge') fetchKnowledge();
  }, [activeTab]);

  useEffect(() => {
    document.body.classList.toggle('admin-dark', darkMode);
    localStorage.setItem('admin_dark', darkMode ? '1' : '0');
  }, [darkMode]);

  // Refresh dashboard stats every 30 seconds
  useEffect(() => {
    const id = setInterval(fetchStats, 30000);
    return () => clearInterval(id);
  }, []);

  /** Fetch admin overview (user count, post count, knowledge count, etc.) */
  const fetchStats = async () => {
    try {
      setStatsError(null);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setStatsLoading(false);
    }
  };

  /** Load all users for the Admin Users tab */
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

  /** Load all posts (including unapproved) for the Admin Posts tab */
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

  /** Load all knowledge entries for the Admin Knowledge tab */
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

  // Debounced search
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebounced(searchTerm), 250);
    return () => clearTimeout(id);
  }, [searchTerm]);

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

  /** Remove duplicate knowledge entries based on title */
  const handleRemoveDuplicates = async () => {
    if (!window.confirm('This will remove duplicate entries based on title. Keep the oldest entry and delete newer duplicates. Continue?')) return;
    try {
      const response = await api.post('/admin/knowledge/remove-duplicates');
      alert(response.data.message || `Removed ${response.data.removed || 0} duplicate entries`);
      fetchKnowledge();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove duplicates');
    }
  };

  /** Add 8 new FAQs to the knowledge base */
  const handleAdd8FAQs = async () => {
    if (!window.confirm('This will add 8 new unique FAQs to the knowledge base. Continue?')) return;
    try {
      const response = await api.post('/admin/knowledge/add-8-faqs');
      alert(response.data.message || `Added ${response.data.added || 0} FAQs`);
      if (response.data.skipped > 0) {
        alert(`Skipped ${response.data.skipped} duplicates: ${response.data.skippedTitles.join(', ')}`);
      }
      fetchKnowledge();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add FAQs');
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

  // Close export menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(exportMenuRefs).forEach(key => {
        if (exportMenuRefs[key].current && !exportMenuRefs[key].current.contains(event.target)) {
          setShowExportMenu(prev => ({ ...prev, [key]: false }));
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // exportMenuRefs is stable and doesn't need to be in deps

  // CSV export helpers
  const downloadCSV = (filename, rows) => {
    const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map(r => Object.values(r).map(v => typeof v === 'string' ? `"${v.replace(/"/g,'""')}"` : v).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF export helpers
  const downloadPDF = (filename, title, rows, columns) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add table using autoTable function
    autoTable(doc, {
      head: [columns],
      body: rows.map(row => columns.map(col => row[col] || '')),
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 35 }
    });
    
    doc.save(filename);
  };

  /** Fetch data for export (users, posts, or knowledge) */
  const fetchDataForExport = async (type) => {
    let data = [];
    if (type === 'users') {
      data = users.length > 0 ? users : (await api.get('/admin/users')).data;
    } else if (type === 'posts') {
      data = posts.length > 0 ? posts : (await api.get('/admin/posts')).data;
    } else if (type === 'knowledge') {
      data = knowledge.length > 0 ? knowledge : (await api.get('/admin/knowledge')).data;
    }
    return data;
  };

  /** Export users to CSV */
  const exportUsersCSV = async () => {
    setShowExportMenu(prev => ({ ...prev, users: false }));
    setExporting(prev => ({ ...prev, users: true }));
    try {
      const dataToExport = await fetchDataForExport('users');
      const rows = dataToExport.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.isActive }));
      if (rows.length === 0) {
        alert('No users to export');
        return;
      }
      downloadCSV('users.csv', rows);
    } catch (error) {
      alert('Failed to export users: ' + (error.response?.data?.message || error.message));
    } finally {
      setExporting(prev => ({ ...prev, users: false }));
    }
  };

  /** Export users to PDF */
  const exportUsersPDF = async () => {
    setShowExportMenu(prev => ({ ...prev, users: false }));
    setExporting(prev => ({ ...prev, users: true }));
    try {
      const dataToExport = await fetchDataForExport('users');
      const rows = dataToExport.map(u => ({ 
        id: u.id, 
        name: u.name || '', 
        email: u.email || '', 
        role: u.role || '', 
        active: u.isActive ? 'Yes' : 'No' 
      }));
      if (rows.length === 0) {
        alert('No users to export');
        return;
      }
      const columns = ['id', 'name', 'email', 'role', 'active'];
      downloadPDF('users.pdf', 'Users Export', rows, columns);
    } catch (error) {
      alert('Failed to export users: ' + (error.response?.data?.message || error.message));
    } finally {
      setExporting(prev => ({ ...prev, users: false }));
    }
  };

  /** Export posts to CSV */
  const exportPostsCSV = async () => {
    setShowExportMenu(prev => ({ ...prev, posts: false }));
    setExporting(prev => ({ ...prev, posts: true }));
    try {
      const dataToExport = await fetchDataForExport('posts');
      const rows = dataToExport.map(p => ({ id: p.id, title: p.title, type: p.type, approved: p.isApproved }));
      if (rows.length === 0) {
        alert('No posts to export');
        return;
      }
      downloadCSV('posts.csv', rows);
    } catch (error) {
      alert('Failed to export posts: ' + (error.response?.data?.message || error.message));
    } finally {
      setExporting(prev => ({ ...prev, posts: false }));
    }
  };

  /** Export posts to PDF */
  const exportPostsPDF = async () => {
    setShowExportMenu(prev => ({ ...prev, posts: false }));
    setExporting(prev => ({ ...prev, posts: true }));
    try {
      const dataToExport = await fetchDataForExport('posts');
      const rows = dataToExport.map(p => ({ 
        id: p.id, 
        title: (p.title || '').substring(0, 50) + (p.title && p.title.length > 50 ? '...' : ''), 
        type: p.type || '', 
        approved: p.isApproved ? 'Yes' : 'No' 
      }));
      if (rows.length === 0) {
        alert('No posts to export');
        return;
      }
      const columns = ['id', 'title', 'type', 'approved'];
      downloadPDF('posts.pdf', 'Posts Export', rows, columns);
    } catch (error) {
      alert('Failed to export posts: ' + (error.response?.data?.message || error.message));
    } finally {
      setExporting(prev => ({ ...prev, posts: false }));
    }
  };

  /** Export knowledge entries to CSV */
  const exportKnowledgeCSV = async () => {
    setShowExportMenu(prev => ({ ...prev, knowledge: false }));
    setExporting(prev => ({ ...prev, knowledge: true }));
    try {
      const dataToExport = await fetchDataForExport('knowledge');
      const rows = dataToExport.map(k => ({ id: k.id, title: k.title, category: k.category }));
      if (rows.length === 0) {
        alert('No entries to export');
        return;
      }
      downloadCSV('knowledge.csv', rows);
    } catch (error) {
      alert('Failed to export knowledge entries: ' + (error.response?.data?.message || error.message));
    } finally {
      setExporting(prev => ({ ...prev, knowledge: false }));
    }
  };

  /** Export knowledge entries to PDF */
  const exportKnowledgePDF = async () => {
    setShowExportMenu(prev => ({ ...prev, knowledge: false }));
    setExporting(prev => ({ ...prev, knowledge: true }));
    try {
      const dataToExport = await fetchDataForExport('knowledge');
      const rows = dataToExport.map(k => ({ 
        id: k.id, 
        title: (k.title || '').substring(0, 50) + (k.title && k.title.length > 50 ? '...' : ''), 
        category: k.category || '' 
      }));
      if (rows.length === 0) {
        alert('No entries to export');
        return;
      }
      const columns = ['id', 'title', 'category'];
      downloadPDF('knowledge.pdf', 'Knowledge Base Export', rows, columns);
    } catch (error) {
      alert('Failed to export knowledge entries: ' + (error.response?.data?.message || error.message));
    } finally {
      setExporting(prev => ({ ...prev, knowledge: false }));
    }
  };

  /** Render export dropdown menu */
  const renderExportDropdown = (type) => {
    const isOpen = showExportMenu[type];
    const isExporting = exporting[type];
    const menuRef = exportMenuRefs[type];
    
    return (
      <div className="export-dropdown" ref={menuRef}>
        <button 
          className="btn btn-outline export-btn" 
          onClick={() => setShowExportMenu(prev => ({ ...prev, [type]: !prev[type] }))}
          disabled={isExporting}
        >
          <FiDownload /> {isExporting ? 'Exporting...' : 'Export'} <FiChevronDown size={14} style={{ marginLeft: '4px' }} />
        </button>
        {isOpen && (
          <div className="export-dropdown-menu">
            <button 
              className="export-dropdown-item" 
              onClick={type === 'users' ? exportUsersCSV : type === 'posts' ? exportPostsCSV : exportKnowledgeCSV}
            >
              <FiFileText /> Export as CSV
            </button>
            <button 
              className="export-dropdown-item" 
              onClick={type === 'users' ? exportUsersPDF : type === 'posts' ? exportPostsPDF : exportKnowledgePDF}
            >
              <FiFileText /> Export as PDF
            </button>
          </div>
        )}
      </div>
    );
  };

  const filteredUsers = useMemo(() => users.filter(u => 
    u.name.toLowerCase().includes(debounced.toLowerCase()) ||
    u.email.toLowerCase().includes(debounced.toLowerCase())
  ), [users, debounced]);

  const filteredPosts = useMemo(() => posts.filter(p =>
    p.title.toLowerCase().includes(debounced.toLowerCase()) ||
    p.content.toLowerCase().includes(debounced.toLowerCase())
  ), [posts, debounced]);

  const knowledgeFiltered = useMemo(() => knowledge.filter(k => {
    const matchesSearch = k.title.toLowerCase().includes(debounced.toLowerCase()) ||
      k.content.toLowerCase().includes(debounced.toLowerCase());
    if (knowledgeFilter === 'faq') return matchesSearch && (k.category || '').toLowerCase() === 'faq';
    if (knowledgeFilter === 'other') return matchesSearch && (k.category || '').toLowerCase() !== 'faq';
    return matchesSearch;
  }), [knowledge, debounced, knowledgeFilter]);

  // Recent activity feed from latest items
  const recentActivity = useMemo(() => {
    const items = [];
    users.slice(0, 5).forEach(u => items.push({ type: 'user', date: u.createdAt || '', text: `New user: ${u.name}` }));
    posts.slice(0, 5).forEach(p => items.push({ type: 'post', date: p.createdAt || '', text: `Post: ${p.title}` }));
    knowledge.slice(0, 5).forEach(k => items.push({ type: 'kb', date: k.createdAt || '', text: `Knowledge: ${k.title}` }));
    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  }, [users, posts, knowledge]);

  return (
    <div className={`admin-panel${darkMode ? ' admin-panel-dark' : ''}`}>
      <header className="admin-header">
        <h1><FiShield /> Admin Dashboard</h1>
        <div className="admin-header__actions">
          <div className="theme-toggle-wrapper">
            <FiSun className="theme-toggle-icon theme-toggle-icon--sun" size={16} />
            <button 
              type="button" 
              className={`theme-toggle ${darkMode ? 'theme-toggle--dark' : ''}`}
              onClick={() => setDarkMode(d => !d)} 
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} 
              aria-label={darkMode ? 'Light mode' : 'Dark mode'}
              aria-pressed={darkMode}
            >
              <span className="theme-toggle__slider"></span>
            </button>
            <FiMoon className="theme-toggle-icon theme-toggle-icon--moon" size={16} />
          </div>
        </div>
      </header>

      <div className="admin-tabs-wrap">
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
            <FiBook /> Knowledge
          </button>
          <button onClick={fetchStats} className="admin-tabs__refresh" title="Refresh stats">
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && statsLoading && !stats && (
        <div className="loading">Loading dashboard...</div>
      )}
      {activeTab === 'dashboard' && statsError && !stats && (
        <div className="admin-stats-error">
          <p>{statsError}</p>
          <button type="button" className="btn btn-primary" onClick={() => { setStatsLoading(true); fetchStats(); }}>Retry</button>
        </div>
      )}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3><FiBarChart2 /> Posts by Type</h3>
                {renderExportDropdown('posts')}
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3><FiBarChart2 /> Users by Role</h3>
                {renderExportDropdown('users')}
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3><FiBarChart2 /> Top Knowledge Categories</h3>
                {renderExportDropdown('knowledge')}
              </div>
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

          {/* Recent Activity Feed */}
          <div className="chart-card">
            <h3><FiClock /> Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {recentActivity.map((a, idx) => (
                  <li key={idx} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <small style={{ color: 'var(--muted)' }}>{new Date(a.date).toLocaleString()}</small>
                    <div>{a.text}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--muted)' }}>No recent activity</p>
            )}
          </div>
        </div>
      )}

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

      {loading && <div className="loading">Loading...</div>}

      {activeTab === 'users' && !loading && (
        <div className="content-section">
          <div className="section-header">
            <h2>User Management</h2>
            <div className="section-header__actions">
              <button className="btn btn-primary" onClick={() => { setShowUserModal(true); setFormData({}); setEditingItem(null); }}>
                <FiPlus /> Add User
              </button>
              {renderExportDropdown('users')}
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(userItem => (
                  <tr key={userItem.id}>
                    <td data-label="Name">{userItem.name}</td>
                    <td data-label="Email">{userItem.email}</td>
                    <td data-label="Role">
                      <span className={`badge badge-${userItem.role === 'admin' ? 'danger' : userItem.role === 'manager' ? 'info' : userItem.role === 'supervisor' ? 'warning' : 'primary'}`}>
                        {userItem.role === 'admin' ? 'Admin' : userItem.role === 'manager' ? 'Manager' : userItem.role === 'supervisor' ? 'Supervisor' : 'Worker'}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span className={`badge badge-${userItem.isActive ? 'success' : 'warning'}`}>
                        {userItem.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="action-buttons">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleUpdateUser(userItem.id, { role: e.target.value })}
                          className="role-select"
                          title="Change role"
                        >
                          <option value="worker">Worker</option>
                          <option value="manager">Manager</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="admin">Admin</option>
                          <option value="farmer">Worker (legacy)</option>
                          <option value="farm_supervisor">Manager (legacy)</option>
                        </select>
                        <button className="btn-icon" onClick={() => handleUpdateUser(userItem.id, { isActive: !userItem.isActive })} title={userItem.isActive ? 'Deactivate' : 'Activate'}>
                          {userItem.isActive ? <FiEyeOff /> : <FiEye />}
                        </button>
                        <button className="btn-icon btn-danger" onClick={() => handleDeleteUser(userItem.id)} title="Delete">
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
            <div className="section-header__actions">
              <button className="btn btn-outline" onClick={() => setSearchTerm('')}>
                <FiFilter /> Clear
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
            <h2>Knowledge Base</h2>
            <div className="section-header__actions section-header__actions--wrap">
              <select className="admin-select" value={knowledgeFilter} onChange={(e) => setKnowledgeFilter(e.target.value)} aria-label="Filter by category">
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
              <button className="btn btn-outline" onClick={handleRemoveDuplicates} title="Remove duplicate entries">
                <FiRefreshCw /> Remove Duplicates
              </button>
              <button className="btn btn-primary" onClick={handleAdd8FAQs} title="Add 8 new FAQs">
                <FiPlus /> Add 8 FAQs
              </button>
              {renderExportDropdown('knowledge')}
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

      {/* Modals */}
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
                  value={formData.role || 'worker'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="worker">Worker</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
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
