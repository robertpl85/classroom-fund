-- ============================================================
-- Classroom Fund Manager - Database Schema
-- Run this file once to set up the database:
--   psql -U classroom_user -d classroom_fund -f schema.sql
-- ============================================================

-- Users (admin + classroom moms)
CREATE TABLE IF NOT EXISTS users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(150) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  role      VARCHAR(20) NOT NULL DEFAULT 'mom' CHECK (role IN ('admin', 'mom')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  parent_email  VARCHAR(150) NOT NULL,
  parent_phone  VARCHAR(30),
  paid          BOOLEAN DEFAULT FALSE,
  amount        NUMERIC(10,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id            SERIAL PRIMARY KEY,
  description   VARCHAR(255) NOT NULL,
  amount        NUMERIC(10,2) NOT NULL,
  category      VARCHAR(50) DEFAULT 'General',
  date          DATE NOT NULL,
  submitted_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seed Data ────────────────────────────────────────────────
-- Admin account (password: admin123 — CHANGE THIS after first login)
INSERT INTO users (name, email, password, role) VALUES
  ('Sarah (Admin)', 'sarah@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Classroom moms (password: pass123 — CHANGE THESE after first login)
INSERT INTO users (name, email, password, role) VALUES
  ('Jessica Miller', 'jessica@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mom'),
  ('Amanda Torres',  'amanda@email.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mom')
ON CONFLICT (email) DO NOTHING;

-- Sample students
INSERT INTO students (name, parent_email, parent_phone, paid, amount) VALUES
  ('Liam Johnson',   'johnson@email.com',  '312-555-0101', true,  40.00),
  ('Emma Williams',  'williams@email.com', '312-555-0102', true,  40.00),
  ('Noah Brown',     'brown@email.com',    '312-555-0103', false,  0.00),
  ('Olivia Davis',   'davis@email.com',    '312-555-0104', true,  40.00),
  ('Ava Martinez',   'martinez@email.com', '312-555-0105', false,  0.00),
  ('Sophia Garcia',  'garcia@email.com',   '312-555-0106', true,  40.00),
  ('Jackson Wilson', 'wilson@email.com',   '312-555-0107', true,  40.00),
  ('Isabella Moore', 'moore@email.com',    '312-555-0108', false,  0.00),
  ('Lucas Taylor',   'taylor@email.com',   '312-555-0109', true,  40.00),
  ('Mia Anderson',   'anderson@email.com', '312-555-0110', true,  40.00)
ON CONFLICT DO NOTHING;

-- Sample expenses
INSERT INTO expenses (description, amount, category, date, submitted_by, status, approved_by) VALUES
  ('Halloween Party Supplies',      35.50, 'Holiday', '2025-10-28', 1, 'approved', 1),
  ('Fall Craft Materials',          22.75, 'Craft',   '2025-11-05', 2, 'approved', 1),
  ('Winter Party Decorations',      48.00, 'Holiday', '2025-12-15', 3, 'pending',  NULL),
  ('Valentine''s Day Cards & Candy',31.20, 'Holiday', '2026-02-10', 2, 'pending',  NULL)
ON CONFLICT DO NOTHING;

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action     VARCHAR(100) NOT NULL,
  details    TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  key   VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT INTO settings (key, value) VALUES ('class_name', 'Pierwsza Klasa')
ON CONFLICT (key) DO NOTHING;
