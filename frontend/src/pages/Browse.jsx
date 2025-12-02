import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Browse.css'
import MovieCard from '../components/MovieCard'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const Browse = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [cityMovies, setCityMovies] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const cityParam = searchParams.get('city') || '';
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCity, setSelectedCity] = useState(cityParam);

  // Fetch available cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${API_BASE}/movies/cities`);
        if (res.ok) {
          const data = await res.json();
          setCities(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch cities', err);
      }
    };
    fetchCities();
  }, []);

  // Fetch all movies on mount
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
        setError(t('browse.errorLoading'));
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [t]);

  // Fetch movies by city when city is selected
  useEffect(() => {
    const fetchCityMovies = async () => {
      if (!selectedCity) {
        setCityMovies([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/movies/by-city/${encodeURIComponent(selectedCity)}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setCityMovies(data || []);
      } catch (err) {
        console.error('Failed to fetch movies for city', err);
        setError(t('browse.errorLoading'));
      } finally {
        setLoading(false);
      }
    };
    fetchCityMovies();
  }, [selectedCity, t]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        const params = {};
        if (localSearch.trim()) params.search = localSearch.trim();
        if (selectedCity) params.city = selectedCity;
        setSearchParams(params);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, selectedCity, setSearchParams]);

  // Update URL when city changes
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCity) params.city = selectedCity;
    if (Object.keys(params).length > 0 || cityParam !== selectedCity) {
      setSearchParams(params);
    }
  }, [selectedCity]);

  // Get unique genres from movies
  const availableGenres = useMemo(() => {
    const genres = new Set();
    const sourceMovies = selectedCity ? cityMovies : movies;
    sourceMovies.forEach(movie => {
      if (movie.genre) {
        movie.genre.split(',').forEach(g => genres.add(g.trim()));
      }
    });
    return Array.from(genres).sort();
  }, [movies, cityMovies, selectedCity]);

  // Get unique languages from movies
  const availableLanguages = useMemo(() => {
    const languages = new Set();
    const sourceMovies = selectedCity ? cityMovies : movies;
    sourceMovies.forEach(movie => {
      if (movie.original_language) {
        languages.add(movie.original_language);
      }
      if (movie.language) {
        languages.add(movie.language);
      }
    });
    return Array.from(languages).sort();
  }, [movies, cityMovies, selectedCity]);

  // Language code to name mapping
  const languageNames = {
    'en': 'English',
    'fi': 'Finnish (Suomi)',
    'sv': 'Swedish (Svenska)',
    'de': 'German (Deutsch)',
    'fr': 'French (Français)',
    'es': 'Spanish (Español)',
    'ja': 'Japanese (日本語)',
    'ko': 'Korean (한국어)',
    'hi': 'Hindi (हिन्दी)',
    'zh': 'Chinese (中文)',
    'it': 'Italian (Italiano)',
    'pt': 'Portuguese (Português)',
    'ru': 'Russian (Русский)',
    'ar': 'Arabic (العربية)',
    'nl': 'Dutch (Nederlands)',
    'pl': 'Polish (Polski)',
    'tr': 'Turkish (Türkçe)',
    'th': 'Thai (ไทย)',
    'da': 'Danish (Dansk)',
    'no': 'Norwegian (Norsk)'
  };

  // Filter movies based on search query, genre, and language
  const filteredMovies = useMemo(() => {
    const sourceMovies = selectedCity ? cityMovies : movies;
    
    return sourceMovies.filter(movie => {
      // Search filter
      const matchesSearch = !searchQuery || 
        movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Genre filter
      const matchesGenre = !selectedGenre || 
        movie.genre?.toLowerCase().includes(selectedGenre.toLowerCase());

      // Language filter
      const matchesLanguage = !selectedLanguage || 
        movie.original_language === selectedLanguage ||
        movie.language === selectedLanguage;

      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [movies, cityMovies, searchQuery, selectedGenre, selectedLanguage, selectedCity]);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    // Reset other filters when changing city
    setSelectedGenre('');
    setSelectedLanguage('');
  };

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedLanguage('');
    setSelectedCity('');
    setLocalSearch('');
    setSearchParams({});
  };

  const hasActiveFilters = selectedGenre || selectedLanguage || selectedCity;

  return (
    <div className="browse-root">
      <div className="browse-header">
        <h1>{t('browse.title')}</h1>
        {selectedCity && (
          <p className="browse-subtitle">
            📍 {t('browse.showingIn')} <strong>{selectedCity}</strong>
          </p>
        )}
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-container">
          {/* Location Filter - Primary */}
          <div className="filter-group location-filter-group">
            <label htmlFor="city-filter" className="filter-label">
              <span className="filter-icon">📍</span>
              <span>{t('browse.filterByLocation')}</span>
            </label>
            <select
              id="city-filter"
              className="filter-select location-select"
              value={selectedCity}
              onChange={handleCityChange}
            >
              <option value="">{t('browse.allLocations')}</option>
              {cities.map(city => (
                <option key={city.city} value={city.city}>
                  {city.city} ({city.theater_count} {city.theater_count === 1 ? 'theater' : 'theaters'})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="genre-filter" className="filter-label">
              <span className="filter-icon">🎭</span>
              <span>{t('browse.filterByGenre')}</span>
            </label>
            <select
              id="genre-filter"
              className="filter-select"
              value={selectedGenre}
              onChange={handleGenreChange}
            >
              <option value="">{t('browse.allGenres')}</option>
              {availableGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group language-filter-group">
            <label htmlFor="language-filter" className="filter-label">
              <span className="filter-icon">🌐</span>
              <span>{t('browse.filterByLanguage')}</span>
            </label>
            <select
              id="language-filter"
              className="filter-select"
              value={selectedLanguage}
              onChange={handleLanguageChange}
            >
              <option value="">{t('browse.allLanguages')}</option>
              {availableLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {languageNames[lang] || lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <span>✕</span> {t('browse.clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {(hasActiveFilters || searchQuery) && (
        <div className="results-summary">
          <p>
            {t('browse.showing')} <strong>{filteredMovies.length}</strong> {filteredMovies.length === 1 ? t('browse.movie') : t('browse.movies')}
            {selectedCity && ` ${t('browse.in')} ${selectedCity}`}
            {searchQuery && ` ${t('browse.for')} "${searchQuery}"`}
            {selectedGenre && ` • ${selectedGenre}`}
            {selectedLanguage && ` • ${languageNames[selectedLanguage] || selectedLanguage.toUpperCase()}`}
          </p>
        </div>
      )}

      {/* City Info Banner */}
      {selectedCity && cityMovies.length > 0 && (
        <div className="city-info-banner">
          <div className="city-info-content">
            <span className="city-icon">🎬</span>
            <span>
              {cityMovies.length} {cityMovies.length === 1 ? t('browse.movieShowing') : t('browse.moviesShowing')} {t('browse.in')} {selectedCity}
            </span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{t('browse.loadingMovies')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            {t('browse.tryAgain')}
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
                {selectedCity 
                  ? t('browse.noMoviesInCity')
                  : t('browse.noResults')
                }
              </h2>
              <p className="empty-description">
                {selectedCity 
                  ? t('browse.tryDifferentCity')
                  : t('browse.tryDifferent')
                }
              </p>
              {hasActiveFilters && (
                <button className="empty-action-btn" onClick={clearFilters}>
                  {t('browse.clearFilters')}
                </button>
              )}
            </div>
          ) : (
            filteredMovies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                showCityInfo={selectedCity && movie.showtime_count}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Browse
