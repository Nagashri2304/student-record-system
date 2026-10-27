const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem('token')

  let response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error(
      `Cannot connect to backend server at ${API_BASE_URL}. Ensure backend is running.`
    )
  }

  let result
  try {
    result = await response.json()
  } catch {
    result = {}
  }

  if (response.status === 401) {
    if (endpoint !== '/auth/login') {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    throw new Error(
      result.error?.message || result.message || 'Invalid credentials or session expired.'
    )
  }

  if (!response.ok) {
    throw new Error(
      result.error?.message || result.message || `Request failed with status ${response.status}`
    )
  }

  return result
}

export const api = {
  get: (endpoint) => apiRequest(endpoint),

  post: (endpoint, data) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (endpoint, data) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data) =>
    apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: 'DELETE',
    }),
}
