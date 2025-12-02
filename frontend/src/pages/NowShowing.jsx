import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BookingModal from '../components/BookingModal'
import './NowShowing.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const NowShowing = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch now showing movies
  useEffect(() => {
    const fetchNowShowing = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/movies/now-showing`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setMovies(data || []);
      } catch (err) {
        console.error('Failed to fetch now showing movies', err);
        setError(t('nowShowing.errorLoading'));
      } finally {
        setLoading(false);
      }
    };
    fetchNowShowing();
  }, [t]);

  const handleBookTickets = (movie) => {
    setSelectedMovie(movie);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="now-showing-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('nowShowing.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="now-showing-page">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            {t('nowShowing.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="now-showing-page">
      {/* Header */}
      <div className="now-showing-header">
        <h1>🎬 {t('nowShowing.title')}</h1>
        <p>{t('nowShowing.subtitle')}</p>
      </div>

      {/* Movies Grid */}
      <div className="now-showing-content">
        {movies.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎭</span>
            <h2>{t('nowShowing.noMovies')}</h2>
            <p>{t('nowShowing.checkBack')}</p>
            <Link to="/browse" className="browse-link">
              {t('nowShowing.browseAll')}
            </Link>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <div className="movie-poster">
                  <img 
                    src={movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'} 
                    alt={movie.title}
                  />
                  <div className="movie-overlay">
                    <button 
                      className="book-btn"
                      onClick={() => handleBookTickets(movie)}
                    >
                      🎟️ {t('nowShowing.bookNow')}
                    </button>
                    <Link to={`/movies/${movie.id}`} className="details-btn">
                      {t('nowShowing.viewDetails')}
                    </Link>
                  </div>
                  {movie.rating && (
                    <span className="rating-badge">⭐ {movie.rating}</span>
                  )}
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <div className="movie-meta">
                    {movie.year && <span>{movie.year}</span>}
                    {movie.duration && <span>{movie.duration} min</span>}
                    {movie.genre && <span>{movie.genre.split(',')[0]}</span>}
                  </div>
                  <button 
                    className="mobile-book-btn"
                    onClick={() => handleBookTickets(movie)}
                  >
                    🎟️ {t('nowShowing.bookTickets')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedMovie && (
        <BookingModal
          movie={selectedMovie}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedMovie(null);
          }}
        />
      )}
    </div>
  );
};

export default NowShowing;
