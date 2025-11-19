import pool from "../db/index.js";

// Get all bookings (with optional user_id filter for user-specific bookings)
export async function getBookings(user_id = null) {
  let sql = `
    SELECT b.booking_id, b.user_id, b.showtime_id, b.customer_name, b.customer_email, 
           b.customer_phone, b.number_of_seats, b.total_price, b.status, 
           b.payment_status, b.payment_method, b.created_at,
           s.show_date, s.show_time, s.price,
           m.title as movie_title, m.poster_url,
           a.name as auditorium_name,
           t.name as theater_name, t.city
    FROM bookings b
    INNER JOIN showtimes s ON b.showtime_id = s.showtime_id
    INNER JOIN movies m ON s.movie_id = m.id
    INNER JOIN auditoriums a ON s.auditorium_id = a.auditorium_id
    INNER JOIN theaters t ON a.theater_id = t.theater_id
  `;
  const values = [];

  if (user_id) {
    sql += " WHERE b.user_id = $1";
    values.push(user_id);
  }

  sql += " ORDER BY b.created_at DESC";

  const { rows } = await pool.query(sql, values);
  return rows;
}

// Get booking by ID
export async function getBookingById(booking_id) {
  const { rows } = await pool.query(
    `SELECT b.booking_id, b.user_id, b.showtime_id, b.customer_name, b.customer_email, 
            b.customer_phone, b.number_of_seats, b.total_price, b.status, 
            b.payment_status, b.payment_method, b.created_at,
            s.show_date, s.show_time, s.price,
            m.id as movie_id, m.title as movie_title, m.poster_url, m.duration,
            a.auditorium_id, a.name as auditorium_name, a.seating_capacity,
            t.theater_id, t.name as theater_name, t.city, t.address
     FROM bookings b
     INNER JOIN showtimes s ON b.showtime_id = s.showtime_id
     INNER JOIN movies m ON s.movie_id = m.id
     INNER JOIN auditoriums a ON s.auditorium_id = a.auditorium_id
     INNER JOIN theaters t ON a.theater_id = t.theater_id
     WHERE b.booking_id = $1`,
    [booking_id]
  );
  return rows[0];
}

// Create a new booking
export async function createBooking({ 
  user_id, 
  showtime_id, 
  customer_name, 
  customer_email, 
  customer_phone, 
  number_of_seats, 
  total_price,
  payment_method = 'mock'
}) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check available seats
    const { rows: showtimeRows } = await client.query(
      'SELECT available_seats FROM showtimes WHERE showtime_id = $1 FOR UPDATE',
      [showtime_id]
    );

    if (!showtimeRows[0]) {
      throw new Error('Showtime not found');
    }

    if (showtimeRows[0].available_seats < number_of_seats) {
      throw new Error('Not enough seats available');
    }

    // Create booking
    const sql = `
      INSERT INTO bookings (user_id, showtime_id, customer_name, customer_email, customer_phone, 
                           number_of_seats, total_price, status, payment_status, payment_method) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed', 'completed', $8) 
      RETURNING booking_id, user_id, showtime_id, customer_name, customer_email, customer_phone, 
                number_of_seats, total_price, status, payment_status, payment_method, created_at
    `;
    const values = [user_id || null, showtime_id, customer_name, customer_email, customer_phone || null, number_of_seats, total_price, payment_method];
    const { rows: bookingRows } = await client.query(sql, values);

    // Update available seats
    await client.query(
      'UPDATE showtimes SET available_seats = available_seats - $1 WHERE showtime_id = $2',
      [number_of_seats, showtime_id]
    );

    // Create payment record (mock payment)
    await client.query(
      `INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id)
       VALUES ($1, $2, 'completed', $3, $4)`,
      [bookingRows[0].booking_id, total_price, payment_method, `MOCK-${Date.now()}`]
    );

    await client.query('COMMIT');
    return bookingRows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Cancel a booking
export async function cancelBooking(booking_id) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get booking details
    const { rows: bookingRows } = await client.query(
      'SELECT showtime_id, number_of_seats, status FROM bookings WHERE booking_id = $1 FOR UPDATE',
      [booking_id]
    );

    if (!bookingRows[0]) {
      throw new Error('Booking not found');
    }

    if (bookingRows[0].status === 'cancelled') {
      throw new Error('Booking already cancelled');
    }

    // Update booking status
    const { rows: updatedBooking } = await client.query(
      `UPDATE bookings 
       SET status = 'cancelled', payment_status = 'failed'
       WHERE booking_id = $1 
       RETURNING booking_id, user_id, showtime_id, customer_name, customer_email, customer_phone, 
                 number_of_seats, total_price, status, payment_status, payment_method, created_at`,
      [booking_id]
    );

    // Return seats to showtime
    await client.query(
      'UPDATE showtimes SET available_seats = available_seats + $1 WHERE showtime_id = $2',
      [bookingRows[0].number_of_seats, bookingRows[0].showtime_id]
    );

    // Update payment status
    await client.query(
      `UPDATE payments SET payment_status = 'refunded' WHERE booking_id = $1`,
      [booking_id]
    );

    await client.query('COMMIT');
    return updatedBooking[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Get user's bookings
export async function getUserBookings(user_id) {
  return getBookings(user_id);
}

