import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function StudentsRosterView() {
  const [students, setStudents] = useState([
    { id: 1, rollNo: 'SR001', name: 'Aarav Sharma', department: 'Computer Science and Engineering', semester: 3, section: 'A', email: 'aarav.sharma@edutrack.edu', phone: '+91 98765 43210', guardianContact: '+91 90000 00001', cgpa: '8.85', status: 'Active' },
    { id: 2, rollNo: 'SR002', name: 'Diya Rao', department: 'Computer Science and Engineering', semester: 3, section: 'A', email: 'diya.rao@edutrack.edu', phone: '+91 98765 43211', guardianContact: '+91 90000 00002', cgpa: '9.12', status: 'Active' },
    { id: 3, rollNo: 'SR003', name: 'Ishaan Kumar', department: 'Computer Science and Engineering', semester: 3, section: 'B', email: 'ishaan.kumar@edutrack.edu', phone: '+91 98765 43212', guardianContact: '+91 90000 00003', cgpa: '8.40', status: 'Active' },
    { id: 4, rollNo: 'SR004', name: 'Meera Nair', department: 'Computer Science and Engineering', semester: 3, section: 'B', email: 'meera.nair@edutrack.edu', phone: '+91 98765 43213', guardianContact: '+91 90000 00004', cgpa: '9.30', status: 'Active' },
    { id: 5, rollNo: 'SR005', name: 'Rohan Das', department: 'Computer Science and Engineering', semester: 3, section: 'A', email: 'rohan.das@edutrack.edu', phone: '+91 98765 43214', guardianContact: '+91 90000 00005', cgpa: '7.95', status: 'Active' },
  ])

  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/students')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setStudents(res.data)
        }
      })
      .catch(() => {})
  }, [])

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="view-container">
      <div className="view-intro">
        <h2>Student Information Directory</h2>
        <p>Comprehensive roster of enrolled students across active academic cohorts.</p>
      </div>

      <div className="table-controls">
        <input
          type="search"
          placeholder="🔍 Search student by name, roll number, or department..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="results-count">Showing {filtered.length} students</span>
      </div>

      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Sem / Sec</th>
              <th>CGPA</th>
              <th>Email</th>
              <th>Emergency Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.rollNo}>
                <td><span className="code-badge">{s.rollNo}</span></td>
                <td><strong>{s.name}</strong></td>
                <td>{s.department}</td>
                <td>Sem {s.semester} · {s.section || 'A'}</td>
                <td><strong>{s.cgpa || '8.50'}</strong></td>
                <td>{s.email}</td>
                <td>{s.guardianContact || '+91 90000 00001'}</td>
                <td><span className="status-tag safe">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

