import pool from "../db/index.js";

/**
 * Get admin summary statistics
 * @returns {object} Summary data for admin dashboard
 */
export async function getAdminSummary() {
  const client = await pool.connect();
  
  try {
    // Get total counts
    const { rows: counts } = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM movies) as total_movies,
        (SELECT COUNT(*) FROM theaters) as total_theaters,
        (SELECT COUNT(*) FROM auditoriums) as total_auditoriums,
        (SELECT COUNT(*) FROM showtimes WHERE show_date >= CURRENT_DATE) as active_showtimes,
        (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as active_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled') as cancelled_bookings
    `);
    
    // Get revenue statistics (only from confirmed bookings with completed payment)
    const { rows: revenue } = await client.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'confirmed' AND payment_status = 'completed' THEN total_price ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'confirmed' AND payment_status = 'completed' THEN total_price ELSE 0 END), 0) as completed_revenue,
        COALESCE(SUM(CASE WHEN status = 'confirmed' AND payment_status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days' THEN total_price ELSE 0 END), 0) as revenue_last_30_days
      FROM bookings
    `);
    
    // Get recent bookings count (last 7 days)
    const { rows: recentBookings } = await client.query(`
      SELECT COUNT(*) as recent_bookings
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    // Get top movies by bookings
    const { rows: topMovies } = await client.query(`
      SELECT 
        m.id,
        m.title,
        m.poster_url,
        COUNT(b.booking_id) as total_bookings,
        SUM(b.number_of_seats) as total_seats_sold
      FROM movies m
      INNER JOIN showtimes s ON m.id = s.movie_id
      INNER JOIN bookings b ON s.showtime_id = b.showtime_id
      WHERE b.status = 'confirmed'
      GROUP BY m.id, m.title, m.poster_url
      ORDER BY total_bookings DESC
      LIMIT 5
    `);
    
    // Get user statistics
    const { rows: userStats } = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE role = true) as admin_count,
        COUNT(*) FILTER (WHERE role = false) as user_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_last_30_days
      FROM users
    `);
    
    return {
      counts: counts[0],
      revenue: {
        total: parseFloat(revenue[0].total_revenue),
        completed: parseFloat(revenue[0].completed_revenue),
        last_30_days: parseFloat(revenue[0].revenue_last_30_days)
      },
      recent_bookings: parseInt(recentBookings[0].recent_bookings),
      top_movies: topMovies.map(movie => ({
        ...movie,
        total_bookings: parseInt(movie.total_bookings),
        total_seats_sold: parseInt(movie.total_seats_sold)
      })),
      users: {
        admin_count: parseInt(userStats[0].admin_count),
        user_count: parseInt(userStats[0].user_count),
        new_users_last_30_days: parseInt(userStats[0].new_users_last_30_days)
      }
    };
  } finally {
    client.release();
  }
}

