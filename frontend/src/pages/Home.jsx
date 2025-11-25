import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Home.css'
import MovieCard from '../components/MovieCard'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Fetch movies on mount
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/movies`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setMovies(data || []);
      } catch (err) {
        console.error('Failed to fetch movies', err);
        setError('Failed to load movies');
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        if (localSearch.trim()) {
          setSearchParams({ search: localSearch.trim() });
        } else {
          setSearchParams({});
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, setSearchParams]);

  // Get unique genres from movies
  const availableGenres = useMemo(() => {
    const genres = new Set();
    movies.forEach(movie => {
      if (movie.genre) {
        // Split by comma in case there are multiple genres
        movie.genre.split(',').forEach(g => genres.add(g.trim()));
      }
    });
    return Array.from(genres).sort();
  }, [movies]);

  // Filter movies based on search query, genre, and language
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      // Search filter
      const matchesSearch = !searchQuery || 
        movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Genre filter
      const matchesGenre = !selectedGenre || 
        movie.genre?.toLowerCase().includes(selectedGenre.toLowerCase());

      // Language filter (placeholder - can be connected to backend later)
      const matchesLanguage = !selectedLanguage; // Always true for now

      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [movies, searchQuery, selectedGenre, selectedLanguage]);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedLanguage('');
  };

  const hasActiveFilters = selectedGenre || selectedLanguage;

  return (
    <div className="home-root">
      <div className="home-header">
        <h1>Discover Movies</h1>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="genre-filter" className="filter-label">
              <span className="filter-icon">🎭</span>
              <span>Filter by Genre</span>
            </label>
            <select
              id="genre-filter"
              className="filter-select"
              value={selectedGenre}
              onChange={handleGenreChange}
            >
              <option value="">All Genres</option>
              {availableGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group language-filter-group">
            <label htmlFor="language-filter" className="filter-label">
              <span className="filter-icon">🌐</span>
              <span>Filter by Language</span>
              <span className="filter-badge">Coming Soon</span>
            </label>
            <select
              id="language-filter"
              className="filter-select disabled"
              value={selectedLanguage}
              onChange={handleLanguageChange}
              disabled
              title="Language filter coming soon"
            >
              <option value="">All Languages</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <span>✕</span> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="results-summary">
          <p>
            Showing <strong>{filteredMovies.length}</strong> {filteredMovies.length === 1 ? 'movie' : 'movies'}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedGenre && ` in ${selectedGenre}`}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading movies...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {/* Movies Grid */}
      {!loading && !error && (
        <div className="cards-grid">
          {filteredMovies.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎬</span>
              <h2 className="empty-title">
                {searchQuery || selectedGenre ? 'No movies found' : 'No movies available'}
              </h2>
              <p className="empty-description">
                {searchQuery || selectedGenre
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Check back later for new movies.'}
              </p>
              {hasActiveFilters && (
                <button className="empty-action-btn" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Home
