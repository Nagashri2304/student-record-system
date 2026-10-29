# EduTrack - Sprint 2 Final Product Demonstration Script

**Document Code:** `DOC-DEMO-V1.0`  
**Deliverable:** Issue #6 `[SP-1] DEV-05: Sprint 2 Demo Video, Final IEEE Deliverables & v1.0 Release Freeze`  
**Target Video Duration:** 5 to 7 Minutes  
**Project Lead & Presenter:** Nagashree R Patil ([@Nagashri2304](https://github.com/Nagashri2304))  
**Team Members:** Monika PM ([@Monikapm19](https://github.com/Monikapm19)), Kushitha K ([@Kushitha30](https://github.com/Kushitha30)), Nidhi L ([@nidhilokesh1](https://github.com/nidhilokesh1))  

---

## 📹 Video Recording Submission Details

| Field | Submission Details |
|---|---|
| **Video Title** | `EduTrack - Final Working Product Demonstration & IEEE Specifications (Sprint 1 & 2)` |
| **Video Hosting Link** | *[Insert YouTube / Google Drive / Loom Unlisted Submission URL Here]* |
| **Resolution & Format** | 1080p Full HD / MP4 |
| **Audio** | Clear narration with screen capture walkthrough |

---

## 🎬 Minute-by-Minute Demonstration Script

### Segment 1: Introduction & Architecture Overview (0:00 - 0:45)
- **On Screen:** Title slide showing project name, team member names, GitHub repository link, and formal IEEE Word specifications (`docs/1_SRS_StudentRecordSystem.docx`, `docs/2_TestPlan_StudentRecordSystem.docx`, `docs/3_ArchitectureDesign_StudentRecordSystem.docx`).
- **Narration:**
  > *"Welcome to the final product demonstration of EduTrack, a robust university Student Record System built in adherence with IEEE Std 830, IEEE Std 829, and IEEE Std 1016 standards. Over two agile sprints, our team of four engineers has delivered all 20 backlog items, implementing secure role-based access, attendance tracking, automated grade calculation, low-attendance alert systems, and a continuous integration pipeline."*

---

### Segment 2: Authentication & Role Security (0:45 - 1:45)
- **On Screen:** Login interface at `/login`. Demonstrate Administrator login (`admin@edutrack.edu`), followed by demonstration of brute-force lockout defense.
- **Actions:**
  1. Show login with valid credentials returning signed JWT with role claim.
  2. Demonstrate entering 5 consecutive incorrect passwords to trigger account lockout (HTTP 423 Locked for 15 minutes).
- **Narration:**
  > *"First, we demonstrate our multi-role authentication system. Passwords are encrypted using bcrypt with salt factor $\ge 10$. To prevent credential attacks, the system locks any account for 15 minutes after 5 consecutive failed attempts."*

---

### Segment 3: Student Management & Course Enrollment (1:45 - 2:45)
- **On Screen:** Administrator Dashboard showing Student Directory and Course Catalog.
- **Actions:**
  1. Show registration of a new student with unique USN/Roll number validation.
  2. Show course listing, semester allocation, and faculty instructor assignment.
  3. Show batch enrollment of students into course rosters.
- **Narration:**
  > *"In the administrative module, students are enrolled with strict USN conflict detection. Courses are cataloged with credit weightings, semester tags, and faculty allocations, establishing the prerequisites for attendance and grading."*

---

### Segment 4: Daily Attendance Marking & Session Validation (2:45 - 3:45)
- **On Screen:** Faculty Dashboard at `/courses/1/attendance`.
- **Actions:**
  1. Faculty logs in and opens lecture session attendance marking for Course CS101.
  2. Mark batch attendance with `Present`, `Absent`, `Late`, and `Excused` flags.
  3. Submit attendance (HTTP 201 Created).
  4. Demonstrate the 24-hour edit limit rule: modifying a session within 24 hours succeeds, while backdated sessions are locked against unauthorized edits.
- **Narration:**
  > *"Here, a faculty instructor records attendance for their lecture. Records support Present, Absent, Late, and Excused statuses. To protect academic integrity, our session validation engine enforces a strict 24-hour edit limit, preventing backdated modifications."*

---

### Segment 5: Real-Time Low Attendance Alerts (<75%) & Warning Dispatch (3:45 - 4:45)
- **On Screen:** Low Attendance Alert Management at `/attendance/alerts`.
- **Actions:**
  1. Show automated detection of students falling below the 75.0% threshold.
  2. Highlight debarment risk indicators: `CRITICAL` (<65%) and `HIGH` (<75%).
  3. Show the recovery deficit metric: `classes_needed_to_reach_75`.
  4. Trigger automated warning dispatch (`POST /api/v1/attendance/alerts/dispatch`), creating delivery logs for SMS and Email.
  5. Log in as Student to show the urgent shortage warning banner and course shortage breakdown.
- **Narration:**
  > *"As part of Sprint 2, our real-time percentage engine continuously monitors student participation. Any student falling below 75% is immediately flagged with debarment risk and the exact number of consecutive sessions needed to recover eligibility. Instructors can dispatch urgent multi-channel warnings, and students immediately see an alert banner on their portal."*

---

### Segment 6: Subject Marks Entry, Automatic GPA & Audit Logging (4:45 - 5:45)
- **On Screen:** Faculty Grading Portal at `/courses/1/grades`.
- **Actions:**
  1. Faculty submits exam marks (0–100) for enrolled students.
  2. Show automatic letter grade evaluation (`S`, `A`, `B`, `C`, `D`, `E`, `F`) and grade points.
  3. Demonstrate grade amendment requiring a mandatory justification note.
  4. Show the immutable security audit log capturing every mark alteration with actor ID and timestamp.
  5. View the student grade report showing weighted GPA calculation.
- **Narration:**
  > *"In the grading module, marks are validated within 0 to 100 and converted into institutional letter grades and credit-weighted GPA. Every grade change requires a mandatory explanation note and is recorded in our append-only immutable audit trail."*

---

### Segment 7: Comprehensive IEEE Test Suite & CI/CD Pipeline (5:45 - 6:30)
- **On Screen:** Terminal running `npm test --prefix backend` and GitHub Actions workflow tab.
- **Actions:**
  1. Run the test suite: Show all **92 tests passing across 8 test suites** with 100% assertions.
  2. Highlight `ieeeTestPlanVerification.test.js` validating TC-01 through TC-10.
  3. Run the frontend Vite build: show `vite build` completing in < 1 second with 0 errors.
  4. Show GitHub Actions CI badge green in `README.md`.
- **Narration:**
  > *"Quality assurance is verified by our comprehensive automated test suite. All 10 IEEE test plan cases and regression suites pass 100%, and our GitHub Actions pipeline continuously verifies documentation, runs backend tests, and builds the frontend production bundle on every push."*

---

### Segment 8: Conclusion & Release Freeze Sign-Off (6:30 - 7:00)
- **On Screen:** GitHub Repository home page showing `v1.0.0 Release Freeze` badge and `RELEASE_NOTES.md`.
- **Narration:**
  > *"With all functional requirements, security objectives, and non-functional latency benchmarks verified, the EduTrack Student Record System is officially frozen at version 1.0.0. Thank you."*
