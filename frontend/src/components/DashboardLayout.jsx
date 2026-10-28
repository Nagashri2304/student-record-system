import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roleMenus } from '../config/menu'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const role = String(user?.role || 'STUDENT').toUpperCase()
  const menuItems = roleMenus[role] || roleMenus.STUDENT || []

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  // Get current page label for header
  const currentItem = menuItems.find((item) => item.path === location.pathname)
  const pageTitle = currentItem?.label || 'Overview'

  const userInitial = (user?.name || user?.username || 'U').charAt(0).toUpperCase()

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-badge-icon" aria-hidden="true">S</div>
          <div>
            <h2 className="brand-name">Student<span>Space</span></h2>
            <span className="brand-tagline">Academic Records</span>
          </div>
        </div>

        <div className="sidebar-user-card">
          <div className="sidebar-avatar">{userInitial}</div>
          <div className="sidebar-user-info">
            <span className="user-name">{user?.name || user?.username || 'User'}</span>
            <span className="user-role-badge">{role}</span>
          </div>
        </div>

        <div className="sidebar-section-title">NAVIGATION</div>
        <nav aria-label="Main navigation" className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role.toLowerCase()}`}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon || '•'}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span aria-hidden="true">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              ☰
            </button>
            <div>
              <h1 className="header-title">{pageTitle}</h1>
              <p className="header-subtitle">
                Welcome back, {user?.name || user?.username || 'User'} · {role.toLowerCase()} account
              </p>
            </div>
          </div>

          <div className="header-right">
            <div className="system-status-indicator">
              <span className="indicator-dot" />
              <span>System Online</span>
            </div>
            <div className="header-avatar" title={user?.name || user?.username}>
              {userInitial}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
