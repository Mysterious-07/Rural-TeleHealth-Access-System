import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import './DoctorQueue.css'

export default function DoctorQueue() {
  const { user, token } = useContext(AuthContext)
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQueue = async () => {
    try {
      const res = await fetch(`/api/queue/doctor/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setQueue(data.data.queue)
      }
    } catch (err) {
      setError('Failed to fetch doctor queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 15000)
    return () => clearInterval(interval)
  }, [user.id, token])

  const handleAction = async (queueId, type) => {
    try {
      const res = await fetch(`/api/queue/${queueId}/${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        fetchQueue()
      }
    } catch (err) {
      alert(`Failed to ${type} consultation`)
    }
  }

  if (loading) return <div className="doctor-queue-loading">Loading queue...</div>

  const totalWaiting = queue.length
  const estimatedClearTime = totalWaiting * 10

  return (
    <div className="doctor-queue-container">
      <div className="dq-header">
        <h2 className="dq-title">Your Queue — {totalWaiting} patients waiting</h2>
      </div>

      <div className="dq-stats-row">
        <div className="dq-stat-card">
          <span className="dq-stat-label">Total Waiting</span>
          <span className="dq-stat-value">{totalWaiting}</span>
        </div>
        <div className="dq-stat-card">
          <span className="dq-stat-label">Estimated Clear Time</span>
          <span className="dq-stat-value">~{estimatedClearTime} mins</span>
        </div>
      </div>

      <div className="dq-list-container">
        {queue.length === 0 ? (
          <div className="dq-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="dq-empty-text">Queue is clear ✓</p>
          </div>
        ) : (
          <div className="dq-table">
            <div className="dq-table-header">
              <span className="dq-col-pos">#</span>
              <span className="dq-col-patient">Patient</span>
              <span className="dq-col-complaint">Complaint</span>
              <span className="dq-col-wait">Wait</span>
              <span className="dq-col-action">Action</span>
            </div>
            {queue.map((item) => (
              <div 
                key={item.queueId} 
                className={`dq-table-row ${item.isNext ? 'dq-row-next' : ''}`}
              >
                <div className="dq-col-pos">
                  <span className={`dq-pos-badge ${item.isNext ? 'dq-pos-badge-next' : ''}`}>
                    {item.position}
                  </span>
                </div>
                <div className="dq-col-patient">
                  <div className="dq-patient-info">
                    <span className="dq-patient-name">{item.patientName}</span>
                    <span className="dq-patient-phone">{item.patientPhone}</span>
                  </div>
                </div>
                <div className="dq-col-complaint">
                  <span className="dq-complaint-text">{item.chiefComplaint}</span>
                </div>
                <div className="dq-col-wait">
                  <span className="dq-wait-text">{item.waitMinutes}m</span>
                </div>
                <div className="dq-col-action">
                  {item.isNext ? (
                    <button 
                      className="btn btn-primary dq-btn-start"
                      onClick={() => handleAction(item.queueId, 'complete')}
                    >
                      START CONSULTATION
                    </button>
                  ) : (
                    <button 
                      className="btn btn-ghost dq-btn-complete"
                      onClick={() => handleAction(item.queueId, 'complete')}
                    >
                      Mark Complete
                    </button>
                  )}
                  <button 
                    className="btn btn-ghost-danger dq-btn-cancel"
                    onClick={() => handleAction(item.queueId, 'cancel')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
