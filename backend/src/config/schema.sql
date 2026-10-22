-- EduTrack Student Record System - DDL Schema
-- Module: Authentication & RBAC (FR-01, SEC-01)
-- Author: Monika PM (@Monikapm19)

-- 1. Roles Definition Table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed Standard Roles
INSERT INTO roles (role_name, description) VALUES
    ('Admin', 'System administrator with unrestricted access to catalogs and user management'),
    ('Faculty', 'Teaching faculty authorized to mark attendance and record subject grades'),
    ('Student', 'Enrolled student authorized to view grades, attendance, and generate grade cards'),
    ('Parent', 'Parent/Guardian authorized to monitor linked student academic progress')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Users Table with Security & Account Lockout Fields
CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    failed_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for high-performance lookup during authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
