# Student Record System (EduTrack)
## Architecture & System Design Document (SADD)
**Standard:** IEEE Std 1016-2009 (Software Design Descriptions)  
**Deliverable:** Part-1 Architecture & Part-2 Agile Sprints Engineering Traceability  
**Author:** Monika PM ([@Monikapm19](https://github.com/Monikapm19)) — *Backend & Security Architect*  
**Contributors:** Nagashree R Patil ([@Nagashri2304](https://github.com/Nagashri2304)), Kushitha K ([@Kushitha30](https://github.com/Kushitha30)), Nidhi L ([@nidhilokesh1](https://github.com/nidhilokesh1))  
**Version:** 2.0 (Sprint 2 Release)  
**Date:** October 2026  

---

## 1. Architectural Patterns & System Overview

EduTrack is structured using a **3-Tier Distributed Layered Architecture** ensuring loose coupling, high cohesion, zero data redundancy (3NF), and zero-trust security enforcement at every boundary:

```
+-------------------------------------------------------------------------+
|                  Tier 1: Presentation Layer (Client)                    |
|  - Single-Page Application (React 18 + Vite + Tailwind CSS)            |
|  - Role-Tailored Portals: Admin, Faculty, Student, Parent               |
|  - Client-side token storage in secure session memory / sessionStorage   |
+-------------------------------------------------------------------------+
                                    |
                                    | HTTPS / JSON:API (RESTful)
                                    v
+-------------------------------------------------------------------------+
|                  Tier 2: Application & API Layer (Backend)              |
|  - Node.js (v20+) runtime with Express.js micro-framework               |
|  - Global Input Sanitization Middleware (Anti-XSS & Payload Stripping)  |
|  - Stateless RS256/HMAC JWT Authentication & RBAC Engine (roleAuth.js)  |
|  - Zero-Trust Object-Level Authorization Guards (objectAuth.js / IDOR)   |
|  - Modular Business Logic Services (Attendance, Grades, Grievances)     |
|  - Append-Only Security Audit Logging Service (auditModel.js)           |
+-------------------------------------------------------------------------+
                                    |
                                    | Parameterized SQL ($1, $2) via pg Pool
                                    v
+-------------------------------------------------------------------------+
|                  Tier 3: Persistence Layer (Database)                   |
|  - PostgreSQL 15+ Relational ACID Engine                                |
|  - Third Normal Form (3NF) Relational Schemas (11 Normalized Tables)    |
|  - Foreign Key Constraints with CASCADE / RESTRICT Integrity Controls   |
|  - Database-Level REVOKE & Immutability Triggers on audit_logs          |
|  - High-Performance B-Tree Composite Indices for Real-Time Querying     |
+-------------------------------------------------------------------------+
```

---

## 2. Component Decomposition & System Responsibilities

The system is decomposed into 10 autonomous, interacting components:

| Component ID | Component Name | Technology | Responsibility |
|---|---|---|---|
| **C1** | **Client SPA & Portals** | React 18, Vite | Interactive UI rendering, client-side validation, JWT persistence in session storage, role-specific navigation. |
| **C2** | **API Gateway & Router** | Express Router | Versioned endpoint routing (`/api/v1`), CORS policy enforcement, rate limiting, and 404/500 global error interception. |
| **C3** | **Auth & RBAC Service** | JWT, Bcrypt | User authentication, Bcrypt password hashing ($\ge 10$ rounds), 5-attempt brute-force lockout, 30-min JWT session expiration. |
| **C4** | **Student Profile Manager** | Express, Node.js | Student lifecycle management (CRUD), unique Roll Number/USN enforcement, department indexing, and profile archival. |
| **C5** | **Course & Allocation Catalog** | Express, Node.js | Academic catalog maintenance, credits validation, instructor allocation mapping, and semester enrollment rosters. |
| **C6** | **Attendance Engine** | Express, Node.js | Batch daily lecture attendance recording, 24-hour edit window enforcement, and real-time attendance percentage aggregation. |
| **C7** | **Grade Calculation Service** | Express, Node.js | Marks entry [0, 100], automatic letter grade mapping, semester GPA weighted aggregation, and mandatory change notes. |
| **C8** | **PDF Grade Card Service** | Express, PDFKit | Generation of cryptographically verifiable semester grade cards with QR verification hashes and institutional seals. |
| **C9** | **Grievance Workflow Service**| Express, Node.js | Student grade/attendance dispute ticketing, assigned faculty resolution workflows, and zero-trust IDOR visibility controls. |
| **C10** | **Immutable Audit Service** | PostgreSQL Trigger | Non-repudiation engine logging all state mutations (actor, old value, new value, timestamp, IP) with revoked UPDATE/DELETE. |

---

## 3. STRIDE Threat Model & Security Mitigations

In accordance with IEEE 1016 and IEEE 830 security objectives, the system incorporates comprehensive defense-in-depth controls mapped across the **STRIDE** threat categories:

| Threat Category | Potential Attack Vector | Architectural Mitigation in EduTrack | Implementation Evidence |
|---|---|---|---|
| **S - Spoofing** | Attacker impersonates faculty/admin to alter grades or mark attendance. | Asymmetric signed JWT access tokens with role claims; passwords stored using Bcrypt (cost factor $\ge 10$). | `backend/src/middleware/roleAuth.js`<br>`backend/src/models/userModel.js` |
| **T - Tampering** | Attacker modifies attendance records after the lecture or tampers audit trail. | 24-hour strict edit limit on attendance sessions; Database-level `REVOKE UPDATE, DELETE` and trigger aborts on `audit_logs`. | `backend/src/config/schema.sql`<br>`backend/src/controllers/attendanceController.js` |
| **R - Repudiation** | Instructor or Admin denies modifying a grade or archiving a student. | Append-only immutable `audit_logs` table capturing User ID, Action, Entity, Old Value, New Value, IP, and Timestamp. | `backend/src/models/auditModel.js`<br>`backend/src/routes/auditRoutes.js` |
| **I - Information Disclosure** | Student queries another student's grade card, profile, or attendance via IDOR. | Zero-Trust Object-Level Authorization (`objectAuth.js`); query filters strictly bound to authenticated token claims. | `backend/src/middleware/objectAuth.js`<br>`tests/student.test.js` (TC-07) |
| **D - Denial of Service** | Credential stuffing attacks targeting `/api/v1/auth/login`. | Account locked for 15 minutes upon 5 consecutive failed login attempts (`HTTP 423 Locked`). | `backend/src/controllers/authController.js`<br>`tests/auth.test.js` (TC-02) |
| **E - Elevation of Privilege** | Student tampers with JWT role claim or calls administrative endpoints. | Strict JWT signature verification with secret key; role verification middleware (`authorizeRoles`) checks server-side state. | `backend/src/middleware/roleAuth.js`<br>`tests/roleAuth.test.js` (TC-06) |

---

## 4. Input Sanitization & SQLi / XSS Defenses (SEC-02)

1. **100% Parameterized Database Queries:**
   - All persistence calls across all data access models strictly employ parameterized bindings (`$1, $2, ...`):
   ```javascript
   // Example from studentModel.js
   const res = await db.query(
     `SELECT * FROM students WHERE dept_id = $1 AND is_active = $2`,
     [deptId, true]
   );
   ```
   - Parameterization ensures SQL injection payloads such as `' OR '1'='1` and `'; DROP TABLE students; --` are evaluated strictly as literal primitive data types with **zero arbitrary database query execution** (TC-08).

2. **Defense Against Stored & Reflected XSS:**
   - Global Express middleware (`sanitizeInput.js`) recursively sweeps `req.body`, `req.query`, and `req.params`.
   - Strips `<script>`, `<iframe>`, `<object>`, `<embed>`, inline event handlers (`onerror=`, `onload=`, `onclick=`), and `javascript:` pseudo-protocols before data enters business controllers.

---

## 5. Third Normal Form (3NF) Database Schemas

The database persistence layer is implemented in PostgreSQL 15+ normalized to 3NF:

```sql
-- 1. Roles
roles (role_id PK, role_name UNIQUE, description, created_at)

-- 2. Users & Credentials
users (user_id PK, email UNIQUE, password_hash, role_id FK, is_active, failed_attempts, locked_until, created_at, updated_at)

-- 3. Academic Departments
departments (dept_id PK, dept_code UNIQUE, dept_name, created_at)

-- 4. Student Profiles
students (student_id PK, user_id FK UNIQUE, roll_number UNIQUE, first_name, last_name, email UNIQUE, dob, dept_id FK, semester, parent_user_id FK, is_active, created_at, updated_at)

-- 5. Courses Master
courses (course_id PK, course_code UNIQUE, course_name, credits, dept_id FK, semester, faculty_user_id FK, is_active, created_at, updated_at)

-- 6. Student Enrollments
enrollments (enrollment_id PK, student_id FK, course_id FK, semester, academic_year, enrolled_at, UNIQUE(student_id, course_id, semester))

-- 7. Daily Attendance Sessions
attendance_sessions (session_id PK, course_id FK, session_date, period, faculty_user_id FK, created_at, updated_at)

-- 8. Attendance Records
attendance_records (record_id PK, session_id FK, student_id FK, status CHECK ('present','absent','late','excused'), created_at, UNIQUE(session_id, student_id))

-- 9. Subject Grades
grades (grade_id PK, student_id FK, course_id FK, marks NUMERIC(5,2), letter_grade, grade_points, semester, explanation_note, faculty_user_id FK, created_at, updated_at, UNIQUE(student_id, course_id, semester))

-- 10. Immutable Security Audit Trail
audit_logs (audit_id PK, actor_user_id FK, action, entity_type, entity_id, course_id FK, student_id FK, old_value JSONB, new_value JSONB, old_marks, new_marks, letter_grade, note, ip_address INET, timestamp)

-- 11. Academic Grievance Discrepancies
grievances (grievance_id PK, student_id FK, course_id FK, grievance_type CHECK ('grade','attendance'), title, description, status CHECK ('Open','In Review','Resolved'), resolution_notes, resolved_by FK, created_at, updated_at, resolved_at)
```

---

## 6. Complete RESTful API Endpoint Catalog

All endpoints adhere to `/api/v1` versioning and uniform JSON response envelopes:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

### Authentication & Security
- `POST /api/v1/auth/login`: Public. Validates credentials; returns JWT signed with role claims.
- `GET /api/v1/auth/me`: Authenticated. Returns decoded token claims for the active session.
- `GET /api/v1/auth/admin-only`: Admin only. RBAC boundary verification endpoint.

### Student Management (FR-02, SEC-08)
- `GET /api/v1/students`: Admin, Faculty. List students with pagination and department filters.
- `POST /api/v1/students`: Admin only. Create student profile with unique roll number.
- `GET /api/v1/students/me`: Student only. Self-service profile retrieval.
- `GET /api/v1/students/:id`: Admin, Faculty, Authorized Student (own), Linked Parent. IDOR-guarded student profile.
- `PUT /api/v1/students/:id`: Admin only. Update student demographic details.
- `DELETE /api/v1/students/:id`: Admin only. Soft-delete / archive student record.

### Courses & Catalog (FR-03, FR-04)
- `GET /api/v1/courses`: All roles. View catalog of active academic courses.
- `POST /api/v1/courses`: Admin only. Create course with credits and faculty allocation.
- `PUT /api/v1/courses/:id`: Admin only. Reallocate course instructor.
- `POST /api/v1/courses/:id/enroll`: Admin only. Enroll student in course for semester.
- `GET /api/v1/courses/:id/roster`: Faculty, Admin. List enrolled students in assigned course.

### Daily Attendance Marking (FR-04)
- `POST /api/v1/courses/:id/attendance`: Faculty (assigned), Admin. Submit batch lecture attendance.
- `PUT /api/v1/courses/:id/attendance/:sessionId`: Faculty (assigned), Admin. Update attendance within 24 hours.
- `GET /api/v1/courses/:id/attendance`: Faculty (assigned), Admin. Course attendance session logs.
- `GET /api/v1/students/:id/attendance`: Admin, Faculty, Authorized Student, Linked Parent. Real-time percentage rollup.

### Subject Marks & GPA Engine (FR-05, FR-07)
- `POST /api/v1/courses/:id/grades`: Faculty (assigned), Admin. Enter/update batch marks [0, 100].
- `GET /api/v1/students/:id/grades`: Admin, Faculty, Authorized Student, Linked Parent. Term grades & GPA breakdown.
- `GET /api/v1/students/me/grades`: Student only. Self-service GPA and subject breakdown.

### Academic Grievance Workflow (FR-10, FR-15)
- `POST /api/v1/grievances`: Student, Admin. Create academic dispute ticket in `Open` state.
- `GET /api/v1/grievances`: Filtered by role (Student sees own; Faculty sees assigned courses; Admin sees all).
- `GET /api/v1/grievances/:id`: IDOR protected. Inspect grievance details and resolution notes.
- `PATCH /api/v1/grievances/:id`: Assigned Faculty, Admin. Update status to `Resolved` with resolution explanation.

### Immutable Audit Trail (FR-13, SEC-03)
- `GET /api/v1/audit-logs`: Admin only. Query audit logs with action/entity filters and pagination.
- `PUT /api/v1/audit-logs/:id`: Forbidden (405 Method Not Allowed — Immutable).
- `DELETE /api/v1/audit-logs/:id`: Forbidden (405 Method Not Allowed — Immutable).

---

## 7. Requirement & Verification Traceability Matrix

| Requirement ID | Specification Description | Primary Component | Database Persisted Table | Test Case Verification |
|---|---|---|---|---|
| **FR-01** | Multi-Factor & Role-Based Authentication | C3 (Auth Service) | `users`, `roles` | `TC-01`, `TC-06` (`roleAuth.test.js`) |
| **FR-02** | Student Profile Lifecycle CRUD | C4 (Student Manager) | `students`, `departments` | `TC-02` (`student.test.js`) |
| **FR-03** | Course Catalog & Faculty Allocation | C5 (Course Catalog) | `courses`, `users` | `TC-03` (`course.test.js`) |
| **FR-04** | Batch Daily Lecture Attendance Marking | C6 (Attendance Engine) | `attendance_sessions`, `attendance_records` | `TC-04` (`attendance.test.js`) |
| **FR-05** | Subject Marks Entry & Automatic GPA | C7 (Grade Calculation) | `grades` | `TC-05` (`grade.test.js`) |
| **FR-06** | Student Self-Service Dashboard | C1 (Client SPA) | `students`, `grades`, `attendance` | `TC-06` (`roleAuth.test.js`, Frontend) |
| **FR-10** | Grade Grievance Resolution Workflow | C9 (Grievance Service)| `grievances` | `TC-10` (`grievance.test.js`) |
| **FR-13** | Non-Repudiation Security Audit Logging | C10 (Audit Engine) | `audit_logs` | `TC-09` (`audit.test.js`) |
| **SEC-01** | Bcrypt Hashing & 5-Attempt Account Lockout | C3 (Auth Service) | `users.password_hash`, `users.locked_until` | `TC-01`, `TC-02` (`auth.test.js`) |
| **SEC-02** | Input Sanitization & Parameterized Queries | C2 (Gateway), C3-C10 | All tables (`$1, $2`) | `TC-08` (`security.test.js`) |
| **SEC-03** | Database Immutability on Audit Trails | C10 (Audit Engine) | `audit_logs` (Trigger + Revoke) | `TC-09` (`audit.test.js`) |
| **SEC-08** | Zero-Trust IDOR Prevention | C4, C6, C7, C9 | `objectAuth.js` validation | `TC-07` (`student.test.js`) |
