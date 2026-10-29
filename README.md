# EduTrack - Student Record System

[![Deliverables CI](https://github.com/Nagashri2304/student-record-system/actions/workflows/ci.yml/badge.svg)](https://github.com/Nagashri2304/student-record-system/actions/workflows/ci.yml)
[![Release](https://img.shields.io/badge/Release-v1.0.0--freeze-blue.svg)](RELEASE_NOTES.md)
[![Tests](https://img.shields.io/badge/Tests-92%20Passing%20(100%25)-brightgreen.svg)](RELEASE_NOTES.md#-quality-assurance--test-verification-summary)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Software Engineering](https://img.shields.io/badge/Mini--Project-Deliverables%201%20%26%202-brightgreen.svg)](#-deliverables-part-1-ieee-specifications)

A web-based **Student Record System** for universities and institutions to track student enrollment records, lecture attendance, subject grades, and semester grade cards.

---

## 👥 Engineering Team & GitHub Profiles

| Team Member | Role | GitHub Profile | Module Domain |
|---|---|---|---|
| **Nagashree R Patil** | Project Lead & QA Engineer | [@Nagashri2304](https://github.com/Nagashri2304) | Attendance Subsystem & CI/CD Pipeline |
| **Monika PM** | Backend & Security Architect | [@Monikapm19](https://github.com/Monikapm19) | Authentication, RBAC & Security Hardening |
| **Kushita K** | Database Engineer & Systems Analyst | [@Kushitha30](https://github.com/Kushitha30) | Student Management & Course Catalog |
| **Nidhi L** | Frontend UI/UX Engineer | [@nidhilokesh1](https://github.com/nidhilokesh1) | Dashboards, Portals & Grade Card Engine |

---

## 📁 Deliverables Part-1: IEEE Specifications (Word Documents & draw.io)

All Part-1 specifications are provided as formal Word documents (`.docx`) and native draw.io diagram specifications maintained in `docs/`:

| Deliverable | Standard / Format | Document Link | Scope & Highlights |
|---|---|---|---|
| **1. Software Requirements Specification** | IEEE Std 830-1998 (`.docx`) | [docs/1_SRS_StudentRecordSystem.docx](docs/1_SRS_StudentRecordSystem.docx) | 15 Functional Requirements (FR-01 to FR-15), 8 Measurable NFRs, 4 Security Objectives & Embedded draw.io UML Use Case Diagram |
| **2. Software Test Plan** | IEEE Std 829-2008 (`.docx`) | [docs/2_TestPlan_StudentRecordSystem.docx](docs/2_TestPlan_StudentRecordSystem.docx) | Test Strategy, Section 5.1 Security Validation, Full Traceability Matrix & 10 Detailed Test Cases (TC-01 to TC-10) |
| **3. Architecture & Design Specification** | IEEE Std 1016-2009 (`.docx`) | [docs/3_ArchitectureDesign_StudentRecordSystem.docx](docs/3_ArchitectureDesign_StudentRecordSystem.docx) | 3-Tier Layered Pattern, Component Decomposition, 3 Sequence Workflows, REST API Specifications & 3NF ER Relational Schemas |
| **4. UML Use Case Diagram (draw.io)** | draw.io XML / PNG | [docs/use_case_diagram.drawio](docs/use_case_diagram.drawio) / [PNG](docs/use_case_diagram.png) | Native editable draw.io diagram covering Administrator, Faculty, Student, Parent actors & UC-01 to UC-12 |

---

## 🚀 Deliverables Part-2: Agile Sprints & Backlog (20 Issues)

The project backlog is organized into **exactly 20 issues** (maximum 20 issues as per requirements), assigned with **Fibonacci Story Points** (`[SP-1]` to `[SP-5]`), and planned across **Two Sprints**:

- **Sprint 1 [19th Oct to 23rd Oct 2026]**: Core Setup, Authentication, Student Profiles, Daily Attendance Marking, Grade Entry, UI Foundation, CI Pipeline.
- **Sprint 2 [26th Oct to 30th Oct 2026]**: Attendance Alerts (<75%), Semester Grade Cards (PDF), Parent Portal, Grievance Workflow, Security Hardening, Final Verification & Release Freeze.

### 📋 Sprint 1 Backlog [19th Oct to 23rd Oct 2026] (32 SP)
| Issue # | Title & Requirement | SP | Assigned Team Member |
|---|---|:---:|---|
| **#1** | `[SP-5] FR-04: Daily Attendance Marking & Session Validation Engine` | 5 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#2** | `[SP-5] FR-05: Subject Marks Entry & Automatic GPA / Grade Evaluation` | 5 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#3** | `[SP-2] DEV-01: Continuous Integration Pipeline (GitHub Actions CI)` | 2 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#7** | `[SP-5] [Assignee: @Monikapm19] FR-01: Secure Authentication & Role-Based Access Control` | 5 | [@Monikapm19](https://github.com/Monikapm19) |
| **#8** | `[SP-5] [Assignee: @Kushitha30] FR-02: Student Profile Management & Enrollment Lifecycle (CRUD)` | 5 | [@Kushitha30](https://github.com/Kushitha30) |
| **#9** | `[SP-3] [Assignee: @Kushitha30] FR-03: Course & Faculty Assignment Catalog Management` | 3 | [@Kushitha30](https://github.com/Kushitha30) |
| **#10** | `[SP-5] [Assignee: @nidhilokesh1] UI-01: Responsive React Dashboard with Role-Based Navigation` | 5 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#11** | `[SP-3] [Assignee: @Monikapm19] SEC-01: JWT Session Security, Password Hashing & Lockout` | 3 | [@Monikapm19](https://github.com/Monikapm19) |
| **#12** | `[SP-3] [Assignee: @nidhilokesh1] FR-06: Student Self-Service Dashboard for Grades & Attendance` | 3 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#13** | `[SP-1] [Assignee: @nidhilokesh1] DEV-02: Sprint 1 Working Product Demo Video Recording` | 1 | [@nidhilokesh1](https://github.com/nidhilokesh1) |

---

### 📋 Sprint 2 Backlog [26th Oct to 30th Oct 2026] (31 SP)
| Issue # | Title & Requirement | SP | Assigned Team Member | Status |
|---|---|:---:|---|:---:|
| **#4** | `[SP-3] FR-07: Attendance Percentage Engine & Low Attendance Alert (<75%) System` | 3 | [@Nagashri2304](https://github.com/Nagashri2304) | ✅ Done (14 Tests Passed) |
| **#5** | `[SP-3] DEV-03: Comprehensive Test Suite Execution & IEEE Test Plan Verification` | 3 | [@Nagashri2304](https://github.com/Nagashri2304) | ✅ Done (TC-01 to TC-10 Verified) |
| **#6** | `[SP-1] DEV-05: Sprint 2 Demo Video, Final IEEE Deliverables & v1.0 Release Freeze` | 1 | [@Nagashri2304](https://github.com/Nagashri2304) | ✅ Done (v1.0.0 Release Freeze) |
| **#14** | `[SP-5] [Assignee: @nidhilokesh1] FR-08: Semester Grade Card Generation & PDF Export Service` | 5 | [@nidhilokesh1](https://github.com/nidhilokesh1) | In Progress |
| **#15** | `[SP-3] [Assignee: @nidhilokesh1] FR-09: Parent Oversight Portal for Linked Student Progress` | 3 | [@nidhilokesh1](https://github.com/nidhilokesh1) | In Progress |
| **#16** | `[SP-3] [Assignee: @Kushitha30] FR-10: Academic Discrepancy & Grade Grievance Resolution Workflow` | 3 | [@Kushitha30](https://github.com/Kushitha30) | In Progress |
| **#17** | `[SP-3] [Assignee: @Monikapm19] SEC-02: Input Sanitization, Parameterized Queries & XSS/SQLi Defense` | 3 | [@Monikapm19](https://github.com/Monikapm19) | In Progress |
| **#18** | `[SP-3] [Assignee: @Monikapm19] SEC-03: Immutable Security Audit Logging for Data Alterations` | 3 | [@Monikapm19](https://github.com/Monikapm19) | In Progress |
| **#19** | `[SP-3] [Assignee: @Kushitha30] NFR-01: Database Indexing, Query Optimization & Performance` | 3 | [@Kushitha30](https://github.com/Kushitha30) | In Progress |
| **#20** | `[SP-2] [Assignee: @Monikapm19] DEV-04: Document Architectural Decisions & Traceability` | 2 | [@Monikapm19](https://github.com/Monikapm19) | In Progress |

---

## 📦 Version 1.0.0 Release Freeze & Deliverables Summary

EduTrack v1.0.0 is officially released and frozen under standard university quality benchmarks:

- 📄 **Official Release Notes:** [`RELEASE_NOTES.md`](RELEASE_NOTES.md) — Comprehensive release documentation, verified deliverable matrix, and formal QA sign-off.
- 📹 **Demo Video Presentation Script:** [`docs/DEMO_VIDEO_SCRIPT.md`](docs/DEMO_VIDEO_SCRIPT.md) — Complete 5–7 minute minute-by-minute walkthrough across all 7 core modules, actions, and narration.
- 🧪 **IEEE Test Plan Verification:** [`backend/tests/ieeeTestPlanVerification.test.js`](backend/tests/ieeeTestPlanVerification.test.js) — Formal verification of all 10 IEEE 829 test cases (TC-01 through TC-10).
- 🚨 **Attendance Shortage Alert Engine:** [`backend/src/routes/attendanceRoutes.js`](backend/src/routes/attendanceRoutes.js) — Statutory <75% attendance threshold monitoring and warning dispatch.

---

## 🛠️ Technology Stack Plan
- **Presentation Layer:** React.js Single Page Application (Vite).
- **Application Layer:** Node.js / Express RESTful API (`/api/v1/`).
- **Persistence Layer:** PostgreSQL / Relational Database with ACID transaction guarantees.
- **CI/CD:** GitHub Actions automated workflow for deliverables verification.
