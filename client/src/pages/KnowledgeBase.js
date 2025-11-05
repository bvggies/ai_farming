import React, { useState, useEffect } from 'react';
import { FiSearch, FiBookOpen } from 'react-icons/fi';
import api from '../services/api';

const KnowledgeBase = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async (query = '') => {
    try {
      setLoading(true);
      const url = query ? `/knowledge/search?q=${encodeURIComponent(query)}` : '/knowledge';
      const response = await api.get(url);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEntries(searchQuery);
  };

  const handleEntryClick = async (entryId) => {
    try {
      const response = await api.get(`/knowledge?id=${entryId}`);
      setSelectedEntry(response.data);
    } catch (error) {
      console.error('Error fetching entry:', error);
    }
  };

  if (selectedEntry) {
    return (
      <div className="container">
        <button
          className="btn btn-outline"
          onClick={() => setSelectedEntry(null)}
          style={{ marginBottom: '20px' }}
        >
          ← Back to Knowledge Base
        </button>
        <div className="card">
          <h1>{selectedEntry.title}</h1>
          {selectedEntry.category && (
            <span style={badgeStyle}>{selectedEntry.category}</span>
          )}
          {selectedEntry.isAIVerified && (
            <span style={{ ...badgeStyle, backgroundColor: '#e8f5e9', color: '#2e7d32', marginLeft: '10px' }}>
              ✓ AI Verified
            </span>
          )}
          <div style={{ marginTop: '20px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
            {selectedEntry.content}
          </div>
          {selectedEntry.tags && selectedEntry.tags.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <strong>Tags: </strong>
              {selectedEntry.tags.map((tag, idx) => (
                <span key={idx} style={tagStyle}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Knowledge Base</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Search for answers, tips, and best practices about poultry farming
      </p>

      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={searchContainerStyle}>
          <FiSearch style={searchIconStyle} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords (e.g., egg production, feeding, disease)"
            style={searchInputStyle}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="loading">Loading knowledge base...</div>
      ) : entries.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>
            No entries found. Try a different search term.
          </p>
        </div>
      ) : (
        <div style={entriesGridStyle}>
          {entries.map(entry => (
            <div
              key={entry._id}
              className="card"
              style={entryCardStyle}
              onClick={() => handleEntryClick(entry._id)}
            >
              <div style={entryHeaderStyle}>
                <FiBookOpen size={24} color="#4CAF50" />
                <h3 style={entryTitleStyle}>{entry.title}</h3>
              </div>
              <p style={entryContentStyle}>
                {entry.content.substring(0, 150)}...
              </p>
              <div style={entryFooterStyle}>
                {entry.category && <span style={badgeStyle}>{entry.category}</span>}
                {entry.isAIVerified && (
                  <span style={{ fontSize: '12px', color: '#2e7d32' }}>✓ Verified</span>
                )}
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {entry.views || 0} views
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const searchContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  backgroundColor: 'white',
  padding: '10px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const searchIconStyle = {
  color: '#666',
  fontSize: '20px'
};

const searchInputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  fontSize: '16px',
  padding: '8px'
};

const entriesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px'
};

const entryCardStyle = {
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s'
};

const entryHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '15px'
};

const entryTitleStyle = {
  fontSize: '18px',
  color: '#333',
  margin: 0
};

const entryContentStyle = {
  color: '#666',
  lineHeight: '1.6',
  marginBottom: '15px'
};

const entryFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '15px',
  borderTop: '1px solid #eee'
};

const badgeStyle = {
  backgroundColor: '#e3f2fd',
  color: '#1976d2',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '500'
};

const tagStyle = {
  backgroundColor: '#f5f5f5',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  marginRight: '5px',
  color: '#666'
};

export default KnowledgeBase;

