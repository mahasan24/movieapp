import pool from "../db/index.js";

// Get all auditoriums (optionally filtered by theater)
export async function getAllAuditoriums(theater_id = null) {
  let sql = `
    SELECT a.auditorium_id, a.theater_id, a.name, a.seating_capacity, a.created_at,
           t.name as theater_name
    FROM auditoriums a
    LEFT JOIN theaters t ON a.theater_id = t.theater_id
  `;
  let values = [];
  
  if (theater_id) {
    sql += " WHERE a.theater_id = $1";
    values.push(theater_id);
  }
  
  sql += " ORDER BY a.theater_id, a.name";
  
  const { rows } = await pool.query(sql, values);
  return rows;
}

// Get auditorium by ID
export async function getAuditoriumById(auditorium_id) {
  const { rows } = await pool.query(
    `SELECT a.auditorium_id, a.theater_id, a.name, a.seating_capacity, a.created_at,
            t.name as theater_name
     FROM auditoriums a
     LEFT JOIN theaters t ON a.theater_id = t.theater_id
     WHERE a.auditorium_id = $1`,
    [auditorium_id]
  );
  return rows[0];
}

// Create a new auditorium
export async function createAuditorium({ theater_id, name, seating_capacity }) {
  const sql = `
    INSERT INTO auditoriums (theater_id, name, seating_capacity) 
    VALUES ($1, $2, $3) 
    RETURNING auditorium_id, theater_id, name, seating_capacity, created_at
  `;
  const values = [theater_id, name, seating_capacity];
  const { rows } = await pool.query(sql, values);
  return rows[0];
}

// Update auditorium
export async function updateAuditorium(auditorium_id, { theater_id, name, seating_capacity }) {
  const sql = `
    UPDATE auditoriums 
    SET theater_id = COALESCE($1, theater_id),
        name = COALESCE($2, name),
        seating_capacity = COALESCE($3, seating_capacity)
    WHERE auditorium_id = $4
    RETURNING auditorium_id, theater_id, name, seating_capacity, created_at
  `;
  const values = [theater_id, name, seating_capacity, auditorium_id];
  const { rows } = await pool.query(sql, values);
  return rows[0];
}

// Delete auditorium
export async function deleteAuditorium(auditorium_id) {
  const { rows } = await pool.query(
    "DELETE FROM auditoriums WHERE auditorium_id = $1 RETURNING auditorium_id",
    [auditorium_id]
  );
  return rows[0];
}

