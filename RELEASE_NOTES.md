# EduTrack - Student Record System (v1.0.0 Release Freeze)

**Formal Release Version:** `v1.0.0`  
**Release Date:** 29th October 2026  
**Project Lead & QA Lead:** Nagashree R Patil ([@Nagashri2304](https://github.com/Nagashri2304))  
**Engineering Team:**
- **Nagashree R Patil** ([@Nagashri2304](https://github.com/Nagashri2304)) – Project Lead & QA Engineer (Attendance, Alerts, CI/CD Pipeline)
- **Monika PM** ([@Monikapm19](https://github.com/Monikapm19)) – Backend & Security Architect (Authentication, RBAC, Security Hardening)
- **Kushitha K** ([@Kushitha30](https://github.com/Kushitha30)) – Database Engineer & Systems Analyst (Student Management & Course Catalog)
- **Nidhi L** ([@nidhilokesh1](https://github.com/nidhilokesh1)) – Frontend UI/UX Engineer (Dashboards, Portals & Grade Cards)

---

## 🎯 Release Highlights & Executive Summary

The **EduTrack Student Record System v1.0.0** represents the complete production release of the university academic management platform. The system has completed both Sprint 1 and Sprint 2 deliverables, adhering to **IEEE Std 830-1998**, **IEEE Std 829-2008**, and **IEEE Std 1016-2009** standards.

### Key Capabilities Included in v1.0.0:
1. **Secure Multi-Role Authentication & Session Security (FR-01, SEC-01):**
   - JWT-based authentication with role-based claims (`Admin`, `Faculty`, `Student`, `Parent`).
   - Bcrypt cost factor $\ge 10$ password hashing.
   - Account lockout protection (15 minutes after 5 consecutive failed attempts).
2. **Student Lifecycle Management & Course Registry (FR-02, FR-03):**
   - Unique roll number (USN) enforcement with conflict detection.
   - Course catalog with credits, semester, and faculty instructor allocations.
   - Batch class roster enrollment.
3. **Daily Lecture Attendance & Session Engine (FR-04, FR-07):**
   - Batch session attendance marking (`present`, `absent`, `late`, `excused`).
   - 24-hour edit window enforcement for attendance session modifications.
   - Real-time attendance percentage engine with statutory **75.0% threshold alert system**.
   - Automated shortage warning dispatch (SMS/Email mock) with debarment risk assessment (`CRITICAL <65%`, `HIGH <75%`) and recovery deficit calculation.
4. **Subject Marks Entry, Automated Letter Grading & GPA Engine (FR-05, FR-06):**
   - Strict mark validation within `[0, 100]`.
   - Automated letter grade evaluation (`S, A, B, C, D, E, F`) and grade points (`10` down to `0`).
   - Mandatory amendment justification notes for mark revisions.
   - Credit-weighted Semester Grade Point Average (GPA) computation.
   - Append-only immutable security audit trail for all academic revisions.
5. **Zero-Trust Broken Object-Level Authorization (IDOR) Defense (SEC-08):**
   - Students strictly isolated to their own grades and attendance summaries.
   - Parents restricted exclusively to their linked child records.
6. **Automated Continuous Integration Pipeline (DEV-01, DEV-03):**
   - GitHub Actions CI workflow verifying documentation files, executing automated Jest test suites under Node.js 20, and running Vite production frontend build.

---

## 🧪 Quality Assurance & Test Verification Summary

All test suites execute with **100% assertions passing**:

| Test Suite | Module Domain | Verified Cases | Pass Rate |
|---|---|:---:|:---:|
| `backend/tests/auth.test.js` | Authentication & Password Security | 8 / 8 | 100% |
| `backend/tests/roleAuth.test.js` | RBAC Middleware & Token Verification | 10 / 10 | 100% |
| `backend/tests/student.test.js` | Student CRUD & IDOR Object Guards | 15 / 15 | 100% |
| `backend/tests/course.test.js` | Course Catalog & Roster Enrollment | 9 / 9 | 100% |
| `backend/tests/attendance.test.js` | Session Marking & 24h Edit Limit | 14 / 14 | 100% |
| `backend/tests/grade.test.js` | Marks Entry, GPA & Audit Logging | 12 / 12 | 100% |
| `backend/tests/attendanceAlerts.test.js` | Attendance Alerts & Notification Dispatch | 14 / 14 | 100% |
| `backend/tests/ieeeTestPlanVerification.test.js` | IEEE Std 829-2008 Test Cases (TC-01 to TC-10) | 10 / 10 | 100% |
| **Total Automated Tests** | **Full System Regression** | **92 / 92** | **100% PASS** |

---

## 📁 Formal Deliverables Index

- **SRS Specification:** [`docs/1_SRS_StudentRecordSystem.docx`](docs/1_SRS_StudentRecordSystem.docx) (IEEE Std 830-1998)
- **Software Test Plan:** [`docs/2_TestPlan_StudentRecordSystem.docx`](docs/2_TestPlan_StudentRecordSystem.docx) (IEEE Std 829-2008)
- **Architecture & Design:** [`docs/3_ArchitectureDesign_StudentRecordSystem.docx`](docs/3_ArchitectureDesign_StudentRecordSystem.docx) (IEEE Std 1016-2009)
- **UML Use Case Diagrams:** [`docs/use_case_diagram.drawio`](docs/use_case_diagram.drawio) / [`PNG`](docs/use_case_diagram.png)
- **Product Demonstration Script:** [`docs/DEMO_VIDEO_SCRIPT.md`](docs/DEMO_VIDEO_SCRIPT.md)

---

## 🔒 Release Sign-Off

Certified for **v1.0.0 Release Freeze** on 29th October 2026 by:
- **Nagashree R Patil** — Project Lead & QA Engineer ([@Nagashri2304](https://github.com/Nagashri2304))
