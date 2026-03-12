import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Header from '../components/Header'
import './MainDashboard.css'

export default function MainDashboard() {
  const { token, user, logout } = useContext(AuthContext)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Unable to load dashboard data')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) load()
  }, [token])

  return (
    <div className="main-dashboard">
      <Header title="Main Dashboard" />
      <main className="page-content dashboard-page">
        <div className="dashboard-top">
          <div>
            <h2>Welcome, {user?.name || 'Nabha User'}</h2>
            <p className="dashboard-sub">This dashboard displays system-wide user, appointment and communication information.</p>
          </div>
          <button className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>

        {error ? <div className="dashboard-error">{error}</div> : null}

        {loading ? (
          <p>Loading dashboard…</p>
        ) : (
          <>
            {data ? (
              <>
                <div className="dashboard-cards">
                  <div className="card stat-card">
                    <div className="stat-value">{data.stats.users}</div>
                    <div className="stat-label">Users</div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-value">{data.stats.appointments}</div>
                    <div className="stat-label">Appointments</div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-value">{data.stats.communications}</div>
                    <div className="stat-label">Communications</div>
                  </div>
                </div>

                <section className="card table-card">
                  <h3>Users</h3>
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.users.map(u => (
                          <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="card table-card">
                  <h3>Communications</h3>
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>From</th>
                          <th>To</th>
                          <th>Subject</th>
                          <th>Message</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.communications.map(c => {
                          const from = data.users.find(u => u.id === c.from)
                          const to = data.users.find(u => u.id === c.to)
                          return (
                            <tr key={c.id}>
                              <td>{from?.name || c.from}</td>
                              <td>{to?.name || c.to}</td>
                              <td>{c.subject}</td>
                              <td>{c.message}</td>
                              <td>{new Date(c.createdAt).toLocaleString()}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="card table-card">
                  <h3>Appointments</h3>
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.appointments.map(a => {
                          const patient = data.users.find(u => u.id === a.patientId)
                          const doctor = data.users.find(u => u.id === a.doctorId)
                          return (
                            <tr key={a.id}>
                              <td>{patient?.name || a.patientId}</td>
                              <td>{doctor?.name || a.doctorId}</td>
                              <td>{new Date(a.scheduledAt).toLocaleString()}</td>
                              <td>{a.status}</td>
                              <td>{a.type}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            ) : (
              <p>No dashboard data available.</p>
            )}
          </>
        )}
      </main>
    </div>
  )
}
