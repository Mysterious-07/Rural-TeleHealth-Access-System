import { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function ProtectedRoute({ allowedRoles, redirectTo = '/login/patient' }) {
  const { isAuthenticated, user, loading } = useContext(AuthContext)
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to='/' replace />
  }

  return <Outlet />
}
