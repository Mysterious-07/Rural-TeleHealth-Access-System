import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import EmergencyFAB from '../components/EmergencyFAB'
import './HealthRecords.css'

const filters = ['All', 'Consultations', 'Lab Reports', 'Prescriptions']

const records = [
    {
        type: 'consultation', date: 'Mar 10, 2026', label: 'Consultation',
        doctor: 'Dr. Rajinder Singh', summary: 'Follow-up for fever and throat pain. Prescribed antibiotics for 5 days.',
        color: '#CCFBF1', textColor: '#0D9488'
    },
    {
        type: 'lab', date: 'Mar 8, 2026', label: 'Lab Report',
        doctor: 'Civil Hospital Lab', summary: 'CBC test — all parameters normal. Hemoglobin at 13.2 g/dL.',
        color: '#EDE9FE', textColor: '#7C3AED'
    },
    {
        type: 'prescription', date: 'Mar 5, 2026', label: 'Prescription',
        doctor: 'Dr. Priya Kaur', summary: 'Paracetamol 500mg, Cetirizine 10mg for 3 days.',
        color: '#FEF3C7', textColor: '#F59E0B'
    },
    {
        type: 'consultation', date: 'Feb 28, 2026', label: 'Consultation',
        doctor: 'Dr. Amrit Grewal', summary: 'Seasonal cold symptoms. Advised rest and fluids.',
        color: '#CCFBF1', textColor: '#0D9488'
    },
    {
        type: 'lab', date: 'Feb 20, 2026', label: 'Lab Report',
        doctor: 'Civil Hospital Lab', summary: 'Blood sugar fasting: 98 mg/dL — within normal range.',
        color: '#EDE9FE', textColor: '#7C3AED'
    },
]

export default function HealthRecords() {
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState('All')

    const filtered = activeFilter === 'All' ? records :
        records.filter(r => {
            if (activeFilter === 'Consultations') return r.type === 'consultation'
            if (activeFilter === 'Lab Reports') return r.type === 'lab'
            if (activeFilter === 'Prescriptions') return r.type === 'prescription'
            return true
        })

    return (
        <div className="app-layout">
            <Header title="My Health Records" showBack onBack={() => navigate('/')} />
            <main className="page-content records-page">
                {/* AI Summary Link */}
                <div className="ai-records-banner" onClick={() => navigate('/ai-reports')}>
                    <div className="ai-banner-content">
                        <div className="ai-banner-icon">🤖</div>
                        <div className="ai-banner-text">
                            <h4>View AI Consultation Summaries</h4>
                            <p>Get automated reports of your doctor visits.</p>
                        </div>
                    </div>
                    <div className="ai-banner-arrow">→</div>
                </div>

                {/* Filter Chips */}
                <div className="chips-scroll">
                    {filters.map(f => (
                        <button
                            key={f}
                            className={`chip ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >{f}</button>
                    ))}
                </div>

                {/* Timeline */}
                <div className="timeline">
                    {filtered.map((rec, i) => (
                        <div className="timeline-entry" key={i}>
                            <div className="timeline-spine">
                                <div className="timeline-dot" />
                                {i < filtered.length - 1 && <div className="timeline-line" />}
                            </div>
                            <div className="card timeline-card">
                                <div className="record-header">
                                    <span className="record-badge" style={{ background: rec.color, color: rec.textColor }}>
                                        {rec.label}
                                    </span>
                                    <span className="record-date">{rec.date}</span>
                                </div>
                                <span className="record-doctor">{rec.doctor}</span>
                                <p className="record-summary">{rec.summary}</p>
                                <div className="record-actions">
                                    <button className="text-link">View Details →</button>
                                    <span className="pdf-chip">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        PDF
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Offline Footer */}
                <div className="offline-footer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Records available offline • Last synced 2h ago</span>
                </div>
            </main>
            <EmergencyFAB />
            <BottomNav />
        </div>
    )
}
