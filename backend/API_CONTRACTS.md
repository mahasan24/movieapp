# API Contracts Documentation

This document outlines the API endpoints implemented for theaters, auditoriums, showtimes, and bookings.

## Authentication

Most endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <token>
```

## Role-Based Access Control

- **Public**: Anyone can access
- **Authenticated**: Requires valid JWT token
- **Admin Only**: Requires JWT token with `role = true` (admin)
- **User-Specific**: Users can only access their own resources; admins can access all

---

## Theaters API

### GET /theaters
**Access**: Public  
**Description**: Get all theaters

**Response**:
```json
[
  {
    "theater_id": 1,
    "name": "Cinema Downtown",
    "address": "123 Main St",
    "city": "New York",
    "phone": "555-1234",
    "total_auditoriums": 5,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /theaters/:id
**Access**: Public  
**Description**: Get a specific theater by ID

**Response**:
```json
{
  "theater_id": 1,
  "name": "Cinema Downtown",
  "address": "123 Main St",
  "city": "New York",
  "phone": "555-1234",
  "total_auditoriums": 5,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### POST /theaters
**Access**: Admin Only  
**Description**: Create a new theater

**Request Body**:
```json
{
  "name": "Cinema Downtown",
  "address": "123 Main St",
  "city": "New York",
  "phone": "555-1234",
  "total_auditoriums": 5
}
```

**Response**: Same as GET /theaters/:id (201 Created)

### PUT /theaters/:id
**Access**: Admin Only  
**Description**: Update a theater

**Request Body**: Same as POST (all fields optional)

**Response**: Updated theater object

### DELETE /theaters/:id
**Access**: Admin Only  
**Description**: Delete a theater

**Response**:
```json
{
  "message": "Theater deleted successfully",
  "theater": { "theater_id": 1 }
}
```

---

## Auditoriums API

### GET /auditoriums
**Access**: Public  
**Description**: Get all auditoriums (optionally filter by theater)

**Query Parameters**:
- `theater_id` (optional): Filter by theater ID

**Response**:
```json
[
  {
    "auditorium_id": 1,
    "theater_id": 1,
    "name": "Hall A",
    "seating_capacity": 150,
    "created_at": "2024-01-01T00:00:00.000Z",
    "theater_name": "Cinema Downtown"
  }
]
```

### GET /auditoriums/:id
**Access**: Public  
**Description**: Get a specific auditorium by ID

**Response**: Single auditorium object

### POST /auditoriums
**Access**: Admin Only  
**Description**: Create a new auditorium

**Request Body**:
```json
{
  "theater_id": 1,
  "name": "Hall A",
  "seating_capacity": 150
}
```

**Response**: Created auditorium (201 Created)

### PUT /auditoriums/:id
**Access**: Admin Only  
**Description**: Update an auditorium

**Request Body**: Same as POST (all fields optional)

**Response**: Updated auditorium object

### DELETE /auditoriums/:id
**Access**: Admin Only  
**Description**: Delete an auditorium

**Response**:
```json
{
  "message": "Auditorium deleted successfully",
  "auditorium": { "auditorium_id": 1 }
}
```

---

## Showtimes API

### GET /showtimes
**Access**: Public  
**Description**: Get showtimes with optional filters

**Query Parameters**:
- `movie_id` (optional): Filter by movie ID
- `theater_id` (optional): Filter by theater ID
- `auditorium_id` (optional): Filter by auditorium ID
- `date` (optional): Filter by date (YYYY-MM-DD format)

**Example**: `/showtimes?movie_id=5&date=2024-01-15`

**Response**:
```json
[
  {
    "showtime_id": 1,
    "movie_id": 5,
    "auditorium_id": 1,
    "show_date": "2024-01-15",
    "show_time": "19:30:00",
    "price": 12.50,
    "available_seats": 100,
    "created_at": "2024-01-01T00:00:00.000Z",
    "movie_title": "The Great Movie",
    "poster_url": "https://example.com/poster.jpg",
    "duration": 120,
    "auditorium_name": "Hall A",
    "seating_capacity": 150,
    "theater_id": 1,
    "theater_name": "Cinema Downtown",
    "city": "New York"
  }
]
```

### GET /showtimes/:id
**Access**: Public  
**Description**: Get a specific showtime by ID

**Response**: Single showtime object with full details

### POST /showtimes
**Access**: Admin Only  
**Description**: Create a new showtime

**Request Body**:
```json
{
  "movie_id": 5,
  "auditorium_id": 1,
  "show_date": "2024-01-15",
  "show_time": "19:30:00",
  "price": 12.50,
  "available_seats": 150
}
```

**Response**: Created showtime (201 Created)

### PUT /showtimes/:id
**Access**: Admin Only  
**Description**: Update a showtime

**Request Body**: Same as POST (all fields optional)

**Response**: Updated showtime object

### DELETE /showtimes/:id
**Access**: Admin Only  
**Description**: Delete a showtime

**Response**:
```json
{
  "message": "Showtime deleted successfully",
  "showtime": { "showtime_id": 1 }
}
```

---

## Bookings API

### GET /bookings
**Access**: Authenticated (User-Specific)  
**Description**: Get bookings
- Admin users see all bookings
- Regular users see only their own bookings

**Response**:
```json
[
  {
    "booking_id": 1,
    "user_id": 10,
    "showtime_id": 1,
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "555-9876",
    "number_of_seats": 2,
    "total_price": 25.00,
    "status": "confirmed",
    "payment_status": "completed",
    "payment_method": "mock",
    "created_at": "2024-01-10T15:30:00.000Z",
    "show_date": "2024-01-15",
    "show_time": "19:30:00",
    "price": 12.50,
    "movie_title": "The Great Movie",
    "poster_url": "https://example.com/poster.jpg",
    "auditorium_name": "Hall A",
    "theater_name": "Cinema Downtown",
    "city": "New York"
  }
]
```

### GET /bookings/user/:userId
**Access**: Authenticated (User-Specific)  
**Description**: Get bookings for a specific user
- Users can only access their own bookings
- Admins can access any user's bookings

**Response**: Array of booking objects

### GET /bookings/:id
**Access**: Authenticated (User-Specific)  
**Description**: Get a specific booking by ID
- Users can only view their own bookings
- Admins can view any booking

**Response**: Single booking object with full details

### POST /bookings
**Access**: Authenticated  
**Description**: Create a new booking (mock payment)

**Request Body**:
```json
{
  "showtime_id": 1,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "555-9876",
  "number_of_seats": 2,
  "total_price": 25.00,
  "payment_method": "mock"
}
```

**Notes**:
- `user_id` is automatically set from the authenticated user
- Booking status is set to "confirmed"
- Payment status is set to "completed" (mock payment)
- Available seats are automatically decremented
- Transaction fails if not enough seats are available

**Response**: Created booking (201 Created)

**Error Responses**:
- `400`: "Not enough seats available"
- `400`: "Showtime not found"

### DELETE /bookings/:id
**Access**: Authenticated (User-Specific)  
**Description**: Cancel a booking
- Users can only cancel their own bookings
- Admins can cancel any booking

**Notes**:
- Booking status is set to "cancelled"
- Payment status is set to "failed"
- Available seats are returned to the showtime
- Payment status is updated to "refunded"

**Response**:
```json
{
  "message": "Booking cancelled successfully",
  "booking": { /* cancelled booking object */ }
}
```

**Error Responses**:
- `400`: "Booking already cancelled"
- `404`: "Booking not found"
- `403`: "You can only cancel your own bookings"

---

## Error Responses

All endpoints may return the following error formats:

**400 Bad Request**:
```json
{
  "message": "Validation error message"
}
```

**401 Unauthorized**:
```json
{
  "message": "Missing or invalid Authorization header"
}
```

**403 Forbidden**:
```json
{
  "message": "Admin access required"
}
```

**404 Not Found**:
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Admin-Only Routes Summary

The following routes require admin access (`role = true`):

### Theaters
- `POST /theaters` - Create theater
- `PUT /theaters/:id` - Update theater
- `DELETE /theaters/:id` - Delete theater

### Auditoriums
- `POST /auditoriums` - Create auditorium
- `PUT /auditoriums/:id` - Update auditorium
- `DELETE /auditoriums/:id` - Delete auditorium

### Showtimes
- `POST /showtimes` - Create showtime
- `PUT /showtimes/:id` - Update showtime
- `DELETE /showtimes/:id` - Delete showtime

---

## User-Specific Routes Summary

The following routes require authentication and enforce ownership:

### Bookings
- `GET /bookings` - Admin sees all, users see their own
- `GET /bookings/user/:userId` - Users can only access their own
- `GET /bookings/:id` - Users can only view their own
- `POST /bookings` - Creates booking for authenticated user
- `DELETE /bookings/:id` - Users can only cancel their own

---

## Database Schema Reference

Based on Teammate A's schema:
- `users.role`: Boolean (FALSE = user, TRUE = admin)
- `bookings.status`: 'confirmed', 'cancelled', 'completed'
- `bookings.payment_status`: 'pending', 'completed', 'failed'
- `payments.payment_status`: 'pending', 'completed', 'failed', 'refunded'

