import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function StudentsRosterView() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // New Student Form State
  const [formData, setFormData] = useState({
    roll_number: '',
    first_name: '',
    last_name: '',
    email: '',
    dept_id: 1,
    semester: 4,
    section: 'A',
    cgpa: '8.50',
    emergency_contact: '+91 90000 00001',
  })

  const loadStudents = () => {
    api.get('/students')
      .then((res) => {
        const rawList = res.data?.students || res.students || res.data || res
        if (Array.isArray(rawList)) {
          const normalized = rawList.map((s, idx) => ({
            id: s.student_id || s.id || idx + 1,
            rollNo: s.roll_number || s.rollNo || `USN2026CS00${idx + 1}`,
            name: s.first_name ? `${s.first_name} ${s.last_name || ''}`.trim() : (s.name || 'Student'),
            department: s.dept_name || s.dept_code || s.department || 'Computer Science & Engineering',
            semester: s.semester || 4,
            section: s.section || 'A',
            email: s.email || 'student@edutrack.edu',
            phone: s.phone || '+91 98765 43210',
            guardianContact: s.emergency_contact || s.guardian_phone || s.guardianContact || '+91 90000 00001',
            cgpa: s.cgpa ? String(s.cgpa) : '8.50',
            status: s.is_active !== false ? 'Active' : 'Inactive',
          }))
          setStudents(normalized)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const [deletingId, setDeletingId] = useState(null)

  const handleRemoveStudent = async (student) => {
    const confirmDelete = window.confirm(`Are you sure you want to remove student "${student.name}" (${student.rollNo}) from the roster?`)
    if (!confirmDelete) return

    setDeletingId(student.id)
    setErrorMsg('')
    setStatusMsg('')

    try {
      await api.delete(`/students/${student.id}`)
      setStatusMsg(`Student "${student.name}" has been removed from the directory.`)
      loadStudents()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove student.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCreateStudent = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setStatusMsg('')

    if (!formData.roll_number || !formData.first_name || !formData.email) {
      setErrorMsg('Please enter Roll Number, First Name, and Email.')
      return
    }

    setLoading(true)
    try {
      await api.post('/students', {
        roll_number: formData.roll_number.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        dept_id: Number(formData.dept_id) || 1,
        semester: Number(formData.semester) || 1,
      })

      setStatusMsg(`Student "${formData.first_name} ${formData.last_name}" successfully enrolled!`)
      setShowModal(false)
      setFormData({
        roll_number: '',
        first_name: '',
        last_name: '',
        email: '',
        dept_id: 1,
        semester: 4,
        section: 'A',
        cgpa: '8.50',
        emergency_contact: '+91 90000 00001',
      })
      loadStudents()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to enroll new student.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="view-container">
      <div className="view-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Student Information Directory</h2>
          <p>Comprehensive roster of enrolled students across active academic cohorts.</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => {
            setErrorMsg('')
            setStatusMsg('')
            setShowModal(true)
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
          }}
        >
          <span>＋ Add Student</span>
        </button>
      </div>

      {statusMsg && (
        <div style={{
          padding: '12px 18px',
          marginBottom: '20px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          ✓ {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '12px 18px',
          marginBottom: '20px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#b91c1c',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          ⚠ {errorMsg}
        </div>
      )}

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
              <th style={{ textAlign: 'center' }}>Actions</th>
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
                <td><span className="status-tag safe">{s.status || 'Active'}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(s)}
                    disabled={deletingId === s.id}
                    title="Remove student record"
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {deletingId === s.id ? 'Removing...' : '🗑 Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Enroll New Student (FR-02)</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reddy"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Roll Number / USN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. USN2026CS008"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="priya.r@edutrack.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Department *
                  </label>
                  <select
                    value={formData.dept_id}
                    onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                  >
                    <option value={1}>Computer Science & Engineering (CSE)</option>
                    <option value={2}>Electronics & Communication (ECE)</option>
                    <option value={3}>Information Science (ISE)</option>
                    <option value={4}>Mechanical Engineering (ME)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Semester *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                  >
                    <option value={1}>Sem 1</option>
                    <option value={2}>Sem 2</option>
                    <option value={3}>Sem 3</option>
                    <option value={4}>Sem 4</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#4f46e5',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Saving...' : '✓ Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


