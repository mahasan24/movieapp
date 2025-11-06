import pool from "../db/index.js";

export async function getAllMovies() {
  const { rows } = await pool.query("SELECT id, title, genre, year, rating FROM movies ORDER BY id");
  return rows;
}

export async function createMovie({ title, genre, year, rating }) {
  const sql = `INSERT INTO movies (title, genre, year, rating) VALUES ($1, $2, $3, $4) RETURNING id, title, genre, year, rating`;
  const { rows } = await pool.query(sql, [title, genre || null, year || null, rating || null]);
  return rows[0];
}

