import React from 'react'
import { useNavigate } from 'react-router-dom'
import './MovieCard.css'

const MovieCard = ({ movie, showGenreBadge = false, showRating = false }) => {
  const { id, title, genre, year, rating, poster_url, duration } = movie || {};
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movies/${id}`);
  };

  // Get first genre for badge
  const firstGenre = genre ? genre.split(',')[0].trim() : 'General';

  return (
    <div className="movie-card" onClick={handleClick}>
      <div className="movie-poster-wrapper">
        {showGenreBadge && (
          <span className="genre-badge">{firstGenre}</span>
        )}
        {poster_url ? (
          <img className="movie-poster" src={poster_url} alt={title} />
        ) : (
          <div className="movie-poster placeholder">
            <span className="placeholder-icon">🎬</span>
            <span className="placeholder-text">No Image</span>
          </div>
        )}
        <div className="movie-overlay">
          <button className="view-details-btn">View Details</button>
        </div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title" title={title}>{title}</h3>
        
        {showRating && rating !== null && rating !== undefined ? (
          <div className="movie-rating-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.round(rating / 2) ? 'star filled' : 'star'}>
                ★
              </span>
            ))}
          </div>
        ) : (
          <div className="movie-meta">
            {!showGenreBadge && <span className="movie-genre">{genre || 'Unknown'}</span>}
            {year && <span className="movie-year">{year}</span>}
          </div>
        )}
        
        {duration && (
          <div className="movie-duration">
            {Math.floor(duration / 60)}h {duration % 60}m
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieCard
