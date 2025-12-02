-- ============================================
-- NORTH STAR MOVIE THEATERS - IMPORT SCRIPT
-- ============================================
-- Run this to add the Finnish demo theaters
-- Uses theater_id column (for demo-data.sql schema)
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
    SELECT theater_id INTO v_theater_id FROM theaters WHERE name = 'Cinema Nova Oulu';
    
    IF v_theater_id IS NOT NULL THEN
        INSERT INTO auditoriums (theater_id, name, seating_capacity)
        VALUES 
            (v_theater_id, 'Auditorium 1', 145),
            (v_theater_id, 'Auditorium 2', 87),
            (v_theater_id, 'Auditorium 3', 163)
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Created 3 auditoriums for Cinema Nova Oulu (theater_id: %)', v_theater_id;
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
    SELECT theater_id INTO v_theater_id FROM theaters WHERE name = 'Kino Baltic Turku';
    
    IF v_theater_id IS NOT NULL THEN
        INSERT INTO auditoriums (theater_id, name, seating_capacity)
        VALUES 
            (v_theater_id, 'Auditorium 1', 192),
            (v_theater_id, 'Auditorium 2', 76),
            (v_theater_id, 'Auditorium 3', 134),
            (v_theater_id, 'Auditorium 4', 58)
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Created 4 auditoriums for Kino Baltic Turku (theater_id: %)', v_theater_id;
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
    SELECT theater_id INTO v_theater_id FROM theaters WHERE name = 'Elokuvateatteri Helsinki Central';
    
    IF v_theater_id IS NOT NULL THEN
        INSERT INTO auditoriums (theater_id, name, seating_capacity)
        VALUES 
            (v_theater_id, 'Auditorium 1', 178),
            (v_theater_id, 'Auditorium 2', 121)
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Created 2 auditoriums for Elokuvateatteri Helsinki Central (theater_id: %)', v_theater_id;
    END IF;
END $$;

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 'Theaters:' as info;
SELECT theater_id, name, city, total_auditoriums FROM theaters ORDER BY theater_id;

SELECT 'Auditoriums:' as info2;
SELECT a.auditorium_id, t.name as theater, a.name as auditorium, a.seating_capacity 
FROM auditoriums a 
JOIN theaters t ON a.theater_id = t.theater_id
ORDER BY t.name, a.name;

-- ============================================
-- SUCCESS
-- ============================================
SELECT '✓ North Star Theaters imported!' as status;
SELECT '  - 3 theaters (Oulu, Turku, Helsinki)' as info;
SELECT '  - 9 auditoriums total' as info2;
SELECT '  - 1,154 total seats' as info3;
