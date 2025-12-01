-- ============================================
-- MOVIE BOOKING APP - COMPLETE DATABASE SCHEMA
-- ============================================
-- Week 2 Enhanced Schema with TMDB Integration
-- Week 3 Enhanced with North Star Theaters & Performance Optimization
-- ============================================

-- Drop existing tables (optional - uncomment if you want fresh start)
-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS showtimes CASCADE;
-- DROP TABLE IF EXISTS auditoriums CASCADE;
-- DROP TABLE IF EXISTS theaters CASCADE;
-- DROP TABLE IF EXISTS movies CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role BOOLEAN DEFAULT FALSE, -- FALSE = regular user, TRUE = admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. MOVIES TABLE (Extended for Week 2)
-- ============================================
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    
    -- Basic Information (Week 1)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(255),
    year INTEGER,
    rating DECIMAL(3,1),
    poster_url TEXT,
    duration INTEGER, -- in minutes
    director VARCHAR(255),
    "cast" TEXT, -- Quoted because 'cast' is a PostgreSQL reserved keyword
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Week 2 Additions - Multi-language & TMDB Integration
    language VARCHAR(10), -- ISO 639-1 code (en, fi, es, fr, etc.)
    original_language VARCHAR(10), -- Original production language
    tmdb_id INTEGER UNIQUE, -- The Movie Database ID
    popularity DECIMAL(10,2) DEFAULT 0, -- Popularity score from TMDB
    release_date DATE, -- Full release date
    
    -- Week 2 Additions - Discovery Features
    is_featured BOOLEAN DEFAULT FALSE, -- Manually marked as featured
    is_trending_managed BOOLEAN DEFAULT FALSE -- Manually marked as trending
);

-- ============================================
-- MOVIES TABLE INDEXES (Week 2 & 3 Performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_movies_language ON movies(language);
CREATE INDEX IF NOT EXISTS idx_movies_is_featured ON movies(is_featured);
CREATE INDEX IF NOT EXISTS idx_movies_is_trending ON movies(is_trending_managed);
CREATE INDEX IF NOT EXISTS idx_movies_popularity ON movies(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);

-- Week 3 Additional Indexes
CREATE INDEX IF NOT EXISTS idx_movies_title_search ON movies USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year DESC);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating DESC);
CREATE INDEX IF NOT EXISTS idx_movies_created_at ON movies(created_at DESC);

