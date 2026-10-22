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
-- Index for high-performance lookup during authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Departments Table (FR-02, FR-03)
CREATE TABLE IF NOT EXISTS departments (
    dept_id SERIAL PRIMARY KEY,
    dept_code VARCHAR(20) UNIQUE NOT NULL,
    dept_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed Standard Departments
INSERT INTO departments (dept_code, dept_name) VALUES
    ('CSE', 'Computer Science & Engineering'),
    ('ECE', 'Electronics & Communication Engineering'),
    ('ISE', 'Information Science & Engineering'),
    ('ME', 'Mechanical Engineering')
ON CONFLICT (dept_code) DO NOTHING;

-- 4. Students Table (FR-02: Student Profile Management & Enrollment Lifecycle)
CREATE TABLE IF NOT EXISTS students (
    student_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    dept_id INT REFERENCES departments(dept_id) ON DELETE RESTRICT,
    semester INT DEFAULT 1 CHECK (semester >= 1 AND semester <= 8),
    parent_user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_dept_id ON students(dept_id);

-- 5. Courses Table (FR-03: Course & Faculty Assignment Catalog Management)
CREATE TABLE IF NOT EXISTS courses (
    course_id BIGSERIAL PRIMARY KEY,
    course_code VARCHAR(30) UNIQUE NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    credits INT NOT NULL CHECK (credits >= 1 AND credits <= 10),
    dept_id INT REFERENCES departments(dept_id) ON DELETE RESTRICT,
    semester INT DEFAULT 1 CHECK (semester >= 1 AND semester <= 8),
    faculty_user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_dept_id ON courses(dept_id);

-- 6. Enrollments Table (FR-02, FR-04: Course Allocations)
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    semester INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_course_semester UNIQUE (student_id, course_id, semester)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- 7. Attendance Sessions Table (FR-04: Daily Attendance Marking & Session Validation Engine)
-- Author: Nagashree R Patil (@Nagashri2304)
CREATE TABLE IF NOT EXISTS attendance_sessions (
    session_id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    faculty_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    period INT NOT NULL DEFAULT 1 CHECK (period > 0),
    topic VARCHAR(255) DEFAULT 'Lecture Session',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_course ON attendance_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON attendance_sessions(session_date);

-- 8. Attendance Records Table (Per Student Status)
CREATE TABLE IF NOT EXISTS attendance_records (
    record_id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES attendance_sessions(session_id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_status_check;
ALTER TABLE attendance_records
    ADD CONSTRAINT attendance_records_status_check
    CHECK (status IN ('present', 'absent', 'late', 'excused'));

CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);

-- 9. Subject Grades & Marks Evaluation Table (FR-05)
-- Author: Nagashree R Patil (@Nagashri2304)
CREATE TABLE IF NOT EXISTS grades (
    grade_id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    marks NUMERIC(5, 2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
    letter_grade VARCHAR(5) NOT NULL CHECK (letter_grade IN ('S', 'A', 'B', 'C', 'D', 'E', 'F')),
    grade_points INT NOT NULL CHECK (grade_points >= 0 AND grade_points <= 10),
    note TEXT NOT NULL DEFAULT 'Initial evaluation',
    created_by BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    updated_by BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_course_student_grade UNIQUE (course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course ON grades(course_id);

-- 10. Immutable Security Audit Trail Table (FR-05, FR-07, SEC-03)
-- Author: Nagashree R Patil (@Nagashri2304)
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id BIGSERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    course_id BIGINT REFERENCES courses(course_id) ON DELETE SET NULL,
    student_id BIGINT REFERENCES students(student_id) ON DELETE SET NULL,
    old_marks NUMERIC(5, 2),
    new_marks NUMERIC(5, 2),
    letter_grade VARCHAR(5),
    note TEXT,
    actor_user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_course ON audit_logs(course_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_student ON audit_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
