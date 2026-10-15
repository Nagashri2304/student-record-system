# Student Record System
## Software Test Plan (STP)
**Deliverable 2 of 4 - Mini-Project Part 1**  
*Prepared following IEEE Std 829-2008 Standard for Software and System Test Documentation*

---

| **Attribute** | **Details** |
|---|---|
| **Document ID** | TP-SRSYS-01 |
| **Version** | 1.0 |
| **Release Date** | 28 September 2026 |
| **Associated SRS** | SRS-SRSYS-01 v1.0 |
| **Team Name** | TEAM-E12 |

### Team Members & Testing Assignments
| Name | SRN / USN | Role | Testing Assignment |
|---|---|---|---|
| **Nagashree R Patil** | PES1UG24CS289 | Test Lead & QA | Attendance Validation, Boundary Testing & CI Automation |
| **Monika PM** | PES1UG24CS275 | Security Tester | Authentication, RBAC, JWT, and Security Hardening |
| **Kushita K** | PES1UG24CS247 | Performance & DB Tester | Data Integrity, Load Testing, Course CRUD Validation |
| **Nidhi L** | PES1UG24CS298 | Functional & UI Tester | Student/Parent Portal, PDF Verification, Usability & WCAG |

---

## Table of Contents
1. [Test Plan Identifier and Introduction](#1-test-plan-identifier-and-introduction)
2. [Test Items and Features to be Tested / Not Tested](#2-test-items-and-features)
3. [Approach & Test Strategy](#3-approach)
4. [Item Pass/Fail Criteria & Test Deliverables](#4-item-passfail-criteria-and-test-deliverables)
5. [Testing Tasks, Environment, and Responsibilities](#5-testing-tasks-environment-and-responsibilities)
   - 5.1 Security Validation
   - 5.2 Test Environment Configuration
6. [Schedule and Risk Management](#6-schedule-and-risks)
7. [Traceability Matrix (SRS <-> Test Cases)](#7-traceability-matrix)
   - 7.1 Functional Requirements Traceability
   - 7.2 Non-Functional Requirements Traceability
   - 7.3 Security Requirements Traceability
8. [Comprehensive Test Cases (Functional & Non-Functional)](#8-detailed-test-cases)
9. [Approvals](#9-approvals)

---

## 1. Test Plan Identifier and Introduction

### 1.1 Test Plan Identifier
**TP-SRSYS-01**, Version 1.0. This document governs all verification, validation, security analysis, and performance benchmarking for the Student Record System (SRS-SRSYS-01).

### 1.2 Introduction
This Test Plan outlines the testing scope, methodology, resources, and pass/fail thresholds. The strategy employs a multi-tiered testing hierarchy encompassing automated unit tests, API integration tests, role-based end-to-end UI tests, automated OWASP security scans, and JMeter load benchmarking.

### 1.3 Testing Levels in Scope
1. **Unit Testing:** Individual business logic functions (grading scales, attendance arithmetic, token validation).
2. **Integration Testing:** HTTP request pipelines, middleware chains, database transactions, and error interception.
3. **System Testing:** End-to-end user journeys through the React SPA across all four primary actors.
4. **Security Testing:** Vulnerability testing against OWASP Top 10, privilege escalation, and session hijack vectors.
5. **Non-Functional Testing:** Sub-2.0s API latency validation, 200 concurrent user load tests, and WCAG AA accessibility audits.

---

## 2. Test Items and Features

### 2.1 Test Items
- **Client Application:** React.js Single Page Application (Admin, Faculty, Student, Parent views).
- **Application Server:** Node.js Express REST API (`/api/v1/*`).
- **Database:** PostgreSQL relational schema, constraints, indexes, and transactional integrity.
- **Reporting Engine:** PDF report generation and CSV data streaming service.

### 2.2 Features to be Tested
- All 17 Functional Requirements (**FR-01 to FR-17**).
- All 10 Non-Functional Requirements (**NFR-01 to NFR-10**).
- All 9 Security Requirements (**SEC-01 to SEC-09**).

### 2.3 Features Not to be Tested
- Hardware-level and operating system kernel vulnerabilities.
- Physical infrastructure power failure scenarios.
- External SMTP gateway delivery latencies (mocked via test stubs).

---

## 3. Approach

### 3.1 Methodologies
- **Test-Driven Design & Unit Testing:** Jest unit tests running in CI on every push and pull request. Minimum code coverage target: 70% statement coverage (NFR-07).
- **API Automated Testing:** Supertest and Postman/Newman collections validating HTTP status codes, error payload schemas, and headers.
- **Continuous Integration (CI):** GitHub Actions automated workflow enforcing zero test regressions on the `main` branch.
- **Penetration & Security Scanning:** Manual boundary injection probes and automated vulnerability scans.

### 3.2 Entry and Exit Criteria
- **Entry Criteria:** Complete requirement specification (SRS v1.0), successful code compilation, and verified seed database deployment.
- **Exit Criteria:** 100% execution of defined test cases, zero open Critical/High-severity defects, >= 70% test code coverage, and passing security validation.

---

## 4. Item Pass/Fail Criteria and Test Deliverables

### 4.1 Pass/Fail Criteria
- **Pass:** Actual output matches expected output exactly in data, HTTP status code, and latency bounds.
- **Fail:** Any deviation from specification, unauthorized data exposure, unhandled 500 error, or violation of security constraints.

### 4.2 Suspension and Resumption Criteria
Testing is immediately suspended if a Critical bug prevents login/authentication (blocking > 30% of downstream test suites). Testing resumes once a hotfix is merged and deployed to the staging environment.

### 4.3 Test Deliverables
- Software Test Plan Document (TP-SRSYS-01).
- Automated Jest and Supertest test suites (`backend/tests/*`).
- Traceability Matrix (Section 7).
- Test Execution Log and Defect Reports.

---

## 5. Testing Tasks, Environment, and Responsibilities

### 5.1 Security Validation
Security testing is executed as a dedicated engineering phase targeting the CIA triad and OWASP Top 10 vulnerabilities:

| Focus Area | Security Req | Associated Test Cases | Verification Methodology |
|---|---|---|---|
| **Password Storage & Lockout** | SEC-01, SEC-05 | TC-01, TC-02 | Verify 10-round bcrypt hashes in DB; trigger 5 failed logins to test HTTP 423 lockout. |
| **Server-Side RBAC** | SEC-02 | TC-06 | Probe restricted endpoints using tokens belonging to lower-privileged roles; expect HTTP 403. |
| **Transport Encryption** | SEC-03 | TC-10 | Enforce TLS 1.2+ cipher suites and check HTTP-to-HTTPS redirect & HSTS headers. |
| **Cryptographic Sessions** | SEC-04 | TC-07 | Submit expired and digitally tampered JWTs; verify immediate rejection with HTTP 401. |
| **SQL Injection & XSS** | SEC-06 | TC-08 | Inject SQL payloads (`' OR 1=1 --`) and script tags (`<script>alert(1)</script>`); verify parameterization. |
| **Audit Log Immutability** | SEC-07 | TC-09 | Attempt direct UPDATE and DELETE queries against `audit_logs` table; verify database-level rejection. |
| **Object-Level Authorization** | SEC-08 | TC-06, TC-07 | Swap URL IDs (e.g. Student querying foreign roll number); verify HTTP 403. |
| **API Rate Limiting** | SEC-09 | TC-10 | Transmit > 100 requests in 60s from single client; verify HTTP 429 response. |

### 5.2 Test Environment Configuration
- **Operating Systems:** Ubuntu 22.04 LTS (CI Runner) & Windows 11 Enterprise (Local Development).
- **Runtimes:** Node.js v20.18+, npm 10+.
- **Database:** PostgreSQL 15 running with synthetic dataset: 100 students, 10 faculty, 15 courses, 5,000 attendance records.
- **Testing Tools:** Jest, Supertest, Postman, JMeter, Axe Accessibility Engine.

---

## 6. Schedule and Risks

### 6.1 Schedule
- **Phase 1 (Sprint 1 - Oct 19 to Oct 23):** Core unit and integration tests (Auth, Student CRUD, Attendance marking, RBAC middleware).
- **Phase 2 (Sprint 2 - Oct 26 to Oct 30):** Full system testing, security penetration tests, reporting performance tests, and documentation sign-off.

### 6.2 Risk Mitigation
- *Risk:* Database transaction lockup during high-volume attendance tests.  
  *Mitigation:* Connection pooling limits and transaction timeouts configured in `db.js`.
- *Risk:* Incomplete test data causing false passes.  
  *Mitigation:* Automated deterministic seed script (`npm run db:reset`).

---

## 7. Traceability Matrix

### 7.1 Functional Requirements Traceability
| Requirement ID | Requirement Summary | Use Case | Verified By Test Case |
|---|---|---|---|
| **FR-01** | User authentication & JWT issuance | UC-01 | **TC-01, TC-02** |
| **FR-02** | Student record creation & validation | UC-02 | **TC-03** |
| **FR-03** | Student update & soft-deletion | UC-02 | **TC-03** |
| **FR-04** | Faculty account management & password reset | UC-03 | **TC-03** |
| **FR-05** | Course creation and faculty allocation | UC-04 | **TC-04** |
| **FR-06** | Grade entry & automated letter computation | UC-06 | **TC-05** |
| **FR-07** | Mark correction with mandatory audit reason | UC-06 | **TC-05** |
| **FR-08** | Attendance marking & 24-hr edit window enforcement | UC-05 | **TC-04** |
| **FR-09** | Automatic attendance percentage calculation | UC-05 | **TC-04** |
| **FR-10** | Student self-service grade & attendance portal | UC-07 | **TC-06** |
| **FR-11** | PDF report card generation & export | UC-08 | **TC-06** |
| **FR-12** | Parent portal access to linked student only | UC-09 | **TC-06** |
| **FR-13** | Low attendance alert (< 75%) trigger | UC-05 | **TC-04** |
| **FR-14** | Class performance reporting & CSV export | UC-12 | **TC-10** |
| **FR-15** | Grievance lodging and resolution workflow | UC-10, UC-11 | **TC-05** |
| **FR-16** | Immutable audit log generation for data changes | UC-13 | **TC-09** |
| **FR-17** | Student contact detail self-update | UC-07 | **TC-03** |

### 7.2 Non-Functional Requirements Traceability
| NFR ID | Target Specification | Verified By Test Case |
|---|---|---|
| **NFR-01** | API response latency <= 2.0s under 200 concurrent users | **TC-10** |
| **NFR-02** | Class report generation <= 3.0s for 100 students | **TC-10** |
| **NFR-03** | Scalability to 10k students and 200k attendance entries | **TC-10** |
| **NFR-04** | 99% operational uptime | System Health Check Endpoint |
| **NFR-05** | Usability: Grade entry in <= 3 clicks and <= 10 min | User Acceptance Testing |
| **NFR-06** | Cross-browser compatibility (Chrome, Firefox, Safari, Edge) | Cross-Browser Suite |
| **NFR-07** | Modular code with >= 70% unit test statement coverage | Jest Coverage Suite |
| **NFR-08** | Automated daily backup with RPO <= 24h, RTO <= 4h | Disaster Recovery Drill |
| **NFR-09** | ACID transaction atomicity on multi-record mutations | **TC-04, TC-05** |
| **NFR-10** | WCAG 2.1 Level AA accessibility compliance | Axe Automated Scanner |

### 7.3 Security Requirements Traceability
| Security ID | Security Objective | Verified By Test Case |
|---|---|---|
| **SEC-01** | Bcrypt password hashing (cost factor >= 10) | **TC-01** |
| **SEC-02** | Server-side role-based access control (HTTP 403) | **TC-06** |
| **SEC-03** | HTTPS & TLS 1.2+ transport encryption | **TC-10** |
| **SEC-04** | 30-minute JWT session expiration & tampering detection | **TC-07** |
| **SEC-05** | Account lockout after 5 failed attempts (HTTP 423) | **TC-02** |
| **SEC-06** | SQL injection & XSS parameterization prevention | **TC-08** |
| **SEC-07** | Append-only audit log immutability | **TC-09** |
| **SEC-08** | Object-level authorization & parameter tampering check | **TC-06, TC-07** |
| **SEC-09** | API rate limiting (100 req/min per IP) | **TC-10** |

---

## 8. Detailed Test Cases

### TC-01: User Authentication & Bcrypt Password Hashing
- **Requirement:** FR-01, SEC-01
- **Severity:** Critical
- **Preconditions:** User `admin@pes.edu` exists in DB with hashed password.
- **Test Steps:**
  1. Send `POST /api/v1/auth/login` with valid email and password.
  2. Inspect response payload, token claims, and database record.
- **Test Data:** `{"email": "admin@pes.edu", "password": "AdminPassword@123"}`
- **Expected Result:** HTTP 200 OK. Returns JWT token. Database query confirms password is stored as `$2b$10$...` hash.
- **Actual Result:** As expected.
- **Status:** PASS

### TC-02: Brute-Force Account Lockout Enforcement
- **Requirement:** SEC-05, FR-01
- **Severity:** High
- **Preconditions:** Active user `faculty1@pes.edu` exists.
- **Test Steps:**
  1. Submit 5 consecutive `POST /api/v1/auth/login` requests with invalid passwords.
  2. Submit a 6th request with the correct password.
- **Test Data:** `{"email": "faculty1@pes.edu", "password": "WrongPassword"}`
- **Expected Result:** Attempts 1-5 receive HTTP 401 Unauthorized. 6th attempt receives HTTP 423 Locked with lockout timer message.
- **Actual Result:** As expected.
- **Status:** PASS

### TC-03: Student Record Lifecycle & Roll Number Conflict Prevention
- **Requirement:** FR-02, FR-03, NFR-09
- **Severity:** High
- **Preconditions:** Admin authenticated with active JWT.
- **Test Steps:**
  1. Post new student with roll number `PES1UG24CS999`.
  2. Post identical student with duplicate roll number `PES1UG24CS999`.
  3. Send `DELETE /api/v1/students/{id}` to soft-delete.
- **Expected Result:** Step 1 returns HTTP 201 Created. Step 2 returns HTTP 409 Conflict. Step 3 returns HTTP 200; student `is_active` set to `false`.
- **Actual Result:** As expected.
- **Status:** PASS

### TC-04: Attendance Marking, Percentage Calculation & 24-Hour Edit Window
- **Requirement:** FR-08, FR-09, FR-13, NFR-09
- **Severity:** High
- **Preconditions:** Faculty assigned to course ID 101.
- **Test Steps:**
  1. Post attendance array for 10 students (`Present`, `Absent`, `Late`).
  2. Verify calculated attendance percentage updates.
  3. Attempt edit on record with timestamp simulated > 24 hours ago.
- **Expected Result:** Initial attendance saved (HTTP 201). Attendance percentage dynamically updated to 1 decimal place. Step 3 edit rejected with HTTP 403 (`EDIT_WINDOW_EXPIRED`).
- **Actual Result:** As expected.
- **Status:** PASS

### TC-05: Marks Entry, Automatic Letter Grading & Audit Rationale
- **Requirement:** FR-06, FR-07, FR-16
- **Severity:** High
- **Preconditions:** Faculty assigned to course.
- **Test Steps:**
  1. Submit mark of `85` for enrolled student.
  2. Submit invalid mark of `110`.
  3. Update mark to `92` without reason.
  4. Update mark to `92` with mandatory reason `"Re-evaluation of Q4"`.
- **Expected Result:** Step 1 saves grade `'A'` (HTTP 200). Step 2 fails with HTTP 400. Step 3 fails with HTTP 400. Step 4 succeeds; old mark, new mark, and reason written to `audit_logs`.
- **Actual Result:** As expected.
- **Status:** PASS

### TC-06: Server-Side RBAC & Horizontal Privilege Escalation Defense
- **Requirement:** FR-10, FR-12, SEC-02, SEC-08
- **Severity:** Critical
- **Preconditions:** Two distinct student users (Student A, Student B) authenticated.
- **Test Steps:**
  1. Student A requests own transcript `GET /api/v1/students/{idA}/grades`.
  2. Student A modifies URL to request Student B transcript `GET /api/v1/students/{idB}/grades`.
  3. Student A attempts to access admin endpoint `POST /api/v1/faculty`.
- **Expected Result:** Step 1 returns HTTP 200 with Student A data. Step 2 returns HTTP 403 Forbidden. Step 3 returns HTTP 403 Forbidden.
- **Actual Result:** As expected.
- **Status:** PASS

### TC-07: JWT Tampering & Expiration Invalidation
- **Requirement:** SEC-04
- **Severity:** Critical
- **Preconditions:** Valid JWT issued to user.
- **Test Steps:**
  1. Alter payload byte in JWT string and send to protected endpoint.
  2. Send expired JWT (> 30 minutes old).
- **Expected Result:** Both requests immediately rejected with HTTP 401 Unauthorized and `TOKEN_INVALID` / `TOKEN_EXPIRED` codes.
- **Actual Result:** As expected.
- **Status:** PASS

### TC-08: Parameterized Query Defense Against SQL Injection
- **Requirement:** SEC-06
- **Severity:** Critical
- **Preconditions:** Application running against PostgreSQL.
- **Test Steps:**
  1. Submit login payload with SQL injection: `admin' OR '1'='1`.
  2. Query student search endpoint with `roll_no="'; DROP TABLE students; --"`.
- **Expected Result:** Parameterized queries treat input purely as literal strings. Zero database syntax error, zero SQL execution, zero unauthorized login.
- **Actual Result:** As expected.
- **Status:** PASS

### TC-09: Audit Trail Immutability Verification
- **Requirement:** SEC-07, FR-16
- **Severity:** High
- **Preconditions:** Audit log entries exist.
- **Test Steps:**
  1. Attempt `PUT /api/v1/audit-logs/{id}` through API.
  2. Execute `DELETE FROM audit_logs` using application connection pool.
- **Expected Result:** Step 1 returns HTTP 405 Method Not Allowed / 404. Step 2 returns PostgreSQL permission denied error. Audit records remain intact.
- **Actual Result:** As expected.
- **Status:** PASS

### TC-10: System Latency, Reporting Throughput & Rate Limiting (Non-Functional)
- **Requirement:** NFR-01, NFR-02, SEC-09
- **Severity:** Medium
- **Preconditions:** JMeter test agent configured with 200 concurrent user threads.
- **Test Steps:**
  1. Execute 200 concurrent GET queries against `/api/v1/health` and `/api/v1/courses`.
  2. Request aggregated class report for 100 students.
  3. Burst 120 rapid requests from single IP in under 60 seconds.
- **Expected Result:** 95% of standard requests complete in < 2.0s. Class report generates in < 3.0s. Requests > 100 from same IP receive HTTP 429.
- **Actual Result:** As expected.
- **Status:** PASS

---

## 9. Approvals

| Role | Sign-off Name | Date | Status |
|---|---|---|---|
| **Quality Assurance Lead** | Nagashree R Patil | 28-09-2026 | Approved |
| **Security Engineering Lead**| Monika PM | 28-09-2026 | Approved |
| **Systems & Database Lead** | Kushita K | 28-09-2026 | Approved |
| **Frontend & UI Lead** | Nidhi L | 28-09-2026 | Approved |
