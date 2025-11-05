import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const response = await api.get('/knowledge');
      setKnowledge(response.data);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handlePostApprove = async (postId, isApproved) => {
    try {
      await api.put(`/admin/posts/${postId}/approve`, { isApproved });
      fetchPosts();
    } catch (error) {
      console.error('Error approving post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteKnowledge = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.delete(`/knowledge/${id}`);
      fetchKnowledge();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
    }
  };

  return (
    <div className="container">
      <h1>Admin Panel</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Manage users, posts, and content</p>

      {stats && (
        <div style={statsGridStyle}>
          <div className="card" style={statCardStyle}>
            <h3>Total Users</h3>
            <p style={statNumberStyle}>{stats.totalUsers}</p>
            <small style={statSubStyle}>{stats.activeUsers} active</small>
          </div>
          <div className="card" style={statCardStyle}>
            <h3>Total Posts</h3>
            <p style={statNumberStyle}>{stats.totalPosts}</p>
            <small style={statSubStyle}>{stats.approvedPosts} approved</small>
          </div>
          <div className="card" style={statCardStyle}>
            <h3>Knowledge Base</h3>
            <p style={statNumberStyle}>{stats.totalKnowledge}</p>
            <small style={statSubStyle}>entries</small>
          </div>
        </div>
      )}

      <div style={tabsStyle}>
        <button
          className={activeTab === 'users' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={activeTab === 'posts' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={activeTab === 'knowledge' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setActiveTab('knowledge')}
        >
          Knowledge Base
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {activeTab === 'users' && (
            <div className="card">
              <h2>User Management</h2>
              <table style={tableStyle}>
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
                  {users.map(userItem => (
                    <tr key={userItem._id}>
                      <td>{userItem.name}</td>
                      <td>{userItem.email}</td>
                      <td>{userItem.role}</td>
                      <td>{userItem.isActive ? 'Active' : 'Inactive'}</td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                          onClick={() => handleUserStatus(userItem._id, !userItem.isActive)}
                        >
                          {userItem.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              {posts.map(post => (
                <div key={post._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3>{post.title}</h3>
                      <p style={{ color: '#666', fontSize: '14px' }}>
                        By {post.author?.name} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <p style={{ marginTop: '10px' }}>{post.content.substring(0, 200)}...</p>
                      <p style={{ marginTop: '10px' }}>
                        Status: {post.isApproved ? (
                          <span style={{ color: '#2e7d32' }}>✓ Approved</span>
                        ) : (
                          <span style={{ color: '#f44336' }}>✗ Pending</span>
                        )}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                      {!post.isApproved && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handlePostApprove(post._id, true)}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div>
              {knowledge.map(entry => (
                <div key={entry._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3>{entry.title}</h3>
                      <p style={{ color: '#666', marginTop: '10px' }}>
                        {entry.content.substring(0, 200)}...
                      </p>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteKnowledge(entry._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const statCardStyle = {
  textAlign: 'center'
};

const statNumberStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#4CAF50',
  margin: '10px 0'
};

const statSubStyle = {
  color: '#666'
};

const tabsStyle = {
  display: 'flex',
  gap: '10px',
  marginBottom: '20px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

export default AdminPanel;

