# Testing Guide - Phase 2 Backend Features

This guide will help you test all the new backend features implemented in Phase 2.

## Prerequisites

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

The server should start on `http://localhost:4000`

### 2. Get Admin Token (for admin-only endpoints)

**Login as Admin:**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@movieapp.com",
    "password": "password123"
  }'
```

**Save the token from the response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 3. Get Regular User Token

**Login as Regular User:**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## Test 1: Featured Movies Endpoint

**Test GET /movies/featured**

```bash
# Get featured movies (default 10)
curl http://localhost:4000/movies/featured

# Get featured movies with custom limit
curl http://localhost:4000/movies/featured?limit=5
```

**Expected Response:**
- Array of high-rated movies (rating >= 8.0)
- Recent movies (year >= 2010)
- Sorted by rating DESC, year DESC

**Verify:**
- ✅ Returns array of movies
- ✅ All movies have rating >= 8.0
- ✅ All movies have year >= 2010
- ✅ Response includes full movie details (title, description, genre, year, rating, poster_url, duration, director, cast)

---

## Test 2: Trending Movies Endpoint

**Test GET /movies/trending**

```bash
# Get trending movies (default 10)
curl http://localhost:4000/movies/trending

# Get trending movies with custom limit
curl http://localhost:4000/movies/trending?limit=3
```

**Expected Response:**
- Array of recently added movies
- Sorted by created_at DESC, rating DESC

**Verify:**
- ✅ Returns array of movies
- ✅ Movies are sorted by most recent first
- ✅ Response includes full movie details

---

## Test 3: Now-Showing Movies Endpoint

**Test GET /movies/now-showing**

```bash
# Get movies with active showtimes
curl http://localhost:4000/movies/now-showing
```

**Expected Response:**
- Array of movies that have showtimes with show_date >= current date
- Movies with future/today showtimes only

**Verify:**
- ✅ Returns array of movies
- ✅ All movies have active showtimes
- ✅ Response includes full movie details

---

## Test 4: My Bookings Endpoint

**Test GET /bookings/me** (Authenticated)

```bash
# Replace <YOUR_TOKEN> with actual user token
curl http://localhost:4000/bookings/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**Expected Response:**
- Array of current user's bookings only
- Includes showtime, movie, theater details

**Verify:**
- ✅ Returns only authenticated user's bookings
- ✅ Response includes full booking details with joined data

**Test Error Cases:**

```bash
# Missing token - should return AUTH_MISSING_TOKEN
curl http://localhost:4000/bookings/me

# Invalid token - should return AUTH_INVALID_TOKEN
curl http://localhost:4000/bookings/me \
  -H "Authorization: Bearer invalid_token_here"
```

---

## Test 5: Admin Summary Endpoint

**Test GET /admin/summary** (Admin Only)

```bash
# Replace <ADMIN_TOKEN> with actual admin token
curl http://localhost:4000/admin/summary \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
{
  "counts": {
    "total_users": 4,
    "total_movies": 12,
    "total_theaters": 4,
    "total_auditoriums": 24,
    "active_showtimes": 30,
    "active_bookings": 0,
    "cancelled_bookings": 0
  },
  "revenue": {
    "total": 0,
    "completed": 0,
    "last_30_days": 0
  },
  "recent_bookings": 0,
  "top_movies": [],
  "users": {
    "admin_count": 1,
    "user_count": 3,
    "new_users_last_30_days": 4
  }
}
```

**Verify:**
- ✅ Returns comprehensive statistics
- ✅ Counts are accurate
- ✅ Revenue calculations are correct

**Test Error Cases:**

```bash
# Regular user trying to access admin endpoint - should return AUTH_ADMIN_REQUIRED
curl http://localhost:4000/admin/summary \
  -H "Authorization: Bearer <REGULAR_USER_TOKEN>"

# No token - should return AUTH_MISSING_TOKEN
curl http://localhost:4000/admin/summary
```

