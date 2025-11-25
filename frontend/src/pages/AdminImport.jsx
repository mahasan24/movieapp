import React, { useState } from 'react';

const AdminImport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/movies/external/search?q=${searchQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to search TMDB');
      }
      
      const data = await response.json();
      setSearchResults(data);
      setMessage(`Found ${data.length} movies!`);
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (tmdbId) => {
    setLoading(true);
    setMessage('Importing...');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/movies/import`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tmdb_id: tmdbId })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import');
      }
      
      const movie = await response.json();
      setMessage(`✅ Successfully imported: ${movie.title}`);
      
      // Remove from search results
      setSearchResults(prev => prev.filter(m => m.tmdb_id !== tmdbId));
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportPopular = async (count) => {
    setLoading(true);
    setMessage(`Importing ${count} popular movies...`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/movies/import/popular`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ count })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to import popular movies');
      }
      
      const data = await response.json();
      setMessage(`✅ ${data.message}`);
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickSearches = [
    { label: '🦸 Marvel Movies', query: 'marvel' },
    { label: '⭐ Star Wars', query: 'star wars' },
    { label: '🧙 Harry Potter', query: 'harry potter' },
    { label: '💍 Lord of the Rings', query: 'lord of the rings' },
    { label: '🎭 Classic Films', query: 'godfather' },
    { label: '🎬 Pixar', query: 'pixar' },
  ];

  const handleQuickSearch = async (query) => {
    setSearchQuery(query);
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/movies/external/search?q=${query}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to search TMDB');
      }
      
      const data = await response.json();
      setSearchResults(data);
      setMessage(`Found ${data.length} movies for "${query}"!`);
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>🎬 Import Movies from TMDB</h1>
      
      {/* Quick Import Buttons */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Quick Import Popular Movies</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleImportPopular(10)}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🚀 Import 10 Movies
          </button>
          <button
            onClick={() => handleImportPopular(20)}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⚡ Import 20 Movies
          </button>
          <button
            onClick={() => handleImportPopular(50)}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔥 Import 50 Movies
          </button>
        </div>
      </div>

      <hr style={{ margin: '30px 0' }} />

      {/* Quick Search Categories */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Quick Search Categories</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {quickSearches.map((item) => (
            <button
              key={item.query}
              onClick={() => handleQuickSearch(item.query)}
              disabled={loading}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#333',
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Section */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <h3>Or Search Manually</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search movies on TMDB..."
          style={{
            padding: '12px',
            fontSize: '16px',
            width: '400px',
            border: '2px solid #ddd',
            borderRadius: '8px'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            marginLeft: '10px',
            backgroundColor: '#673AB7',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Searching...' : '🔍 Search'}
        </button>
      </form>

      {/* Message */}
      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e9',
          color: message.includes('❌') ? '#c62828' : '#2e7d32',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          fontSize: '18px',
          color: '#666'
        }}>
          ⏳ Please wait...
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h3>Search Results ({searchResults.length} movies)</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {searchResults.map(movie => (
              <div
                key={movie.tmdb_id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {movie.poster_url && (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}
                  />
                )}
                <h3 style={{ fontSize: '16px', margin: '10px 0' }}>
                  {movie.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                  {movie.year} • ⭐ {movie.vote_average}
                </p>
                <button
                  onClick={() => handleImport(movie.tmdb_id)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '10px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Import
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImport;