import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.mustChangePassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  const role = String(user.role || '').toUpperCase()
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role.toLowerCase() || 'student'}`} replace />
  }

  return <Outlet />
}
