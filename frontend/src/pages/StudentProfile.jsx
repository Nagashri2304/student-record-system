import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function StudentProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.name || 'Aarav Sharma'
  const displayRollNo = user?.rollNo || 'SR001'
  const displayEmail = user?.email || `${user?.username || 'student1'}@edutrack.edu`
  const displayDept = user?.department || 'Computer Science and Engineering'
  const displaySem = user?.semester ? `Semester ${user.semester}` : 'Semester 3'

  const profileSections = [
    {
      title: 'Personal Information',
      icon: '👤',
      fields: [
        ['Full Name', displayName],
        ['Roll Number / SRN', displayRollNo],
        ['Email Address', displayEmail],
        ['Contact Number', '+91 98765 43210'],
        ['Date of Birth', '14 February 2005'],
        ['Blood Group', 'O Positive (O+)'],
        ['Gender', 'Male'],
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
        ['Class Section', 'Section A'],
        ['Academic Year', '2026–2027'],
        ['Cumulative GPA (CGPA)', '8.85 / 10.0'],
        ['Current Credits Earned', '48 Credits'],
        ['Enrolment Status', 'Active & Enrolled'],
      ],
    },
    {
      title: 'Parent & Guardian Details',
      icon: '🏡',
      fields: [
        ['Father / Guardian Name', 'Rajesh Sharma'],
        ['Guardian Phone', '+91 90000 00001'],
        ['Guardian Email', 'parent.aarav@edutrack.edu'],
        ['Mother’s Name', 'Sunita Sharma'],
        ['Emergency Contact', '+91 90000 00001 (Father)'],
        ['Relationship', 'Father'],
      ],
    },
    {
      title: 'Residential & Address Records',
      icon: '📍',
      fields: [
        ['Present Address', '3rd Cross, Near High Tension Road, Vidhya Nagar'],
        ['Permanent Address', '3rd Cross, Near High Tension Road, Vidhya Nagar'],
        ['City', 'Bengaluru'],
        ['State', 'Karnataka'],
        ['Postal Code', '560064'],
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
