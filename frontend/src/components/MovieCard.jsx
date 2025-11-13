import React from 'react'
import './MovieCard.css'

const MovieCard = ({ movie }) => {
  const { title, genre, year, rating, poster_url } = movie || {};

  return (
    <div className="movie-card">
      {poster_url ? (
        <img className="movie-poster" src={poster_url} alt={title} />
      ) : (
        <div className="movie-poster placeholder">No image</div>
      )}

      <div className="movie-info">
        <div className="movie-title">{title}</div>
        <div className="movie-meta">{genre || 'Unknown'} • {year || '—'}</div>
        <div className="movie-rating">Rating: {rating ?? 'N/A'}</div>
      </div>
    </div>
  )
}

export default MovieCard
