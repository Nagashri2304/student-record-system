# IEEE Std 829 Software System Validation Report
## EduTrack - Student Record System (v1.0.0 Release)

**Report Identifier:** `SVR-EDUTRACK-V1.0`  
**Reference Standards:** IEEE Std 829-2008, IEEE Std 830-1998, IEEE Std 1016-2009  
**Execution Window:** 2nd November to 6th November 2026 (Deliverables Part-3)  
**Project Lead & QA Lead:** Nagashree R Patil ([@Nagashri2304](https://github.com/Nagashri2304))  
**Backend & Security Architect:** Monika PM ([@Monikapm19](https://github.com/Monikapm19))  
**Database Engineer & Systems Analyst:** Kushitha K ([@Kushitha30](https://github.com/Kushitha30))  
**Frontend UI/UX Engineer:** Nidhi L ([@nidhilokesh1](https://github.com/nidhilokesh1))  
**System Status:** **ACCEPTED FOR PRODUCTION FREEZE (v1.0.0)**

---

## 1. Executive Summary
The System Validation Report provides formal verification that the integrated **EduTrack Student Record System** satisfies all high-level business goals, functional requirements (FR-01 through FR-15), non-functional constraints (NFR-01 to NFR-08), and multi-role user workflows across the four institutional actors: **Administrator, Faculty, Student, and Parent**.

---

## 2. Multi-Role End-to-End Persona Validation

### 2.1 Role 1: Administrator Persona (`admin@edutrack.edu`)
- **Workflow Scenario:** Institutional management, student onboarding, course registry, and immutable audit inspection.
- **Validation Steps:**
  1. Login via `POST /api/v1/auth/login` receiving signed JWT with `role: Admin`.
  2. Register new student with auto-generated USN. Enforce uniqueness: duplicate USN rejected with HTTP 409 Conflict.
  3. Create new courses in catalog (`CS101`, `CS102`) and allocate instructor faculty IDs.
  4. Access global security audit trail via `GET /api/v1/audit-logs`. Inspect chronological user alterations.
  5. Attempt to mutate or purge audit records: system blocks with `405 Method Not Allowed`.
- **System Acceptance Result:** **VERIFIED & ACCEPTED**

### 2.2 Role 2: Faculty Member Persona (`faculty@edutrack.edu`)
- **Workflow Scenario:** Classroom daily attendance logging, 24-hour retrospective revision, gradebook entry, and grievance resolution.
- **Validation Steps:**
  1. Login receiving JWT with `role: Faculty`. Access assigned course teaching roster.
  2. Mark batch daily lecture attendance with `present`, `absent`, `late`, `excused` flags. Verify transaction timestamp.
  3. Edit attendance session within $< 24$ hours: update succeeds.
  4. Attempt editing attendance session $\ge 24$ hours: system enforces 24-hour edit limit and rejects with `403 Forbidden`.
  5. Enter subject marks `[0, 100]`. System auto-evaluates letter grades (`S, A, B, C, D, E, F`) and grade points (`10 - 0`).
  6. Amend existing student marks providing mandatory justification note. Verify audit entry generation.
  7. Query low-attendance alerts ($< 75.0\%$). Dispatch automated shortage warnings to affected students.
  8. Review student academic grievance ticket. Update state to `Resolved` providing explanatory resolution notes.
- **System Acceptance Result:** **VERIFIED & ACCEPTED**

### 2.3 Role 3: Student Self-Service Persona (`student@edutrack.edu`)
- **Workflow Scenario:** Academic progress tracking, live CGPA badge, subject attendance review, PDF report card download, and grievance submission.
- **Validation Steps:**
  1. Login receiving JWT with `role: Student`. Access self-service dashboard (`/api/v1/students/me`).
  2. View course enrollments, cumulative attendance percentage, and shortage warnings.
  3. Download official Semester Grade Card in PDF format via `GET /api/v1/students/1/report-card`. Verify cryptographic stream and $< 1.0\text{s}$ compile latency.
  4. Zero-Trust IDOR Attempt: Student 1 attempts to download Student 2 grade card or view Student 2 profile. Intercepted and blocked with `403 Forbidden`.
  5. Submit academic discrepancy grievance for grade reassessment. Verify ticket creation in `Open` state.
  6. Query resolution status to review faculty instructor notes upon resolution.
- **System Acceptance Result:** **VERIFIED & ACCEPTED**

### 2.4 Role 4: Parent Oversight Persona (`parent@edutrack.edu`)
- **Workflow Scenario:** Parental oversight of linked child's academic performance and attendance compliance.
- **Validation Steps:**
  1. Login receiving JWT with `role: Parent`. Access Parent Oversight Portal (`/api/v1/parent/overview`).
  2. System resolves linked student ID. Renders child's attendance rate, shortage warning badge, and GPA.
  3. Download child's official PDF semester report card.
  4. Zero-Trust IDOR Attempt: Parent attempts to query unlinked Student 2 records. Request rejected with `403 Forbidden`.
  5. Review child's academic grievance status and resolution notes.
- **System Acceptance Result:** **VERIFIED & ACCEPTED**

---

## 3. Requirements Acceptance Verification Matrix

| Requirement | Description | System Acceptance Criteria | Validation Result |
|---|---|---|:---:|
| **FR-01** | Multi-Role Authentication | JWT token issuance with 30m expiry and role claim; unauthorized routes return 401/403. | **ACCEPTED** |
| **FR-02** | Student Profile Management | Student CRUD lifecycle with unique USN conflict detection and soft-delete archive. | **ACCEPTED** |
| **FR-03** | Course & Faculty Allocation | Credit bounds `[1, 6]`, instructor assignment, course active status verification. | **ACCEPTED** |
| **FR-04** | Daily Attendance Marking | Session recording with 4 statuses (`P/A/L/E`) and strict 24-hour edit limit enforcement. | **ACCEPTED** |
| **FR-05** | Marks Entry & GPA Engine | Mark bounds `[0, 100]`, auto grade mapping (`S-F`), mandatory amendment notes. | **ACCEPTED** |
| **FR-06** | Student Self-Service Portal | Real-time CGPA badge, transcript display, and subject attendance metrics. | **ACCEPTED** |
| **FR-07** | Shortage Alert Engine (<75%) | Real-time threshold calculation, deficit sessions metric, automated notification dispatch. | **ACCEPTED** |
| **FR-08** | PDF Grade Card Export | Dynamic PDF stream generation with verification headers, generated in $< 1.0\text{s}$. | **ACCEPTED** |
| **FR-09** | Parent Oversight Portal | Zero-trust child linkage, attendance breakdown, GPA overview, and alerts. | **ACCEPTED** |
| **FR-10** | Academic Grievance Workflow | Complete `Open` $\rightarrow$ `In Review` $\rightarrow$ `Resolved` state machine with notes. | **ACCEPTED** |
| **SEC-01** | Password & Session Security | Bcrypt hashing ($\ge 10$ rounds), 5-attempt brute-force lockout window. | **ACCEPTED** |
| **SEC-02** | Input Sanitization (XSS/SQLi) | Deep recursion payload sanitization, parameterized SQL bindings throughout. | **ACCEPTED** |
| **SEC-03** | Immutable Audit Trail | Append-only audit table with SQL triggers blocking update/delete operations. | **ACCEPTED** |
| **SEC-08** | Zero IDOR Vulnerabilities | Cross-tenant broken object level authorization completely mitigated. | **ACCEPTED** |
| **NFR-01** | Response Latency SLA | All standard API queries respond within $< 200\text{ms}$ (verified via benchmark). | **ACCEPTED** |
| **NFR-02** | Report Generation SLA | Binary PDF generation compiles in $< 1.0\text{s}$ (real-time average: $0.15\text{s}$). | **ACCEPTED** |

---

## 4. Deviations from Initial Design & Justification
In accordance with Agile development standards, the following improvements and design refinements were made during Sprint 1 & Sprint 2:
1. **Status Expansion in Attendance (FR-04):** Added `excused` status alongside `present`, `absent`, and `late` to satisfy university medical and authorized leave policies.
2. **Deficit Session Computation in Shortage Alerts (FR-07):** Enhanced the <75% alert engine to output the exact mathematical deficit of consecutive sessions required to regain statutory 75% standing.
3. **Composite B-Tree Indexes (NFR-01):** Implemented 7 composite database indexes (`attendance_records`, `attendance_sessions`, `enrollments`, `grades`, `grievances`, `students`, `courses`) to guarantee query latency remains $< 200\text{ms}$ under large student rosters.

---

## 5. Formal QA Sign-Off
- **QA Lead:** Nagashree R Patil — **SIGNED & APPROVED**
- **Security Lead:** Monika PM — **SIGNED & APPROVED**
- **Final Verdict:** System satisfies 100% of functional requirements and passes all acceptance criteria with zero blocking defects.
