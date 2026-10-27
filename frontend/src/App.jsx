import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StudentProfile from './pages/StudentProfile'
import ChangePassword from './pages/ChangePassword'
import GradesView from './pages/GradesView'
import AttendanceView from './pages/AttendanceView'
import CoursesView from './pages/CoursesView'
import StudentsRosterView from './pages/StudentsRosterView'
import FacultyDirectoryView from './pages/FacultyDirectoryView'
import GrievancesView from './pages/GrievancesView'
import ReportsView from './pages/ReportsView'

import './App.css'

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user?.role) {
    return <Navigate to={`/${String(user.role).toLowerCase()}`} replace />
  }

  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Student Role Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="grades" element={<GradesView />} />
              <Route path="attendance" element={<AttendanceView />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="grievances" element={<GrievancesView />} />
            </Route>
          </Route>

          {/* Faculty Role Routes */}
          <Route element={<ProtectedRoute allowedRoles={['FACULTY']} />}>
            <Route path="/faculty" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="courses" element={<CoursesView />} />
              <Route path="attendance" element={<AttendanceView />} />
              <Route path="grades" element={<GradesView />} />
            </Route>
          </Route>

          {/* Admin Role Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="students" element={<StudentsRosterView />} />
              <Route path="faculty" element={<FacultyDirectoryView />} />
              <Route path="courses" element={<CoursesView />} />
              <Route path="reports" element={<ReportsView />} />
            </Route>
          </Route>

          {/* Parent Role Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
            <Route path="/parent" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="grades" element={<GradesView />} />
              <Route path="attendance" element={<AttendanceView />} />
            </Route>
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
