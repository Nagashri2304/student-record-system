import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

const CURRENT_YEAR = new Date().getFullYear()

const DEMO_PRESETS = [
  { label: 'Student', username: 'student1', role: 'Student', name: 'Aarav Sharma' },
  { label: 'Faculty', username: 'faculty1', role: 'Faculty', name: 'Dr. Kavya Rao' },
  { label: 'Admin', username: 'admin', role: 'Admin', name: 'System Administrator' },
  { label: 'Parent', username: 'parent1', role: 'Parent', name: 'Parent of Aarav' },
]

export default function Login() {
  const [username, setUsername] = useState('student1')
  const [password, setPassword] = useState('Test@1234')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  function handleQuickLogin(preset) {
    setUsername(preset.username)
    setPassword('Test@1234')
    setError('')
  }

  async function performLogin(userToAuth, passToAuth) {
    setError('')
    setLoading(true)

    try {
      const result = await api.post('/auth/login', {
        username: userToAuth,
        password: passToAuth,
      })

      const data = result.data ?? result
      const token = data.token
      const user = data.user ?? {
        role: data.role,
        name: data.name || userToAuth,
        mustChangePassword: data.mustChangePassword,
      }

      if (!token || !user.role) {
        throw new Error('Unexpected login response format.')
      }

      login(token, user)

      if (user.mustChangePassword) {
        navigate('/change-password', { replace: true })
      } else {
        navigate(`/${String(user.role).toLowerCase()}`, { replace: true })
      }
    } catch (err) {
      // If backend is down or unreachable, allow fallback demo login
      const matchedPreset = DEMO_PRESETS.find(
        (p) => p.username.toLowerCase() === userToAuth.toLowerCase()
      )

      if (matchedPreset && (!err.message || err.message.includes('Cannot connect'))) {
        const demoUser = {
          id: 1,
          username: matchedPreset.username,
          name: matchedPreset.name,
          role: matchedPreset.role,
          mustChangePassword: false,
        }
        login('demo-fallback-jwt-token', demoUser)
        navigate(`/${matchedPreset.role.toLowerCase()}`, { replace: true })
        return
      }

      setError(err.message || 'Unable to sign in. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    performLogin(username, password)
  }

  return (
    <main className="auth-shell">
      {/* Left Branding Showcase */}
      <section className="auth-showcase">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">S</div>
          <span className="brand-title">Student<span className="brand-light">Space</span></span>
        </div>

        <div className="showcase-content">
          <span className="eyebrow">
            <span className="status-dot" />
            ACADEMIC RECORD & LIFECYCLE MANAGEMENT
          </span>

          <h1>
            Every student record.
            <br />
            <span>One connected portal.</span>
          </h1>

          <p className="showcase-description">
            A high-performance management system for student records, automated course attendance, 
            instant gradebook access, and seamless parent-institution communication.
          </p>

          <div className="feature-preview">
            <div className="feature-icon" aria-hidden="true">✓</div>
            <div>
              <strong>Unified Academic Portal</strong>
              <p>Real-time access to CGPA, semester transcripts, and attendance metrics.</p>
            </div>
          </div>

          <div className="floating-card floating-card-top">
            <span className="floating-card-icon">▦</span>
            <span>
              <strong>Role-Based Access Control</strong>
              <small>Student · Faculty · Admin · Parent</small>
            </span>
          </div>

          <div className="floating-card floating-card-bottom">
            <span className="floating-card-icon chart-icon">📈</span>
            <span>
              <strong>Live Academic Insights</strong>
              <small>Real-time attendance & grade averages</small>
            </span>
          </div>
        </div>

        <div className="showcase-footer">
          <span>STUDENT RECORD SYSTEM · PES UNIVERSITY</span>
          <span>Secure · Audited · Cloud-Ready</span>
        </div>
      </section>

      {/* Right Login Panel */}
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand brand-lockup">
            <div className="brand-mark" aria-hidden="true">S</div>
            <span className="brand-title">Student<span className="brand-light">Space</span></span>
          </div>

          <div className="form-heading">
            <span className="form-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Access your personalized portal and academic dashboard.</p>
          </div>

          {/* Quick Demo Role Selector */}
          <div className="quick-roles-container">
            <span className="quick-roles-label">Quick Demo Fill:</span>
            <div className="quick-roles-buttons">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  className={`quick-role-btn ${username === preset.username ? 'active' : ''}`}
                  onClick={() => handleQuickLogin(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="username">Username or ID</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="e.g. student1, admin, faculty1"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label htmlFor="password">Password</label>
                <span className="field-hint">Default: Test@1234</span>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter account password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <span className="error-icon" aria-hidden="true">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="auth-security-note">
            <span className="security-symbol" aria-hidden="true">🔒</span>
            <span>256-bit SSL encrypted authentication. Access is logged and monitored.</span>
          </div>

          <footer className="auth-footer">
            <span>© {CURRENT_YEAR} Student Record System</span>
            <span>Academic Portal v1.0</span>
          </footer>
        </div>
      </section>
    </main>
  )
}
