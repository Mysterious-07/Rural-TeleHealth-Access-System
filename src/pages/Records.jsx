import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Header from '../components/Header'
import './Records.css'

export default function Records() {
  const { token } = useContext(AuthContext)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/consultations/reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setReports(data.data)
        } else {
          setError(data.message)
        }
      } catch (err) {
        setError('Failed to load records')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [token])

  const formatDate = (isoStr) => {
    return new Date(isoStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="records-page">
      <Header title="Medical Records" />
      <main className="page-content">
        <div className="records-container">
          <h2>AI-Summarized Consultation Reports</h2>
          <p className="records-intro">All your previous tele-consultations are automatically summarized by AI and saved here.</p>

          {loading ? (
            <div className="records-loading">Loading your records...</div>
          ) : error ? (
            <div className="records-error">{error}</div>
          ) : reports.length === 0 ? (
            <div className="records-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p>No consultation reports found yet.</p>
            </div>
          ) : (
            <div className="reports-list">
              {reports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <span className="report-date">{formatDate(report.date)}</span>
                    <span className="report-duration">Duration: {Math.round(report.durationSeconds / 60)}m</span>
                  </div>
                  <div className="report-body">
                    <div className="report-section">
                      <h4>AI Summary</h4>
                      <p className="report-summary">{report.summary}</p>
                    </div>
                    <div className="report-section">
                      <h4>Transcript Snippet</h4>
                      <p className="report-transcript">"{report.transcriptSnippet}..."</p>
                    </div>
                  </div>
                  <div className="report-footer">
                    <span className="report-status-badge">Finalized</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
