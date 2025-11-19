import pool from "../db/index.js";

// Get all theaters
export async function getAllTheaters() {
  const { rows } = await pool.query(`
    SELECT theater_id, name, address, city, phone, total_auditoriums, created_at 
    FROM theaters 
    ORDER BY name
  `);
  return rows;
}

// Get theater by ID
export async function getTheaterById(theater_id) {
  const { rows } = await pool.query(
    "SELECT theater_id, name, address, city, phone, total_auditoriums, created_at FROM theaters WHERE theater_id = $1",
    [theater_id]
  );
  return rows[0];
}

// Create a new theater
export async function createTheater({ name, address, city, phone, total_auditoriums }) {
  const sql = `
    INSERT INTO theaters (name, address, city, phone, total_auditoriums) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING theater_id, name, address, city, phone, total_auditoriums, created_at
  `;
  const values = [name, address || null, city || null, phone || null, total_auditoriums || 0];
  const { rows } = await pool.query(sql, values);
  return rows[0];
}

// Update theater
export async function updateTheater(theater_id, { name, address, city, phone, total_auditoriums }) {
  const sql = `
    UPDATE theaters 
    SET name = COALESCE($1, name),
        address = COALESCE($2, address),
        city = COALESCE($3, city),
        phone = COALESCE($4, phone),
        total_auditoriums = COALESCE($5, total_auditoriums)
    WHERE theater_id = $6
    RETURNING theater_id, name, address, city, phone, total_auditoriums, created_at
  `;
  const values = [name, address, city, phone, total_auditoriums, theater_id];
  const { rows } = await pool.query(sql, values);
  return rows[0];
}

// Delete theater
export async function deleteTheater(theater_id) {
  const { rows } = await pool.query(
    "DELETE FROM theaters WHERE theater_id = $1 RETURNING theater_id",
    [theater_id]
  );
  return rows[0];
}

