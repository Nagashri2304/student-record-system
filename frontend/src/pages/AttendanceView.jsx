import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AttendanceView() {
  const { user } = useAuth()
  const role = String(user?.role || 'STUDENT').toUpperCase()

  const [records, setRecords] = useState([
    { id: 1, course: 'Database Management Systems', code: 'CS301', attended: 28, total: 30, lastDate: '2026-10-24', faculty: 'Dr. Kavya Rao' },
    { id: 2, course: 'Software Engineering', code: 'CS302', attended: 26, total: 28, lastDate: '2026-10-25', faculty: 'Prof. Arjun Nair' },
    { id: 3, course: 'Machine Learning', code: 'CS303', attended: 24, total: 25, lastDate: '2026-10-26', faculty: 'Dr. Kavya Rao' },
    { id: 4, course: 'Design & Analysis of Algorithms', code: 'CS304', attended: 29, total: 32, lastDate: '2026-10-26', faculty: 'Prof. Arjun Nair' },
  ])

  const [notice, setNotice] = useState('')

  useEffect(() => {
    api.get('/attendance')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRecords(res.data)
        }
      })
      .catch(() => {})
  }, [])

  function markSession(code, isPresent) {
    const updated = records.map((r) => {
      if (r.code === code) {
        return {
          ...r,
          total: r.total + 1,
          attended: isPresent ? r.attended + 1 : r.attended,
        }
      }
      return r
    })
    setRecords(updated)
    setNotice(`Attendance recorded for ${code}: Student was marked ${isPresent ? 'PRESENT' : 'ABSENT'}.`)
    setTimeout(() => setNotice(''), 4000)
  }

  const totalAttended = records.reduce((acc, c) => acc + c.attended, 0)
  const totalClasses = records.reduce((acc, c) => acc + c.total, 0)
  const overallPct = Math.round((totalAttended / totalClasses) * 100) || 0

  return (
    <div className="view-container">
      <div className="view-intro">
        <h2>{role === 'FACULTY' ? 'Classroom Attendance Management' : 'Course-Wise Attendance Summary'}</h2>
        <p>Institutional minimum requirement: 75% aggregate per registered course.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">TOTAL SESSIONS HELD</span>
          <strong className="metric-value">{totalClasses}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">CLASSES ATTENDED</span>
          <strong className="metric-value">{totalAttended}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">OVERALL ATTENDANCE</span>
          <strong className="metric-value" style={{ color: overallPct >= 75 ? '#16a34a' : '#dc2626' }}>
            {overallPct}%
          </strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">ELIGIBILITY STATUS</span>
          <strong className="metric-value" style={{ color: '#16a34a' }}>Exam Eligible ✓</strong>
        </div>
      </div>

      {notice && <div className="success-banner">{notice}</div>}

      <div className="attendance-cards-grid">
        {records.map((item) => {
          const pct = Math.round((item.attended / item.total) * 100)
          const isSafe = pct >= 75

          return (
            <div className="attendance-card" key={item.code}>
              <div className="attendance-card-header">
                <div>
                  <span className="code-badge">{item.code}</span>
                  <h3>{item.course}</h3>
                  <small>Instructor: {item.faculty}</small>
                </div>
                <div className={`percentage-pill ${isSafe ? 'safe' : 'warning'}`}>
                  {pct}%
                </div>
              </div>

              <div className="progress-bar-bg" style={{ margin: '16px 0 8px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isSafe ? '#4f46e5' : '#ea580c',
                  }}
                />
              </div>

              <div className="attendance-card-footer">
                <span>{item.attended} attended / {item.total} conducted</span>
                <span className={isSafe ? 'status-tag safe' : 'status-tag alert'}>
                  {isSafe ? 'Eligible' : 'Shortage'}
                </span>
              </div>

              {role === 'FACULTY' && (
                <div className="faculty-quick-actions" style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="action-pill-btn green"
                    onClick={() => markSession(item.code, true)}
                  >
                    + Present
                  </button>
                  <button
                    type="button"
                    className="action-pill-btn red"
                    onClick={() => markSession(item.code, false)}
                  >
                    - Absent
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

