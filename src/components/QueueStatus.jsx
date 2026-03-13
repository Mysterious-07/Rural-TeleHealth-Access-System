import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import './QueueStatus.css'

export default function QueueStatus() {
  const { user, token } = useContext(AuthContext)
  const [queueData, setQueueData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/queue/my-status', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setQueueData(data.data)
      } else {
        setQueueData(null)
      }
    } catch (err) {
      setError('Failed to fetch queue status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [token])

  const handleCancel = async () => {
    if (!queueData) return
    try {
      const res = await fetch(`/api/queue/${queueData.id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setQueueData(null)
      }
    } catch (err) {
      alert('Failed to cancel appointment')
    }
  }

  if (loading) return <div className="queue-loading">Loading status...</div>

  if (!queueData) {
    return (
      <div className="card queue-empty-card">
        <div className="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h3>No active booking</h3>
        <p>You are not currently in any waiting queue.</p>
        <Link to="/book" className="btn btn-primary">Book Consultation</Link>
      </div>
    )
  }

  const { position, doctorName, estimatedWaitMinutes } = queueData

  if (position === 1) {
    return (
      <div className="next-banner-container">
        <div className="next-banner-pulsing">
          <div className="next-banner-content">
            <h2 className="next-title">YOU ARE NEXT!</h2>
            <p className="next-subtitle">Dr. {doctorName} will call shortly</p>
          </div>
        </div>
        <div className="queue-details-mini card">
          <div className="detail-row">
            <span className="label">Estimated Wait</span>
            <span className="value success">~{estimatedWaitMinutes} mins</span>
          </div>
          <button className="btn btn-ghost-danger btn-sm" onClick={handleCancel}>Cancel Appointment</button>
        </div>
      </div>
    )
  }

  return (
    <div className="card queue-status-card">
      <div className="queue-header-main">
        <div className="position-circle">
          <span className="pos-num">{position}</span>
        </div>
        <div className="header-text">
          <h3>Your Position</h3>
          <p>in Dr. {doctorName}'s queue</p>
        </div>
      </div>

      <div className="wait-info-row">
        <div className="wait-item">
          <span className="wait-label">Estimated Wait</span>
          <span className="wait-value">~{estimatedWaitMinutes} mins</span>
        </div>
      </div>

      <div className="queue-progress-container">
        <div className="progress-labels">
          <span>Your Turn</span>
          <span>{position} patients ahead</span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.max(5, 100 - (position * 10))}%` }} 
          />
        </div>
      </div>

      <div className="queue-actions">
        <button className="btn btn-ghost-danger btn-full" onClick={handleCancel}>
          Cancel Appointment
        </button>
      </div>
      
      <p className="queue-hint">
        We'll notify you via SMS when you are next. 
        You can also reply <strong>STATUS</strong> to our SMS.
      </p>
    </div>
  )
}
