-- ====================================================
-- TINY HOUSES SUPABASE POSTGRESQL DATABASE SCHEMA
-- ====================================================

-- 1. Create Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  allowed_screens JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT,
  role_code TEXT REFERENCES roles(code) ON DELETE SET NULL,
  role_name TEXT,
  status TEXT DEFAULT 'Chờ duyệt',
  avatar TEXT,
  auth_provider TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_tiny BOOLEAN DEFAULT true,
  owner_type TEXT DEFAULT 'tiny',
  rating NUMERIC DEFAULT 5.0,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT DEFAULT 'Hà Nội',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  vacant_rooms_count INT DEFAULT 0,
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 0,
  cover_image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  rooms JSONB DEFAULT '[]'::jsonb,
  host_name TEXT,
  host_phone TEXT,
  host_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  room_type_id TEXT,
  building_id TEXT REFERENCES buildings(id) ON DELETE CASCADE,
  building_code TEXT,
  building_name TEXT,
  room_number TEXT NOT NULL,
  status TEXT DEFAULT 'Có sẵn',
  price NUMERIC DEFAULT 0,
  type TEXT DEFAULT 'Studio',
  area NUMERIC DEFAULT 25,
  max_occupants INT DEFAULT 2,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  building_id TEXT,
  building_code TEXT,
  room_number TEXT,
  appointment_date DATE,
  appointment_time TEXT,
  status TEXT DEFAULT 'Chờ xác nhận',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow full public read/write access for all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access roles" ON roles;
CREATE POLICY "Public full access roles" ON roles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access users" ON users;
CREATE POLICY "Public full access users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access buildings" ON buildings;
CREATE POLICY "Public full access buildings" ON buildings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access rooms" ON rooms;
CREATE POLICY "Public full access rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access bookings" ON bookings;
CREATE POLICY "Public full access bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);

-- 6. Create Commissions Table
CREATE TABLE IF NOT EXISTS commissions (
  id TEXT PRIMARY KEY,
  ctv_id TEXT,
  ctv_name TEXT NOT NULL,
  ctv_phone TEXT,
  building_code TEXT,
  room_number TEXT,
  contract_value NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 0,
  commission_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Chờ duyệt',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access commissions" ON commissions;
CREATE POLICY "Public full access commissions" ON commissions FOR ALL USING (true) WITH CHECK (true);

-- Indexes for ultra-fast filtering
CREATE INDEX IF NOT EXISTS idx_buildings_district ON buildings(district);
CREATE INDEX IF NOT EXISTS idx_buildings_min_price ON buildings(min_price);
CREATE INDEX IF NOT EXISTS idx_buildings_owner_type ON buildings(owner_type);
CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE INDEX IF NOT EXISTS idx_commissions_ctv_id ON commissions(ctv_id);
