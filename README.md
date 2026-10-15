# EduTrack - Student Record System (SRS)

[![CI Pipeline](https://github.com/Nagashri2304/student-record-system/actions/workflows/ci.yml/badge.svg)](https://github.com/Nagashri2304/student-record-system/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-v5-black.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A web-based **Student Record System** for comprehensive management of student enrollment, daily lecture attendance, subject grades, and semester grade card downloads. Built with **React.js**, **Node.js/Express**, and a **Relational Database**.

---

## 👥 Engineering Team

| Team Member | Role | GitHub Profile | Primary Module Responsibility |
|---|---|---|---|
| **Nagashree R Patil** | Project Lead & Full-Stack Engineer | [@Nagashri2304](https://github.com/Nagashri2304) | Attendance Subsystem, 24-hr Edit Boundary, Test Automation & CI |
| **Monika PM** | Backend & Security Architect | [@Monikapm19](https://github.com/Monikapm19) | Auth Service, JWT Session Management, RBAC & Security Hardening |
| **Kushita K** | Database Engineer & Systems Analyst | [@Kushitha30](https://github.com/Kushitha30) | Student & Course Management, Relational Schema & Query Optimization |
| **Nidhi L** | Frontend UI/UX & Integration Engineer | [@nidhilokesh1](https://github.com/nidhilokesh1) | React SPA Layouts, Student & Parent Dashboards, PDF Grade Cards |

---

## 📁 Deliverables Part-1: IEEE Specifications

All Part-1 deliverables follow standard IEEE software engineering guidelines:

| Deliverable | IEEE Standard | Document Link | Description |
|---|---|---|---|
| **1. Software Requirements Specification** | IEEE Std 830-1998 | [docs/1_SRS_StudentRecordSystem.md](docs/1_SRS_StudentRecordSystem.md) | Functional (FR-01 to FR-15), Non-Functional (NFR-01 to NFR-08), Security & Mermaid UML Use Case Diagram |
| **2. Software Test Plan** | IEEE Std 829-2008 | [docs/2_TestPlan_StudentRecordSystem.md](docs/2_TestPlan_StudentRecordSystem.md) | Test Strategy, Section 5.1 Security Validation, Full Traceability Matrix & 10 Detailed Test Cases |
| **3. Architecture & Design Specification** | IEEE Std 1016-2009 | [docs/3_ArchitectureDesign_StudentRecordSystem.md](docs/3_ArchitectureDesign_StudentRecordSystem.md) | 3-Tier Architecture Pattern, Component Diagram, 3 UML Sequence Diagrams, REST API Design & ER Diagram |

---

## 🚀 Deliverables Part-2: Agile Sprints & Backlog (20 Issues)

The backlog contains **exactly 20 issues**, mapped to **Story Points** (Fibonacci: 1, 2, 3, 5) and organized across **Two Sprints**:

- **Sprint 1 [19th Oct to 23rd Oct 2026]**: Core Infrastructure, Authentication, Student/Course CRUD, Attendance Marking, Grade Entry, UI Foundation, CI Pipeline, Sprint 1 Demo.
- **Sprint 2 [26th Oct to 30th Oct 2026]**: Attendance Analytics & Alerts, PDF Grade Cards, Parent Portal, Grievance Workflow, Security Hardening, Test Plan Execution, Sprint 2 Demo & v1.0 Release Freeze.

### 📋 Backlog Overview

| Issue # | Title & Requirement | Sprint | SP | Assigned Team Member |
|---|---|:---:|:---:|---|
| **#1** | `[SP-5] FR-04: Daily Attendance Marking & Session Validation Engine` | Sprint 1 | 5 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#2** | `[SP-5] FR-05: Subject Marks Entry & Automatic GPA / Grade Evaluation` | Sprint 1 | 5 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#3** | `[SP-2] DEV-01: Continuous Integration Pipeline (GitHub Actions CI)` | Sprint 1 | 2 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#4** | `[SP-3] FR-07: Attendance Percentage Engine & Low Attendance Alert (<75%) System` | Sprint 2 | 3 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#5** | `[SP-3] DEV-03: Comprehensive Test Suite Execution & IEEE Test Plan Verification` | Sprint 2 | 3 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#6** | `[SP-1] DEV-05: Sprint 2 Demo Video, Final IEEE Deliverables & v1.0 Release Freeze` | Sprint 2 | 1 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#7** | `[SP-5] [Assignee: @Monikapm19] FR-01: Secure Authentication & Role-Based Access Control` | Sprint 1 | 5 | [@Monikapm19](https://github.com/Monikapm19) |
| **#8** | `[SP-5] [Assignee: @Kushitha30] FR-02: Student Profile Management & Enrollment Lifecycle (CRUD)` | Sprint 1 | 5 | [@Kushitha30](https://github.com/Kushitha30) |
| **#9** | `[SP-3] [Assignee: @Kushitha30] FR-03: Course & Faculty Assignment Catalog Management` | Sprint 1 | 3 | [@Kushitha30](https://github.com/Kushitha30) |
| **#10** | `[SP-5] [Assignee: @nidhilokesh1] UI-01: Responsive React Dashboard with Role-Based Navigation` | Sprint 1 | 5 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#11** | `[SP-3] [Assignee: @Monikapm19] SEC-01: JWT Session Security, Password Hashing & Lockout` | Sprint 1 | 3 | [@Monikapm19](https://github.com/Monikapm19) |
| **#12** | `[SP-3] [Assignee: @nidhilokesh1] FR-06: Student Self-Service Dashboard for Grades & Attendance` | Sprint 1 | 3 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#13** | `[SP-1] [Assignee: @nidhilokesh1] DEV-02: Sprint 1 Working Product Demo Video Recording` | Sprint 1 | 1 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#14** | `[SP-5] [Assignee: @nidhilokesh1] FR-08: Semester Grade Card Generation & PDF Export Service` | Sprint 2 | 5 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#15** | `[SP-3] [Assignee: @nidhilokesh1] FR-09: Parent Oversight Portal for Linked Student Progress` | Sprint 2 | 3 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#16** | `[SP-3] [Assignee: @Kushitha30] FR-10: Academic Discrepancy & Grade Grievance Resolution Workflow` | Sprint 2 | 3 | [@Kushitha30](https://github.com/Kushitha30) |
| **#17** | `[SP-3] [Assignee: @Monikapm19] SEC-02: Input Sanitization, Parameterized Queries & XSS/SQLi Defense` | Sprint 2 | 3 | [@Monikapm19](https://github.com/Monikapm19) |
| **#18** | `[SP-3] [Assignee: @Monikapm19] SEC-03: Immutable Security Audit Logging for Data Alterations` | Sprint 2 | 3 | [@Monikapm19](https://github.com/Monikapm19) |
| **#19** | `[SP-3] [Assignee: @Kushitha30] NFR-01: Database Indexing, Query Optimization & Performance` | Sprint 2 | 3 | [@Kushitha30](https://github.com/Kushitha30) |
| **#20** | `[SP-2] [Assignee: @Monikapm19] DEV-04: Document Architectural Decisions & Traceability` | Sprint 2 | 2 | [@Monikapm19](https://github.com/Monikapm19) |

---

## ⚙️ Running Locally

### Backend Setup
```bash
cd backend
npm install
npm test       # Run 41 automated unit & integration tests
npm run dev    # Start API server on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run build  # Validate production Vite bundle
npm run dev    # Start React SPA on http://localhost:5173
```
