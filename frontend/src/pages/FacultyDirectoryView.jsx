import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function FacultyDirectoryView() {
  const [faculty, setFaculty] = useState([
    { id: 1, name: 'Dr. Kavya Rao', department: 'Computer Science and Engineering', designation: 'Associate Professor', email: 'kavya.rao@edutrack.edu', courses: ['CS301 (DBMS)', 'CS303 (ML)'], cabin: 'Block B - 302' },
    { id: 2, name: 'Prof. Arjun Nair', department: 'Computer Science and Engineering', designation: 'Assistant Professor', email: 'arjun.nair@edutrack.edu', courses: ['CS302 (SE)', 'CS304 (DAA)'], cabin: 'Block B - 215' },
    { id: 3, name: 'Dr. Priya Sundaram', department: 'Computer Science and Engineering', designation: 'Professor & HOD', email: 'priya.s@edutrack.edu', courses: ['CS401 (Cloud Computing)'], cabin: 'Block A - 101' },
  ])

  useEffect(() => {
    api.get('/faculty')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setFaculty(res.data)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="view-container">
      <div className="view-intro">
        <h2>Faculty & Instructional Staff Directory</h2>
        <p>Department faculty members, teaching allocations, and office hours.</p>
      </div>

      <div className="faculty-cards-grid">
        {faculty.map((f) => (
          <div className="faculty-card" key={f.email}>
            <div className="faculty-avatar">
              {f.name.replace(/^(Dr\.|Prof\.)\s*/, '').charAt(0)}
            </div>
            <div className="faculty-info">
              <h3>{f.name}</h3>
              <p className="faculty-designation">{f.designation}</p>
              <p className="faculty-department">{f.department}</p>
              <div className="faculty-meta">
                <span>📧 {f.email}</span>
                <span>🚪 {f.cabin || 'Faculty Cabin'}</span>
              </div>
              <div className="faculty-courses-tags">
                {Array.isArray(f.courses) && f.courses.map((c) => (
                  <span className="course-tag" key={c}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

