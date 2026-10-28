import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function GrievancesView() {
  const { user } = useAuth()
  const [grievances, setGrievances] = useState([
    { id: 1, student: user?.name || 'Aarav Sharma', category: 'Grading Review', description: 'Requesting re-evaluation of Quiz 2 questions 4 & 5 in CS301 (DBMS).', status: 'In Review', raisedAt: '2026-10-22' },
    { id: 2, student: user?.name || 'Aarav Sharma', category: 'Attendance Correction', description: 'Attended Lab session on Oct 18 but biometric punch failed.', status: 'Resolved', raisedAt: '2026-10-19' },
  ])

  const [category, setCategory] = useState('Grading Review')
  const [description, setDescription] = useState('')
  const [submittedMessage, setSubmittedMessage] = useState('')

  useEffect(() => {
    api.get('/grievances')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setGrievances(res.data)
        }
      })
      .catch(() => {})
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return

    const newTicket = {
      id: grievances.length + 1,
      student: user?.name || 'Aarav Sharma',
      category,
      description,
      status: 'Open',
      raisedAt: new Date().toISOString().split('T')[0],
    }

    setGrievances([newTicket, ...grievances])
    setDescription('')
    setSubmittedMessage('Ticket submitted successfully! Assigned Ticket Ref: #GR-' + Math.floor(1000 + Math.random() * 9000))
    setTimeout(() => setSubmittedMessage(''), 5000)
  }

  return (
    <div className="view-container">
      <div className="view-intro">
        <h2>Academic Grievance & Resolution Desk</h2>
        <p>Submit and track academic appeals, grade re-evaluations, and attendance corrections.</p>
      </div>

      <div className="dashboard-grid-2">
        <section className="portal-card">
          <div className="portal-card-header">
            <h3>Lodge a New Grievance</h3>
          </div>

          {submittedMessage && <div className="success-banner">{submittedMessage}</div>}

          <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '16px' }}>
            <div className="field-group">
              <label>Grievance Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Grading Review">Grading & Evaluation Review</option>
                <option value="Attendance Correction">Attendance Discrepancy</option>
                <option value="Course Registration">Course Registration / Elective Change</option>
                <option value="General Academic">General Academic Query</option>
              </select>
            </div>

            <div className="field-group">
              <label>Detailed Description</label>
              <textarea
                rows="4"
                placeholder="State the course code, date, and specifics of your query..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="primary-pill-btn" style={{ alignSelf: 'flex-start' }}>
              Submit Grievance Ticket
            </button>
          </form>
        </section>

        <section className="portal-card">
          <div className="portal-card-header">
            <h3>My Active & Past Tickets</h3>
          </div>

          <div className="tickets-list">
            {grievances.map((g) => (
              <div className="ticket-card" key={g.id}>
                <div className="ticket-header">
                  <span className="code-badge">#{g.id} · {g.category}</span>
                  <span className={`status-tag ${g.status === 'Resolved' ? 'safe' : 'alert'}`}>
                    {g.status}
                  </span>
                </div>
                <p className="ticket-desc">{g.description}</p>
                <small className="ticket-date">Logged on: {g.raisedAt}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

