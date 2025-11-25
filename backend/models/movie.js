import pool from "../db/index.js";

export async function getAllMovies() {
  const { rows } = await pool.query("SELECT id, title, genre, year, rating, poster_url FROM movies ORDER BY id");
  return rows;
}

export async function createMovie({ title, genre, year, rating, poster_url }) {
  const sql = `INSERT INTO movies (title, genre, year, rating, poster_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, genre, year, rating, poster_url`;
  const { rows } = await pool.query(sql, [title, genre || null, year || null, rating || null, poster_url || null]);
  return rows[0];
}

export async function getMovieById(id) {
  const { rows } = await pool.query("SELECT id, title, genre, year, rating, poster_url FROM movies WHERE id = $1", [id]);
  return rows[0];
}

export async function searchMovies(query) {
  const sql = `SELECT id, title, genre, year, rating, poster_url FROM movies WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY rating DESC`;
  const { rows } = await pool.query(sql, [`%${query}%`]);
  return rows;
}

export async function getMoviesByGenre(genre) {
  const sql = `SELECT id, title, genre, year, rating, poster_url FROM movies WHERE genre ILIKE $1 ORDER BY rating DESC`;
  const { rows } = await pool.query(sql, [`%${genre}%`]);
  return rows;
}

// Get featured movies (high ratings, recent years)
export async function getFeaturedMovies(limit = 10) {
  const sql = `
    SELECT id, title, description, genre, year, rating, poster_url, duration, director, "cast"
    FROM movies 
    WHERE rating >= 8.0 AND year >= 2010
    ORDER BY rating DESC, year DESC
    LIMIT $1
  `;
  const { rows } = await pool.query(sql, [limit]);
  return rows;
}

// Get trending movies (recently created in our system, high ratings)
export async function getTrendingMovies(limit = 10) {
  const sql = `
    SELECT id, title, description, genre, year, rating, poster_url, duration, director, "cast"
    FROM movies 
    ORDER BY created_at DESC, rating DESC
    LIMIT $1
  `;
  const { rows } = await pool.query(sql, [limit]);
  return rows;
}

// Get now-showing movies (movies with active showtimes)
export async function getNowShowingMovies() {
  const sql = `
    SELECT DISTINCT m.id, m.title, m.description, m.genre, m.year, m.rating, 
           m.poster_url, m.duration, m.director, m."cast"
    FROM movies m
    INNER JOIN showtimes s ON m.id = s.movie_id
    WHERE s.show_date >= CURRENT_DATE
    ORDER BY m.rating DESC, m.year DESC
  `;
  const { rows } = await pool.query(sql);
  return rows;
}