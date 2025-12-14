import pool from "../db/index.js";
import * as stripeService from "../services/stripeService.js";

// Hold window for unpaid Stripe reservations (defaults to 5 minutes)
const RESERVATION_HOLD_MS = parseInt(process.env.BOOKING_HOLD_MS || "300000", 10);

// Expire pending bookings whose hold window has passed, returning seats.
// If a client (transaction) is provided, use it; otherwise use pool.
export async function expirePendingBookings(dbClient = null) {
  const db = dbClient || pool;
  await db.query(`
    WITH expired AS (
      UPDATE bookings
      SET status = 'expired',
          payment_status = 'failed'
      WHERE status = 'pending'
        AND expires_at IS NOT NULL
        AND expires_at <= NOW()
      RETURNING booking_id, showtime_id, number_of_seats
    )
    UPDATE showtimes s
    SET available_seats = available_seats + e.number_of_seats
    FROM expired e
    WHERE s.showtime_id = e.showtime_id;
  `);
}

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

// ============================================
// B3.0 - STRIPE PAYMENT INTEGRATION
// ============================================

/**
 * Create a payment intent for a booking (Step 1 of Stripe flow)
 * This doesn't create the booking yet - just initializes payment
 */
export async function createPaymentIntentForBooking({ 
  showtime_id, 
  customer_name, 
  customer_email, 
  customer_phone, 
  number_of_seats, 
  total_price 
}) {
  // Clean up any expired pending bookings before proceeding
  await expirePendingBookings();

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check showtime exists and has enough seats
    const { rows: showtimeRows } = await client.query(
      'SELECT available_seats, price FROM showtimes WHERE showtime_id = $1 FOR UPDATE',
      [showtime_id]
    );

    if (!showtimeRows[0]) {
      throw new Error('Showtime not found');
    }

    if (showtimeRows[0].available_seats < number_of_seats) {
      throw new Error('Not enough seats available');
    }

    // Verify the total price matches (prevent client-side tampering)
    const expectedPrice = showtimeRows[0].price * number_of_seats;
    if (Math.abs(total_price - expectedPrice) > 0.01) {
      throw new Error(`Price mismatch. Expected ${expectedPrice}, got ${total_price}`);
    }

    // Temporarily reserve seats (will be finalized or released after payment)
    await client.query(
      'UPDATE showtimes SET available_seats = available_seats - $1 WHERE showtime_id = $2',
      [number_of_seats, showtime_id]
    );

    // Create Stripe payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: total_price,
      customer_email,
      customer_name,
      metadata: {
        showtime_id: showtime_id.toString(),
        number_of_seats: number_of_seats.toString(),
        customer_phone: customer_phone || ''
      }
    });

    // Persist pending booking with expiration and payment_intent_id
    const expiresAt = new Date(Date.now() + RESERVATION_HOLD_MS);
    const insertSql = `
      INSERT INTO bookings (
        user_id, showtime_id, customer_name, customer_email, customer_phone,
        number_of_seats, total_price, status, payment_status, payment_method,
        payment_intent_id, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'pending', 'stripe', $8, $9)
      RETURNING booking_id, user_id, showtime_id, customer_name, customer_email, customer_phone,
                number_of_seats, total_price, status, payment_status, payment_method,
                payment_intent_id, expires_at, created_at
    `;
    const insertValues = [
      null, // user_id is set at confirm step if available
      showtime_id,
      customer_name,
      customer_email,
      customer_phone || null,
      number_of_seats,
      total_price,
      paymentIntent.payment_intent_id,
      expiresAt
    ];

    const { rows: pendingRows } = await client.query(insertSql, insertValues);

    await client.query('COMMIT');

    return {
      ...paymentIntent,
      showtime_id,
      number_of_seats,
      total_price,
      seats_reserved: true,
      booking: pendingRows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Confirm booking after successful Stripe payment (Step 2 of Stripe flow)
 * This creates the actual booking record after payment is verified
 */
export async function confirmBookingWithStripe({ 
  payment_intent_id,
  user_id,
  showtime_id,
  customer_name,
  customer_email,
  customer_phone,
  number_of_seats,
  total_price
}) {
  // Clean up expired holds before confirming
  await expirePendingBookings();

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Load pending booking by payment_intent_id
    const { rows: pendingRows } = await client.query(
      `SELECT * FROM bookings WHERE payment_intent_id = $1 FOR UPDATE`,
      [payment_intent_id]
    );

    const pendingBooking = pendingRows[0];

    if (!pendingBooking) {
      throw new Error('Pending booking not found for this payment intent');
    }

    if (showtime_id && showtime_id !== pendingBooking.showtime_id) {
      throw new Error('Showtime mismatch for this payment intent');
    }

    if (pendingBooking.status === 'expired' || (pendingBooking.expires_at && pendingBooking.expires_at <= new Date())) {
      throw new Error('Payment intent expired. Seats were released. Please start a new booking.');
    }

    if (pendingBooking.status === 'confirmed') {
      await client.query('COMMIT');
      return pendingBooking;
    }

    // Validate totals if provided
    if (typeof total_price === 'number' && Math.abs(total_price - pendingBooking.total_price) > 0.01) {
      throw new Error('Price mismatch for confirmation');
    }

    // Verify payment with Stripe
    const paymentStatus = await stripeService.confirmPayment(payment_intent_id);

    if (paymentStatus.status !== 'succeeded') {
      throw new Error(`Payment not successful. Status: ${paymentStatus.status}`);
    }

    // Create booking record
    const sql = `
      UPDATE bookings
      SET user_id = COALESCE($1, user_id),
          customer_name = $2,
          customer_email = $3,
          customer_phone = $4,
          status = 'confirmed',
          payment_status = 'completed',
          payment_method = 'stripe',
          expires_at = NULL
      WHERE booking_id = $5
      RETURNING booking_id, user_id, showtime_id, customer_name, customer_email, customer_phone, 
                number_of_seats, total_price, status, payment_status, payment_method, created_at
    `;
    const values = [
      user_id || pendingBooking.user_id || null, 
      customer_name || pendingBooking.customer_name, 
      customer_email || pendingBooking.customer_email, 
      customer_phone || pendingBooking.customer_phone, 
      pendingBooking.booking_id
    ];
    const { rows: bookingRows } = await client.query(sql, values);

    // Create payment record with Stripe transaction ID
    await client.query(
      `INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id)
       VALUES ($1, $2, 'completed', 'stripe', $3)`,
      [bookingRows[0].booking_id, pendingBooking.total_price, payment_intent_id]
    );

    // Clear pending reservation timer
    if (reservation && reservation.timer) {
      clearTimeout(reservation.timer);
    }
    pendingReservations.delete(payment_intent_id);

    await client.query('COMMIT');
    
    console.log(`✅ Booking confirmed with Stripe payment: ${bookingRows[0].booking_id}`);
    
    return bookingRows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    
    // If booking creation fails after payment succeeded, we should handle this carefully
    // In production, you'd want to log this and potentially refund
    console.error('❌ Error confirming booking after payment:', error);
    
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cancel booking and refund Stripe payment
 * Enhanced version with Stripe refund support
 */
export async function cancelBookingWithStripe(booking_id) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Lock booking row first (avoid FOR UPDATE with outer joins)
    const { rows: bookingRows } = await client.query(
      `SELECT booking_id, user_id, showtime_id, number_of_seats, status, payment_method
       FROM bookings
       WHERE booking_id = $1
       FOR UPDATE`,
      [booking_id]
    );

    if (!bookingRows[0]) {
      throw new Error('Booking not found');
    }

    if (bookingRows[0].status === 'cancelled') {
      throw new Error('Booking already cancelled');
    }

    const booking = bookingRows[0];

    // Fetch latest payment info separately to keep the booking lock simple
    const { rows: paymentRows } = await client.query(
      `SELECT transaction_id, payment_status
       FROM payments
       WHERE booking_id = $1
       ORDER BY payment_id DESC
       LIMIT 1`,
      [booking_id]
    );

    const payment = paymentRows[0] || {};

    // If payment was made through Stripe, process refund
    if (booking.payment_method === 'stripe' && payment.transaction_id) {
      try {
        await stripeService.refundPayment(payment.transaction_id);
        console.log(`✅ Stripe refund processed for booking ${booking_id}`);
      } catch (error) {
        console.error(`❌ Stripe refund failed for booking ${booking_id}:`, error);
        // Continue with cancellation even if refund fails (manual refund may be needed)
      }
    }

    // Update booking status
    const { rows: updatedBooking } = await client.query(
      `UPDATE bookings 
       SET status = 'cancelled', payment_status = 'refunded'
       WHERE booking_id = $1 
       RETURNING booking_id, user_id, showtime_id, customer_name, customer_email, customer_phone, 
                 number_of_seats, total_price, status, payment_status, payment_method, created_at`,
      [booking_id]
    );

    // Return seats to showtime
    await client.query(
      'UPDATE showtimes SET available_seats = available_seats + $1 WHERE showtime_id = $2',
      [booking.number_of_seats, booking.showtime_id]
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

