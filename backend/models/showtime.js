import pool from "../db/index.js";

// Get showtimes with optional filters
export async function getShowtimes({ movie_id = null, theater_id = null, date = null, auditorium_id = null } = {}) {
  let sql = `
    SELECT 
      s.id as showtime_id,
      s.show_date,
      s.show_time,
      s.price,
      s.available_seats,
      m.id as movie_id,
      m.title as movie_title,
      m.poster_url,
      m.duration,
      m.rating,
      a.id as auditorium_id,
      a.name as auditorium_name,
      a.seating_capacity,
      t.id as theater_id,
      t.name as theater_name,
      t.city,
      t.address
    FROM showtimes s
    INNER JOIN movies m ON s.movie_id = m.id
    INNER JOIN auditoriums a ON s.auditorium_id = a.id
    INNER JOIN theaters t ON a.theater_id = t.id
    WHERE s.show_date >= CURRENT_DATE
  `;
  
  const params = [];
  let paramCount = 1;
  
  if (movie_id) {
    sql += ` AND s.movie_id = $${paramCount}`;
    params.push(movie_id);
    paramCount++;
  }
  
  if (theater_id) {
    sql += ` AND t.id = $${paramCount}`;
    params.push(theater_id);
    paramCount++;
  }
  
  if (auditorium_id) {
    sql += ` AND s.auditorium_id = $${paramCount}`;
    params.push(auditorium_id);
    paramCount++;
  }
  
  if (date) {
    sql += ` AND s.show_date = $${paramCount}`;
    params.push(date);
    paramCount++;
  }
  
  sql += ` ORDER BY s.show_date, s.show_time`;
  
  const { rows } = await pool.query(sql, params);
  return rows;
}

// Get all showtimes with movie and theater info
export async function getAllShowtimes() {
  const sql = `
    SELECT 
      s.id as showtime_id,
      s.show_date,
      s.show_time,
      s.price,
      s.available_seats,
      m.id as movie_id,
      m.title as movie_title,
      m.duration,
      a.id as auditorium_id,
      a.name as auditorium_name,
      a.seating_capacity,
      t.id as theater_id,
      t.name as theater_name,
      t.city
    FROM showtimes s
    JOIN movies m ON s.movie_id = m.id
    JOIN auditoriums a ON s.auditorium_id = a.id
    JOIN theaters t ON a.theater_id = t.id
    WHERE s.show_date >= CURRENT_DATE
    ORDER BY s.show_date, s.show_time
  `;
  const { rows } = await pool.query(sql);
  return rows;
}

// Get showtimes by movie ID
export async function getShowtimesByMovie(movie_id) {
  const sql = `
    SELECT 
      s.id as showtime_id,
      s.movie_id,
      s.auditorium_id,
      s.show_date,
      s.show_time,
      s.price,
      s.available_seats,
      a.name as auditorium_name,
      a.seating_capacity,
      t.name as theater_name,
      t.city,
      t.address
    FROM showtimes s
    JOIN auditoriums a ON s.auditorium_id = a.id
    JOIN theaters t ON a.theater_id = t.id
    WHERE s.movie_id = $1 
      AND s.show_date >= CURRENT_DATE
    ORDER BY s.show_date, s.show_time
  `;
  const { rows } = await pool.query(sql, [movie_id]);
  return rows;
}

// Get showtimes by date
export async function getshowtimesByDate(date) {
  const sql = `
    SELECT 
      s.id as showtime_id,
      s.movie_id,
      s.auditorium_id,
      s.show_date,
      s.show_time,
      s.price,
      s.available_seats,
      m.title as movie_title,
      m.duration,
      a.name as auditorium_name,
      t.name as theater_name,
      t.city
    FROM showtimes s
    JOIN movies m ON s.movie_id = m.id
    JOIN auditoriums a ON s.auditorium_id = a.id
    JOIN theaters t ON a.theater_id = t.id
    WHERE s.show_date = $1
    ORDER BY s.show_time
  `;
  const { rows } = await pool.query(sql, [date]);
  return rows;
}

// Get showtime by ID
export async function getShowtimeById(showtime_id) {
  const sql = `
    SELECT 
      s.id as showtime_id,
      s.movie_id,
      s.auditorium_id,
      s.show_date,
      s.show_time,
      s.price,
      s.available_seats,
      m.id as movie_id,
      m.title as movie_title,
      m.description,
      m.duration,
      m.genre,
      m.rating,
      m.poster_url,
      a.id as auditorium_id,
      a.name as auditorium_name,
      a.seating_capacity,
      t.id as theater_id,
      t.name as theater_name,
      t.address,
      t.city,
      t.phone
    FROM showtimes s
    JOIN movies m ON s.movie_id = m.id
    JOIN auditoriums a ON s.auditorium_id = a.id
    JOIN theaters t ON a.theater_id = t.id
    WHERE s.id = $1
  `;
  const { rows } = await pool.query(sql, [showtime_id]);
  return rows[0];
}