---

## Test 6: Error Code Standardization

Test that all endpoints now return standardized error codes.

### Test Movie Not Found

```bash
curl http://localhost:4000/movies/99999
```

**Expected Response:**
```json
{
  "code": "MOVIE_NOT_FOUND",
  "message": "Movie not found"
}
```

### Test Search Query Required

```bash
curl http://localhost:4000/movies/search
```

**Expected Response:**
```json
{
  "code": "SEARCH_QUERY_REQUIRED",
  "message": "Search query is required"
}
```

### Test Missing Auth Token

```bash
curl http://localhost:4000/bookings/me
```

**Expected Response:**
```json
{
  "code": "AUTH_MISSING_TOKEN",
  "message": "Missing or invalid Authorization header"
}
```

### Test Invalid Token

```bash
curl http://localhost:4000/bookings/me \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response:**
```json
{
  "code": "AUTH_INVALID_TOKEN",
  "message": "Invalid or expired token"
}
```

### Test Expired Token (if you have an expired token)

```bash
curl http://localhost:4000/bookings/me \
  -H "Authorization: Bearer <EXPIRED_TOKEN>"
```

**Expected Response:**
```json
{
  "code": "AUTH_EXPIRED_TOKEN",
  "message": "Token has expired"
}
```

### Test Admin Access Required

```bash
# Try to create a theater with regular user token
curl -X POST http://localhost:4000/theaters \
  -H "Authorization: Bearer <REGULAR_USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Theater",
    "city": "Test City"
  }'
```

**Expected Response:**
```json
{
  "code": "AUTH_ADMIN_REQUIRED",
  "message": "Admin access required"
}
```

### Test Booking Not Found

```bash
curl http://localhost:4000/bookings/99999 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**Expected Response:**
```json
{
  "code": "BOOKING_NOT_FOUND",
  "message": "Booking not found"
}
```

---

## Test 7: Using Browser/Postman

If you prefer a GUI tool:

### Using Browser
1. Open `http://localhost:4000/movies/featured` in browser
2. Should see JSON array of featured movies
3. Try `http://localhost:4000/movies/trending`
4. Try `http://localhost:4000/movies/now-showing`

### Using Postman

**Setup:**
1. Create a new collection "MovieApp Phase 2 Tests"
2. Set a collection variable `baseUrl` = `http://localhost:4000`

**Create Requests:**

1. **Featured Movies**
   - Method: GET
   - URL: `{{baseUrl}}/movies/featured?limit=5`

2. **Trending Movies**
   - Method: GET
   - URL: `{{baseUrl}}/movies/trending?limit=5`

3. **Now Showing**
   - Method: GET
   - URL: `{{baseUrl}}/movies/now-showing`

4. **Login (to get token)**
   - Method: POST
   - URL: `{{baseUrl}}/auth/login`
   - Body (JSON):
   ```json
   {
     "email": "admin@movieapp.com",
     "password": "password123"
   }
   ```
   - Save the token from response

5. **My Bookings**
   - Method: GET
   - URL: `{{baseUrl}}/bookings/me`
   - Headers: `Authorization: Bearer <token>`

6. **Admin Summary**
   - Method: GET
   - URL: `{{baseUrl}}/admin/summary`
   - Headers: `Authorization: Bearer <admin_token>`

---

## Test 8: Frontend Integration Test (Optional)

If you want to test from the frontend:

### 1. Start Frontend
```bash
cd frontend
npm run dev
```

### 2. Open Browser Console
Open `http://localhost:5173` and open browser console (F12)

### 3. Test API Calls from Console

