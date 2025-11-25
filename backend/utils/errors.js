/**
 * Centralized Error Codes and Error Response Utility
 * For frontend localization support
 */

// Error codes catalog
export const ErrorCodes = {
  // Authentication & Authorization
  AUTH_MISSING_TOKEN: 'AUTH_MISSING_TOKEN',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_EXPIRED_TOKEN: 'AUTH_EXPIRED_TOKEN',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_ADMIN_REQUIRED: 'AUTH_ADMIN_REQUIRED',
  AUTH_OWNERSHIP_REQUIRED: 'AUTH_OWNERSHIP_REQUIRED',
  
  // Users
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_INVALID_CREDENTIALS: 'USER_INVALID_CREDENTIALS',
  USER_VALIDATION_ERROR: 'USER_VALIDATION_ERROR',
  
  // Movies
  MOVIE_NOT_FOUND: 'MOVIE_NOT_FOUND',
  MOVIE_FETCH_ERROR: 'MOVIE_FETCH_ERROR',
  MOVIE_CREATE_ERROR: 'MOVIE_CREATE_ERROR',
  MOVIE_VALIDATION_ERROR: 'MOVIE_VALIDATION_ERROR',
  
  // Theaters
  THEATER_NOT_FOUND: 'THEATER_NOT_FOUND',
  THEATER_FETCH_ERROR: 'THEATER_FETCH_ERROR',
  THEATER_CREATE_ERROR: 'THEATER_CREATE_ERROR',
  THEATER_UPDATE_ERROR: 'THEATER_UPDATE_ERROR',
  THEATER_DELETE_ERROR: 'THEATER_DELETE_ERROR',
  THEATER_VALIDATION_ERROR: 'THEATER_VALIDATION_ERROR',
  
  // Auditoriums
  AUDITORIUM_NOT_FOUND: 'AUDITORIUM_NOT_FOUND',
  AUDITORIUM_FETCH_ERROR: 'AUDITORIUM_FETCH_ERROR',
  AUDITORIUM_CREATE_ERROR: 'AUDITORIUM_CREATE_ERROR',
  AUDITORIUM_UPDATE_ERROR: 'AUDITORIUM_UPDATE_ERROR',
  AUDITORIUM_DELETE_ERROR: 'AUDITORIUM_DELETE_ERROR',
  AUDITORIUM_VALIDATION_ERROR: 'AUDITORIUM_VALIDATION_ERROR',
  
  // Showtimes
  SHOWTIME_NOT_FOUND: 'SHOWTIME_NOT_FOUND',
  SHOWTIME_FETCH_ERROR: 'SHOWTIME_FETCH_ERROR',
  SHOWTIME_CREATE_ERROR: 'SHOWTIME_CREATE_ERROR',
  SHOWTIME_UPDATE_ERROR: 'SHOWTIME_UPDATE_ERROR',
  SHOWTIME_DELETE_ERROR: 'SHOWTIME_DELETE_ERROR',
  SHOWTIME_VALIDATION_ERROR: 'SHOWTIME_VALIDATION_ERROR',
  SHOWTIME_NOT_AVAILABLE: 'SHOWTIME_NOT_AVAILABLE',
  
  // Bookings
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  BOOKING_FETCH_ERROR: 'BOOKING_FETCH_ERROR',
  BOOKING_CREATE_ERROR: 'BOOKING_CREATE_ERROR',
  BOOKING_DELETE_ERROR: 'BOOKING_DELETE_ERROR',
  BOOKING_VALIDATION_ERROR: 'BOOKING_VALIDATION_ERROR',
  BOOKING_ALREADY_CANCELLED: 'BOOKING_ALREADY_CANCELLED',
  BOOKING_NOT_ENOUGH_SEATS: 'BOOKING_NOT_ENOUGH_SEATS',
  BOOKING_OWNERSHIP_ERROR: 'BOOKING_OWNERSHIP_ERROR',
  
  // Payments
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_VALIDATION_ERROR: 'PAYMENT_VALIDATION_ERROR',
  
  // General
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  SEARCH_QUERY_REQUIRED: 'SEARCH_QUERY_REQUIRED',
};

/**
 * Create standardized error response
 * @param {string} code - Machine-readable error code
 * @param {string} message - Human-readable message (English default)
 * @param {object} details - Additional error details (optional)
 * @returns {object} Standardized error object
 */
export function createError(code, message, details = null) {
  const error = {
    code,
    message
  };
  
  if (details) {
    error.details = details;
  }
  
  return error;
}

/**
 * Send standardized error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {object} details - Additional details (optional)
 */
export function sendError(res, statusCode, code, message, details = null) {
  res.status(statusCode).json(createError(code, message, details));
}

// Common error responses
export const commonErrors = {
  notFound: (resource = 'Resource') => createError(
    ErrorCodes.NOT_FOUND,
    `${resource} not found`
  ),
  
  validationError: (message, details = null) => createError(
    ErrorCodes.VALIDATION_ERROR,
    message,
    details
  ),
  
  authRequired: () => createError(
    ErrorCodes.AUTH_REQUIRED,
    'Authentication required'
  ),
  
  adminRequired: () => createError(
    ErrorCodes.AUTH_ADMIN_REQUIRED,
    'Admin access required'
  ),
  
  ownershipRequired: () => createError(
    ErrorCodes.AUTH_OWNERSHIP_REQUIRED,
    'You can only access your own resources'
  ),
  
  internalError: (message = 'Internal server error') => createError(
    ErrorCodes.INTERNAL_SERVER_ERROR,
    message
  ),
};

