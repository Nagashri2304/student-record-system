
import { useState } from 'react'
import './App.css'

const roles = ['Student', 'Faculty', 'Admin', 'Parent']

const sampleGrades = [
  { subject: 'Data Structures', code: 'CS201', marks: 86, grade: 'A' },
  { subject: 'Database Management', code: 'CS202', marks: 92, grade: 'A+' },
  { subject: 'Software Engineering', code: 'CS203', marks: 78, grade: 'B+' },
  { subject: 'Computer Networks', code: 'CS204', marks: 81, grade: 'A' },
]

const sampleAttendance = [
  { subject: 'Data Structures', attended: 24, total: 28 },
  { subject: 'Database Management', attended: 22, total: 25 },
  { subject: 'Software Engineering', attended: 19, total: 24 },
  { subject: 'Computer Networks', attended: 21, total: 26 },
]

function App() {
  const [role, setRole] = useState('Student')
  const [page, setPage] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = role === 'Student'
    ? ['Overview', 'My Grades', 'My Attendance', 'My Profile']
    : role === 'Faculty'
      ? ['Overview', 'My Courses', 'Enter Marks', 'Attendance']
      : role === 'Admin'
        ? ['Overview', 'Students', 'Faculty', 'Courses']
        : ['Overview', 'Student Progress', 'Grades', 'Attendance']

  const totalAttended = sampleAttendance.reduce(
    (sum, item) => sum + item.attended, 0
  )
  const totalClasses = sampleAttendance.reduce(
    (sum, item) => sum + item.total, 0
  )
  const attendancePercent = Math.round(totalAttended / totalClasses * 100)

  function changeRole(nextRole) {
    setRole(nextRole)
    setPage('Overview')
    setMenuOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">E</div>
          <div>
            <strong>EduTrack</strong>
            <span>STUDENT RECORD SYSTEM</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <div className="role-picker">
          <label htmlFor="role">Preview dashboard as</label>
          <select
            id="role"
            value={role}
            onChange={(e) => changeRole(e.target.value)}
          >
            {roles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="nav-label">MENU</div>
        <nav className="navigation" aria-label="Main navigation">
          {navItems.map((item, index) => (
            <button
              key={item}
              className={`nav-item ${page === item ? 'active' : ''}`}
              onClick={() => {
                setPage(item)
                setMenuOpen(false)
              }}
            >
              <span className="nav-icon">
                {['◫', '▤', '◷', '○'][index % 4]}
              </span>
              {item}
              {item === 'My Grades' && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <strong>Need help?</strong>
            <p>Contact your institution's support team.</p>
          </div>
          <div className="profile-mini">
            <div className="avatar">{role[0]}</div>
            <div className="profile-info">
              <strong>{role} preview</strong>
              <span>{role.toLowerCase()}@edutrack.demo</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span> {page}
          </div>
          <div className="topbar-right">
            <span className="status-pill"><span /> Academic portal</span>
            <div className="avatar top-avatar">{role[0]}</div>
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">ACADEMIC WORKSPACE</p>
              <h1>{page === 'Overview' ? 'Welcome to EduTrack' : page}</h1>
              <p className="subtitle">
                {role === 'Student'
                  ? 'Your academic progress, all in one place.'
                  : `Your ${role.toLowerCase()} workspace for academic management.`}
              </p>
            </div>
            <div className="term-chip">
              <span>●</span> Academic year 2026–27
            </div>
          </div>

          <div className="prototype-notice">
            <span className="notice-icon">i</span>
            <div>
              <strong>UI prototype</strong>
              <p>
                Displayed grades and attendance are sample data. Live student
                records will appear after API integration.
              </p>
            </div>
          </div>

          {role === 'Student' &&
          ['Overview', 'My Grades', 'My Attendance'].includes(page) ? (
            <>
              <div className="section-heading">
                <div>
                  <h2>
                    {page === 'Overview' ? 'Academic overview' : page}
                  </h2>
                  <p>Semester 1 · Your current academic snapshot</p>
                </div>
                {page !== 'Overview' && (
                  <button
                    className="secondary-button"
                    onClick={() => setPage('Overview')}
                  >
                    Back to overview
                  </button>
                )}
              </div>

              <div className="stats-grid">
                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon purple">▤</span>
                    <span className="trend">Academic</span>
                  </div>
                  <p>Subjects enrolled</p>
                  <div className="stat-value">04</div>
                  <span className="stat-caption">Current semester</span>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon blue">↗</span>
                    <span className="trend">Grades</span>
                  </div>
                  <p>Average marks</p>
                  <div className="stat-value">
                    84.3<span className="value-unit">/100</span>
                  </div>
                  <span className="stat-caption">Based on sample marks</span>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon green">✓</span>
                    <span className="trend">Attendance</span>
                  </div>
                  <p>Attendance rate</p>
                  <div className="stat-value">
                    {attendancePercent}<span className="value-unit">%</span>
                  </div>
                  <span className="stat-caption">
                    {totalAttended} of {totalClasses} classes attended
                  </span>
                </article>
              </div>

              {(page === 'Overview' || page === 'My Grades') && (
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Recent grades</h3>
                      <p>Marks and letter grades by subject</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setPage('My Grades')}
                    >
                      View all →
                    </button>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>SUBJECT</th>
                          <th>COURSE CODE</th>
                          <th>MARKS</th>
                          <th>LETTER GRADE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleGrades.map((item) => (
                          <tr key={item.code}>
                            <td><strong>{item.subject}</strong></td>
                            <td className="muted-cell">{item.code}</td>
                            <td>
                              <div className="marks-cell">
                                <div className="progress-track">
                                  <span style={{ width: `${item.marks}%` }} />
                                </div>
                                {item.marks}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`grade-badge ${
                                  item.grade === 'A+' ? 'grade-top' : ''
                                }`}
                              >
                                {item.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {(page === 'Overview' || page === 'My Attendance') && (
                <section className="panel attendance-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Attendance by subject</h3>
                      <p>Classes attended versus total classes</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setPage('My Attendance')}
                    >
                      View all →
                    </button>
                  </div>

                  <div className="attendance-list">
                    {sampleAttendance.map((item) => {
                      const percent = Math.round(
                        item.attended / item.total * 100
                      )
                      return (
                        <div className="attendance-row" key={item.subject}>
                          <div className="attendance-name">
                            <strong>{item.subject}</strong>
                            <span>{item.attended}/{item.total} classes</span>
                          </div>
                          <div className="attendance-progress">
                            <div className="progress-track">
                              <span style={{ width: `${percent}%` }} />
                            </div>
                            <strong>{percent}%</strong>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </>
          ) : (
            <section className="panel role-panel">
              <div className="role-panel-icon">◫</div>
              <h2>{page}</h2>
              <p>
                This section is a UI preview for the {role} role. Role-specific
                functionality and live records will be connected as the
                corresponding APIs become available.
              </p>
              <button
                className="primary-button"
                onClick={() => setPage('Overview')}
              >
                Return to overview
              </button>
            </section>
          )}

          <footer className="page-footer">
            <span>© 2026 EduTrack · Student Record System</span>
            <span>Built for academic success</span>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default App
