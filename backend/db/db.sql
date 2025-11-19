-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role BOOLEAN DEFAULT FALSE,  -- FALSE = user, TRUE = admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MOVIES TABLE
CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(100),
  year INTEGER,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  poster_url VARCHAR(500),
  duration INTEGER,
  director VARCHAR(255),
  "cast" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- THEATERS TABLE
CREATE TABLE IF NOT EXISTS theaters (
  theater_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  city VARCHAR(100),
  phone VARCHAR(20),
  total_auditoriums INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AUDITORIUMS TABLE
CREATE TABLE IF NOT EXISTS auditoriums (
  auditorium_id SERIAL PRIMARY KEY,
  theater_id INTEGER NOT NULL REFERENCES theaters(theater_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  seating_capacity INTEGER NOT NULL CHECK (seating_capacity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(theater_id, name)
);

-- SEATS TABLE
CREATE TABLE IF NOT EXISTS seats (
  seat_id SERIAL PRIMARY KEY,
  auditorium_id INTEGER NOT NULL REFERENCES auditoriums(auditorium_id) ON DELETE CASCADE,
  seat_row VARCHAR(10) NOT NULL,
  seat_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(auditorium_id, seat_row, seat_number)
);

-- SHOWTIMES TABLE
CREATE TABLE IF NOT EXISTS showtimes (
  showtime_id SERIAL PRIMARY KEY,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  auditorium_id INTEGER NOT NULL REFERENCES auditoriums(auditorium_id) ON DELETE CASCADE,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(auditorium_id, show_date, show_time)
);

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  booking_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  showtime_id INTEGER NOT NULL REFERENCES showtimes(showtime_id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  number_of_seats INTEGER NOT NULL CHECK (number_of_seats > 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- BOOKED_SEATS TABLE
CREATE TABLE IF NOT EXISTS booked_seats (
  booked_seat_id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  showtime_id INTEGER NOT NULL REFERENCES showtimes(showtime_id) ON DELETE CASCADE,
  seat_id INTEGER NOT NULL REFERENCES seats(seat_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(showtime_id, seat_id)
);

--PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  payment_id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ACTIVITY_LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);