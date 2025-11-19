import pool from "../db/index.js";

// Get showtimes with filters (movie_id, theater_id, date)
export async function getShowtimes({ movie_id, theater_id, date, auditorium_id } = {}) {
  let sql = `
    SELECT s.showtime_id, s.movie_id, s.auditorium_id, s.show_date, s.show_time, 
           s.price, s.available_seats, s.created_at,
           m.title as movie_title, m.poster_url, m.duration,
           a.name as auditorium_name, a.seating_capacity,
           t.theater_id, t.name as theater_name, t.city
    FROM showtimes s
    INNER JOIN movies m ON s.movie_id = m.id
    INNER JOIN auditoriums a ON s.auditorium_id = a.auditorium_id
    INNER JOIN theaters t ON a.theater_id = t.theater_id
    WHERE 1=1
  `;
  const values = [];
  let paramCount = 1;

  if (movie_id) {
    sql += ` AND s.movie_id = $${paramCount}`;
    values.push(movie_id);
    paramCount++;
  }

  if (theater_id) {
    sql += ` AND t.theater_id = $${paramCount}`;
    values.push(theater_id);
    paramCount++;
  }

  if (auditorium_id) {
    sql += ` AND s.auditorium_id = $${paramCount}`;
    values.push(auditorium_id);
    paramCount++;
  }

  if (date) {
    sql += ` AND s.show_date = $${paramCount}`;
    values.push(date);
    paramCount++;
  }

  sql += " ORDER BY s.show_date, s.show_time";

  const { rows } = await pool.query(sql, values);
  return rows;
}

// Get showtime by ID
export async function getShowtimeById(showtime_id) {
  const { rows } = await pool.query(
    `SELECT s.showtime_id, s.movie_id, s.auditorium_id, s.show_date, s.show_time, 
            s.price, s.available_seats, s.created_at,
            m.title as movie_title, m.poster_url, m.duration, m.rating,
            a.name as auditorium_name, a.seating_capacity,
            t.theater_id, t.name as theater_name, t.city, t.address
     FROM showtimes s
     INNER JOIN movies m ON s.movie_id = m.id
     INNER JOIN auditoriums a ON s.auditorium_id = a.auditorium_id
     INNER JOIN theaters t ON a.theater_id = t.theater_id
     WHERE s.showtime_id = $1`,
    [showtime_id]
  );
  return rows[0];
}

// Create a new showtime
export async function createShowtime({ movie_id, auditorium_id, show_date, show_time, price, available_seats }) {
  const sql = `
    INSERT INTO showtimes (movie_id, auditorium_id, show_date, show_time, price, available_seats) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING showtime_id, movie_id, auditorium_id, show_date, show_time, price, available_seats, created_at
  `;
  const values = [movie_id, auditorium_id, show_date, show_time, price, available_seats];
  const { rows } = await pool.query(sql, values);
  return rows[0];
}

// Update showtime
export async function updateShowtime(showtime_id, { movie_id, auditorium_id, show_date, show_time, price, available_seats }) {
  const sql = `
    UPDATE showtimes 
    SET movie_id = COALESCE($1, movie_id),
        auditorium_id = COALESCE($2, auditorium_id),
        show_date = COALESCE($3, show_date),
        show_time = COALESCE($4, show_time),
        price = COALESCE($5, price),
        available_seats = COALESCE($6, available_seats)
    WHERE showtime_id = $7
    RETURNING showtime_id, movie_id, auditorium_id, show_date, show_time, price, available_seats, created_at
  `;
  const values = [movie_id, auditorium_id, show_date, show_time, price, available_seats, showtime_id];
  const { rows } = await pool.query(sql, values);
  return rows[0];
}

// Delete showtime
export async function deleteShowtime(showtime_id) {
  const { rows } = await pool.query(
    "DELETE FROM showtimes WHERE showtime_id = $1 RETURNING showtime_id",
    [showtime_id]
  );
  return rows[0];
}

// Update available seats
export async function updateAvailableSeats(showtime_id, seats_change) {
  const { rows } = await pool.query(
    `UPDATE showtimes 
     SET available_seats = available_seats + $1 
     WHERE showtime_id = $2 
     RETURNING showtime_id, available_seats`,
    [seats_change, showtime_id]
  );
  return rows[0];
}

