import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [stats, setStats] = useState(null)

  const role = (user?.role || location.pathname.split('/')[1] || 'student').toLowerCase()

  useEffect(() => {
    // Fetch role-specific metrics if available
    let endpoint = ''
    if (role === 'admin') endpoint = '/admin/metrics'
    else if (role === 'student') endpoint = '/students/profile'
    else if (role === 'parent') endpoint = '/parent/overview'

    if (endpoint) {
      api.get(endpoint)
        .then((res) => setStats(res.data))
        .catch(() => {})
    }
  }, [role])

  if (role === 'admin') {
    return (
      <div className="role-dashboard">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">TOTAL STUDENTS</span>
              <span className="metric-icon">👥</span>
            </div>
            <strong className="metric-value">{stats?.totalStudents || '1,420'}</strong>
            <span className="metric-trend positive">↑ +42 enrolled this term</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">FACULTY MEMBERS</span>
              <span className="metric-icon">🎓</span>
            </div>
            <strong className="metric-value">{stats?.totalFaculty || '85'}</strong>
            <span className="metric-trend neutral">All departments staffed</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">ACTIVE COURSES</span>
              <span className="metric-icon">📚</span>
            </div>
            <strong className="metric-value">{stats?.activeCourses || '48'}</strong>
            <span className="metric-trend positive">Curriculum updated</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">SYSTEM HEALTH</span>
              <span className="metric-icon">⚡</span>
            </div>
            <strong className="metric-value">{stats?.systemStatus || 'Optimal'}</strong>
            <span className="metric-trend positive">Uptime: 99.98%</span>
          </div>
        </div>

        <div className="dashboard-grid-2">
          <section className="portal-card">
            <div className="portal-card-header">
              <h3>Quick Administrative Actions</h3>
            </div>
            <div className="quick-actions-list">
              <button className="action-button" onClick={() => navigate('/admin/students')}>
                <span>👥 Manage Student Records</span>
                <span className="arrow">→</span>
              </button>
              <button className="action-button" onClick={() => navigate('/admin/faculty')}>
                <span>🎓 View Faculty Directory</span>
                <span className="arrow">→</span>
              </button>
              <button className="action-button" onClick={() => navigate('/admin/courses')}>
                <span>📚 Manage Courses & Allocations</span>
                <span className="arrow">→</span>
              </button>
              <button className="action-button" onClick={() => navigate('/admin/reports')}>
                <span>📊 Generate Audit & Performance Reports</span>
                <span className="arrow">→</span>
              </button>
            </div>
          </section>

          <section className="portal-card">
            <div className="portal-card-header">
              <h3>Recent System Logs</h3>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-dot" />
                <div className="activity-info">
                  <strong>Attendance synchronized for CS301 (DBMS)</strong>
                  <span>10 mins ago · Dr. Kavya Rao</span>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot" />
                <div className="activity-info">
                  <strong>Mid-term grades published for CS201</strong>
                  <span>2 hours ago · Academic Council</span>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot" />
                <div className="activity-info">
                  <strong>Database auto-backup completed</strong>
                  <span>Today at 04:00 AM · PostgreSQL System</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (role === 'faculty') {
    return (
      <div className="role-dashboard">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">ASSIGNED COURSES</span>
              <span className="metric-icon">📚</span>
            </div>
            <strong className="metric-value">3</strong>
            <span className="metric-trend neutral">Semester 3 & 5</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">STUDENTS TAUGHT</span>
              <span className="metric-icon">👥</span>
            </div>
            <strong className="metric-value">184</strong>
            <span className="metric-trend positive">Across 3 lecture sections</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">AVG ATTENDANCE</span>
              <span className="metric-icon">◷</span>
            </div>
            <strong className="metric-value">91%</strong>
            <span className="metric-trend positive">Above institution target</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">PENDING GRADING</span>
              <span className="metric-icon">📝</span>
            </div>
            <strong className="metric-value">1 Quiz</strong>
            <span className="metric-trend alert">CS303 Machine Learning</span>
          </div>
        </div>

        <div className="dashboard-grid-2">
          <section className="portal-card">
            <div className="portal-card-header">
              <h3>My Teaching Courses</h3>
            </div>
            <div className="course-list">
              <div className="course-item">
                <div className="course-details">
                  <span className="course-code">CS301</span>
                  <strong>Database Management Systems</strong>
                  <p>Mon, Wed, Fri · LH-201 · 64 Students</p>
                </div>
                <button className="primary-pill-btn" onClick={() => navigate('/faculty/attendance')}>
                  Mark Attendance
                </button>
              </div>

              <div className="course-item">
                <div className="course-details">
                  <span className="course-code">CS303</span>
                  <strong>Machine Learning Foundations</strong>
                  <p>Tue, Thu · Lab-3 · 58 Students</p>
                </div>
                <button className="primary-pill-btn" onClick={() => navigate('/faculty/grades')}>
                  Enter Marks
                </button>
              </div>
            </div>
          </section>

          <section className="portal-card">
            <div className="portal-card-header">
              <h3>Fast Faculty Shortcuts</h3>
            </div>
            <div className="quick-actions-list">
              <button className="action-button" onClick={() => navigate('/faculty/attendance')}>
                <span>◷ Record Class Attendance</span>
                <span className="arrow">→</span>
              </button>
              <button className="action-button" onClick={() => navigate('/faculty/grades')}>
                <span>▤ Review & Upload Final Grades</span>
                <span className="arrow">→</span>
              </button>
              <button className="action-button" onClick={() => navigate('/faculty/courses')}>
                <span>📚 View Course Syllabus & Materials</span>
                <span className="arrow">→</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (role === 'parent') {
    return (
      <div className="role-dashboard">
        <div className="student-hero-banner">
          <div className="student-hero-avatar">A</div>
          <div className="student-hero-info">
            <h2>Aarav Sharma</h2>
            <p>Roll No: SR001 · Computer Science and Engineering · Semester 3 (2026–2027)</p>
          </div>
          <div className="cgpa-pill">
            <small>CURRENT CGPA</small>
            <strong>8.85 / 10</strong>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">OVERALL ATTENDANCE</span>
              <span className="metric-icon">◷</span>
            </div>
            <strong className="metric-value">92%</strong>
            <span className="metric-trend positive">Eligible for examinations</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">ENROLLED COURSES</span>
              <span className="metric-icon">📚</span>
            </div>
            <strong className="metric-value">5 Subjects</strong>
            <span className="metric-trend neutral">Semester 3 Core</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">TOP PERFORMANCE</span>
              <span className="metric-icon">⭐</span>
            </div>
            <strong className="metric-value">Grade S</strong>
            <span className="metric-trend positive">Data Structures (94%)</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">FACULTY MENTOR</span>
              <span className="metric-icon">👤</span>
            </div>
            <strong className="metric-value">Dr. Kavya Rao</strong>
            <span className="metric-trend neutral">kavya.rao@edutrack.edu</span>
          </div>
        </div>

        <div className="dashboard-grid-2">
          <section className="portal-card">
            <div className="portal-card-header">
              <h3>Upcoming Mid-Term Assessments</h3>
            </div>
            <div className="exam-schedule-list">
              <div className="exam-item">
                <div className="exam-date">
                  <strong>12</strong>
                  <span>NOV</span>
                </div>
                <div className="exam-details">
                  <strong>Database Management Systems</strong>
                  <p>Mid-Term II · 10:00 AM – 12:00 PM · LH-201</p>
                </div>
              </div>

              <div className="exam-item">
                <div className="exam-date">
                  <strong>15</strong>
                  <span>NOV</span>
                </div>
                <div className="exam-details">
                  <strong>Software Engineering</strong>
                  <p>Mid-Term II · 02:00 PM – 04:00 PM · LH-202</p>
                </div>
              </div>
            </div>
          </section>

          <section className="portal-card">
            <div className="portal-card-header">
              <h3>Parent Actions</h3>
            </div>
            <div className="quick-actions-list">
              <button className="action-button" onClick={() => navigate('/parent/grades')}>
                <span>▤ View Detailed Grade Breakdown</span>
                <span className="arrow">→</span>
              </button>
              <button className="action-button" onClick={() => navigate('/parent/attendance')}>
                <span>◷ Check Subject-Wise Attendance</span>
                <span className="arrow">→</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    )
  }

  // Default: Student Dashboard
  return (
    <div className="role-dashboard">
      <div className="student-hero-banner">
        <div className="student-hero-avatar">
          {(user?.name || 'A').charAt(0).toUpperCase()}
        </div>
        <div className="student-hero-info">
          <h2>{user?.name || 'Aarav Sharma'}</h2>
          <p>
            Roll No: {user?.rollNo || 'SR001'} · Department: {user?.department || 'Computer Science and Engineering'} · Semester: {user?.semester || 3}
          </p>
        </div>
        <div className="cgpa-pill">
          <small>CURRENT CGPA</small>
          <strong>8.85</strong>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">AVERAGE ATTENDANCE</span>
            <span className="metric-icon">◷</span>
          </div>
          <strong className="metric-value">92%</strong>
          <span className="metric-trend positive">104 / 113 classes attended</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">ACTIVE COURSES</span>
            <span className="metric-icon">📚</span>
          </div>
          <strong className="metric-value">5 Subjects</strong>
          <span className="metric-trend neutral">Semester 3 Curriculum</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">CREDITS REGISTERED</span>
            <span className="metric-icon">🎓</span>
          </div>
          <strong className="metric-value">22 Credits</strong>
          <span className="metric-trend positive">On track for graduation</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">ACADEMIC STATUS</span>
            <span className="metric-icon">✓</span>
          </div>
          <strong className="metric-value">Good Standing</strong>
          <span className="metric-trend positive">No active backlogs</span>
        </div>
      </div>

      <div className="dashboard-grid-2">
        <section className="portal-card">
          <div className="portal-card-header">
            <h3>Quick Student Portal Navigation</h3>
          </div>
          <div className="quick-actions-list">
            <button className="action-button" onClick={() => navigate('/student/profile')}>
              <span>👤 View My Complete Profile & Personal Records</span>
              <span className="arrow">→</span>
            </button>
            <button className="action-button" onClick={() => navigate('/student/grades')}>
              <span>▤ View Semester Grades & Marksheets</span>
              <span className="arrow">→</span>
            </button>
            <button className="action-button" onClick={() => navigate('/student/attendance')}>
              <span>◷ Track Subject Attendance & Shortage Warning</span>
              <span className="arrow">→</span>
            </button>
            <button className="action-button" onClick={() => navigate('/student/grievances')}>
              <span>📝 Lodge Academic Grievance or Recorrection</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </section>

        <section className="portal-card">
          <div className="portal-card-header">
            <h3>Current Coursework Highlights</h3>
          </div>
          <div className="course-progress-list">
            <div className="progress-item">
              <div className="progress-header">
                <strong>CS301 - Database Management Systems</strong>
                <span className="badge-grade">Grade A+ (91%)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: '93%' }} />
              </div>
              <small>Attendance: 28 / 30 Classes (93%)</small>
            </div>

            <div className="progress-item">
              <div className="progress-header">
                <strong>CS302 - Software Engineering</strong>
                <span className="badge-grade">Grade A (84%)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: '92%' }} />
              </div>
              <small>Attendance: 26 / 28 Classes (92%)</small>
            </div>

            <div className="progress-item">
              <div className="progress-header">
                <strong>CS303 - Machine Learning</strong>
                <span className="badge-grade">Grade A (88%)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: '96%' }} />
              </div>
              <small>Attendance: 24 / 25 Classes (96%)</small>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
