import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem('token')
  )

  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user')

    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      sessionStorage.removeItem('user')
      return null
    }
  })

  const login = (tokenValue, userValue) => {
    sessionStorage.setItem('token', tokenValue)
    sessionStorage.setItem('user', JSON.stringify(userValue))
    setToken(tokenValue)
    setUser(userValue)
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
