import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import OfflineBanner from '../components/OfflineBanner'
import EmergencyFAB from '../components/EmergencyFAB'
import './Home.css'

const quickActions = [
    {
        id: 'consult',
        title: 'Consult Doctor',
        subtitle: 'Available now',
        iconBg: '#CCFBF1',
        iconColor: '#0D9488',
        badgeBg: '#CCFBF1',
        badgeColor: '#0D9488',
        path: '/book',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a2 2 0 002 2h1a2 2 0 002-2V5a2 2 0 00-2-2 .3.3 0 10.8.3" />
                <path d="M8 15v1a6 6 0 006 6v0a6 6 0 006-6v-4" />
                <path d="M22 10v1a2 2 0 01-2 2h-1a2 2 0 01-2-2V7a2 2 0 012-2h1a2 2 0 012 2v3z" />
                <line x1="12" y1="10" x2="12" y2="15" /><line x1="10" y1="13" x2="14" y2="13" />
            </svg>
        ),
    },
    {
        id: 'medicine',
        title: 'Sehat Bhandar',
        subtitle: '3 pharmacies nearby',
        iconBg: '#FEF3C7',
        iconColor: '#F59E0B',
        path: '/medicine',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="18" height="10" rx="5" /><line x1="12" y1="7" x2="12" y2="17" />
            </svg>
        ),
    },
    {
        id: 'vault',
        title: 'Health Vault',
        subtitle: 'Offline ready • QR ID',
        iconBg: '#CCFBF1',
        iconColor: '#0D9488',
        path: '/vault',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
        ),
    },
    {
        id: 'triage',
        title: 'AI Assistant',
        subtitle: 'Chat-based • Low data',
        iconBg: '#FEF3C7',
        iconColor: '#F59E0B',
        badgeBg: '#FEF3C7',
        badgeColor: '#F59E0B',
        path: '/ai-triage',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                <path d="M12 7l1 3h3l-2.5 1.8.9 3L12 13l-2.4 1.8.9-3L8 10h3z" />
            </svg>
        ),
    },
]

const upcomingDoctors = [
    { initials: 'RS', name: 'Dr. Rajinder Singh', specialty: 'General Physician', time: 'Today 2:30 PM', type: 'video' },
    { initials: 'PK', name: 'Dr. Priya Kaur', specialty: 'Pediatrician', time: 'Tomorrow 10 AM', type: 'audio' },
    { initials: 'AG', name: 'Dr. Amrit Grewal', specialty: 'Orthopedics', time: 'Fri, 11 AM', type: 'video' },
]

const recentPrescriptions = [
    { name: 'Paracetamol 500mg', pharmacy: 'Sharma Medical', inStock: true },
    { name: 'Amoxicillin 250mg', pharmacy: 'City Pharmacy', inStock: false },
    { name: 'Cetirizine 10mg', pharmacy: 'Nabha Health Store', inStock: true },
]

// Impact & Savings data (Feature 5)
const impactData = {
    distanceSaved: 127,    // km
    moneySaved: 3450,      // INR
    workDaysPreserved: 8,  // days
    consultations: 12,
}

export default function Home() {
    const navigate = useNavigate()

    return (
        <div className="app-layout">
            <Header />
            <OfflineBanner />
            <main className="page-content home-page">
                {/* Greeting Card */}
                <div className="card greeting-card">
                    <h2 className="greeting-text">Sat Sri Akal, Gurpreet 👋</h2>
                    <p className="greeting-sub">How are you feeling today?</p>
                    <div className="doctor-available">
                        <span className="dot dot-success dot-pulse"></span>
                        <span>1 doctor available now</span>
                    </div>
                </div>

                {/* Impact & Savings Dashboard (Feature 5) */}
                <div className="card impact-dashboard">
                    <div className="impact-header">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                        </svg>
                        <span className="impact-title">Your Health Savings</span>
                    </div>
                    <div className="impact-grid">
                        <div className="impact-stat">
                            <span className="impact-value">{impactData.distanceSaved}<span className="impact-unit">km</span></span>
                            <span className="impact-label">Travel Saved</span>
                            <div className="impact-icon-bg teal-bg">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            </div>
                        </div>
                        <div className="impact-stat">
                            <span className="impact-value">₹{impactData.moneySaved.toLocaleString('en-IN')}</span>
                            <span className="impact-label">Money Saved</span>
                            <div className="impact-icon-bg gold-bg">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                            </div>
                        </div>
                        <div className="impact-stat">
                            <span className="impact-value">{impactData.workDaysPreserved}<span className="impact-unit">days</span></span>
                            <span className="impact-label">Work Days Saved</span>
                            <div className="impact-icon-bg green-bg">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="impact-footer">
                        <span className="impact-footer-text">Based on {impactData.consultations} TeleHealth consultations</span>
                    </div>
                </div>

                {/* Quick Action Grid */}
                <div className="quick-grid">
                    {quickActions.map(action => (
                        <button
                            key={action.id}
                            className="card card-interactive quick-card"
                            onClick={() => navigate(action.path)}
                        >
                            <div className="quick-icon" style={{ background: action.iconBg }}>
                                {action.icon}
                            </div>
                            <span className="quick-title">{action.title}</span>
                            {action.badgeBg ? (
                                <span className="quick-badge" style={{ background: action.badgeBg, color: action.badgeColor }}>
                                    {action.subtitle}
                                </span>
                            ) : (
                                <span className="quick-subtitle">{action.subtitle}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Upcoming Appointments */}
                <section className="section">
                    <h3 className="section-title">Upcoming Appointments</h3>
                    <div className="appointments-scroll">
                        {upcomingDoctors.map((doc, i) => (
                            <div className="card appointment-card" key={i}>
                                <div className="apt-avatar" style={{ background: '#CCFBF1', color: '#0D9488' }}>
                                    {doc.initials}
                                </div>
                                <div className="apt-info">
                                    <span className="apt-name">{doc.name}</span>
                                    <span className="apt-specialty">{doc.specialty}</span>
                                </div>
                                <div className="apt-meta">
                                    <span className="pill pill-warning">{doc.time}</span>
                                    {doc.type === 'video' ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Prescriptions */}
                <section className="section">
                    <h3 className="section-title">Recent Prescriptions</h3>
                    <div className="prescriptions-list">
                        {recentPrescriptions.map((rx, i) => (
                            <div className="prescription-item" key={i}>
                                <span className={`dot ${rx.inStock ? 'dot-success' : 'dot-danger'}`}></span>
                                <div className="rx-info">
                                    <span className="rx-name">{rx.name}</span>
                                    <span className="rx-pharmacy">{rx.pharmacy}</span>
                                </div>
                                <span className={`rx-status ${rx.inStock ? 'text-success' : 'text-danger'}`}>
                                    {rx.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <EmergencyFAB />
            <BottomNav />
        </div>
    )
}
