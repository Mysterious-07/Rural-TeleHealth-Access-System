import { useState } from 'react'
import './EmergencyFAB.css'

export default function EmergencyFAB() {
    const [showOverlay, setShowOverlay] = useState(false)

    return (
        <>
            <button
                className="emergency-fab"
                onClick={() => setShowOverlay(true)}
                aria-label="Emergency Call"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
            </button>

            {showOverlay && (
                <div className="emergency-overlay" role="dialog" aria-label="Emergency call in progress">
                    <div className="emergency-content">
                        <div className="emergency-pulse-ring">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                            </svg>
                        </div>
                        <h2 className="emergency-title">Calling Emergency...</h2>
                        <p className="emergency-subtitle">Connecting to Nabha Civil Hospital</p>
                        <button className="btn btn-danger emergency-cancel" onClick={() => setShowOverlay(false)}>
                            Cancel Call
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
