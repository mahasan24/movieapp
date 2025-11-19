import pool from "../db/index.js";

// Get all theaters
export async function getAllTheaters() {
  const sql = `
    SELECT 
      t.theater_id,
      t.name,
      t.address,
      t.city,
      t.phone,
      COUNT(a.auditorium_id) as total_auditoriums
    FROM theaters t
    LEFT JOIN auditoriums a ON t.theater_id = a.theater_id
    GROUP BY t.theater_id
    ORDER BY t.theater_id
  `;
  const { rows } = await pool.query(sql);
  return rows;
}

// Get theater by ID with auditoriums
export async function getTheaterById(theater_id) {
  const theaterSql = `
    SELECT * FROM theaters WHERE theater_id = $1
  `;
  const auditoriumsSql = `
    SELECT auditorium_id, name, seating_capacity 
    FROM auditoriums 
    WHERE theater_id = $1
    ORDER BY name
  `;
  
  const theaterResult = await pool.query(theaterSql, [theater_id]);
  if (theaterResult.rows.length === 0) return null;
  
  const auditoriumsResult = await pool.query(auditoriumsSql, [theater_id]);
  
  return {
    ...theaterResult.rows[0],
    auditoriums: auditoriumsResult.rows
  };
}

// Get theaters by city
export async function getTheatersByCity(city) {
  const sql = `SELECT * FROM theaters WHERE city ILIKE $1 ORDER BY name`;
  const { rows } = await pool.query(sql, [`%${city}%`]);
  return rows;
}

// Create theater (admin only)
export async function createTheater({ name, address, city, phone }) {
  const sql = `
    INSERT INTO theaters (name, address, city, phone)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const { rows } = await pool.query(sql, [name, address, city, phone || null]);
  return rows[0];
}