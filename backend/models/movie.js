import pool from "../db/index.js";
import * as tmdbService from "../services/tmdbService.js";

// A1.3 - Search external movies from TMDB
export const searchExternalMovies = async (query, language = 'en') => {
  try {
    const results = await tmdbService.searchMovies(query, language);
    
    // Return simplified results for the UI
    return results.map(movie => ({
      tmdb_id: movie.id,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      poster_url: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      release_date: movie.release_date,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      vote_average: movie.vote_average,
      popularity: movie.popularity,
      language: movie.original_language
    }));
  } catch (error) {
    console.error('Error searching external movies:', error);
    throw error;
  }
};

// A1.3 - Import a movie from TMDB
export const importMovieFromTmdb = async (tmdbId, language = 'en') => {
  try {
    // Check if movie already exists
    const existingMovie = await pool.query(
      'SELECT id FROM movies WHERE tmdb_id = $1',
      [tmdbId]
    );
    
    if (existingMovie.rows.length > 0) {
      throw new Error('Movie already exists in database');
    }
    
    // Fetch full details from TMDB
    const tmdbMovie = await tmdbService.getMovieDetails(tmdbId, language);
    
    // Map to our schema
    const movieData = tmdbService.mapTmdbToSchema(tmdbMovie);
    
    // Insert into database (NOTE: "cast" is quoted because it's a reserved keyword)
    const result = await pool.query(
      `INSERT INTO movies (
        title, description, genre, year, rating, poster_url, duration, director, "cast",
        language, original_language, tmdb_id, popularity, release_date, 
        is_featured, is_trending_managed
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        movieData.title,
        movieData.description,
        movieData.genre,
        movieData.year,
        movieData.rating,
        movieData.poster_url,
        movieData.duration,
        movieData.director,
        movieData.cast,
        movieData.language,
        movieData.original_language,
        movieData.tmdb_id,
        movieData.popularity,
        movieData.release_date,
        movieData.is_featured,
        movieData.is_trending_managed
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error importing movie from TMDB:', error);
    throw error;
  }
};

// A1.3 - Batch import popular movies (for seeding) - ENHANCED VERSION
export const importPopularMovies = async (count = 10, language = 'en') => {
  try {
    const imported = [];
    let page = 1;
    
    // Keep fetching pages until we have enough movies
    while (imported.length < count && page <= 3) { // Max 3 pages = 60 movies
      console.log(`📄 Fetching page ${page} from TMDB...`);
      const popularMovies = await tmdbService.getPopularMovies(page, language);
      
      for (let i = 0; i < popularMovies.length && imported.length < count; i++) {
        try {
          const movie = await importMovieFromTmdb(popularMovies[i].id, language);
          imported.push(movie);
          console.log(`✅ Imported ${imported.length}/${count}: ${movie.title}`);
        } catch (error) {
          // Skip if already exists or other error
          console.log(`⏭️  Skipped ${popularMovies[i].title}: ${error.message}`);
        }
      }
      
      page++;
    }
    
    console.log(`🎉 Batch import complete! Imported ${imported.length} movies.`);
    return imported;
  } catch (error) {
    console.error('Error batch importing movies:', error);
    throw error;
  }
};

// Existing functions
export const getAllMovies = async () => {
  const result = await pool.query('SELECT * FROM movies ORDER BY created_at DESC');
  return result.rows;
};

export const getMovieById = async (id) => {
  const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
  return result.rows[0];
};

export const searchMovies = async (query) => {
  const result = await pool.query(
    `SELECT * FROM movies 
     WHERE title ILIKE $1 OR genre ILIKE $1 OR description ILIKE $1
     ORDER BY created_at DESC`,
    [`%${query}%`]
  );
  return result.rows;
};

export const getMoviesByGenre = async (genre) => {
  const result = await pool.query(
    'SELECT * FROM movies WHERE genre ILIKE $1 ORDER BY created_at DESC',
    [`%${genre}%`]
  );
  return result.rows;
};

export const createMovie = async (movieData) => {
  const { 
    title, description, genre, year, rating, poster_url, duration, director, cast,
    language, original_language, tmdb_id, popularity, release_date, 
    is_featured, is_trending_managed 
  } = movieData;
  
  const result = await pool.query(
    `INSERT INTO movies (
      title, description, genre, year, rating, poster_url, duration, director, "cast",
      language, original_language, tmdb_id, popularity, release_date, 
      is_featured, is_trending_managed
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      title, description, genre, year, rating, poster_url, duration, director, cast,
      language || 'en', original_language || language || 'en', tmdb_id, 
      popularity || 0, release_date, is_featured || false, is_trending_managed || false
    ]
  );
  return result.rows[0];
};

export const updateMovie = async (id, movieData) => {
  const movie = await getMovieById(id);
  if (!movie) return null;
  
  const { 
    title, description, genre, year, rating, poster_url, duration, director, cast,
    language, original_language, tmdb_id, popularity, release_date, 
    is_featured, is_trending_managed 
  } = movieData;
  
  const updates = [];
  const values = [];
  let paramCount = 1;
  
  if (title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(title);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(description);
  }
  if (genre !== undefined) {
    updates.push(`genre = $${paramCount++}`);
    values.push(genre);
  }
  if (year !== undefined) {
    updates.push(`year = $${paramCount++}`);
    values.push(year);
  }
  if (rating !== undefined) {
    updates.push(`rating = $${paramCount++}`);
    values.push(rating);
  }
  if (poster_url !== undefined) {
    updates.push(`poster_url = $${paramCount++}`);
    values.push(poster_url);
  }
  if (duration !== undefined) {
    updates.push(`duration = $${paramCount++}`);
    values.push(duration);
  }
  if (director !== undefined) {
    updates.push(`director = $${paramCount++}`);
    values.push(director);
  }
  if (cast !== undefined) {
    updates.push(`"cast" = $${paramCount++}`);
    values.push(cast);
  }
  if (language !== undefined) {
    updates.push(`language = $${paramCount++}`);
    values.push(language);
  }
  if (original_language !== undefined) {
    updates.push(`original_language = $${paramCount++}`);
    values.push(original_language);
  }
  if (tmdb_id !== undefined) {
    updates.push(`tmdb_id = $${paramCount++}`);
    values.push(tmdb_id);
  }
  if (popularity !== undefined) {
    updates.push(`popularity = $${paramCount++}`);
    values.push(popularity);
  }
  if (release_date !== undefined) {
    updates.push(`release_date = $${paramCount++}`);
    values.push(release_date);
  }
  if (is_featured !== undefined) {
    updates.push(`is_featured = $${paramCount++}`);
    values.push(is_featured);
  }
  if (is_trending_managed !== undefined) {
    updates.push(`is_trending_managed = $${paramCount++}`);
    values.push(is_trending_managed);
  }
  
  if (updates.length === 0) {
    return movie;
  }
  
  values.push(id);
  const query = `
    UPDATE movies 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteMovie = async (id) => {
  const result = await pool.query(
    'DELETE FROM movies WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};

// Featured movies - high rating and recent years
export const getFeaturedMovies = async (limit = 10, language = null) => {
  let query = `
    SELECT * FROM movies 
    WHERE rating >= 8.0 AND year >= 2010
  `;
  const params = [];
  
  if (language) {
    query += ` AND language = $1`;
    params.push(language);
    query += ` ORDER BY rating DESC, year DESC LIMIT $2`;
    params.push(limit);
  } else {
    query += ` ORDER BY rating DESC, year DESC LIMIT $1`;
    params.push(limit);
  }
  
  const result = await pool.query(query, params);
  return result.rows;
};

// Trending movies - recent releases with good ratings
export const getTrendingMovies = async (limit = 10, language = null) => {
  let query = `
    SELECT * FROM movies 
    WHERE year >= 2015
  `;
  const params = [];
  
  if (language) {
    query += ` AND language = $1`;
    params.push(language);
    query += ` ORDER BY year DESC, rating DESC LIMIT $2`;
    params.push(limit);
  } else {
    query += ` ORDER BY year DESC, rating DESC LIMIT $1`;
    params.push(limit);
  }
  
  const result = await pool.query(query, params);
  return result.rows;
};

// Now showing movies - movies with active showtimes
export const getNowShowingMovies = async (language = null) => {
  let query = `
    SELECT DISTINCT m.id, m.title, m.description, m.genre, m.year, m.rating, 
           m.poster_url, m.duration, m.director, m."cast", m.created_at
    FROM movies m
    INNER JOIN showtimes s ON m.id = s.movie_id
    WHERE s.show_date >= CURRENT_DATE
  `;
  const params = [];
  
  if (language) {
    query += ` AND m.language = $1`;
    params.push(language);
  }
  
  query += ` ORDER BY m.rating DESC, m.year DESC LIMIT 20`;
  
  const result = await pool.query(query, params);
  return result.rows;
};

export const getAdminSummary = async () => {
  const summaryQuery = `
    SELECT 
      (SELECT COUNT(*) FROM movies) as total_movies,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as active_bookings,
      (SELECT COUNT(*) FROM bookings WHERE created_at > CURRENT_DATE - INTERVAL '7 days') as bookings_this_week,
      (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'confirmed') as total_revenue,
      (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE created_at > CURRENT_DATE - INTERVAL '30 days' AND status = 'confirmed') as revenue_this_month,
      (SELECT COUNT(*) FROM theaters) as total_theaters,
      (SELECT COUNT(*) FROM showtimes WHERE show_date >= CURRENT_DATE) as upcoming_showtimes
  `;
  
  const result = await pool.query(summaryQuery);
  return result.rows[0];
};
