import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isPatient: false,
  isDoctor: false,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  requestOtp: async () => {},
  verifyOtp: async () => {},
  logout: () => {},
  refreshUser: async () => {},
})

const STORAGE_KEY = 'nabha_auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const saveAuth = (auth) => {
    if (!auth) {
      window.localStorage.removeItem(STORAGE_KEY)
      setUser(null)
      setToken(null)
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    setUser(auth.user)
    setToken(auth.token)
  }

  const logout = useCallback(() => {
    saveAuth(null)
  }, [])

  const login = useCallback(async ({ email, password, role }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      saveAuth(data)
      return data.user
    } catch (err) {
      throw err
    }
  }, [])

  const requestOtp = useCallback(async ({ phone }) => {
    try {
      const res = await fetch('/api/auth/patient/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP')
      return data
    } catch (err) {
      throw err
    }
  }, [])

  const verifyOtp = useCallback(async ({ phone, otp }) => {
    try {
      const res = await fetch('/api/auth/patient/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid OTP')
      saveAuth(data)
      return data.user
    } catch (err) {
      throw err
    }
  }, [])

  const register = useCallback(async ({ name, phone, email, password, role, age, location }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password, role, age, location }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')

      // If patient, registration is successful but no token yet (need OTP login)
      if (role === 'patient') {
        return { success: true, message: data.message }
      }

      saveAuth(data)
      return data.user
    } catch (err) {
      throw err
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) return
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      logout()
      return
    }

    const data = await res.json()
    setUser(data.user)
  }, [token, logout])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token)
          setUser(parsed.user)
        }
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  const contextValue = useMemo(() => {
    const isAuthenticated = Boolean(user && token)
    const role = user?.role
    return {
      user,
      token,
      isAuthenticated,
      isPatient: isAuthenticated && role === 'patient',
      isDoctor: isAuthenticated && role === 'doctor',
      isAdmin: isAuthenticated && role === 'admin',
      login,
      register,
      requestOtp,
      verifyOtp,
      logout,
      refreshUser,
      loading,
    }
  }, [user, token, login, register, requestOtp, verifyOtp, logout, refreshUser, loading])

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
