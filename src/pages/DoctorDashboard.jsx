import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { AppContext } from '../App'
import PrescriptionPad from './PrescriptionPad'
import './DoctorDashboard.css'

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'queue', label: 'My Queue', icon: 'queue' },
    { id: 'patients', label: 'Patients', icon: 'users' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'records', label: 'Records', icon: 'file' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
]

const stats = [
    { value: '24', label: 'Patients Today', trend: '+12%', up: true },
    { value: '8', label: 'In Queue', trend: '-3%', up: false },
    { value: '18', label: 'Completed', trend: '+8%', up: true },
    { value: '4.8', label: 'Avg Rating', trend: '+0.2', up: true },
]

const baseQueue = [
    { id: 'P-2847', name: 'Gurpreet Singh', age: 45, village: 'Dhanaula', complaint: 'Fever, body ache', wait: '5 min', urgent: false, type: 'video', triageUrgency: null },
    { id: 'P-2848', name: 'Harjit Kaur', age: 32, village: 'Amloh', complaint: 'Chest pain, breathlessness', wait: '12 min', urgent: true, type: 'video', triageUrgency: 'high' },
    { id: 'P-2849', name: 'Ranjit Kumar', age: 58, village: 'Nabha', complaint: 'Follow-up diabetes', wait: '18 min', urgent: false, type: 'audio', triageUrgency: null },
    { id: 'P-2850', name: 'Manpreet Kaur', age: 28, village: 'Patiala', complaint: 'Prenatal checkup', wait: '25 min', urgent: false, type: 'video', triageUrgency: null },
    { id: 'P-2851', name: 'Baldev Singh', age: 67, village: 'Samana', complaint: 'Knee pain, swelling', wait: '30 min', urgent: false, type: 'chat', triageUrgency: 'low' },
]

const activities = [
    { time: '2:15 PM', text: 'Completed consultation with Amarjit Kaur' },
    { time: '1:45 PM', text: 'Prescription sent to Sharma Medical' },
    { time: '1:20 PM', text: 'Lab report reviewed for Sukhjinder' },
    { time: '12:00 PM', text: 'Started afternoon session' },
]

const triageLabels = {
    high: { label: 'AI: URGENT', bg: '#FEE2E2', color: '#EF4444', icon: '🔴' },
    medium: { label: 'AI: Review', bg: '#FEF3C7', color: '#F59E0B', icon: '🟡' },
    low: { label: 'AI: Low', bg: '#DCFCE7', color: '#22C55E', icon: '🟢' },
}

