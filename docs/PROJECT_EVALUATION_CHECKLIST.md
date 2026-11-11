# Project Evaluation Checklist & Deliverables Audit Matrix
## EduTrack - Student Record System (v1.0.0 Production Release)

**Evaluation Target:** Software Engineering Mini-Project  
**Repository:** [https://github.com/Nagashri2304/student-record-system](https://github.com/Nagashri2304/student-record-system)  
**Project Lead & QA Lead:** Nagashree R Patil ([@Nagashri2304](https://github.com/Nagashri2304))  
**Backend & Security Architect:** Monika PM ([@Monikapm19](https://github.com/Monikapm19))  
**Database Engineer & Systems Analyst:** Kushitha K ([@Kushitha30](https://github.com/Kushitha30))  
**Frontend UI/UX Engineer:** Nidhi L ([@nidhilokesh1](https://github.com/nidhilokesh1))  
**Audit Completion Date:** 11th November 2026

---

## Part-1: Requirements & Design Documents

### ● Software Requirements Specification (SRS)
- [x] **Document is in standard IEEE format:** [`docs/1_SRS_StudentRecordSystem.docx`](docs/1_SRS_StudentRecordSystem.docx) (Complies with IEEE Std 830-1998 format).
- [x] **Contains introductory and descriptive sections:** Purpose, Scope, Definitions, References, Overall Description, Product Perspective, Product Functions, User Characteristics, Assumptions & Dependencies.
- [x] **Includes both Functional Requirements (FRs) and Non-Functional Requirements (NFRs) specified clearly and measurably:**
  - 15 Functional Requirements (FR-01 through FR-15) covering multi-role auth, student profile CRUD, course catalog, attendance marking, subject grading & GPA, student portal, attendance alert engine (<75%), report card PDF export, parent portal, grievance resolution, etc.
  - 8 Non-Functional Requirements (NFR-01 through NFR-08) with precise measurable bounds (NFR-01: API latency $< 200\text{ms}$; NFR-02: Grade card generation $\le 1.0\text{s}$; NFR-03: Availability $99.9\%$).
- [x] **Contains at least 1 UML Use Case Diagram:** [`docs/use_case_diagram.drawio`](docs/use_case_diagram.drawio) & [`docs/use_case_diagram.png`](docs/use_case_diagram.png) covering Administrator, Faculty, Student, and Parent actors.
- [x] **Security section includes at least 2 objectives and 2 requirements:**
  - Security Objectives: Confidentiality & Zero IDOR data leakage; Non-repudiation & data alteration immutability.
  - Security Requirements: SEC-01 (Bcrypt salt $\ge 10$ + 5-attempt lockout); SEC-02 (Input sanitization & parameterized queries); SEC-03 (Append-only immutable audit trail); SEC-08 (Object-level authorization).

### ● Test Plan Document
- [x] **Document is in standard IEEE format:** [`docs/2_TestPlan_StudentRecordSystem.docx`](docs/2_TestPlan_StudentRecordSystem.docx) & [`docs/2_TestPlan_StudentRecordSystem.md`](docs/2_TestPlan_StudentRecordSystem.md) (Complies with IEEE Std 829-2008).
- [x] **Sections 3, 4, and 5 are completely filled:**
  - Section 3: Test Items, Scope & Environment (Isolated PostgreSQL fixtures, Jest v29, Node.js 20, Oxlint, Vite).
  - Section 4: Approach & Test Strategy (Unit, Integration, Security Validation, Performance SLAs).
  - Section 5: Detailed Test Cases & Execution Matrix (14 test suites, 143 test cases).
- [x] **Section 5.1 is dedicated to security validation:** Section 5.1 explicitly validates IDOR prevention (SEC-VAL-01, SEC-VAL-02), authentication bypass (SEC-VAL-03), brute force lockout (SEC-VAL-04), SQL injection (SEC-VAL-05), XSS defense (SEC-VAL-06), and audit immutability (SEC-VAL-07).
- [x] **Establishes clear traceability back to the SRS:** Section 6 contains the complete Traceability Matrix mapping FR-01 through FR-10, SEC-01 to SEC-08, and NFR-01 to NFR-02 directly to test cases.
- [x] **Contains 7 to 10 minimum test cases covering both FRs and NFRs:** Contains 14 detailed test cases (TC-01 through TC-14), formally verified in [`backend/tests/ieeeTestPlanVerification.test.js`](backend/tests/ieeeTestPlanVerification.test.js).

### ● Software Architecture & Design (SAD) Specification
- [x] **Document is in standard IEEE format:** [`docs/3_ArchitectureDesign_StudentRecordSystem.docx`](docs/3_ArchitectureDesign_StudentRecordSystem.docx) & [`docs/3_ArchitectureDesign_StudentRecordSystem.md`](docs/3_ArchitectureDesign_StudentRecordSystem.md) (Complies with IEEE Std 1016-2009).
- [x] **Architecture includes component diagrams/descriptions, architectural pattern, traceability, and security architecture:**
  - Pattern: 3-Tier Layered Pattern (Presentation, Application, Persistence).
  - Component Decomposition: C1 through C10 (AuthController, StudentController, AttendanceController, GradeController, ReportCardController, GrievanceController, ParentController, AuditController, PerformanceBenchmark, DatabasePool).
  - Security Architecture: Defense-in-depth STRIDE matrix, token interception, and SQL trigger immutability.
- [x] **Design section includes at least 2 UML sequence diagrams, API design, and error handling protocols:**
  - Sequence Diagram 1: Multi-Role Authentication & Session Token Lifecycle.
  - Sequence Diagram 2: Daily Attendance Marking, 24h Edit Window & Shortage Alert (<75%) Dispatch.
  - Sequence Diagram 3: Semester Grade Evaluation & PDF Report Card Compilation.
  - API Design: Complete REST API catalog with HTTP verbs, path variables, request schemas, and responses.
  - Error Handling Protocols: Standardized JSON error response envelope (`{ success: false, message: ... }`) with status codes 400, 401, 403, 404, 405, 409, 423, 500.

---

## Part-2: Agile Planning & Repository Setup

### ● GitHub Backlog & Project Management
- [x] **GitHub Project created and successfully linked to the mini-project repository:** [EduTrack Project Board #1](https://github.com/users/Nagashri2304/projects/1/views/1).
- [x] **Backlog items successfully created using FRs and NFRs from the SRS:** Exactly 20 backlog issues created (Issue #1 to Issue #20).
- [x] **Story Points assigned to all backlog items:** Fibonacci estimation used throughout (`[SP-1]`, `[SP-2]`, `[SP-3]`, `[SP-5]`).
- [x] **User stories appropriately assigned to individual team members:**
  - Nagashree R Patil (@Nagashri2304): Issues #1, #2, #3, #4, #5, #6 (19 SP).
  - Monika PM (@Monikapm19): Issues #7, #11, #17, #18, #20 (16 SP).
  - Kushitha K (@Kushitha30): Issues #8, #9, #16, #19 (14 SP).
  - Nidhi L (@nidhilokesh1): Issues #10, #12, #13, #14, #15 (14 SP).
- [x] **Sprint 1 and Sprint 2 clearly planned in the project board:**
  - Sprint 1 (32 SP): Issues #1, #2, #3, #7, #8, #9, #10, #11, #12, #13.
  - Sprint 2 (31 SP): Issues #4, #5, #6, #14, #15, #16, #17, #18, #19, #20.

### >> Sprint 1 Execution
- [x] **GitHub Actions enabled for automated PRs and commits:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) configured with automatic execution on push/PR for doc checks, Jest backend test suite, and Vite build.
- [x] **Code implemented using approved methods matching SRS/SAD constraints:** Express REST API, React SPA with Vite, PostgreSQL relational tables with ACID compliance.
- [x] **Pull Requests (PRs) raised by the specifically assigned team member:**
  - Nidhi: PR #22 & PR #24 (`feature/nidhi-sprint1-ui-fr06`)
  - Kushitha: PR #23 & PR #25 (`feat/student-and-course-catalog`)
  - Monika: PR #21 (`feat/auth-and-rbac`)
  - Nagashree: PR #25 (`feature/FR-04-attendance-validation`)
- [x] **PRs formally reviewed and committed by the repository owner:** All PRs reviewed with formal comments and merged into `main`.
- [x] **Sprint 1 Deliverables:** 1-minute video demonstrating a working product recorded, accepted, and documented in [`README.md`](README.md).

### >> Sprint 2 Execution
- [x] **Sprint 2 development activities completed and development cycle officially frozen:**
  - Nidhi: PR #29 & PR #30 (`feat/sprint2-pdf-gradecard-parent-portal`)
  - Kushitha: PR #26 (`feature/FR-10-grievance-workflow`) & PR #28 (`feat/nfr01-indexing-query-optimization`)
  - Monika: PR #27 (`feat/sprint2-security-audit-and-docs`)
  - Nagashree: PR #31 (`feature/FR-07-attendance-alerts`), PR #32 (`feature/DEV-03-comprehensive-ieee-tests`), PR #33 (`feature/DEV-05-v1.0-release-freeze`)
- [x] **Any deviations from initial SAD/SRS documents formally documented for the demo:** Documented in [`RELEASE_NOTES.md`](RELEASE_NOTES.md) and [`docs/5_SystemValidationReport.md`](docs/5_SystemValidationReport.md).
- [x] **All remaining project documentation finalized:** Official release freeze at `v1.0.0`.
- [x] **Sprint 2 Deliverables:** 2-minute / 5-minute product demonstration video script documented in [`docs/DEMO_VIDEO_SCRIPT.md`](docs/DEMO_VIDEO_SCRIPT.md) and linked in [`README.md`](README.md).

---

## Part-3: Testing & Quality Assurance

- [x] **1. Test Cases Updation:**
  - Original test cases (TC-01 through TC-10) updated to reflect sprint changes.
  - Test Plan Document updated accordingly: [`docs/2_TestPlan_StudentRecordSystem.md`](docs/2_TestPlan_StudentRecordSystem.md).
- [x] **2. Testing [2nd Nov to 6th Nov]:**
  - All testing completed according to the Test Plan (14 test suites, 143 test cases).
  - All 4 Test Reports generated and uploaded to the `docs/` folder in the project repository:
    - [x] **i. Unit Test Report:** [`docs/4_UnitTestReport.md`](docs/4_UnitTestReport.md) (143/143 tests passing, 100% green).
    - [x] **ii. System Validation Report:** [`docs/5_SystemValidationReport.md`](docs/5_SystemValidationReport.md) (End-to-end multi-role persona validation).
    - [x] **iii. Code Coverage Report:** [`docs/6_CodeCoverageReport.md`](docs/6_CodeCoverageReport.md) (Full Istanbul/V8 statement, function, and line coverage breakdown).
    - [x] **iv. Branch Coverage Report:** [`docs/7_BranchCoverageReport.md`](docs/7_BranchCoverageReport.md) (Detailed boolean and decision branch analysis).
- [x] **3. Optional Sprint-3:**
  - Zero development spill-over: all planned deliverables completed within Sprint 1 & Sprint 2; Testing phase (2nd Nov to 6th Nov) dedicated to report generation and QA sign-off.

---

## Part-4: Final Evaluation & Viva Preparation Guide

### Final Demo Readiness
- [x] **The application functions as designed and successfully fulfills the outlined core use cases:**
  - Admin: User onboarding, course allocation, audit inspection.
  - Faculty: Lecture attendance marking with 24h limit, mark entry, attendance alert dispatch (<75%), grievance resolution.
  - Student: Live CGPA badge, subject attendance summary, PDF report card export, grievance submission.
  - Parent: Child academic progress overview, attendance breakdown, report card download.
- [x] **The team clearly explains any permitted deviations from the original design documents:**
  - Addition of `excused` attendance status for medical leaves.
  - Real-time deficit session calculation in <75% attendance alerts.
  - 7 composite B-Tree indexes for sub-200ms query latency.
- [x] **The codebase is accessible, readable, and properly managed through version control:**
  - Monorepo structure (`backend/`, `frontend/`, `docs/`).
  - Clear branch naming conventions (`feature/...`, `feat/...`).
  - Semantic commit messages linked to issue numbers (`closes #...`).

### Viva / Oral Examination Cheatsheet by Team Member
1. **Nagashree R Patil (@Nagashri2304) — Project Lead & QA Engineer:**
   - *Key Focus:* Project management, CI/CD pipeline, attendance subsystem (FR-04), 24h edit window, statutory attendance alert engine (<75% threshold, FR-07), IEEE Std 829 test plan execution (DEV-03), and v1.0.0 release freeze (DEV-05).
   - *PRs:* PR #25, PR #31, PR #32, PR #33.
2. **Monika PM (@Monikapm19) — Backend & Security Architect:**
   - *Key Focus:* Authentication engine (FR-01, SEC-01), bcrypt password hashing ($\ge 10$), account lockout mechanism (5 failed attempts $\rightarrow$ 15m lockout), deep input sanitization (SEC-02, XSS/SQLi defense), append-only immutable security audit logging (SEC-03), and IEEE Std 1016 architectural design specification (DEV-04).
   - *PRs:* PR #21, PR #27.
3. **Kushitha K (@Kushitha30) — Database Engineer & Systems Analyst:**
   - *Key Focus:* Student profile CRUD & USN uniqueness (FR-02), course catalog & faculty allocation (FR-03), academic discrepancy & grievance resolution workflow (FR-10), and database indexing & query performance optimization (NFR-01).
   - *PRs:* PR #23, PR #26, PR #28.
4. **Nidhi L (@nidhilokesh1) — Frontend UI/UX Engineer:**
   - *Key Focus:* Responsive React single page application with role-based routing (UI-01), student self-service dashboard (FR-06), semester grade card PDF export service (FR-08), parent oversight portal (FR-09), and Sprint 1 demo video (DEV-02).
   - *PRs:* PR #22, PR #24, PR #29, PR #30.
