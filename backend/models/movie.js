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
  const { rows } = await pool.query("SELECT id, title, description, genre, year, rating, poster_url, duration, director, \"cast\" FROM movies WHERE id = $1", [id]);
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