export default function DoctorDashboard() {
    const { connectivity, toggleConnectivity, language, setLanguage } = useContext(AppContext)
    const [activeNav, setActiveNav] = useState('dashboard')
    const [showPrescription, setShowPrescription] = useState(false)
    const [queue, setQueue] = useState(baseQueue)

    // Pull AI triage data from localStorage and merge with queue
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('nabhacare_triage_queue') || '[]')
            if (stored.length > 0) {
                const latest = stored[stored.length - 1]
                // Add AI-triaged patients to queue (simulate priority insertion)
                const newPatient = {
                    id: `P-${2852 + stored.length}`,
                    name: latest.patient || 'AI Referred Patient',
                    age: 45,
                    village: 'Via AI Triage',
                    complaint: latest.symptoms,
                    wait: 'Just now',
                    urgent: latest.urgency === 'high',
                    type: 'chat',
                    triageUrgency: latest.urgency,
                    aiReferred: true,
                }
                setQueue(prev => {
                    // Insert urgent at top, others at appropriate position
                    if (latest.urgency === 'high') {
                        return [newPatient, ...prev.filter(p => p.id !== newPatient.id)]
                    }
                    return [...prev.filter(p => p.id !== newPatient.id), newPatient]
                })
            }
        } catch (e) { /* silent */ }
    }, [])

    // Sort queue: urgent/high triage first
    const sortedQueue = [...queue].sort((a, b) => {
        const urgencyRank = { high: 0, medium: 1, low: 2, null: 3 }
        const aRank = a.urgent ? -1 : (urgencyRank[a.triageUrgency] ?? 3)
        const bRank = b.urgent ? -1 : (urgencyRank[b.triageUrgency] ?? 3)
        return aRank - bRank
    })

    const syncClass = connectivity === 'synced' ? 'pill-success' :
        connectivity === 'syncing' ? 'pill-warning' : 'pill-danger'
    const dotClass = connectivity === 'synced' ? 'dot-success' :
        connectivity === 'syncing' ? 'dot-warning' : 'dot-danger'

    return (
        <div className="doctor-layout">
            {/* Left Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span className="sidebar-logo">NabhaCare</span>
                    <span className="sidebar-sub">Doctor Portal</span>
                </div>

                <div className="sidebar-profile">
                    <div className="sidebar-avatar">RS</div>
                    <div className="sidebar-profile-info">
                        <span className="sidebar-name">Dr. Rajinder Singh</span>
                        <span className="pill pill-success" style={{ fontSize: '11px', padding: '3px 8px' }}>
                            <span className="dot dot-success" style={{ width: '6px', height: '6px' }}></span>
                            Online
                        </span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`sidebar-nav-item ${activeNav === item.id ? 'active' : ''}`}
                            onClick={() => setActiveNav(item.id)}
                        >
                            <span className="sidebar-nav-icon">
                                {item.icon === 'grid' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
                                {item.icon === 'queue' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>}
                                {item.icon === 'users' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                                {item.icon === 'calendar' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                                {item.icon === 'file' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                                {item.icon === 'settings' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.55a11 11 0 0114.08 0" /><path d="M1.42 9a16 16 0 0121.16 0" /><path d="M8.53 16.11a6 6 0 016.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                    <span>Network: Good</span>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Top Bar */}
                <div className="dash-topbar">
                    <div className="dash-greeting">
                        <h1 className="dash-title">Good morning, Dr. Singh</h1>
                        <span className="dash-date">Wednesday, March 12, 2026</span>
                    </div>
                    <div className="dash-topbar-right">
                        <div className="lang-switcher-desktop">
                            {['en', 'pa', 'hi'].map(l => (
                                <button key={l} className={`lang-btn ${language === l ? 'active' : ''}`} onClick={() => setLanguage(l)}>
                                    {l === 'en' ? 'ENG' : l === 'pa' ? 'ਪੰਜਾਬੀ' : 'हिंदी'}
                                </button>
                            ))}
                        </div>
                        <button className={`pill ${syncClass}`} onClick={toggleConnectivity}>
                            <span className={`dot ${dotClass} dot-pulse`}></span>
                            {connectivity === 'synced' ? 'Synced' : connectivity === 'syncing' ? 'Syncing...' : 'Offline'}
                        </button>
                        <span className="pill pill-warning">
                            {sortedQueue.length} patients waiting
                        </span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="stats-row">
                    {stats.map((s, i) => (
                        <div className="card stat-card" key={i}>
                            <span className="stat-value">{s.value}</span>
                            <span className="stat-label">{s.label}</span>
                            <span className={`stat-trend ${s.up ? 'trend-up' : 'trend-down'}`}>
                                {s.up ? '↑' : '↓'} {s.trend}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Patient Queue */}
                <div className="card queue-card">
                    <div className="queue-header">
                        <h2 className="queue-title">Patient Queue</h2>
                        <span className="queue-subtitle">Sorted by AI triage priority</span>
                    </div>
                    <div className="queue-table-wrap">
                        <table className="queue-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Patient</th>
                                    <th>Village</th>
                                    <th>Complaint</th>
                                    <th>AI Triage</th>
                                    <th>Wait</th>
                                    <th>Type</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedQueue.map((p, i) => (
                                    <tr key={i} className={`${p.urgent || p.triageUrgency === 'high' ? 'urgent-row' : ''} ${p.aiReferred ? 'ai-referred-row' : ''}`}>
                                        <td className="mono" style={{ fontSize: '12px', color: '#6B7280' }}>{p.id}</td>
                                        <td>
                                            <div className="patient-cell">
                                                <span className="patient-name">
                                                    {p.name}
                                                    {p.aiReferred && <span className="ai-badge">AI</span>}
                                                </span>
                                                <span className="patient-age">Age: {p.age}</span>
                                            </div>
                                        </td>
                                        <td className="text-secondary">{p.village}</td>
                                        <td className="complaint-cell">{p.complaint}</td>
                                        <td>
                                            {p.triageUrgency && triageLabels[p.triageUrgency] ? (
                                                <span className="triage-flag" style={{
                                                    background: triageLabels[p.triageUrgency].bg,
                                                    color: triageLabels[p.triageUrgency].color,
                                                }}>
                                                    {triageLabels[p.triageUrgency].icon} {triageLabels[p.triageUrgency].label}
                                                </span>
                                            ) : (
                                                <span className="triage-flag-none">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`pill ${p.urgent || p.triageUrgency === 'high' ? 'pill-danger' : 'pill-warning'}`} style={{ fontSize: '11px' }}>
                                                {p.wait}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="pill pill-teal" style={{ fontSize: '11px' }}>{p.type}</span>
                                        </td>
                                        <td>
                                            <button className="btn btn-primary btn-sm">Start</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Right Panel */}
            <aside className="right-panel">
                <div className="card next-patient-card">
                    <h3 className="rp-section-title">Next Patient</h3>
                    <div className="next-patient-info">
                        <div className="np-avatar">GS</div>
                        <div className="np-details">
                            <span className="np-name">Gurpreet Singh</span>
                            <span className="np-village">Village: Dhanaula</span>
                            <span className="np-visits">Past visits: 7</span>
                        </div>
                    </div>
                    <div className="np-complaint">
                        Fever and body ache since 2 days
                    </div>
                    <button className="btn btn-primary btn-full" onClick={() => setShowPrescription(true)}>
                        Write Prescription
                    </button>
                </div>

                {/* AI Triage Summary */}
                <div className="rp-section">
                    <h3 className="rp-section-title">AI Triage Summary</h3>
                    <div className="triage-summary-cards">
                        <div className="triage-sum-item">
                            <span className="triage-sum-count" style={{ color: '#EF4444' }}>{sortedQueue.filter(p => p.triageUrgency === 'high').length}</span>
                            <span className="triage-sum-label">Urgent</span>
                        </div>
                        <div className="triage-sum-item">
                            <span className="triage-sum-count" style={{ color: '#F59E0B' }}>{sortedQueue.filter(p => p.triageUrgency === 'medium').length}</span>
                            <span className="triage-sum-label">Review</span>
                        </div>
                        <div className="triage-sum-item">
                            <span className="triage-sum-count" style={{ color: '#22C55E' }}>{sortedQueue.filter(p => p.triageUrgency === 'low').length}</span>
                            <span className="triage-sum-label">Low</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="rp-section">
                    <h3 className="rp-section-title">Quick Notes</h3>
                    <textarea className="input notes-textarea" placeholder="Add notes for the session..." rows="4"></textarea>
                </div>

                {/* Activity Feed */}
                <div className="rp-section">
                    <h3 className="rp-section-title">Activity Feed</h3>
                    <div className="activity-feed">
                        {activities.map((a, i) => (
                            <div className="activity-item" key={i}>
                                <span className="activity-time">{a.time}</span>
                                <span className="activity-text">{a.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Prescription Modal */}
            {showPrescription && (
                <PrescriptionPad onClose={() => setShowPrescription(false)} />
            )}
        </div>
    )
}
