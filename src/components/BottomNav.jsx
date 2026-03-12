import { useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppContext } from '../App'
import './BottomNav.css'

const tabs = [
    { id: 'home', labelKey: 'home', path: '/', icon: 'home' },
    { id: 'consult', labelKey: 'consult', path: '/book', icon: 'consult' },
    { id: 'records', labelKey: 'records', path: '/records', icon: 'records' },
    { id: 'profile', labelKey: 'profile', path: '/profile', icon: 'profile' },
]

const icons = {
    home: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    consult: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
    ),
    records: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    profile: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
}

export default function BottomNav() {
    const location = useLocation()
    const navigate = useNavigate()
    const { language } = useContext(AppContext)

    const labels = {
        en: { home: 'Home', consult: 'Consult', records: 'Records', profile: 'Profile' },
        pa: { home: 'ਘਰ', consult: 'ਸਲਾਹ', records: 'ਰਿਕਾਰਡ', profile: 'ਪ੍ਰੋਫ਼ਾਈਲ' },
        hi: { home: 'होम', consult: 'परामर्श', records: 'रिकॉर्ड', profile: 'प्रोफ़ाइल' },
    }

    const getActiveTab = () => {
        if (location.pathname === '/') return 'home'
        if (location.pathname.startsWith('/book') || location.pathname === '/consultation') return 'consult'
        if (location.pathname === '/records' || location.pathname === '/vault' || location.pathname === '/symptoms') return 'records'
        if (location.pathname === '/profile') return 'profile'
        return 'home'
    }

    const active = getActiveTab()
    const tabLabels = labels[language] || labels.en

    return (
        <nav className="bottom-nav" aria-label="Main navigation">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`nav-tab ${active === tab.id ? 'active' : ''}`}
                    onClick={() => navigate(tab.path)}
                    aria-current={active === tab.id ? 'page' : undefined}
                >
                    {active === tab.id && <div className="nav-indicator" />}
                    <span className="nav-icon">{icons[tab.icon]}</span>
                    <span className="nav-label">{tabLabels[tab.labelKey]}</span>
                </button>
            ))}
        </nav>
    )
}
