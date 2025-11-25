// A1.3 - TMDB Service Module
// Handles all interactions with The Movie Database API

import dotenv from 'dotenv';
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Check if API key is configured
if (!TMDB_API_KEY) {
  console.warn('⚠️  TMDB_API_KEY not configured. TMDB integration will not work.');
}

/**
 * Search movies on TMDB
 * @param {string} query - Search query
 * @param {string} language - Language code (en, fi, etc.)
 * @returns {Promise<Array>} - Array of movie results
 */
export const searchMovies = async (query, language = 'en') => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY not configured');
  }

  const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${language}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching TMDB:', error);
    throw error;
  }
};

/**
 * Get detailed movie information from TMDB
 * @param {number} tmdbId - TMDB movie ID
 * @param {string} language - Language code
 * @returns {Promise<Object>} - Detailed movie data
 */
export const getMovieDetails = async (tmdbId, language = 'en') => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY not configured');
  }

  const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=${language}&append_to_response=credits`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Movie not found on TMDB');
      }
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TMDB movie details:', error);
    throw error;
  }
};

/**
 * Map TMDB movie data to our database schema
 * @param {Object} tmdbMovie - TMDB movie object
 * @returns {Object} - Movie data in our schema format
 */
export const mapTmdbToSchema = (tmdbMovie) => {
  // Extract director from crew
  const director = tmdbMovie.credits?.crew?.find(
    person => person.job === 'Director'
  )?.name || null;
  
  // Extract top cast (first 5)
  const cast = tmdbMovie.credits?.cast
    ?.slice(0, 5)
    .map(actor => actor.name)
    .join(', ') || null;
  
  // Extract genres
  const genre = tmdbMovie.genres
    ?.map(g => g.name)
    .join(', ') || null;
  
  // Build poster URL
  const poster_url = tmdbMovie.poster_path 
    ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}`
    : null;
  
  // Map to our schema
  return {
    title: tmdbMovie.title || tmdbMovie.original_title,
    description: tmdbMovie.overview || null,
    genre: genre,
    year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
    rating: tmdbMovie.vote_average ? parseFloat(tmdbMovie.vote_average.toFixed(1)) : null,
    poster_url: poster_url,
    duration: tmdbMovie.runtime || null,
    director: director,
    cast: cast,
    language: tmdbMovie.original_language || 'en',
    original_language: tmdbMovie.original_language || 'en',
    tmdb_id: tmdbMovie.id,
    popularity: tmdbMovie.popularity ? parseFloat(tmdbMovie.popularity.toFixed(2)) : 0,
    release_date: tmdbMovie.release_date || null,
    is_featured: false,
    is_trending_managed: false
  };
};

/**
 * Get popular movies from TMDB (for discovery)
 * @param {number} page - Page number
 * @param {string} language - Language code
 * @returns {Promise<Array>} - Array of popular movies
 */
export const getPopularMovies = async (page = 1, language = 'en') => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY not configured');
  }

  const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

/**
 * Get now playing movies from TMDB
 * @param {string} language - Language code
 * @returns {Promise<Array>} - Array of now playing movies
 */
export const getNowPlayingMovies = async (language = 'en') => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY not configured');
  }

  const url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=${language}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
};

export default {
  searchMovies,
  getMovieDetails,
  mapTmdbToSchema,
  getPopularMovies,
  getNowPlayingMovies
};