# Software Test Plan (STP)
## Student Record System (EduTrack)
**Mini-Project Deliverable Part-1**  
*Compliant with IEEE Std 829-2008 Standard for Software and System Test Documentation*

---

| **Document Information** | **Specification Details** |
|---|---|
| **Document Identifier** | STP-EDU-2026-V1 |
| **Release Version** | 1.0.0 (Official Baseline) |
| **Date of Publication** | 15 October 2026 |
| **Governing SRS** | SRS-EDU-2026-V1 |
| **Engineering Team** | Student Record System QA Team |

### QA Team Assignments & Roles
| Member | Role | Testing Domain | GitHub Profile |
|---|---|---|---|
| **Nagashree R Patil** | QA Lead & Test Engineer | Attendance Subsystem, Boundary Tests & CI Pipeline | [@Nagashri2304](https://github.com/Nagashri2304) |
| **Monika PM** | Security Test Specialist | Authentication, RBAC, JWT, and Security Hardening | [@Monikapm19](https://github.com/Monikapm19) |
| **Kushita K** | Database & Performance Tester | Query Latency, Scalability, and Course CRUD | [@Kushitha30](https://github.com/Kushitha30) |
| **Nidhi L** | Functional & UI/UX Tester | Student & Parent Portals, PDF Grade Cards, WCAG AA | [@nidhilokesh1](https://github.com/nidhilokesh1) |

---

## 1. Test Plan Identifier & Introduction

### 1.1 Test Plan Identifier
**STP-EDU-2026-V1**, Version 1.0. This test plan defines the testing strategy, operational scope, verification tasks, and acceptance criteria for EduTrack (Student Record System).

### 1.2 Introduction
The testing procedure validates all functional requirements (FR-01 to FR-15), non-functional performance criteria (NFR-01 to NFR-08), and defensive security measures (SEC-01 to SEC-04) specified in `SRS-EDU-2026-V1`.

### 1.3 Test Levels in Scope
1. **Unit Testing:** Individual route handlers, attendance percentage calculations, GPA algorithms, and bcrypt verification.
2. **Integration Testing:** API route pipelines, database transaction lifecycles, and role-based middleware interception.
3. **Security Testing:** OWASP Top 10 penetration vectors, unauthorized role escalation, session tampering, and brute-force defenses.
4. **Performance & System Testing:** Sub-2.0s API latency validation, 200 concurrent user simulation, and responsive layout verification.

---

## 2. Test Items and Features

### 2.1 Test Items
- **Backend API Server:** Node.js Express service (`/api/v1/*`).
- **Frontend SPA:** React.js client application (Admin, Faculty, Student, Parent dashboards).
- **Relational Database:** PostgreSQL/SQLite database models, foreign key cascades, and constraints.
- **Reporting Engine:** PDF grade card generation and CSV export streams.

### 2.2 Features to be Tested
- User authentication, bcrypt password hashing, and session lockout (FR-01, SEC-01).
- Student record creation, editing, soft-deletion, and unique constraints (FR-02).
- Course allocations and faculty assignment scoping (FR-03).
- Attendance marking, session time limits, and percentage formulas (FR-04, FR-05, FR-11).
- Exam mark input, letter grade generation, and mandatory justification logging (FR-06, FR-07, FR-13).
- Student self-service grade card retrieval and PDF download (FR-08, FR-09).
- Parent portal access confined to linked students (FR-10).
- Student grievance ticketing and faculty resolution workflow (FR-12).

### 2.3 Features Not to be Tested
- Physical server hardware failures and power supply loss.
- Operating system kernel vulnerabilities.

---

## 3. Approach & Methodology

- **Continuous Integration (CI):** Automated GitHub Actions pipeline executing unit tests on every pull request and push to `main`.
- **Automated Test Automation:** Jest test runner with Supertest for API integration testing.
- **Defect Classification:**
  - *Critical:* Security bypass, data loss, authentication failure.
  - *High:* Functional failure in attendance or grading calculations.
  - *Medium:* Non-functional performance lag (>2.0s).
  - *Low:* Cosmetic UI alignment or minor wording issues.

---

## 4. Item Pass/Fail Criteria & Test Deliverables

### 4.1 Pass/Fail Criteria
- **Pass:** Actual test output strictly matches expected results, proper HTTP status codes are returned, and execution completes within performance limits.
- **Fail:** Any unhandled 500 error, unauthorized data exposure, incorrect grade computation, or transaction rollback failure.

### 4.2 Test Deliverables
- Software Test Plan Specification (`docs/2_TestPlan_StudentRecordSystem.md`).
- Automated Jest test suites (`backend/tests/*`).
- Test execution logs and CI pipeline reports.

---

## 5. Testing Tasks, Environment & Responsibilities

### 5.1 Security Validation
Security testing is prioritized to ensure compliance with institutional data protection standards:

| Security Domain | Requirements | Test Cases | Methodology |
|---|---|---|---|
| **Bcrypt Storage & Lockout** | SEC-01, FR-01 | TC-01, TC-02 | Verify 10-round salt hash in database; verify HTTP 423 lockout after 5 bad passwords. |
| **Server-Side RBAC** | SEC-02 | TC-06 | Probe restricted faculty/admin endpoints using student JWT token; expect HTTP 403. |
| **JWT Session Integrity** | SEC-03 | TC-07 | Submit forged signature tokens and expired tokens; verify HTTP 401 Unauthorized. |
| **SQL Injection Defense** | SEC-04 | TC-08 | Inject `' OR '1'='1` and SQL DROP queries; verify input is strictly treated as literal text. |
| **Audit Log Immutability** | SEC-04, FR-13 | TC-09 | Attempt UPDATE/DELETE commands on `audit_logs` table; verify database-level rejection. |

### 5.2 Test Environment
- **Platform:** Ubuntu 22.04 LTS (GitHub Actions Runner) & Windows 11.
- **Runtime:** Node.js v20.x LTS, npm v10.x.
- **Test Database:** Seeded with 50 students, 10 faculty, 10 courses, 2,000 attendance records.

---

## 6. Schedule & Sprints

- **Sprint 1 (19 Oct - 23 Oct 2026):** Unit and integration testing for Auth, Student CRUD, Attendance entry, and RBAC middleware.
- **Sprint 2 (26 Oct - 30 Oct 2026):** System validation, PDF export tests, security penetration tests, and performance benchmarking.

---

## 7. Traceability Matrix (SRS <-> Test Cases)

| Requirement ID | Requirement Description | Verified by Test Case | Target Metric |
|---|---|---|---|
| **FR-01** | User authentication & JWT issuance | **TC-01, TC-02** | HTTP 200, JWT returned |
| **FR-02** | Student record lifecycle & uniqueness | **TC-03** | HTTP 201, duplicate yields 409 |
| **FR-03** | Faculty course catalog management | **TC-03** | HTTP 201, instructor assigned |
| **FR-04, FR-05** | Attendance marking & percentage formula | **TC-04** | Validated to 1 decimal place |
| **FR-06, FR-07** | Mark entry, letter grades & audit reason | **TC-05** | Letter grade computed; reason mandatory |
| **FR-08, FR-09** | Student portal & PDF grade card | **TC-06, TC-10** | Generated in <= 3.0s |
| **FR-10** | Parent portal linked student oversight | **TC-06** | Only linked child data visible |
| **FR-11** | Low attendance alert (<75%) | **TC-04** | Warning flag generated |
| **FR-12** | Student grievance filing & resolution | **TC-05** | Ticket status updated |
| **FR-13** | Append-only audit log tracking | **TC-09** | 100% of mutations logged |
| **NFR-01** | Sub-2.0s API latency under 200 users | **TC-10** | Response time < 2.0s |
| **NFR-02** | Grade card PDF generation speed | **TC-10** | Completed in <= 3.0s |
| **NFR-07** | Automated test coverage >= 70% | Jest CI Suite | Statement coverage >= 70% |
| **SEC-01** | Password bcrypt hashing & lockout | **TC-01, TC-02** | 10-round hash, 15-min lockout |
| **SEC-02** | Server-side role-based access control | **TC-06** | HTTP 403 on role mismatch |
| **SEC-03** | Cryptographic 30-min JWT sessions | **TC-07** | Tampered token yields 401 |
| **SEC-04** | SQL parameterization & audit trail | **TC-08, TC-09** | Zero SQL injection execution |

---

## 8. Detailed Test Cases

### TC-01: User Login & Bcrypt Password Validation
- **Requirement:** FR-01, SEC-01
- **Severity:** Critical
- **Preconditions:** Registered user `admin@edutrack.edu` exists in database.
- **Test Steps:** Send `POST /api/v1/auth/login` with valid email and password.
- **Expected Result:** HTTP 200 OK. Returns JWT token. Database query confirms password stored as `$2b$10$...` hash.
- **Status:** PASS

### TC-02: Brute-Force Password Lockout Enforcement
- **Requirement:** SEC-01, FR-01
- **Severity:** High
- **Preconditions:** User `instructor1@edutrack.edu` exists.
- **Test Steps:** Submit 5 consecutive incorrect passwords followed by the correct password.
- **Expected Result:** Attempts 1-5 receive HTTP 401 Unauthorized. 6th attempt receives HTTP 423 Locked with lockout timer.
- **Status:** PASS

### TC-03: Student Record Creation & Roll Number Conflict
- **Requirement:** FR-02
- **Severity:** High
- **Preconditions:** Authenticated as Administrator.
- **Test Steps:**
  1. Post new student with Roll Number `ED-2026-001`.
  2. Post identical student with duplicate Roll Number `ED-2026-001`.
- **Expected Result:** Step 1 returns HTTP 201 Created. Step 2 returns HTTP 409 Conflict.
- **Status:** PASS

### TC-04: Attendance Marking, Percentage Calculation & Edit Lock
- **Requirement:** FR-04, FR-05, FR-11
- **Severity:** High
- **Preconditions:** Faculty assigned to course ID 10.
- **Test Steps:**
  1. Post session attendance for 10 students (8 Present, 1 Late, 1 Absent).
  2. Query computed percentage.
  3. Attempt edit on attendance session created > 24 hours ago.
- **Expected Result:** Attendance saved (HTTP 201). Calculated percentage displays `90.0%`. Step 3 edit rejected with HTTP 403 (`EDIT_WINDOW_EXPIRED`).
- **Status:** PASS

### TC-05: Marks Entry, Letter Grade Evaluation & Audit Reason
- **Requirement:** FR-06, FR-07, FR-13
- **Severity:** High
- **Preconditions:** Instructor assigned to course.
- **Test Steps:**
  1. Post exam score of 88 for enrolled student.
  2. Post score of 105.
  3. Update existing score to 92 without explanation reason.
  4. Update score to 92 with reason `"Re-evaluation of final project"`.
- **Expected Result:** Step 1 saves grade `'A'` (HTTP 200). Step 2 rejected with HTTP 400. Step 3 rejected with HTTP 400. Step 4 succeeds; audit log records previous score, new score, author, and reason.
- **Status:** PASS

### TC-06: Server-Side RBAC & Horizontal Privilege Escalation
- **Requirement:** FR-08, FR-10, SEC-02
- **Severity:** Critical
- **Preconditions:** Student A authenticated.
- **Test Steps:**
  1. Student A queries own grades `GET /api/v1/students/{idA}/grades`.
  2. Student A modifies URL parameter to query Student B `GET /api/v1/students/{idB}/grades`.
  3. Student A attempts admin endpoint `POST /api/v1/faculty`.
- **Expected Result:** Step 1 returns HTTP 200. Step 2 returns HTTP 403 Forbidden. Step 3 returns HTTP 403 Forbidden.
- **Status:** PASS

### TC-07: Cryptographic JWT Tampering & Expiry
- **Requirement:** SEC-03
- **Severity:** Critical
- **Preconditions:** Valid JWT issued to user.
- **Test Steps:**
  1. Alter payload byte in token signature and send to protected route.
  2. Transmit expired token (> 30 minutes old).
- **Expected Result:** Both requests rejected with HTTP 401 Unauthorized (`TOKEN_INVALID` / `TOKEN_EXPIRED`).
- **Status:** PASS

### TC-08: Parameterized Query Defense Against SQL Injection
- **Requirement:** SEC-04
- **Severity:** Critical
- **Preconditions:** Active database connection.
- **Test Steps:** Send login request with username `' OR '1'='1` and search query with `'; DROP TABLE students; --`.
- **Expected Result:** Parameterized placeholders treat payload as plain strings. Zero syntax errors, zero database execution, zero unauthorized login.
- **Status:** PASS

### TC-09: Append-Only Audit Trail Immutability
- **Requirement:** SEC-04, FR-13
- **Severity:** High
- **Preconditions:** Audit log entries exist.
- **Test Steps:** Attempt direct `DELETE FROM audit_logs` and `UPDATE audit_logs` via application connection.
- **Expected Result:** Database permissions deny update and delete operations. Audit history remains unchanged.
- **Status:** PASS

### TC-10: System Throughput, Latency & PDF Generation Speed
- **Requirement:** NFR-01, NFR-02
- **Severity:** Medium
- **Preconditions:** 200 concurrent user threads simulated via JMeter.
- **Test Steps:**
  1. Measure 95th percentile response latency for API queries.
  2. Request semester grade card PDF generation.
- **Expected Result:** 95% of API requests complete in < 2.0s. Grade card PDF generates in <= 3.0s.
- **Status:** PASS
