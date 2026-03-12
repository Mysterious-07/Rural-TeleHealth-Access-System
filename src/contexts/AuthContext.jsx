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

  const login = useCallback(async ({ phone, password, role }) => {
    if (role === 'patient') {
      throw new Error('Patient login uses OTP. Please request an OTP first.')
    }

    let res
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
    } catch (networkErr) {
      throw new Error('Unable to reach auth server — make sure the backend is running')
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Login failed')
    }

    const data = await res.json()
    saveAuth(data)
    return data.user
  }, [])

  const requestOtp = useCallback(async ({ phone }) => {
    const res = await fetch('/api/auth/patient/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Unable to request OTP')
    }

    return res.json()
  }, [])

  const verifyOtp = useCallback(async ({ phone, otp }) => {
    const res = await fetch('/api/auth/patient/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'OTP verification failed')
    }

    const data = await res.json()
    saveAuth(data)
    return data.user
  }, [])

  const register = useCallback(async ({ name, phone, password, role }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password, role }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Registration failed')
    }

    const data = await res.json()
    saveAuth(data)
    return data.user
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
