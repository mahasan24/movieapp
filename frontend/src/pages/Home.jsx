import React, { useEffect, useState } from 'react'
import './Home.css'
import MovieCard from '../components/MovieCard'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


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

  return (
    <div className="home-root">
      <div className="home-header">
        <h1>Movies</h1>
      </div>

      {loading && <div className="status">Loading movies...</div>}
      {error && <div className="status error">{error}</div>}

      <div className="cards-grid">
        {movies.length === 0 && !loading && <div className="status">No movies found.</div>}
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}

export default Home
