/**
 * Community Posts page: list of posts with filter (all / tip / question / experience).
 * Users can like posts and open a post to read details. Fetches posts from the API and refetches when filter changes.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiHeart, FiMessageCircle, FiArrowRight, FiMessageSquare, FiSearch } from 'react-icons/fi';
import api from '../services/api';
import './Posts.css';

const Posts = ({ user }) => {
  // List state, filter by type, and search (search is debounced from searchInput)
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  /** Fetch posts from API with optional search param; filter by type on the client */
  const fetchPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      const response = await api.get('/posts', { params });
      let filteredPosts = response.data;
      if (filter !== 'all') filteredPosts = filteredPosts.filter(post => post.type === filter);
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Debounce search: update `search` 400ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  /** Toggle like on a post and update the post in the list with the API response */
  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(post => post.id === postId ? response.data : post));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading posts...</div></div>;
  }

  return (
    <div className="container posts-page">
      <div className="page-top">
        <h1>Community Posts</h1>
        <Link to="/create-post" className="btn btn-primary">
          <FiPlus /> Create Post
        </Link>
      </div>

      <div className="posts-search">
        <span className="posts-search-icon"><FiSearch /></span>
        <input
          type="search"
          placeholder="Search posts by title or content..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="posts-search-input"
          aria-label="Search posts"
        />
      </div>
      <div className="posts-filters">
        {['all', 'question', 'tip', 'experience'].map(f => (
          <button
            key={f}
            type="button"
            className={`filter-pill ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="card posts-empty empty-state">
          <FiMessageSquare className="empty-state-icon" size={48} />
          <h3>No posts found</h3>
          <p>Be the first to share a tip, question, or experience with the community.</p>
          <Link to="/create-post" className="btn btn-primary">Create Post</Link>
        </div>
      ) : (
        <div className="posts-list-cards">
          {posts.map(post => (
            <article key={post.id} className="post-card card">
              <div className="post-card-header">
                <div>
                  <h2 className="post-card-title">{post.title}</h2>
                  <p className="post-card-meta">
                    By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                    {post.type && <span className="post-card-badge">{post.type}</span>}
                  </p>
                </div>
              </div>

              <p className="post-card-content">{post.content}</p>

              {post.images && post.images.length > 0 && (
                <div className="post-card-images">
                  {post.images.map((img, idx) => {
                    const src = typeof img === 'string' ? img : (img?.url || img);
                    const url = src?.startsWith('http') ? src : `${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${src?.startsWith('/') ? '' : '/'}${src || ''}`;
                    return (
                      <img
                        key={img?.id || idx}
                        src={url}
                        alt={`Post ${idx + 1}`}
                        className="post-card-image"
                      />
                    );
                  })}
                </div>
              )}

              <div className="post-card-actions">
                <button
                  type="button"
                  onClick={() => handleLike(post.id)}
                  style={{ color: post.likes?.some(like => like.userId === user?.id) ? '#c62828' : undefined }}
                >
                  <FiHeart /> {post.likes?.length || 0}
                </button>
                <Link to={`/posts/${post.id}`}>
                  <FiMessageCircle /> {post.comments?.length || 0} Comments
                </Link>
                <Link to={`/posts/${post.id}`} className="read-more">
                  Read more <FiArrowRight />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;

