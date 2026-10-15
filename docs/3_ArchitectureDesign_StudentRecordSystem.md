# Software Architecture & Design Specification (SAD)
## Student Record System (EduTrack)
**Mini-Project Deliverable Part-1**  
*Compliant with IEEE Std 1016-2009 (Software Design Descriptions) & ISO/IEC/IEEE 42010*

---

| **Document Information** | **Specification Details** |
|---|---|
| **Document Identifier** | SAD-EDU-2026-V1 |
| **Release Version** | 1.0.0 (Official Baseline) |
| **Date of Publication** | 15 October 2026 |
| **Governing SRS** | SRS-EDU-2026-V1 |
| **Engineering Team** | Student Record System Architecture Team |

### Team Members & Architectural Responsibilities
| Member | Role | Architectural Focus | GitHub Profile |
|---|---|---|---|
| **Nagashree R Patil** | Lead System Architect | Attendance Service, Session Boundary Enforcement & CI Pipeline | [@Nagashri2304](https://github.com/Nagashri2304) |
| **Monika PM** | Security Architect | JWT Session Architecture, Auth Service & RBAC Middleware | [@Monikapm19](https://github.com/Monikapm19) |
| **Kushita K** | Database Architect | Database Relational Modeling, Query Optimization & Course Catalog | [@Kushitha30](https://github.com/Kushitha30) |
| **Nidhi L** | Frontend Architect | React SPA Client Architecture, State Management & Report Cards | [@nidhilokesh1](https://github.com/nidhilokesh1) |

---

## PART A - ARCHITECTURE

## 1. Introduction

### 1.1 Purpose
This document establishes the architectural foundation and detailed software design specifications for the **Student Record System (EduTrack)**. It defines structural tiers, component responsibilities, data flow, API design, security boundaries, and relational schemas necessary to fulfill `SRS-EDU-2026-V1`.

### 1.2 Architectural Drivers
- **Modularity:** High cohesion within domain services (Attendance, Grades, Students, Courses) and loose coupling between presentation and persistence tiers.
- **Defense-in-Depth:** Centralized request validation, cryptographic token verification, and server-side RBAC before controllers execute.
- **Horizontal Scalability:** Stateless application servers with token-based session encapsulation.
- **Transactional Integrity:** ACID guarantees for multi-row student attendance and grading operations.

---

## 2. Architecture Pattern

EduTrack adheres to a **3-Tier Layered Client-Server Architecture**:

```mermaid
flowchart TD
    subgraph ClientTier ["Tier 1: Presentation Tier"]
        ReactApp["React 19 SPA (Vite)"]
        Dashboard["Role-Specific Dashboards (Admin, Faculty, Student, Parent)"]
        ReactApp --> Dashboard
    end

    subgraph ServerTier ["Tier 2: Application Tier (Node.js & Express)"]
        APIRouter["API Gateway & Route Dispatcher (/api/v1)"]
        
        subgraph SecurityPipeline ["Security Middleware Pipeline"]
            Helmet["Helmet & CORS Security Headers"]
            RateLimit["Rate Limiter (100 req/min)"]
            AuthMW["JWT Authentication Middleware"]
            RBACMW["Role-Based & Object-Level Access Control"]
        end

        subgraph ServiceSubsystems ["Domain Business Services"]
            AuthService["Auth & Session Service"]
            StudentService["Student Profile Service"]
            CourseService["Course Catalog & Faculty Service"]
            AttendanceService["Attendance & Percentage Service"]
            GradeService["Grade & Letter Evaluation Service"]
            ReportService["Report Card & PDF Service"]
            AuditService["Audit Log Service"]
        end

        ErrorHandler["Centralized Error Interceptor Middleware"]
    end

    subgraph DataTier ["Tier 3: Data Tier (Relational Storage)"]
        Database[("Relational Database (PostgreSQL / SQLite)")]
        AuditLogStore[("Append-Only Audit Logs")]
    end

    ClientTier -->|HTTPS / REST / JSON| APIRouter
    APIRouter --> Helmet --> RateLimit --> AuthMW --> RBACMW
    RBACMW --> ServiceSubsystems
    ServiceSubsystems --> ErrorHandler
    ServiceSubsystems -->|Parameterized SQL Queries| Database
    AuditService -->|Append-Only Writes| AuditLogStore
```

---

## 3. Component View and Description

### 3.1 Component Diagram
```mermaid
graph LR
    C1["C1: React Web Client"]
    C2["C2: Express API Gateway"]
    C3["C3: Security & Auth Middleware"]
    C4["C4: Student Profile Manager"]
    C5["C5: Course & Faculty Manager"]
    C6["C6: Attendance Tracking Subsystem"]
    C7["C7: Grade Calculation Subsystem"]
    C8["C8: Report Card & Export Engine"]
    C9["C9: Audit Logging Engine"]
    C10["C10: Relational Database"]

    C1 -->|REST Requests| C2
    C2 --> C3
    C3 --> C4 & C5 & C6 & C7 & C8 & C9
    C4 & C5 & C6 & C7 & C8 & C9 -->|SQL Connection Pool| C10
```

### 3.2 Component Responsibilities
| Component | Name | Core Responsibilities |
|---|---|---|
| **C1** | React Web Client | SPA views, authentication token storage, interactive attendance grid, grade views. |
| **C2** | Express API Gateway | Route mapping, TLS termination, payload serialization under `/api/v1/*`. |
| **C3** | Security Middleware | Token verification, role whitelist matching, brute-force lockout, rate limiting. |
| **C4** | Student Profile Manager | Student enrollment, soft-deletions, demographic data maintenance. |
| **C5** | Course & Faculty Manager| Course catalog definitions, instructor assignment mappings. |
| **C6** | Attendance Subsystem | Daily session attendance logging, 24-hr edit limit check, percentage formula. |
| **C7** | Grade Subsystem | Mark entry validation (0-100), automated letter grading, amendment justification. |
| **C8** | Report Card Engine | Cohort performance analytics and PDF grade card streaming. |
| **C9** | Audit Logging Engine | Immutable logging of all state mutations with timestamps and identities. |
| **C10**| Relational Database | ACID relational persistence, unique constraints, and foreign key cascades. |

---

## 4. Traceability to Requirements

| Requirement ID | Realizing Architecture Component | Design Mechanism |
|---|---|---|
| **FR-01, SEC-01** | C2, C3 (Auth Service) | Bcrypt password hashing, signed 30-min JWT issuance |
| **FR-02** | C4, C10 (Student Service) | Student table with UNIQUE roll_number constraint |
| **FR-03** | C5, C10 (Course Service) | Foreign key relationship linking courses to faculty users |
| **FR-04, FR-05** | C6, C10 (Attendance Service) | 24-hr timestamp validation, SQL attendance percentage math |
| **FR-06, FR-07** | C7, C9, C10 (Grade Service) | Boundary check [0, 100], automated letter grade mapping, audit reason |
| **FR-08, FR-09** | C1, C8 (Report Service) | Object-level auth check (`req.user.student_id == params.id`), PDFKit engine |
| **FR-10** | C1, C3, C10 | `parent_links` table verification |
| **FR-11** | C6, C8 | Event trigger on attendance update with percentage < 75% |
| **FR-13, SEC-04** | C9, C10 (Audit Engine) | Interceptor writing to append-only `audit_logs` |
| **NFR-01, NFR-03**| C2, C10 | Indexed query execution, connection pooling, sub-2.0s response |
| **SEC-02** | C3 (Security Middleware) | `roleAuth.js` middleware checking role claims on every route |

---

## 5. Security Architecture

### 5.1 Defense-in-Depth Model
1. **Perimeter Layer:** Rate limiting (100 req/min per IP) and Helmet HTTP security headers (CSP, HSTS).
2. **Access Control Layer:** JWT token authentication with 30-minute expiration; server-side RBAC denying unauthorized roles with HTTP 403.
3. **Application Layer:** Strict input validation and sanitization preventing XSS; parameterized queries preventing SQL injection.
4. **Data Layer:** Bcrypt password hashes with salt rounds >= 10; append-only audit trail with restricted database permissions.

### 5.2 STRIDE Threat Model
| Threat Category | Potential Attack Vector | Mitigating Design Control |
|---|---|---|
| **Spoofing** | Forged authentication token | Cryptographically signed HMAC-SHA256 JWT tokens. |
| **Tampering** | Unauthorized grade manipulation | Server-side role check; 24-hr edit lock; mandatory audit justification. |
| **Repudiation** | Denying an unauthorized attendance change | Non-repudiable audit logs recording user ID, IP address, and timestamp. |
| **Information Disclosure**| IDOR: Accessing other students' transcripts | Object-level authorization validating identity claims against requested IDs. |
| **Denial of Service** | Credential stuffing brute-force attack | Account lockout for 15 minutes after 5 consecutive failed attempts. |
| **Elevation of Privilege**| Student accessing admin endpoints | Strict server-side RBAC middleware rejecting unauthorized requests with HTTP 403. |

---

## PART B - DETAILED DESIGN

## 6. UML Sequence Diagrams

### 6.1 SD-1: User Authentication & JWT Issuance (FR-01, SEC-01)
```mermaid
sequenceDiagram
    autonumber
    actor Client as User (Browser)
    participant GW as API Gateway
    participant Auth as Auth Service
    participant DB as Relational Database

    Client->>GW: POST /api/v1/auth/login {email, password}
    GW->>Auth: authenticate(email, password)
    Auth->>DB: SELECT * FROM users WHERE email = $1
    DB-->>Auth: User record (password_hash, failed_attempts, locked_until)

    alt Account Locked (locked_until > NOW())
        Auth-->>Client: HTTP 423 Locked {error: "ACCOUNT_LOCKED"}
    else Invalid Password
        Auth->>DB: UPDATE users SET failed_attempts = failed_attempts + 1
        Auth-->>Client: HTTP 401 Unauthorized {error: "INVALID_CREDENTIALS"}
    else Valid Credentials
        Auth->>DB: UPDATE users SET failed_attempts = 0, locked_until = NULL
        Auth->>Auth: signJWT({id, role, email}, secret, {expiresIn: '30m'})
        Auth-->>Client: HTTP 200 OK {token, user: {id, role, name}}
    end
```

### 6.2 SD-2: Daily Attendance Logging & 24-Hour Edit Lock (FR-04, FR-05)
```mermaid
sequenceDiagram
    autonumber
    actor Instructor as Faculty Member
    participant Router as Attendance Router
    participant RBAC as Security Middleware
    participant Service as Attendance Service
    participant DB as Relational Database

    Instructor->>Router: POST /api/v1/courses/:id/attendance {date, records: [...]}
    Router->>RBAC: verifyToken() & requireRole('faculty')
    RBAC-->>Router: Authorized
    Router->>Service: logAttendance(courseId, facultyId, records)
    Service->>DB: Verify instructor assignment to course

    loop For each attendance record
        alt If editing past record
            Service->>DB: Check original marked_at timestamp
            alt (NOW() - marked_at) > 24 hours AND role != 'admin'
                Service-->>Instructor: HTTP 403 Forbidden {error: "EDIT_WINDOW_EXPIRED"}
            end
        end
        Service->>DB: INSERT / UPDATE attendance_records
    end

    Service->>DB: Compute updated cumulative attendance %
    DB-->>Service: Updated attendance statistics
    Service-->>Instructor: HTTP 201 Created {success: true, data: {summary}}
```

### 6.3 SD-3: Marks Entry, Letter Grade Evaluation & Grade Card (FR-06, FR-08, FR-09)
```mermaid
sequenceDiagram
    autonumber
    actor Faculty as Faculty Member
    actor Student as Student
    participant GradeRouter as Grade Router
    participant GradeService as Grade Service
    participant ReportRouter as Report Router
    participant DB as Relational Database

    Faculty->>GradeRouter: POST /api/v1/courses/:id/grades {enrolment_id, marks, reason}
    GradeRouter->>GradeService: submitGrade(enrolment_id, marks, reason)
    GradeService->>GradeService: validateMarks(0 <= marks <= 100)
    GradeService->>GradeService: computeLetterGrade(marks) -> 'A'
    GradeService->>DB: UPDATE grades SET marks = $1, letter_grade = $2, reason = $3
    GradeService-->>Faculty: HTTP 200 OK {marks: 88, grade: 'A'}

    Note over Student, ReportRouter: Student requests official grade card
    Student->>ReportRouter: GET /api/v1/students/:id/report-card
    ReportRouter->>ReportRouter: verifyObjectOwnership(req.user.id == id)
    ReportRouter->>DB: Fetch enrolled courses, final grades, attendance %
    DB-->>ReportRouter: Complete student academic record
    ReportRouter-->>Student: HTTP 200 OK (Content-Type: application/pdf)
```

---

## 7. REST API Design Specification

| Method | Endpoint | Authorization | Description | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Authenticates credentials and issues signed 30-min JWT. | 200, 400, 401, 423 |
| `POST` | `/api/v1/auth/logout` | Authenticated | Clears client session. | 200, 401 |
| `GET` | `/api/v1/students` | Admin, Faculty | Queries student enrollment directory with filters. | 200, 401, 403 |
| `POST` | `/api/v1/students` | Admin | Registers a new student record (unique roll number). | 201, 400, 409 |
| `GET` | `/api/v1/students/:id` | Admin, Student(self), Parent(linked) | Fetches complete student academic profile. | 200, 401, 403, 404 |
| `PUT` | `/api/v1/students/:id` | Admin | Updates student demographic details. | 200, 400, 404 |
| `DELETE`| `/api/v1/students/:id` | Admin | Soft-deletes student account (`is_active = false`). | 200, 404 |
| `GET` | `/api/v1/courses` | Authenticated | Lists courses assigned to user or whole catalog for Admin. | 200, 401 |
| `POST` | `/api/v1/courses` | Admin | Creates new semester course and assigns faculty. | 201, 400, 409 |
| `POST` | `/api/v1/courses/:id/attendance`| Faculty(assigned), Admin | Records or updates attendance session records. | 201, 400, 403 |
| `GET` | `/api/v1/courses/:id/attendance`| Faculty, Admin | Retrieves session attendance grid and percentages. | 200, 403 |
| `POST` | `/api/v1/courses/:id/grades` | Faculty(assigned), Admin | Enters marks (0-100) and computes letter grade. | 200, 400, 403 |
| `GET` | `/api/v1/students/:id/report-card`| Student(self), Parent, Admin | Streams generated PDF semester grade card. | 200, 403, 404 |
| `GET` | `/api/v1/reports/class/:courseId` | Faculty(assigned), Admin | Generates class summary report with CSV export. | 200, 403 |
| `POST` | `/api/v1/grievances` | Student | Submits academic evaluation grievance. | 201, 400 |
| `PATCH` | `/api/v1/grievances/:id` | Faculty, Admin | Updates grievance status and resolution text. | 200, 400, 403 |
| `GET` | `/api/v1/audit-logs` | Admin | Reads immutable system audit trail with filters. | 200, 403 |
| `GET` | `/api/v1/health` | Public | System liveness, database connection, and uptime check. | 200, 503 |

---

## 8. Database Design & Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| STUDENTS : "maps_to"
    USERS ||--o| FACULTY : "maps_to"
    USERS ||--o{ AUDIT_LOGS : "performed_by"
    FACULTY ||--o{ COURSES : "instructs"
    STUDENTS ||--o{ ENROLMENTS : "enrolls_in"
    COURSES ||--o{ ENROLMENTS : "contains"
    ENROLMENTS ||--o{ GRADES : "earns"
    ENROLMENTS ||--o{ ATTENDANCE_RECORDS : "records"
    STUDENTS ||--o{ GRIEVANCES : "submits"
    USERS ||--o{ PARENT_LINKS : "guardian"
    STUDENTS ||--o{ PARENT_LINKS : "dependent"

    USERS {
        int id PK
        string email UK
        string password_hash
        string role
        int failed_attempts
        timestamp locked_until
        timestamp created_at
    }

    STUDENTS {
        int id PK
        int user_id FK
        string roll_no UK
        string first_name
        string last_name
        date dob
        string department
        int semester
        boolean is_active
    }

    FACULTY {
        int id PK
        int user_id FK
        string employee_id UK
        string full_name
        string department
    }

    COURSES {
        int id PK
        string code UK
        string name
        int semester
        int faculty_id FK
    }

    ENROLMENTS {
        int id PK
        int student_id FK
        int course_id FK
    }

    GRADES {
        int id PK
        int enrolment_id FK
        decimal marks
        string letter_grade
        string reason
        timestamp updated_at
    }

    ATTENDANCE_RECORDS {
        int id PK
        int enrolment_id FK
        date session_date
        string status
        int marked_by FK
        timestamp marked_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string entity
        json old_value
        json new_value
        timestamp timestamp
    }
```
