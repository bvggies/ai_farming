/**
 * Main App component: the root of the React UI.
 * Responsibilities:
 * - Check if the user is logged in (using token in localStorage)
 * - Define all routes (login, register, dashboard, posts, AI chat, profile, admin)
 * - Show Navbar and MobileBar when logged in; protect routes so guests go to login
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { authService } from './services/authService';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import AIChat from './pages/AIChat';
import KnowledgeBase from './pages/KnowledgeBase';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Notifications from './pages/Notifications';
import Navbar from './components/Navbar';
import MobileBar from './components/MobileBar';
import { SplashScreen } from '@capacitor/splash-screen';
import './App.css';

function App() {
  // Current logged-in user (null = guest). Loading = we're still checking the token.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hide native splash (welcome) screen when app has finished initial load
  useEffect(() => {
    if (!loading) SplashScreen.hide().catch(() => {});
  }, [loading]);

  // On first load: if we have a token, fetch user data; otherwise we're a guest
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  /** Called after successful login or register: store token and set user so the app shows logged-in UI */
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  /** Clear token and user; user will see login page */
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Don't render routes until we know if user is logged in (avoids flash of wrong page)
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {/* Top navigation (desktop); hidden on small screens where we use bottom bar */}
        {user && <Navbar user={user} onLogout={handleLogout} />}
        {/* Short mobile-only header when logged in */}
        {user && (
          <header className="app-mobile-header" aria-hidden="true">
            <span className="app-mobile-header__title">🐔 Appah Farms</span>
            <Link to="/notifications" className="app-mobile-header__bell" aria-label="Notifications">🔔</Link>
          </header>
        )}
        <main className="App__main">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/posts" 
            element={user ? <Posts user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/posts/:id" 
            element={user ? <PostDetail user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/create-post" 
            element={user ? <CreatePost user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/posts/:id/edit" 
            element={user ? <EditPost user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/ai-chat" 
            element={user ? <AIChat user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/knowledge" 
            element={user ? <KnowledgeBase user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} setUser={setUser} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user && user.role === 'admin' ? <AdminPanel user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/notifications" 
            element={user ? <Notifications user={user} /> : <Navigate to="/login" />} 
          />
          {/* Default path: send to dashboard if logged in, else login */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
          />
        </Routes>
        </main>
        {/* Bottom tab bar on mobile (Home, Posts, AI, Knowledge, Profile) */}
        {user && <MobileBar user={user} />}
      </div>
    </Router>
  );
}

export default App;