// Create showtime (admin only)
export async function createShowtime({ movie_id, auditorium_id, show_date, show_time, price }) {
  // Get auditorium capacity
  const capacitySql = `SELECT seating_capacity FROM auditoriums WHERE id = $1`;
  const capacityResult = await pool.query(capacitySql, [auditorium_id]);
  
  if (capacityResult.rows.length === 0) {
    throw new Error('Auditorium not found');
  }
  
  const available_seats = capacityResult.rows[0].seating_capacity;
  
  const sql = `
    INSERT INTO showtimes (movie_id, auditorium_id, show_date, show_time, price, available_seats)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id as showtime_id, *
  `;
  const { rows } = await pool.query(sql, [movie_id, auditorium_id, show_date, show_time, price, available_seats]);
  return rows[0];
}

// Update showtime
export async function updateShowtime(showtime_id, updates) {
  const { movie_id, auditorium_id, show_date, show_time, price, available_seats } = updates;
  
  let sql = `UPDATE showtimes SET `;
  const params = [];
  const setClauses = [];
  let paramCount = 1;
  
  if (movie_id !== undefined) {
    setClauses.push(`movie_id = $${paramCount}`);
    params.push(movie_id);
    paramCount++;
  }
  
  if (auditorium_id !== undefined) {
    setClauses.push(`auditorium_id = $${paramCount}`);
    params.push(auditorium_id);
    paramCount++;
  }
  
  if (show_date !== undefined) {
    setClauses.push(`show_date = $${paramCount}`);
    params.push(show_date);
    paramCount++;
  }
  
  if (show_time !== undefined) {
    setClauses.push(`show_time = $${paramCount}`);
    params.push(show_time);
    paramCount++;
  }
  
  if (price !== undefined) {
    setClauses.push(`price = $${paramCount}`);
    params.push(price);
    paramCount++;
  }
  
  if (available_seats !== undefined) {
    setClauses.push(`available_seats = $${paramCount}`);
    params.push(available_seats);
    paramCount++;
  }
  
  if (setClauses.length === 0) {
    return null;
  }
  
  sql += setClauses.join(', ');
  sql += ` WHERE id = $${paramCount} RETURNING id as showtime_id, *`;
  params.push(showtime_id);
  
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

// Delete showtime
export async function deleteShowtime(showtime_id) {
  const sql = `DELETE FROM showtimes WHERE id = $1 RETURNING id as showtime_id, *`;
  const { rows } = await pool.query(sql, [showtime_id]);
  return rows[0];
}

// Update available seats
export async function updateAvailableSeats(showtime_id, seats_change) {
  const sql = `
    UPDATE showtimes 
    SET available_seats = available_seats + $2
    WHERE id = $1
    RETURNING id as showtime_id, *
  `;
  const { rows } = await pool.query(sql, [showtime_id, seats_change]);
  return rows[0];
}

// Search showtimes with filters
export async function searchShowtimes({ movie_id, theater_id, city, date }) {
  let sql = `
    SELECT 
      s.id as showtime_id,
      s.movie_id,
      s.auditorium_id,
      s.show_date,
      s.show_time,
      s.price,
      s.available_seats,
      m.title as movie_title,
      a.name as auditorium_name,
      t.name as theater_name,
      t.city
    FROM showtimes s
    JOIN movies m ON s.movie_id = m.id
    JOIN auditoriums a ON s.auditorium_id = a.id
    JOIN theaters t ON a.theater_id = t.id
    WHERE s.show_date >= CURRENT_DATE
  `;
  
  const params = [];
  let paramCount = 1;
  
  if (movie_id) {
    sql += ` AND s.movie_id = $${paramCount}`;
    params.push(movie_id);
    paramCount++;
  }
  
  if (theater_id) {
    sql += ` AND t.id = $${paramCount}`;
    params.push(theater_id);
    paramCount++;
  }
  
  if (city) {
    sql += ` AND t.city ILIKE $${paramCount}`;
    params.push(`%${city}%`);
    paramCount++;
  }
  
  if (date) {
    sql += ` AND s.show_date = $${paramCount}`;
    params.push(date);
    paramCount++;
  }
  
  sql += ` ORDER BY s.show_date, s.show_time`;
  
  const { rows } = await pool.query(sql, params);
  return rows;
}
