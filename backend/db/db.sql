-- ============================================
-- DATABASE: movieapp
-- FULL SCHEMA EXPORT
-- ============================================

-- Ensure public schema exists
CREATE SCHEMA IF NOT EXISTS public;

SET search_path TO public;

------------------------------------------------------------
-- TABLE: users
------------------------------------------------------------
CREATE TABLE public.users (
    user_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLE: theaters
------------------------------------------------------------
CREATE TABLE public.theaters (
    theater_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(20),
    total_auditoriums INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLE: auditoriums
------------------------------------------------------------
CREATE TABLE public.auditoriums (
    auditorium_id SERIAL PRIMARY KEY,
    theater_id INTEGER NOT NULL REFERENCES public.theaters(theater_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    seating_capacity INTEGER NOT NULL CHECK (seating_capacity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLE: seats
------------------------------------------------------------
CREATE TABLE public.seats (
    seat_id SERIAL PRIMARY KEY,
    auditorium_id INTEGER NOT NULL REFERENCES public.auditoriums(auditorium_id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    seat_type VARCHAR(20) DEFAULT 'standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLE: movies
------------------------------------------------------------
CREATE TABLE public.movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    poster_url TEXT,
    duration INTEGER,
    rating NUMERIC(3,1),
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movies_rating_check CHECK (rating >= 0 AND rating <= 10)
);

------------------------------------------------------------
-- TABLE: showtimes
------------------------------------------------------------
CREATE TABLE public.showtimes (
    showtime_id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    auditorium_id INTEGER NOT NULL REFERENCES public.auditoriums(auditorium_id) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    available_seats INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLE: bookings
------------------------------------------------------------
CREATE TABLE public.bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    showtime_id INTEGER NOT NULL REFERENCES public.showtimes(showtime_id) ON DELETE CASCADE,
    total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLE: booked_seats
------------------------------------------------------------
CREATE TABLE public.booked_seats (
    booked_seat_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES public.bookings(booking_id) ON DELETE CASCADE,
    showtime_id INTEGER NOT NULL REFERENCES public.showtimes(showtime_id) ON DELETE CASCADE,
    seat_id INTEGER NOT NULL REFERENCES public.seats(seat_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLE: payments
------------------------------------------------------------
CREATE TABLE public.payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES public.bookings(booking_id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'completed', 'failed', 'refunded')
    ),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLE: activity_logs
------------------------------------------------------------
CREATE TABLE public.activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- INDEXES (optional but good for speed)
------------------------------------------------------------

CREATE INDEX idx_showtimes_movie_id ON public.showtimes(movie_id);
CREATE INDEX idx_seats_auditorium_id ON public.seats(auditorium_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_showtime_id ON public.bookings(showtime_id);
CREATE INDEX idx_booked_seats_booking_id ON public.booked_seats(booking_id);
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);

