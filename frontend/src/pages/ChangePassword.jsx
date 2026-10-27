import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(newPassword)) {
      setError(
        'Use at least 8 characters, including uppercase, lowercase, and a number.'
      )
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })

      setMessage('Password updated successfully! Please sign in again.')
      setTimeout(() => {
        logout()
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err) {
      setError(err.message || 'Could not change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="view-container" style={{ maxWidth: '640px', margin: '40px auto' }}>
      <div className="portal-card">
        <div className="portal-card-header">
          <h2>Update Account Security Password</h2>
          <p>
            {user?.mustChangePassword
              ? 'You must change your initial temporary password before continuing.'
              : 'Choose a strong, unique password to secure your academic account.'}
          </p>
        </div>

        {error && <div className="auth-error" style={{ margin: '16px 0' }}>{error}</div>}
        {message && <div className="success-banner" style={{ margin: '16px 0' }}>{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '20px' }}>
          <div className="field-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Enter existing password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 chars (uppercase, lowercase, number)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="submit" className="primary-pill-btn" disabled={loading}>
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
