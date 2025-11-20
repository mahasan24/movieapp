import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Home.css'
import MovieCard from '../components/MovieCard'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

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

  // Filter movies based on search query
  const filteredMovies = searchQuery
    ? movies.filter(movie => 
        movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : movies;

  return (
    <div className="home-root">
      <div className="home-header">
        <h1>Movies</h1>
        {searchQuery && (
          <p className="search-results-text">
            Search results for: <strong>"{searchQuery}"</strong> ({filteredMovies.length} found)
          </p>
        )}
      </div>

      {loading && <div className="status">Loading movies...</div>}
      {error && <div className="status error">{error}</div>}

      <div className="cards-grid">
        {filteredMovies.length === 0 && !loading && (
          <div className="status">
            {searchQuery ? `No movies found for "${searchQuery}"` : 'No movies found.'}
          </div>
        )}
        {filteredMovies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}

export default Home