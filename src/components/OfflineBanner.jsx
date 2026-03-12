import { useContext } from 'react'
import { AppContext } from '../App'

export default function OfflineBanner() {
    const { connectivity } = useContext(AppContext)
    if (connectivity !== 'offline') return null

    return (
        <div className="offline-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>You're offline — showing cached data</span>
        </div>
    )
}
