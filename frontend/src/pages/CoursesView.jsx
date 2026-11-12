import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function CoursesView() {
  const [courses, setCourses] = useState([
    { id: 1, code: 'CS301', name: 'Database Management Systems', semester: 3, credits: 4, faculty: 'Dr. Kavya Rao', enrolledCount: 64, room: 'LH-201' },
    { id: 2, code: 'CS302', name: 'Software Engineering', semester: 3, credits: 4, faculty: 'Prof. Arjun Nair', enrolledCount: 62, room: 'LH-202' },
    { id: 3, code: 'CS303', name: 'Machine Learning', semester: 3, credits: 4, faculty: 'Dr. Kavya Rao', enrolledCount: 58, room: 'Lab-3' },
    { id: 4, code: 'CS304', name: 'Design & Analysis of Algorithms', semester: 3, credits: 4, faculty: 'Prof. Arjun Nair', enrolledCount: 65, room: 'LH-204' },
  ])

  useEffect(() => {
    api.get('/courses')
      .then((res) => {
        const rawList = res.data?.courses || res.courses || res.data || res
        if (Array.isArray(rawList) && rawList.length > 0) {
          const normalized = rawList.map((c, idx) => ({
            id: c.course_id || c.id || idx + 1,
            code: c.course_code || c.code || `CS${100 + idx}`,
            name: c.course_name || c.name || 'Core Engineering Subject',
            credits: c.credits || 4,
            semester: c.semester || 3,
            faculty: c.faculty_name || c.faculty || c.faculty_email || 'Dr. Kavya Rao',
            enrolledCount: c.enrolled_count || c.enrolledCount || 60,
            room: c.room || c.classroom || `LH-${201 + (idx % 5)}`,
          }))
          setCourses(normalized)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="view-container">
      <div className="view-intro">
        <h2>Department Course Curriculum</h2>
        <p>Active course offerings, instructional faculty, and room allocations.</p>
      </div>

      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Semester</th>
              <th>Instructor</th>
              <th>Enrolment</th>
              <th>Classroom</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.code || c.id}>
                <td><span className="code-badge">{c.code}</span></td>
                <td><strong>{c.name}</strong></td>
                <td>{c.credits}</td>
                <td>Semester {c.semester}</td>
                <td>{c.faculty}</td>
                <td>{c.enrolledCount} Students</td>
                <td><span className="room-badge">{c.room}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

