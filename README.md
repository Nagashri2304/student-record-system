# Student Record System (SRS)

[![CI Pipeline](https://github.com/Nagashri2304/student-record-system/actions/workflows/ci.yml/badge.svg)](https://github.com/Nagashri2304/student-record-system/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v19-blue)](https://react.dev/)

A modern, web-based **Student Record System** for comprehensive management of student academic lifecycle, grades, and attendance tracking. Built with **React.js**, **Node.js/Express**, and **PostgreSQL**.

---

## 👥 Project Team (TEAM-E12)

| Team Member | SRN / USN | GitHub Profile | Primary Responsibilities |
|---|---|---|---|
| **Nagashree R Patil** | PES1UG24CS289 | [@Nagashri2304](https://github.com/Nagashri2304) | Attendance Subsystem, 24-hr Edit Boundary, Test Lead & CI Automation |
| **Monika PM** | PES1UG24CS275 | [@Monikapm19](https://github.com/Monikapm19) | Auth Service, JWT Session Management, RBAC Middleware & Security Hardening |
| **Kushita K** | PES1UG24CS247 | [@Kushitha30](https://github.com/Kushitha30) | Student & Course Management, Database Schema & Relational Integrity |
| **Nidhi L** | PES1UG24CS298 | [@nidhilokesh1](https://github.com/nidhilokesh1) | Frontend UI/UX, Student/Parent Dashboards, PDF Report Card Generation |

---

## 📁 Deliverables Part-1 (IEEE Format Documentation)

The official Software Engineering Mini-Project Part-1 deliverables are available in both Word (`.docx`) and native GitHub Markdown formats:

| Deliverable | Description | IEEE Standard | Markdown Link | Word DOCX Link |
|---|---|---|---|---|
| **Deliverable 1: SRS** | Software Requirements Specification | IEEE 830-1998 | [docs/1_SRS_StudentRecordSystem.md](docs/1_SRS_StudentRecordSystem.md) | [1_SRS_StudentRecordSystem.docx](1_SRS_StudentRecordSystem.docx) |
| **Deliverable 2: Test Plan** | Software Test Plan & Traceability | IEEE 829-2008 | [docs/2_TestPlan_StudentRecordSystem.md](docs/2_TestPlan_StudentRecordSystem.md) | [2_TestPlan_StudentRecordSystem.docx](2_TestPlan_StudentRecordSystem.docx) |
| **Deliverable 3: Architecture**| Software Architecture & Design Spec | IEEE 1016-2009 | [docs/3_ArchitectureDesign_StudentRecordSystem.md](docs/3_ArchitectureDesign_StudentRecordSystem.md) | [3_ArchitectureDesign_StudentRecordSystem.docx](3_ArchitectureDesign_StudentRecordSystem.docx) |

---

## 🚀 Deliverables Part-2: Agile Sprints & Backlog Planning

The project backlog is organized into two time-boxed Sprints with a strict **maximum limit of 20 issues** on GitHub, tracked using Story Points (Fibonacci scale: 1, 2, 3, 5, 8) and assigned across all 4 team members:

- **Sprint 1 [19th Oct to 23rd Oct 2026]**: Core Infrastructure, Authentication, Student/Course CRUD, Attendance Marking, Grade Entry, UI Foundation, CI Pipeline, Sprint 1 Demo.
- **Sprint 2 [26th Oct to 30th Oct 2026]**: Attendance Analytics & Alerts, PDF Report Cards, Parent Portal, Grievance Workflow, Security Hardening, Test Plan Execution, Sprint 2 Demo & v1.0 Release Freeze.

### 📋 Backlog Summary (20 Issues)

| Issue # | Title & Requirement | Sprint | Story Points | Assignee |
|---|---|---|---|---|
| **#1** | `[SP-5] FR-01 & SEC-04: User Authentication & Secure JWT Session Management` | Sprint 1 | 5 | [@Monikapm19](https://github.com/Monikapm19) |
| **#2** | `[SP-5] FR-02 & FR-03: Student Record Management & Profile Lifecycle` | Sprint 1 | 5 | [@Kushitha30](https://github.com/Kushitha30) |
| **#3** | `[SP-3] FR-04 & FR-05: Faculty Accounts & Course Assignment Management` | Sprint 1 | 3 | [@Kushitha30](https://github.com/Kushitha30) |
| **#4** | `[SP-5] FR-08: Faculty Attendance Marking & 24-Hour Edit Window` | Sprint 1 | 5 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#5** | `[SP-5] FR-06 & FR-07: Marks Entry, Letter Grade Computation & Edit Audit` | Sprint 1 | 5 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#6** | `[SP-5] UI-01: Responsive Frontend Layout, Login & Role-Based Navigation` | Sprint 1 | 5 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#7** | `[SP-3] SEC-02: Server-Side Role-Based Access Control (RBAC) Middleware` | Sprint 1 | 3 | [@Monikapm19](https://github.com/Monikapm19) |
| **#8** | `[SP-2] DEV-01: GitHub Actions CI Pipeline for Testing and Verification` | Sprint 1 | 2 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#9** | `[SP-3] FR-10: Student Portal for Viewing Own Grades and Attendance` | Sprint 1 | 3 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#10** | `[SP-1] DEV-05: Record and Upload Sprint 1 Working Product Demo Video` | Sprint 1 | 1 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#11** | `[SP-3] FR-09 & FR-13: Attendance Percentage Calculation & Low Attendance Alerts` | Sprint 2 | 3 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#12** | `[SP-5] FR-11 & FR-14: Class & Student Report Generation and PDF Report Card Export` | Sprint 2 | 5 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#13** | `[SP-3] FR-12: Parent Portal for Viewing Linked Student Progress` | Sprint 2 | 3 | [@nidhilokesh1](https://github.com/nidhilokesh1) |
| **#14** | `[SP-3] FR-15: Student Grievance Submission and Resolution Workflow` | Sprint 2 | 3 | [@Kushitha30](https://github.com/Kushitha30) |
| **#15** | `[SP-3] SEC-01 & SEC-06: Password Hashing, Input Sanitization & SQLi/XSS Prevention` | Sprint 2 | 3 | [@Monikapm19](https://github.com/Monikapm19) |
| **#16** | `[SP-3] SEC-07 & FR-16: Append-Only Security Audit Logging and Retention` | Sprint 2 | 3 | [@Monikapm19](https://github.com/Monikapm19) |
| **#17** | `[SP-3] NFR-01 & NFR-02: Database Query Optimization & Sub-3s Report Performance` | Sprint 2 | 3 | [@Kushitha30](https://github.com/Kushitha30) |
| **#18** | `[SP-3] DEV-02: Execute Test Plan Test Cases and Security Validation` | Sprint 2 | 3 | [@Nagashri2304](https://github.com/Nagashri2304) |
| **#19** | `[SP-2] DEV-07: Document Deviations from SRS, SAD, and Test Plan` | Sprint 2 | 2 | [@Monikapm19](https://github.com/Monikapm19) |
| **#20** | `[SP-1] DEV-06 & DEV-08: Sprint 2 Demo Video, Final Docs & v1.0 Release Freeze` | Sprint 2 | 1 | [@Nagashri2304](https://github.com/Nagashri2304) |

---

## 🏗️ Architecture Overview

The application follows a **3-Tier Layered Architecture**:
1. **Frontend Tier (React + Vite):** Role-tailored dashboards (Admin, Faculty, Student, Parent) communicating with the backend via a centralized API client (`client.js`).
2. **Backend Tier (Node.js + Express):** REST API under `/api/v1/` featuring rate limiting, CORS/Helmet protection, bcrypt password hashing, and role-based access control middleware.
3. **Database Tier (PostgreSQL):** Relational schema enforcing foreign key cascades, unique constraints, and transaction safety (`BEGIN...COMMIT`).

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
- **Node.js** (>= v20 LTS) and **npm** (>= v10)
- **PostgreSQL** (>= v14) or compatible database
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/Nagashri2304/student-record-system.git
cd student-record-system
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure database connection parameters and a secure `JWT_SECRET` are configured.

### 4. Database Initialization
From the `backend` directory:
```bash
cd backend
npm install
npm run db:reset
```
*Loads `db/schema.sql` and `db/seed.sql` with default users and test records.*

### 5. Running the Backend API
```bash
cd backend
npm run dev
```
- Server starts at `http://localhost:5000`
- Health check: `http://localhost:5000/api/v1/health`

### 6. Running the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
- Frontend starts at `http://localhost:5173`

---

## 🧪 Testing & Quality Assurance

### Run Backend Unit & Integration Tests
```bash
cd backend
npm test
```
*Runs Jest automated tests verifying authentication, role-based access control, attendance boundaries, and 24-hr edit windows.*

### Lint and Build Frontend
```bash
cd frontend
npm run lint
npm run build
```

---

## 📜 Development Workflow & Branching
1. Branch naming: `feature/<ISSUE-ID>-<short-description>`
2. All pull requests must pass the GitHub Actions CI pipeline before merging.
3. Code reviews must be performed by assigned peers prior to merge into `main`.