```javascript
// Test Featured Movies
fetch('http://localhost:4000/movies/featured')
  .then(res => res.json())
  .then(data => console.log('Featured:', data));

// Test Trending Movies
fetch('http://localhost:4000/movies/trending?limit=5')
  .then(res => res.json())
  .then(data => console.log('Trending:', data));

// Test Now Showing
fetch('http://localhost:4000/movies/now-showing')
  .then(res => res.json())
  .then(data => console.log('Now Showing:', data));

// Test Error Code (Movie Not Found)
fetch('http://localhost:4000/movies/99999')
  .then(res => res.json())
  .then(data => console.log('Error:', data));
// Should show: { code: "MOVIE_NOT_FOUND", message: "Movie not found" }
```

---

## Verification Checklist

After running all tests, verify:

### New Endpoints
- [ ] GET /movies/featured works correctly
- [ ] GET /movies/trending works correctly
- [ ] GET /movies/now-showing works correctly
- [ ] GET /bookings/me works correctly
- [ ] GET /admin/summary works correctly (admin only)

### Error Codes
- [ ] All errors include `code` field
- [ ] All errors include `message` field
- [ ] AUTH_MISSING_TOKEN returned when no token
- [ ] AUTH_INVALID_TOKEN returned for invalid token
- [ ] AUTH_EXPIRED_TOKEN returned for expired token
- [ ] AUTH_ADMIN_REQUIRED returned for admin-only endpoints
- [ ] MOVIE_NOT_FOUND returned for invalid movie ID
- [ ] BOOKING_NOT_FOUND returned for invalid booking ID

### Authentication
- [ ] Admin endpoints reject regular users
- [ ] User endpoints work for authenticated users
- [ ] Ownership is properly enforced

### Response Quality
- [ ] All responses are properly formatted JSON
- [ ] All movie endpoints return complete movie details
- [ ] All booking endpoints return joined data
- [ ] Admin summary returns accurate statistics

---

## Troubleshooting

### Issue: "Server listening on port 4000" but requests fail

**Solution:** Check if backend is actually running:
```bash
curl http://localhost:4000/movies
```

If it fails, restart the backend:
```bash
cd backend
npm run dev
```

### Issue: "AUTH_MISSING_TOKEN" even with token

**Solution:** Check token format in Authorization header:
- Must be: `Authorization: Bearer <token>`
- NOT: `Authorization: <token>`

### Issue: "MOVIE_NOT_FOUND" for featured/trending

**Solution:** Make sure demo data is loaded in database:
```bash
# In psql or your database client
SELECT COUNT(*) FROM movies;
```

Should return at least 12 movies. If not, run:
```bash
psql "your-connection-string" -f backend/db/demo-data.sql
```

### Issue: Admin summary returns empty data

**Solution:** This is normal if you haven't created any bookings yet. Try creating a test booking first.

---

## Quick Test Script (Copy & Paste)

Save this as `test-phase2.sh` (Linux/Mac) or run commands one by one:

```bash
#!/bin/bash

BASE_URL="http://localhost:4000"

echo "Testing Featured Movies..."
curl -s "$BASE_URL/movies/featured?limit=3" | jq '.'

echo "\nTesting Trending Movies..."
curl -s "$BASE_URL/movies/trending?limit=3" | jq '.'

echo "\nTesting Now Showing..."
curl -s "$BASE_URL/movies/now-showing" | jq '.'

echo "\nTesting Error Code (Movie Not Found)..."
curl -s "$BASE_URL/movies/99999" | jq '.'

echo "\nTesting Error Code (Search Query Required)..."
curl -s "$BASE_URL/movies/search" | jq '.'

echo "\nTesting Error Code (Missing Auth Token)..."
curl -s "$BASE_URL/bookings/me" | jq '.'

echo "\n✅ All basic tests completed!"
```

**Note:** Requires `jq` for JSON formatting. If you don't have jq, remove `| jq '.'`

---

## Success Criteria

✅ **All new endpoints return data**
✅ **All error responses include `code` field**
✅ **Authentication works correctly**
✅ **Admin endpoints properly secured**
✅ **Response format is consistent**

---

**Happy Testing! 🚀**

