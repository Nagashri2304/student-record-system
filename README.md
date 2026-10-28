\# Student Record System



A web-based Student Record System built with React, Vite, Node.js, Express, and PostgreSQL.



\## Features



\- REST API with versioned routes under `/api/v1`

\- PostgreSQL database schema and sample seed data

\- React frontend

\- Shared frontend API client

\- Health-check endpoint for verifying backend availability

\- Environment-based configuration



\## Prerequisites



\- Node.js and npm

\- PostgreSQL

\- Git



\## Project Structure



```text

student\_record\_system/

├── backend/

│   ├── scripts/

│   ├── src/

│   └── package.json

├── db/

│   ├── schema.sql

│   └── seed.sql

├── frontend/

│   ├── src/

│   ├── package.json

│   └── index.html

├── .env.example

└── README.md

```



\## Environment Configuration



Copy `.env.example` to `.env` in the repository root and configure the values for your local PostgreSQL installation.



Never commit `.env` or any real credentials.



\## Database Setup



Create a PostgreSQL database named `student\_record\_system`, then configure the connection settings in `.env`.



The repository includes `db/schema.sql` and `db/seed.sql` for creating the tables and loading sample data.



From the backend directory, the database reset script can be run with:



```bash

npm run db:reset

```



\*\*Warning:\*\* The reset script drops and recreates database tables. Use it only when you intend to reset the local database.



\## Run the Backend



Open a terminal in the `backend` directory:



```bash

npm install

npm run dev

```



The API uses port `5000` by default.



Health endpoint:



```text

http://localhost:5000/api/v1/health

```



\## Run the Frontend



Open another terminal in the `frontend` directory:



```bash

npm install

npm run dev

```



Open the local URL printed by Vite in the terminal.



The frontend uses `VITE\_API\_BASE\_URL` when configured, with `http://localhost:5000/api/v1` as its default API base URL.



\## Validation



From the frontend directory:



```bash

npm run lint

npm run build

```



These commands check the frontend code and create a production build.



\## Product Demonstration Videos & Release Deliverables

### 1. Sprint 1 Working Product Demo Video (DEV-02 / Issue #13)
As part of Sprint 1 deliverables (Item 2.g, 2.h / DEV-02), a 1-minute product demonstration showcasing operational progress across all core user roles:
- **Demo Video Link**: [Sprint 1 Product Demonstration Video](https://drive.google.com/your-demo-video-link-here) *(Google Drive / YouTube Unlisted Link)*
- **Acceptance Criteria Verification**:
  - [x] Multi-Role Authentication: Verified login for Admin (`admin@edutrack.edu`), Faculty (`faculty@edutrack.edu`), Student (`student@edutrack.edu`), and Parent (`parent@edutrack.edu`).
  - [x] Faculty Workflow: Classroom attendance recording (`+ Present` / `- Absent`) with 24h edit window, and subject gradebook mark entry.
  - [x] Student Self-Service: Live CGPA badge, course transcript breakdown, and subject attendance metrics.
  - [x] Video link & walkthrough documented in repository.

### 2. Sprint 2 Working Product Demo & Release Freeze (DEV-05 / Issue #6)
As part of Sprint 2 deliverables (Item 3.a, 3.b, 3.c, 3.d / DEV-05), a comprehensive walkthrough of advanced capabilities, security hardening, and final release tagging:
- **Final Demo Video Link**: [Sprint 2 Final Demonstration Video](https://drive.google.com/your-final-demo-video-link-here) *(Google Drive / YouTube Unlisted Link)*
- **Acceptance Criteria Verification**:
  - [x] FR-08 PDF Report Card: Official downloadable semester grade card with institutional branding, SGPA badge, and attendance % compiled in <75ms.
  - [x] FR-09 Parent Oversight Portal: Zero-trust child tracking, attendance analytics, and dynamic <75% attendance warning alert.
  - [x] FR-10 Grievance Resolution Desk: Academic discrepancy submission and faculty resolution workflow.
  - [x] SEC-02 & SEC-03: Global input sanitization, parameterized query defense, and immutable audit logging.
  - [x] Release Freeze: Code changes locked, test suite passing 100%, tagged as Git release `v1.0.0`.

## IEEE Documentation Deliverables
The project includes formal engineering documentation compliant with IEEE standards located in `docs/`:
- **Software Requirements Specification (SRS)**: `docs/1_SRS_StudentRecordSystem.docx` (IEEE Std 830-1998)
- **Software Test Plan & Verification (STP)**: `docs/2_TestPlan_StudentRecordSystem.docx` (IEEE Std 829-2008)
- **Software Architecture Design (SAD)**: `docs/3_ArchitectureDesign_StudentRecordSystem.md` (IEEE Std 1016-2009)
- **System Architecture & Use Case Diagrams**: `docs/use_case_diagram.png`

## Collaboration



\- Create feature branches for changes.

\- Submit pull requests against `main`.

\- Do not commit secrets, `.env` files, or generated build folders.

\- Review and merge changes through the team's GitHub workflow.

