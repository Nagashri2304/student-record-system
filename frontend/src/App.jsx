
import { useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = 'http://127.0.0.1:5001/api/v1'

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

const roleMenus = {
  Student: ['Overview', 'My Grades', 'My Attendance', 'My Profile'],
  Faculty: ['Overview', 'My Courses', 'Enter Marks', 'Attendance'],
  Admin: ['Overview', 'Students', 'Faculty', 'Courses'],
  Parent: ['Overview', 'Student Progress', 'Grades', 'Attendance'],
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('edutrack_user') || 'null')
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(
    () => sessionStorage.getItem('edutrack_token') || ''
  )
  const [email, setEmail] = useState('student@edutrack.edu')
  const [password, setPassword] = useState('Password@123')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)

  const role = user?.role || 'Student'
  const navItems = roleMenus[role] || roleMenus.Student

  const totalAttended = useMemo(
    () => sampleAttendance.reduce((sum, item) => sum + item.attended, 0),
    []
  )

  const totalClasses = useMemo(
    () => sampleAttendance.reduce((sum, item) => sum + item.total, 0),
    []
  )

  const attendancePercent = Math.round(
    (totalAttended / totalClasses) * 100
  )

  const averageMarks = Math.round(
    sampleGrades.reduce((sum, item) => sum + item.marks, 0) /
      sampleGrades.length
  )

  async function handleLogin(event) {
    event.preventDefault()
    setLoginError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success || !data.token || !data.user) {
        throw new Error(data.message || 'Login failed. Check your credentials.')
      }

      sessionStorage.setItem('edutrack_token', data.token)
      sessionStorage.setItem('edutrack_user', JSON.stringify(data.user))

      setToken(data.token)
      setUser(data.user)
      setPage('Overview')
      setPassword('')
    } catch (error) {
      setLoginError(
        error.message ||
          'Unable to connect to the server. Check that the backend is running on port 5001.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('edutrack_token')
    sessionStorage.removeItem('edutrack_user')
    setToken('')
    setUser(null)
    setPassword('')
    setLoginError('')
    setPage('Overview')
    setMenuOpen(false)
  }

  function navigateTo(nextPage) {
    setPage(nextPage)
    setMenuOpen(false)
  }

  if (!user || !token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <div className="brand-mark">E</div>
            <div>
              <strong>EduTrack</strong>
              <span>STUDENT RECORD SYSTEM</span>
            </div>
          </div>

          <div className="login-heading">
            <p className="login-eyebrow">WELCOME BACK</p>
            <h1>Sign in to EduTrack</h1>
            <p>Access your academic information and dashboard.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="Enter your institutional email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {loginError && (
              <div className="login-error" role="alert">
                {loginError}
              </div>
            )}

            <button
              className="primary-button login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="login-footnote">
            Secure access for students, faculty, administrators and parents.
          </p>
        </div>
      </div>
    )
  }

  const isStudentAcademicPage =
    role === 'Student' &&
    ['Overview', 'My Grades', 'My Attendance'].includes(page)

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
          <label htmlFor="role">Signed in as</label>
          <select id="role" value={role} disabled>
            <option value={role}>{role}</option>
          </select>
        </div>

        <div className="nav-label">MENU</div>

        <nav className="navigation" aria-label="Main navigation">
          {navItems.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`nav-item ${page === item ? 'active' : ''}`}
              onClick={() => navigateTo(item)}
            >
              <span className="nav-icon">
                {['◫', '▤', '◷', '○'][index % 4]}
              </span>
              <span>{item}</span>
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
            <div className="avatar">{role.charAt(0).toUpperCase()}</div>
            <div className="profile-info">
              <strong>{user.email}</strong>
              <span>{role}</span>
            </div>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> {page}
          </div>

          <button
            className="text-button"
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </header>

        <section className="content-area">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">YOUR LEARNING SPACE</p>
              <h1>
                {page === 'Overview' ? 'Your academic overview' : page}
              </h1>
              <p className="welcome-description">
                Welcome back, {user.email}.
              </p>
            </div>

            <div className="date-chip">
              <span className="status-dot" />
              {role} account
            </div>
          </div>

          <p className="sample-notice">
            Grades and attendance shown here are sample data. Live academic
            records will appear after the academic APIs are integrated.
          </p>

          {isStudentAcademicPage ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon blue">↗</span>
                    <span className="trend">Grades</span>
                  </div>
                  <p>Average marks</p>
                  <div className="stat-value">
                    {averageMarks}
                    <span className="value-unit">/100</span>
                  </div>
                  <span className="stat-caption">
                    Across {sampleGrades.length} subjects
                  </span>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon green">✓</span>
                    <span className="trend">Attendance</span>
                  </div>
                  <p>Attendance rate</p>
                  <div className="stat-value">
                    {attendancePercent}
                    <span className="value-unit">%</span>
                  </div>
                  <span className="stat-caption">
                    {totalAttended} of {totalClasses} classes attended
                  </span>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon purple">▦</span>
                    <span className="trend">Subjects</span>
                  </div>
                  <p>Enrolled subjects</p>
                  <div className="stat-value">{sampleGrades.length}</div>
                  <span className="stat-caption">Current semester</span>
                </div>
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
                      type="button"
                      onClick={() => navigateTo('My Grades')}
                    >
                      View all →
                    </button>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Course code</th>
                          <th>Marks</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleGrades.map((item) => (
                          <tr key={item.code}>
                            <td>
                              <strong>{item.subject}</strong>
                            </td>
                            <td className="muted-cell">{item.code}</td>
                            <td>
                              <div className="marks-cell">
                                <div className="progress-track">
                                  <span
                                    style={{ width: `${item.marks}%` }}
                                  />
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
                      type="button"
                      onClick={() => navigateTo('My Attendance')}
                    >
                      View all →
                    </button>
                  </div>

                  <div className="attendance-list">
                    {sampleAttendance.map((item) => {
                      const percent = Math.round(
                        (item.attended / item.total) * 100
                      )

                      return (
                        <div className="attendance-row" key={item.subject}>
                          <div className="attendance-name">
                            <strong>{item.subject}</strong>
                            <span>
                              {item.attended}/{item.total} classes
                            </span>
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
          ) : page === 'My Profile' && role === 'Student' ? (
            <section className="panel role-panel">
              <div className="role-panel-icon">○</div>
              <h2>My Profile</h2>
              <p>View your account information below.</p>

              <div className="profile-details">
                <div className="profile-detail-row">
                  <span>Email address</span>
                  <strong>{user.email}</strong>
                </div>
                <div className="profile-detail-row">
                  <span>Role</span>
                  <strong>{role}</strong>
                </div>
                <div className="profile-detail-row">
                  <span>Account status</span>
                  <strong>Signed in</strong>
                </div>
              </div>

              <button
                className="primary-button"
                type="button"
                onClick={() => navigateTo('Overview')}
              >
                Return to overview
              </button>
            </section>
          ) : (
            <section className="panel role-panel">
              <div className="role-panel-icon">○</div>
              <h2>{page}</h2>
              <p>
                This section is a UI preview for the {role} role. Role-specific
                functionality and live records will be connected as the
                corresponding APIs become available.
              </p>
              <button
                className="primary-button"
                type="button"
                onClick={() => navigateTo('Overview')}
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
