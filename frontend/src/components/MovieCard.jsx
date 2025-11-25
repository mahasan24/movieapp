import React from 'react'
import { useNavigate } from 'react-router-dom'
import './MovieCard.css'

const MovieCard = ({ movie }) => {
  const { id, title, genre, year, rating, poster_url } = movie || {};
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movies/${id}`);
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <div className="movie-poster-wrapper">
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
        <div className="movie-meta">
          <span className="movie-genre">{genre || 'Unknown'}</span>
          {year && <span className="movie-year">{year}</span>}
        </div>
        {rating !== null && rating !== undefined ? (
          <div className="movie-rating">
            <span className="rating-icon">⭐</span>
            <span className="rating-value">{rating}</span>
            <span className="rating-max">/10</span>
          </div>
        ) : (
          <div className="movie-rating no-rating">No rating</div>
        )}
      </div>
    </div>
  )
}

export default MovieCard
