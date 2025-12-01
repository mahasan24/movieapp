// Activity Logger Service
// Week 3 - Teammate A (A3.3)
// Provides activity logging functionality for the backend

import pool from "../db/index.js";

/**
 * Log user activity to database
 * @param {number} userId - User ID (can be null for anonymous actions)
 * @param {string} action - Action type (e.g., 'LOGIN', 'BOOKING_CREATED')
 * @param {string} entityType - Entity type (e.g., 'booking', 'movie', 'user')
 * @param {number} entityId - Entity ID
 * @param {string} details - Additional details
 * @param {string} ipAddress - IP address of the request
 * @returns {Promise<number>} - Log ID
 */
export async function logActivity({
  userId = null,
  action,
  entityType = null,
  entityId = null,
  details = null,
  ipAddress = null
}) {
  try {
    const result = await pool.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING log_id`,
      [userId, action, entityType, entityId, details, ipAddress]
    );
    
    return result.rows[0].log_id;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging should not break the application
    return null;
  }
}

/**
 * Get activity logs with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Activity logs
 */
export async function getActivityLogs({
  userId = null,
  action = null,
  entityType = null,
  limit = 50,
  offset = 0,
  startDate = null,
  endDate = null
} = {}) {
  let query = `
    SELECT 
      al.*,
      u.name as user_name,
      u.email as user_email
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.user_id
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 1;
  
  if (userId) {
    query += ` AND al.user_id = $${paramCount}`;
    params.push(userId);
    paramCount++;
  }
  
  if (action) {
    query += ` AND al.action = $${paramCount}`;
    params.push(action);
    paramCount++;
  }
  
  if (entityType) {
    query += ` AND al.entity_type = $${paramCount}`;
    params.push(entityType);
    paramCount++;
  }
  
  if (startDate) {
    query += ` AND al.created_at >= $${paramCount}`;
    params.push(startDate);
    paramCount++;
  }
  
  if (endDate) {
    query += ` AND al.created_at <= $${paramCount}`;
    params.push(endDate);
    paramCount++;
  }
  
  query += ` ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);
  
  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get activity summary statistics
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} - Activity summary
 */
export async function getActivitySummary(days = 30) {
  const result = await pool.query(
    `SELECT 
      action,
      COUNT(*) as count,
      COUNT(DISTINCT user_id) as unique_users
    FROM activity_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY action
    ORDER BY count DESC`,
    []
  );
  
  return result.rows;
}

/**
 * Activity log action types
 */
export const ActivityActions = {
  // Authentication
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTER: 'USER_REGISTER',
  
  // Bookings
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_VIEWED: 'BOOKING_VIEWED',
  
  // Movies
  MOVIE_VIEWED: 'MOVIE_VIEWED',
  MOVIE_CREATED: 'MOVIE_CREATED',
  MOVIE_UPDATED: 'MOVIE_UPDATED',
  MOVIE_DELETED: 'MOVIE_DELETED',
  MOVIE_IMPORTED: 'MOVIE_IMPORTED',
  
  // Theaters
  THEATER_CREATED: 'THEATER_CREATED',
  THEATER_UPDATED: 'THEATER_UPDATED',
  THEATER_DELETED: 'THEATER_DELETED',
  
  // Showtimes
  SHOWTIME_CREATED: 'SHOWTIME_CREATED',
  SHOWTIME_UPDATED: 'SHOWTIME_UPDATED',
  SHOWTIME_DELETED: 'SHOWTIME_DELETED',
  
  // Admin
  ADMIN_DASHBOARD_VIEWED: 'ADMIN_DASHBOARD_VIEWED',
  ADMIN_ACTION: 'ADMIN_ACTION',
  
  // Search
  SEARCH_PERFORMED: 'SEARCH_PERFORMED',
  
  // Errors
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  AUTH_FAILED: 'AUTH_FAILED'
};

/**
 * Express middleware to log requests
 */
export function activityLoggerMiddleware(action) {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function to log after response
    res.send = function(data) {
      // Only log successful requests (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.user_id || null;
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        // Extract entity info from request
        const entityId = req.params.id ? parseInt(req.params.id) : null;
        const entityType = req.baseUrl.split('/')[1]; // e.g., /movies/:id -> 'movies'
        
        // Create details
        const details = JSON.stringify({
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          userAgent: req.get('user-agent')
        });
        
        // Log activity (don't await - fire and forget)
        logActivity({
          userId,
          action: action || `${req.method}_${entityType}`.toUpperCase(),
          entityType,
          entityId,
          details,
          ipAddress
        }).catch(err => console.error('Activity logging failed:', err));
      }
      
      // Call original send
      return originalSend.call(this, data);
    };
    
    next();
  };
}

export default {
  logActivity,
  getActivityLogs,
  getActivitySummary,
  ActivityActions,
  activityLoggerMiddleware
};