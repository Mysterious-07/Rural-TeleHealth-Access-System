import { useContext } from 'react'
import { AppContext } from '../App'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Header.css'

const labels = {
    en: { synced: 'Synced', syncing: 'Syncing...', offline: 'Offline' },
    pa: { synced: 'ਸਿੰਕ ਹੋਇਆ', syncing: 'ਸਿੰਕ ਹੋ ਰਿਹਾ...', offline: 'ਆਫਲਾਈਨ' },
    hi: { synced: 'सिंक हुआ', syncing: 'सिंक हो रहा...', offline: 'ऑफलाइन' }
}

export default function Header({ title, showBack, onBack }) {
    const { connectivity, toggleConnectivity, language, setLanguage } = useContext(AppContext)
    const { user, isAuthenticated, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const syncLabel = labels[language]?.[connectivity] || labels.en[connectivity]

    const syncClass = connectivity === 'synced' ? 'pill-success' :
        connectivity === 'syncing' ? 'pill-warning' : 'pill-danger'
    const dotClass = connectivity === 'synced' ? 'dot-success' :
        connectivity === 'syncing' ? 'dot-warning' : 'dot-danger'

    const onSignOut = () => {
        logout()
        navigate('/login/patient')
    }

    return (
        <header className="app-header">
            <div className="header-top">
                <div className="header-left">
                    {showBack ? (
                        <button className="back-btn" onClick={onBack} aria-label="Go back">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : null}
                    {title ? (
                        <h1 className="header-title">{title}</h1>
                    ) : (
                        <span className="header-brand">NabhaCare</span>
                    )}
                </div>
                <div className="header-right">
                    <button className={`pill ${syncClass}`} onClick={toggleConnectivity} aria-label="Connection status">
                        <span className={`dot ${dotClass} ${connectivity === 'synced' ? 'dot-pulse' : ''} ${connectivity === 'syncing' ? 'dot-spin' : ''}`}></span>
                        {syncLabel}
                    </button>
                    {isAuthenticated ? (
                        <>
                            {(user?.role === 'admin' || user?.role === 'doctor') && (
                                <button className="pill pill-secondary" onClick={() => navigate('/dashboard')} style={{ marginLeft: '0.5rem' }}>
                                    Dashboard
                                </button>
                            )}
                            <button className="pill pill-secondary" onClick={onSignOut} style={{ marginLeft: '0.5rem' }}>
                                Sign out
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
            <div className="lang-switcher">
                {['en', 'pa', 'hi'].map(l => (
                    <button
                        key={l}
                        className={`lang-btn ${language === l ? 'active' : ''}`}
                        onClick={() => setLanguage(l)}
                    >
                        {l === 'en' ? 'ENG' : l === 'pa' ? 'ਪੰਜਾਬੀ' : 'हिंदी'}
                    </button>
                ))}
            </div>
            {isAuthenticated ? (
                <div className="header-user">
                    Signed in as <strong>{user?.name || user?.email}</strong>
                </div>
            ) : null}
        </header>
    )
}
