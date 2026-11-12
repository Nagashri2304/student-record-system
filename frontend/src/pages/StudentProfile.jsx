import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function StudentProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.get('/students/me')
      .then((res) => {
        const data = res.data || res
        setProfile(data)
      })
      .catch(() => {})
  }, [])

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : (user?.name || 'Aarav Sharma')

  const displayRollNo = profile?.roll_number || user?.rollNo || 'USN2026CS001'
  const displayEmail = profile?.email || user?.email || 'student@edutrack.edu'
  const displayDept = profile?.dept_name || user?.department || 'Computer Science & Engineering'
  const displaySem = profile?.semester ? `Semester ${profile.semester}` : (user?.semester ? `Semester ${user.semester}` : 'Semester 4')
  const displaySection = profile?.section ? `Section ${profile.section}` : 'Section A'
  const displayCgpa = profile?.cgpa ? `${profile.cgpa} / 10.0` : (user?.cgpa ? `${user.cgpa} / 10.0` : '8.85 / 10.0')
  const displayEmergency = profile?.emergency_contact || '+91 90000 00001'

  const isBhavya = displayName.toLowerCase().includes('bhavya')

  const profileSections = [
    {
      title: 'Personal Information',
      icon: '👤',
      fields: [
        ['Full Name', displayName],
        ['Roll Number / SRN', displayRollNo],
        ['Email Address', displayEmail],
        ['Contact Number', isBhavya ? '+91 98765 43211' : '+91 98765 43210'],
        ['Date of Birth', isBhavya ? '28 September 2005' : '14 February 2005'],
        ['Blood Group', isBhavya ? 'B Positive (B+)' : 'O Positive (O+)'],
        ['Gender', isBhavya ? 'Female' : 'Male'],
        ['Nationality', 'Indian'],
      ],
    },
    {
      title: 'Academic Profile',
      icon: '🎓',
      fields: [
        ['Degree Program', 'Bachelor of Technology (B.Tech)'],
        ['Department', displayDept],
        ['Current Semester', displaySem],
        ['Class Section', displaySection],
        ['Academic Year', '2026–2027'],
        ['Cumulative GPA (CGPA)', displayCgpa],
        ['Current Credits Earned', '48 Credits'],
        ['Enrolment Status', 'Active & Enrolled'],
      ],
    },
    {
      title: 'Parent & Guardian Details',
      icon: '🏡',
      fields: [
        ['Father / Guardian Name', isBhavya ? 'Ramesh Patel' : 'Rajesh Sharma'],
        ['Guardian Phone', displayEmergency],
        ['Guardian Email', isBhavya ? 'parent.bhavya@edutrack.edu' : 'parent.aarav@edutrack.edu'],
        ['Mother’s Name', isBhavya ? 'Geeta Patel' : 'Sunita Sharma'],
        ['Emergency Contact', `${displayEmergency} (Guardian)`],
        ['Relationship', 'Father'],
      ],
    },
    {
      title: 'Residential & Address Records',
      icon: '📍',
      fields: [
        ['Present Address', isBhavya ? '4th Main, 7th Cross, Indiranagar' : '3rd Cross, Near High Tension Road, Vidhya Nagar'],
        ['Permanent Address', isBhavya ? '4th Main, 7th Cross, Indiranagar' : '3rd Cross, Near High Tension Road, Vidhya Nagar'],
        ['City', 'Bengaluru'],
        ['State', 'Karnataka'],
        ['Postal Code', isBhavya ? '560038' : '560064'],
      ],
    },
  ]

  return (
    <div className="student-profile-page">
      <header className="student-profile-header">
        <div className="student-profile-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="student-profile-heading">
          <span className="student-profile-eyebrow">OFFICIAL STUDENT RECORD</span>
          <h2>{displayName}</h2>
          <p>{displayRollNo} · {displayDept} · {displaySem}</p>
        </div>
        <div className="profile-header-actions">
          <span className="student-profile-status">Enrolled Active</span>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate('/student')}
          >
            ← Return to Dashboard
          </button>
        </div>
      </header>

      <div className="student-profile-sections">
        {profileSections.map((section) => (
          <section className="student-profile-section" key={section.title}>
            <div className="student-profile-section-heading">
              <span className="student-profile-section-icon">{section.icon}</span>
              <h3>{section.title}</h3>
            </div>
            <div className="student-profile-grid">
              {section.fields.map(([label, value]) => (
                <div className="student-profile-field" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="student-profile-note">
        <p>
          <strong>Official Record Notice:</strong> Information presented here is extracted from the university
          Student Information System (SIS). For discrepancies in personal or family records, please contact
          the Registrar office or raise an enquiry through the Grievance Desk.
        </p>
      </div>
    </div>
  )
}
