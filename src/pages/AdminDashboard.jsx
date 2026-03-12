import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Header from '../components/Header'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const { token, user, logout } = useContext(AuthContext)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Unable to load admin stats')
        const data = await res.json()
        setStats(data.stats)

        const userRes = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!userRes.ok) throw new Error('Unable to load users')
        const userData = await userRes.json()
        setUsers(userData.users || [])
      } catch (err) {
        setError(err.message)
      }
    }

    load()
  }, [token])

  return (
    <div className="admin-layout">
      <Header title="Admin Console" />
      <main className="page-content admin-page">
        <div className="admin-top">
          <div>
            <h2>Welcome, {user?.name}</h2>
            <p className="admin-sub">Manage users, monitor activity, and keep the system healthy.</p>
          </div>
          <button className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>

        {error ? <div className="admin-error">{error}</div> : null}

        <div className="admin-grid">
          <section className="card admin-stats">
            <h3>System overview</h3>
            {stats ? (
              <div className="stats-grid">
                <div className="stat">
                  <div className="stat-value">{stats.patients}</div>
                  <div className="stat-label">Patients</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{stats.doctors}</div>
                  <div className="stat-label">Doctors</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{stats.admins}</div>
                  <div className="stat-label">Admins</div>
                </div>
              </div>
            ) : (
              <p>Loading stats…</p>
            )}
          </section>

          <section className="card admin-users">
            <h3>Users</h3>
            <div className="users-table">
              <div className="users-row users-header">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
              </div>
              {users.map(u => (
                <div key={u.id} className="users-row">
                  <span>{u.name}</span>
                  <span>{u.email}</span>
                  <span className="user-role">{u.role}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
