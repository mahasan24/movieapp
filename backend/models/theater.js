import pool from "../db/index.js";

// Get all theaters
export async function getAllTheaters() {
  const sql = `
    SELECT 
      t.id,
      t.name,
      t.address,
      t.city,
      t.phone,
      t.total_auditoriums,
      COUNT(a.id) as auditorium_count
    FROM theaters t
    LEFT JOIN auditoriums a ON t.id = a.theater_id
    GROUP BY t.id, t.name, t.address, t.city, t.phone, t.total_auditoriums
    ORDER BY t.id
  `;
  const { rows } = await pool.query(sql);
  return rows;
}

// Get theater by ID with auditoriums
export async function getTheaterById(id) {
  const theaterSql = `SELECT * FROM theaters WHERE id = $1`;
  const auditoriumsSql = `
    SELECT id, name, seating_capacity, theater_id
    FROM auditoriums 
    WHERE theater_id = $1
    ORDER BY name
  `;
  
  const theaterResult = await pool.query(theaterSql, [id]);
  if (theaterResult.rows.length === 0) return null;
  
  const auditoriumsResult = await pool.query(auditoriumsSql, [id]);
  
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

// Update theater (admin only)
export async function updateTheater(id, { name, address, city, phone }) {
  const sql = `
    UPDATE theaters 
    SET name = $1, address = $2, city = $3, phone = $4
    WHERE id = $5
    RETURNING *
  `;
  const { rows } = await pool.query(sql, [name, address, city, phone || null, id]);
  return rows[0];
}

// Delete theater (admin only)
export async function deleteTheater(id) {
  const sql = `DELETE FROM theaters WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}
