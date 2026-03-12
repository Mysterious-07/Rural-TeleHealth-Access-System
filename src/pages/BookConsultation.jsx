import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import EmergencyFAB from '../components/EmergencyFAB'
import './BookConsultation.css'

const specialties = ['General', 'Pediatric', 'Gynecology', 'Orthopedic', 'Eye', 'Skin']

const doctors = [
    { initials: 'RS', name: 'Dr. Rajinder Singh', specialty: 'General Physician', status: 'available', wait: 'Available now' },
    { initials: 'PK', name: 'Dr. Priya Kaur', specialty: 'Pediatrician', status: 'waiting', wait: '~10 min wait' },
    { initials: 'AG', name: 'Dr. Amrit Grewal', specialty: 'Orthopedics', status: 'available', wait: 'Available now' },
    { initials: 'SS', name: 'Dr. Simran Sandhu', specialty: 'Gynecologist', status: 'waiting', wait: '~25 min wait' },
]

export default function BookConsultation() {
    const navigate = useNavigate()
    const [consultType, setConsultType] = useState('video')
    const [specialty, setSpecialty] = useState('General')
    const [step] = useState(1)

    const types = [
        {
            id: 'video', label: 'Video Call', desc: 'Face-to-face with doctor', iconBg: '#CCFBF1', recommended: true,
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
        },
        {
            id: 'audio', label: 'Audio Call', desc: 'Works on 2G networks', iconBg: '#FEF3C7',
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
        },
        {
            id: 'chat', label: 'Text Chat', desc: 'Lowest data usage', iconBg: '#DCFCE7',
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
        },
    ]

    return (
        <div className="app-layout">
            <Header title="Book Consultation" showBack onBack={() => navigate('/')} />
            <main className="page-content book-page">
                {/* Step Progress */}
                <div className="step-progress">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="step-group">
                            <div className={`step-circle ${s < step ? 'completed' : ''} ${s === step ? 'active' : ''} ${s > step ? 'future' : ''}`}>
                                {s < step ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : s}
                            </div>
                            <span className="step-label">{s === 1 ? 'Type' : s === 2 ? 'Doctor' : 'Confirm'}</span>
                            {s < 3 && <div className={`step-line ${s < step ? 'completed' : ''}`} />}
                        </div>
                    ))}
                </div>

                {/* Consultation Type */}
                <section className="section">
                    <h3 className="section-title">Consultation Type</h3>
                    <div className="type-list">
                        {types.map(t => (
                            <button
                                key={t.id}
                                className={`card type-card ${consultType === t.id ? 'selected' : ''}`}
                                onClick={() => setConsultType(t.id)}
                            >
                                <div className="type-icon" style={{ background: t.iconBg }}>{t.icon}</div>
                                <div className="type-info">
                                    <span className="type-label">{t.label}</span>
                                    <span className="type-desc">{t.desc}</span>
                                </div>
                                <div className={`radio ${consultType === t.id ? 'checked' : ''}`}>
                                    {consultType === t.id && <div className="radio-dot" />}
                                </div>
                                {t.recommended && <span className="recommended-badge">Recommended</span>}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Specialty Chips */}
                <section className="section">
                    <h3 className="section-title">Select Specialty</h3>
                    <div className="chips-scroll">
                        {specialties.map(s => (
                            <button
                                key={s}
                                className={`chip ${specialty === s ? 'active' : ''}`}
                                onClick={() => setSpecialty(s)}
                            >{s}</button>
                        ))}
                    </div>
                </section>

                {/* Doctor Cards */}
                <section className="section">
                    <h3 className="section-title">Available Doctors</h3>
                    <div className="doctor-list">
                        {doctors.map((doc, i) => (
                            <div className="card doctor-card" key={i}>
                                <div className="doc-avatar">{doc.initials}</div>
                                <div className="doc-info">
                                    <span className="doc-name">{doc.name}</span>
                                    <span className="doc-specialty">{doc.specialty}</span>
                                    <span className={`doc-status ${doc.status === 'available' ? 'text-success' : 'text-warning'}`}>
                                        {doc.status === 'available' ? '● ' : '● '}{doc.wait}
                                    </span>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/consultation')}>Book</button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="sticky-bottom-spacer" />
            </main>

            {/* Sticky CTA */}
            <div className="sticky-cta">
                <button className="btn btn-primary btn-full sticky-cta-btn" onClick={() => navigate('/consultation')}>
                    Confirm Booking →
                </button>
            </div>

            <EmergencyFAB />
            <BottomNav />
        </div>
    )
}
