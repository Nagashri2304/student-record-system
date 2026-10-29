import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function GradesView() {
  const { user } = useAuth()
  const role = String(user?.role || 'STUDENT').toUpperCase()

  const [grades, setGrades] = useState([
    { id: 1, course: 'Database Management Systems', code: 'CS301', marks: 91, grade: 'A+', credits: 4, semester: 3, faculty: 'Dr. Kavya Rao' },
    { id: 2, course: 'Software Engineering', code: 'CS302', marks: 84, grade: 'A', credits: 4, semester: 3, faculty: 'Prof. Arjun Nair' },
    { id: 3, course: 'Machine Learning', code: 'CS303', marks: 88, grade: 'A', credits: 4, semester: 3, faculty: 'Dr. Kavya Rao' },
    { id: 4, course: 'Data Structures & Algorithms', code: 'CS201', marks: 94, grade: 'S', credits: 4, semester: 2, faculty: 'Dr. Kavya Rao' },
    { id: 5, course: 'Computer Networks', code: 'CS202', marks: 79, grade: 'B+', credits: 3, semester: 2, faculty: 'Prof. Arjun Nair' },
  ])

  // New mark entry form state for faculty
  const [courseCode, setCourseCode] = useState('CS301')
  const [studentRoll, setStudentRoll] = useState('SR001')
  const [enteredMarks, setEnteredMarks] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [downloadMsg, setDownloadMsg] = useState('')

  useEffect(() => {
    api.get('/grades')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setGrades(res.data)
        }
      })
      .catch(() => {})
  }, [])

  async function handleDownloadGradeCard() {
    try {
      setDownloading(true)
      setDownloadMsg('')
      // Default to student 1 or look up linked child / user
      let targetId = 1
      if (role === 'STUDENT') {
        try {
          const profile = await api.get('/students/me')
          if (profile?.data?.student_id || profile?.data?.id) {
            targetId = profile.data.student_id || profile.data.id
          }
        } catch {
          // ignore fallback
        }
      } else if (role === 'PARENT') {
        try {
          const overview = await api.get('/parent/overview')
          if (overview?.data?.student?.id) {
            targetId = overview.data.student.id
          }
        } catch {
          // ignore fallback
        }
      }

      await api.downloadBlob(`/students/${targetId}/report-card`, `Semester_GradeCard_Student_${targetId}.pdf`)
      setDownloadMsg('Official Grade Card PDF downloaded successfully!')
      setTimeout(() => setDownloadMsg(''), 5000)
    } catch (err) {
      setDownloadMsg(`Error downloading PDF: ${err.message || 'Server error'}`)
    } finally {
      setDownloading(false)
    }
  }

  function handleAddGrade(e) {
    e.preventDefault()
    if (!enteredMarks) return

    const num = Number(enteredMarks)
    let letter = 'B'
    if (num >= 90) letter = 'A+'
    else if (num >= 80) letter = 'A'
    else if (num >= 70) letter = 'B+'
    else if (num >= 60) letter = 'B'
    else if (num >= 50) letter = 'C'
    else letter = 'F'

    const updated = [
      ...grades,
      {
        id: grades.length + 1,
        course: courseCode === 'CS301' ? 'Database Management Systems' : 'Machine Learning',
        code: courseCode,
        marks: num,
        grade: letter,
        credits: 4,
        semester: 3,
        faculty: user?.name || 'Dr. Kavya Rao',
      },
    ]

    setGrades(updated)
    setEnteredMarks('')
    setSuccessMsg(`Marks (${num} - ${letter}) recorded for ${studentRoll} in ${courseCode}!`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const averageMarks = Math.round(
    grades.reduce((acc, curr) => acc + curr.marks, 0) / grades.length
  )

  return (
    <div className="view-container">
      <div className="view-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>{role === 'FACULTY' ? 'Gradebook & Assessment Entry' : 'Academic Grades & Performance'}</h2>
          <p>Comprehensive transcript breakdown and semester evaluation records.</p>
        </div>

        {/* FR-08: Grade Card Generation & PDF Export Service button */}
        {(role === 'STUDENT' || role === 'PARENT' || role === 'ADMIN') && (
          <button
            type="button"
            className="primary-pill-btn"
            onClick={handleDownloadGradeCard}
            disabled={downloading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              borderRadius: '8px',
              border: 'none',
              cursor: downloading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
            }}
          >
            <span>{downloading ? '⏳ Compiling PDF...' : '📄 Download Official Grade Card (PDF)'}</span>
          </button>
        )}
      </div>

      {downloadMsg && (
        <div className={downloadMsg.startsWith('Error') ? 'error-banner' : 'success-banner'} style={{ marginBottom: '16px' }}>
          {downloadMsg}
        </div>
      )}

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">COURSES EVALUATED</span>
          <strong className="metric-value">{grades.length}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">AVERAGE MARKS</span>
          <strong className="metric-value">{averageMarks}%</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">SEMESTER GPA</span>
          <strong className="metric-value">8.85 / 10</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">ACADEMIC STANDING</span>
          <strong className="metric-value" style={{ color: '#16a34a' }}>Distinction</strong>
        </div>
      </div>

      {role === 'FACULTY' && (
        <section className="portal-card" style={{ marginBottom: '24px' }}>
          <div className="portal-card-header">
            <h3>Enter / Update Student Marks</h3>
          </div>
          {successMsg && <div className="success-banner">{successMsg}</div>}
          <form className="inline-form" onSubmit={handleAddGrade}>
            <div className="field-group">
              <label>Course</label>
              <select value={courseCode} onChange={(e) => setCourseCode(e.target.value)}>
                <option value="CS301">CS301 - DBMS</option>
                <option value="CS302">CS302 - Software Eng</option>
                <option value="CS303">CS303 - Machine Learning</option>
              </select>
            </div>
            <div className="field-group">
              <label>Student Roll No</label>
              <select value={studentRoll} onChange={(e) => setStudentRoll(e.target.value)}>
                <option value="SR001">SR001 - Aarav Sharma</option>
                <option value="SR002">SR002 - Diya Rao</option>
                <option value="SR003">SR003 - Ishaan Kumar</option>
              </select>
            </div>
            <div className="field-group">
              <label>Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 88"
                value={enteredMarks}
                onChange={(e) => setEnteredMarks(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="primary-pill-btn" style={{ alignSelf: 'flex-end', height: '44px' }}>
              Submit Grade
            </button>
          </form>
        </section>
      )}

      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Code</th>
              <th>Credits</th>
              <th>Semester</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Evaluator</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.course}</strong></td>
                <td><span className="code-badge">{item.code}</span></td>
                <td>{item.credits}</td>
                <td>Sem {item.semester}</td>
                <td><strong>{item.marks} / 100</strong></td>
                <td><span className="grade-badge">{item.grade}</span></td>
                <td>{item.faculty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
