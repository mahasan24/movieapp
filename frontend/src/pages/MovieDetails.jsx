import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with your actual API endpoint
      const response = await fetch(`http://localhost:5000/api/movies/${id}`);
      
      if (!response.ok) {
        throw new Error('Movie not found');
      }
      
      const data = await response.json();
      setMovie(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="movie-details-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-details-container">
        <div className="error-message">
          <h2>Movie not found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/movies')} className="back-button">
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-details-container">
      {/* Back Button */}
      <button onClick={() => navigate('/movies')} className="back-btn">
        ← Back to Movies
      </button>

      {/* Movie Details Card */}
      <div className="movie-details-card">
        {/* Movie Poster */}
        <div className="movie-poster">
          <img 
            src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
            alt={movie.title}
          />
        </div>

        {/* Movie Info */}
        <div className="movie-info">
          <h1 className="movie-title">{movie.title}</h1>
          
          <div className="movie-meta">
            {movie.rating && (
              <span className="rating">⭐ {movie.rating}/10</span>
            )}
            {movie.duration && (
              <span className="duration">🕐 {movie.duration} min</span>
            )}
            {movie.genre && (
              <span className="genre">🎭 {movie.genre}</span>
            )}
          </div>

          <div className="movie-description">
            <h3>Description</h3>
            <p>{movie.description || 'No description available'}</p>
          </div>

          {movie.director && (
            <div className="movie-detail-item">
              <h3>Director</h3>
              <p>{movie.director}</p>
            </div>
          )}

          {movie.cast && movie.cast.length > 0 && (
            <div className="movie-detail-item">
              <h3>Cast</h3>
              <p>{movie.cast.join(', ')}</p>
            </div>
          )}

          {movie.releaseDate && (
            <div className="movie-detail-item">
              <h3>Release Date</h3>
              <p>{new Date(movie.releaseDate).toLocaleDateString()}</p>
            </div>
          )}

          {/* Book Tickets Button */}
          <button 
            className="book-tickets-btn"
            onClick={() => navigate(`/movies/${id}/showtimes`)}
          >
            🎟️ Book Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