-- ============================================
-- 3. THEATERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS theaters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    phone VARCHAR(20),
    total_auditoriums INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. AUDITORIUMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS auditoriums (
    id SERIAL PRIMARY KEY,
    theater_id INTEGER NOT NULL REFERENCES theaters(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g., "Auditorium 1", "Hall A"
    seating_capacity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(theater_id, name)
);

-- Auditoriums Indexes (Week 3)
CREATE INDEX IF NOT EXISTS idx_auditoriums_theater_id ON auditoriums(theater_id);

-- ============================================
-- 5. SHOWTIMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS showtimes (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    auditorium_id INTEGER NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(auditorium_id, show_date, show_time)
);

-- Showtimes Indexes (Week 3)
CREATE INDEX IF NOT EXISTS idx_showtimes_show_date ON showtimes(show_date);
CREATE INDEX IF NOT EXISTS idx_showtimes_movie_date ON showtimes(movie_id, show_date);
CREATE INDEX IF NOT EXISTS idx_showtimes_auditorium_date ON showtimes(auditorium_id, show_date);
CREATE INDEX IF NOT EXISTS idx_showtimes_future ON showtimes(show_date) WHERE show_date >= CURRENT_DATE;

-- ============================================
-- 6. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    showtime_id INTEGER NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    number_of_seats INTEGER NOT NULL CHECK (number_of_seats > 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Indexes (Week 3)
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_showtime_id ON bookings(showtime_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);

-- ============================================
-- 7. ACTIVITY LOGS TABLE (Week 3)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Indexes (Week 3)
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Users Indexes (Week 3)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- HELPER FUNCTIONS (Week 3)
-- ============================================

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id INTEGER,
    p_action VARCHAR(100),
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id INTEGER DEFAULT NULL,
    p_details TEXT DEFAULT NULL,
    p_ip_address VARCHAR(45) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_log_id INTEGER;
BEGIN
    INSERT INTO activity_logs (
        user_id, 
        action, 
        entity_type, 
        entity_id, 
        details, 
        ip_address
    )
    VALUES (
        p_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_details,
        p_ip_address
    )
    RETURNING log_id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS (Week 3)
-- ============================================

-- Trigger function for booking creation
CREATE OR REPLACE FUNCTION log_booking_creation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_activity(
        NEW.user_id,
        'BOOKING_CREATED',
        'booking',
        NEW.id,
        format('Created booking for showtime %s, %s seats, total: %s', 
               NEW.showtime_id, NEW.number_of_seats, NEW.total_price)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for booking cancellation
CREATE OR REPLACE FUNCTION log_booking_cancellation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
        PERFORM log_activity(
            NEW.user_id,
            'BOOKING_CANCELLED',
            'booking',
            NEW.id,
            format('Cancelled booking for showtime %s', NEW.showtime_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_log_booking_creation ON bookings;
CREATE TRIGGER trigger_log_booking_creation
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION log_booking_creation();

DROP TRIGGER IF EXISTS trigger_log_booking_cancellation ON bookings;
CREATE TRIGGER trigger_log_booking_cancellation
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION log_booking_cancellation();

-- ============================================
-- OPTIMIZED VIEWS (Week 3)
-- ============================================

-- View for upcoming showtimes (frequently queried)
CREATE OR REPLACE VIEW v_upcoming_showtimes AS
SELECT 
    s.id as showtime_id,
    s.show_date,
    s.show_time,
    s.price,
    s.available_seats,
    m.id as movie_id,
    m.title as movie_title,
    m.poster_url,
    m.duration,
    m.rating,
    a.id as auditorium_id,
    a.name as auditorium_name,
    a.seating_capacity,
    t.id as theater_id,
    t.name as theater_name,
    t.city
FROM showtimes s
INNER JOIN movies m ON s.movie_id = m.id
INNER JOIN auditoriums a ON s.auditorium_id = a.id
INNER JOIN theaters t ON a.theater_id = t.id
WHERE s.show_date >= CURRENT_DATE
ORDER BY s.show_date, s.show_time;

-- View for user booking history (with movie details)
CREATE OR REPLACE VIEW v_user_bookings AS
SELECT 
    b.id as booking_id,
    b.user_id,
    b.customer_name,
    b.customer_email,
    b.number_of_seats,
    b.total_price,
    b.status,
    b.payment_status,
    b.created_at,
    s.show_date,
    s.show_time,
    m.title as movie_title,
    m.poster_url,
    t.name as theater_name,
    a.name as auditorium_name
FROM bookings b
INNER JOIN showtimes s ON b.showtime_id = s.id
INNER JOIN movies m ON s.movie_id = m.id
INNER JOIN auditoriums a ON s.auditorium_id = a.id
INNER JOIN theaters t ON a.theater_id = t.id
ORDER BY b.created_at DESC;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Admin User
-- Password: admin123 (bcrypt hashed)
INSERT INTO users (email, password, role) 
VALUES (
    'admin@movieapp.com', 
    '$2b$10$rWZ3pVF8qX0YvN0wGpLXiOH.qKzN3oZQGZqXxLJ9K9X8p8qKxKxKx',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- NORTH STAR MOVIE THEATERS (Week 3)
-- ============================================

-- Theater 1: Cinema Nova Oulu
INSERT INTO theaters (name, address, city, phone, total_auditoriums)
VALUES (
    'Cinema Nova Oulu',
    'Kauppurienkatu 45, 90100 Oulu',
    'Oulu',
    '+358 8 5542 3890',
    3
) ON CONFLICT DO NOTHING;

DO $$
DECLARE
    v_theater_id INTEGER;
BEGIN
    SELECT id INTO v_theater_id FROM theaters WHERE name = 'Cinema Nova Oulu';
    
    IF v_theater_id IS NOT NULL THEN
        INSERT INTO auditoriums (theater_id, name, seating_capacity)
        VALUES 
            (v_theater_id, 'Auditorium 1', 145),
            (v_theater_id, 'Auditorium 2', 87),
            (v_theater_id, 'Auditorium 3', 163)
        ON CONFLICT (theater_id, name) DO NOTHING;
    END IF;
END $$;

-- Theater 2: Kino Baltic Turku
INSERT INTO theaters (name, address, city, phone, total_auditoriums)
VALUES (
    'Kino Baltic Turku',
    'Linnankatu 28, 20100 Turku',
    'Turku',
    '+358 2 2641 7520',
    4
) ON CONFLICT DO NOTHING;

DO $$
DECLARE
    v_theater_id INTEGER;
BEGIN
    SELECT id INTO v_theater_id FROM theaters WHERE name = 'Kino Baltic Turku';
    
    IF v_theater_id IS NOT NULL THEN
        INSERT INTO auditoriums (theater_id, name, seating_capacity)
        VALUES 
            (v_theater_id, 'Auditorium 1', 192),
            (v_theater_id, 'Auditorium 2', 76),
            (v_theater_id, 'Auditorium 3', 134),
            (v_theater_id, 'Auditorium 4', 58)
        ON CONFLICT (theater_id, name) DO NOTHING;
    END IF;
END $$;

-- Theater 3: Elokuvateatteri Helsinki Central
INSERT INTO theaters (name, address, city, phone, total_auditoriums)
VALUES (
    'Elokuvateatteri Helsinki Central',
    'Mannerheimintie 112, 00100 Helsinki',
    'Helsinki',
    '+358 9 4257 6180',
    2
) ON CONFLICT DO NOTHING;

DO $$
DECLARE
    v_theater_id INTEGER;
BEGIN
    SELECT id INTO v_theater_id FROM theaters WHERE name = 'Elokuvateatteri Helsinki Central';
    
    IF v_theater_id IS NOT NULL THEN
        INSERT INTO auditoriums (theater_id, name, seating_capacity)
        VALUES 
            (v_theater_id, 'Auditorium 1', 178),
            (v_theater_id, 'Auditorium 2', 121)
        ON CONFLICT (theater_id, name) DO NOTHING;
    END IF;
END $$;

-- ============================================
-- DATABASE OPTIMIZATION
-- ============================================

-- Analyze tables to update statistics
ANALYZE users;
ANALYZE movies;
ANALYZE theaters;
ANALYZE auditoriums;
ANALYZE showtimes;
ANALYZE bookings;
ANALYZE activity_logs;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables are created
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Movies', COUNT(*) FROM movies
UNION ALL
SELECT 'Theaters', COUNT(*) FROM theaters
UNION ALL
SELECT 'Auditoriums', COUNT(*) FROM auditoriums
UNION ALL
SELECT 'Showtimes', COUNT(*) FROM showtimes
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Activity Logs', COUNT(*) FROM activity_logs;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✓ Database schema created successfully!' as status;
SELECT '✓ Total tables: 7 (users, movies, theaters, auditoriums, showtimes, bookings, activity_logs)' as info;
SELECT '✓ Total indexes: 25+ (for performance optimization)' as info2;
SELECT '✓ Views created: 2 (v_upcoming_showtimes, v_user_bookings)' as info3;
SELECT '✓ North Star theaters loaded: 3 theaters, 9 auditoriums, 1,154 seats' as info4;
SELECT '✓ Activity logging enabled with automatic triggers' as info5;
SELECT '✓ Ready for Week 2 & Week 3 features!' as info6;