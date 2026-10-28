export const roleMenus = {
  ADMIN: [
    { label: 'Dashboard', path: '/admin', icon: '▦' },
    { label: 'Students Roster', path: '/admin/students', icon: '👥' },
    { label: 'Faculty Directory', path: '/admin/faculty', icon: '🎓' },
    { label: 'Courses & Curriculum', path: '/admin/courses', icon: '📚' },
    { label: 'System Analytics', path: '/admin/reports', icon: '📊' },
  ],

  FACULTY: [
    { label: 'Dashboard', path: '/faculty', icon: '▦' },
    { label: 'My Courses', path: '/faculty/courses', icon: '📚' },
    { label: 'Attendance Tracker', path: '/faculty/attendance', icon: '◷' },
    { label: 'Gradebook & Marks', path: '/faculty/grades', icon: '▤' },
  ],

  STUDENT: [
    { label: 'Dashboard', path: '/student', icon: '▦' },
    { label: 'My Grades', path: '/student/grades', icon: '▤' },
    { label: 'My Attendance', path: '/student/attendance', icon: '◷' },
    { label: 'My Profile', path: '/student/profile', icon: '👤' },
    { label: 'Grievance Desk', path: '/student/grievances', icon: '📝' },
  ],

  PARENT: [
    { label: 'Dashboard', path: '/parent', icon: '▦' },
    { label: 'Child Progress', path: '/parent/grades', icon: '▤' },
    { label: 'Child Attendance', path: '/parent/attendance', icon: '◷' },
  ],
}
