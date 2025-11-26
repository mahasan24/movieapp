import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './MovieDetail.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const MovieDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/movies/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Movie not found');
          }
          throw new Error(`Server responded ${res.status}`);
        }
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error('Failed to fetch movie details', err);
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetail();
    }
  }, [id]);

  const handleBackClick = () => {
    navigate('/browse');
  };

  if (loading) {
    return (
      <div className="movie-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{t('movieDetail.loadingMovie')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-detail-container">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h2>{t('movieDetail.errorLoading')}</h2>
          <p className="error-message">{error}</p>
          <button className="back-btn" onClick={handleBackClick}>
            {t('movieDetail.backButton')}
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-detail-container">
        <div className="error-state">
          <span className="error-icon">🎬</span>
          <h2>{t('movieDetail.notFound')}</h2>
          <p className="error-message">{t('movieDetail.notFound')}</p>
          <button className="back-btn" onClick={handleBackClick}>
            {t('movieDetail.backButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail-container">
      <button className="back-btn" onClick={handleBackClick}>
        {t('movieDetail.backButton')}
      </button>

      <div className="movie-detail-content">
        <div className="movie-poster-section">
          {movie.poster_url ? (
            <img 
              src={movie.poster_url} 
              alt={movie.title} 
              className="detail-poster"
            />
          ) : (
            <div className="detail-poster placeholder">
              <span className="placeholder-icon">🎬</span>
              <span className="placeholder-text">No Image Available</span>
            </div>
          )}
        </div>

        <div className="movie-info-section">
          <h1 className="detail-title">{movie.title}</h1>

          <div className="detail-meta">
            {movie.year && (
              <span className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-label">{t('movieDetail.year')}:</span>
                <span className="meta-value">{movie.year}</span>
              </span>
            )}
            {movie.duration && (
              <span className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span className="meta-label">{t('movieDetail.duration')}:</span>
                <span className="meta-value">{movie.duration} {t('movieDetail.minutes')}</span>
              </span>
            )}
            {movie.rating !== null && movie.rating !== undefined && (
              <span className="meta-item rating">
                <span className="meta-icon">⭐</span>
                <span className="meta-label">{t('movieDetail.rating')}:</span>
                <span className="meta-value highlight">{movie.rating}/10</span>
              </span>
            )}
          </div>

          {movie.genre && (
            <div className="detail-section">
              <h3 className="section-title">{t('movieDetail.genre')}</h3>
              <div className="genre-tags">
                {movie.genre.split(',').map((g, idx) => (
                  <span key={idx} className="genre-tag">{g.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {movie.description && (
            <div className="detail-section">
              <h3 className="section-title">Overview</h3>
              <p className="description-text">{movie.description}</p>
            </div>
          )}

          {movie.director && (
            <div className="detail-section">
              <h3 className="section-title">{t('movieDetail.director')}</h3>
              <p className="info-text">{movie.director}</p>
            </div>
          )}

          {movie.cast && (
            <div className="detail-section">
              <h3 className="section-title">{t('movieDetail.cast')}</h3>
              <p className="info-text">{movie.cast}</p>
            </div>
          )}

          <div className="action-buttons">
            <button className="action-btn primary">
              🎟️ {t('movieDetail.bookTickets')}
            </button>
            <button className="action-btn secondary">
              ❤️ {t('movieDetail.addToFavorites')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;

