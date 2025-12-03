-- ============================================
-- DATABASE MIGRATION SCRIPT
-- ============================================
-- Run this if you already have the database and need to add new columns
-- This handles the "column does not exist" errors
-- ============================================

-- Add missing columns to movies table (if they don't exist)
DO $$
BEGIN
    -- Add language column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'language') THEN
        ALTER TABLE movies ADD COLUMN language VARCHAR(10);
        RAISE NOTICE 'Added column: language';
    ELSE
        RAISE NOTICE 'Column already exists: language';
    END IF;

    -- Add original_language column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'original_language') THEN
        ALTER TABLE movies ADD COLUMN original_language VARCHAR(10);
        RAISE NOTICE 'Added column: original_language';
    ELSE
        RAISE NOTICE 'Column already exists: original_language';
    END IF;

    -- Add tmdb_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'tmdb_id') THEN
        ALTER TABLE movies ADD COLUMN tmdb_id INTEGER UNIQUE;
        RAISE NOTICE 'Added column: tmdb_id';
    ELSE
        RAISE NOTICE 'Column already exists: tmdb_id';
    END IF;

    -- Add popularity column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'popularity') THEN
        ALTER TABLE movies ADD COLUMN popularity DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added column: popularity';
    ELSE
        RAISE NOTICE 'Column already exists: popularity';
    END IF;

    -- Add release_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'release_date') THEN
        ALTER TABLE movies ADD COLUMN release_date DATE;
        RAISE NOTICE 'Added column: release_date';
    ELSE
        RAISE NOTICE 'Column already exists: release_date';
    END IF;

    -- Add is_featured column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'is_featured') THEN
        ALTER TABLE movies ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: is_featured';
    ELSE
        RAISE NOTICE 'Column already exists: is_featured';
    END IF;

    -- Add is_trending_managed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'is_trending_managed') THEN
        ALTER TABLE movies ADD COLUMN is_trending_managed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: is_trending_managed';
    ELSE
        RAISE NOTICE 'Column already exists: is_trending_managed';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_movies_language ON movies(language);
CREATE INDEX IF NOT EXISTS idx_movies_is_featured ON movies(is_featured);
CREATE INDEX IF NOT EXISTS idx_movies_is_trending ON movies(is_trending_managed);
CREATE INDEX IF NOT EXISTS idx_movies_popularity ON movies(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year DESC);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating DESC);
CREATE INDEX IF NOT EXISTS idx_movies_created_at ON movies(created_at DESC);

-- Create activity_logs table if it doesn't exist
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

-- Activity Logs Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Add indexes for other tables if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_auditoriums_theater_id ON auditoriums(theater_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_show_date ON showtimes(show_date);
CREATE INDEX IF NOT EXISTS idx_showtimes_movie_date ON showtimes(movie_id, show_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_showtime_id ON bookings(showtime_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Theater location index for city-based search
CREATE INDEX IF NOT EXISTS idx_theaters_city ON theaters(city);

-- ============================================
-- SUCCESS
-- ============================================
SELECT '✓ Migration completed! All columns and indexes have been added.' as status;



