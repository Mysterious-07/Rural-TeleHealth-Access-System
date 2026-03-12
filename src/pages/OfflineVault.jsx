import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import EmergencyFAB from '../components/EmergencyFAB'
import './OfflineVault.css'

// Simulated IndexedDB / localStorage persistent data
const VAULT_KEY = 'nabhacare_health_vault'

const defaultVaultData = {
    patient: {
        name: 'Gurpreet Singh',
        age: 45,
        gender: 'Male',
        village: 'Dhanaula, Punjab',
        phone: '+91 98765 43210',
        aadhar: 'XXXX-XXXX-7842',
        bloodGroup: 'B+',
        allergies: ['Penicillin', 'Sulfa drugs'],
        emergencyContact: 'Harjit Kaur (+91 98765 43211)',
    },
    history: [
        { date: 'Mar 10, 2026', type: 'Consultation', doctor: 'Dr. Rajinder Singh', summary: 'Fever & throat pain — antibiotics prescribed', urgency: 'medium' },
        { date: 'Mar 8, 2026', type: 'Lab Report', doctor: 'Civil Hospital Lab', summary: 'CBC normal, Hemoglobin 13.2 g/dL', urgency: 'low' },
        { date: 'Feb 28, 2026', type: 'Consultation', doctor: 'Dr. Priya Kaur', summary: 'Seasonal cold — rest & fluids advised', urgency: 'low' },
        { date: 'Feb 15, 2026', type: 'Prescription', doctor: 'Dr. Amrit Grewal', summary: 'Joint pain — Diclofenac prescribed, physiotherapy referred', urgency: 'medium' },
        { date: 'Jan 20, 2026', type: 'Vaccination', doctor: 'PHC Nabha', summary: 'COVID-19 booster dose administered', urgency: 'low' },
    ],
    prescriptions: [
        { name: 'Paracetamol 500mg', dosage: 'Twice daily', days: 5, doctor: 'Dr. Rajinder Singh', date: 'Mar 10, 2026' },
        { name: 'Amoxicillin 250mg', dosage: 'Thrice daily', days: 7, doctor: 'Dr. Rajinder Singh', date: 'Mar 10, 2026' },
        { name: 'Cetirizine 10mg', dosage: 'Once daily', days: 3, doctor: 'Dr. Priya Kaur', date: 'Feb 28, 2026' },
    ],
    lastSynced: new Date().toISOString(),
}

function loadVaultData() {
    try {
        const stored = localStorage.getItem(VAULT_KEY)
        if (stored) return JSON.parse(stored)
    } catch (e) { /* fallback */ }
    localStorage.setItem(VAULT_KEY, JSON.stringify(defaultVaultData))
    return defaultVaultData
}

function generateQRPattern(data) {
    // Generates a deterministic visual pattern from string data
    const hash = data.split('').reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0)
    const cells = []
    for (let r = 0; r < 21; r++) {
        for (let c = 0; c < 21; c++) {
            // Fixed position patterns (finder patterns)
            const isFinderTL = r < 7 && c < 7
            const isFinderTR = r < 7 && c > 13
            const isFinderBL = r > 13 && c < 7
            if (isFinderTL || isFinderTR || isFinderBL) {
                const br = isFinderTL ? 0 : isFinderTR ? 0 : 14
                const bc = isFinderTL ? 0 : isFinderTR ? 14 : 0
                const ri = r - br, ci = c - bc
                const filled = (ri === 0 || ri === 6 || ci === 0 || ci === 6) || (ri >= 2 && ri <= 4 && ci >= 2 && ci <= 4)
                cells.push({ r, c, filled })
            } else {
                const v = (hash * (r * 21 + c + 1)) & 0xFFFF
                cells.push({ r, c, filled: v % 3 !== 0 })
            }
        }
    }
    return cells
}

export default function OfflineVault() {
    const navigate = useNavigate()
    const [vault, setVault] = useState(null)
    const [showQR, setShowQR] = useState(false)
    const [activeTab, setActiveTab] = useState('details')

    useEffect(() => {
        setVault(loadVaultData())
    }, [])

    if (!vault) return null

    const qrData = `NABHACARE:${vault.patient.name}:${vault.patient.aadhar}:${vault.patient.bloodGroup}`
    const qrCells = generateQRPattern(qrData)

    const typeColors = {
        Consultation: { bg: '#CCFBF1', color: '#0D9488' },
        'Lab Report': { bg: '#EDE9FE', color: '#7C3AED' },
        Prescription: { bg: '#FEF3C7', color: '#F59E0B' },
        Vaccination: { bg: '#DCFCE7', color: '#22C55E' },
    }

    return (
        <div className="app-layout">
            <Header title="Offline Health Vault" showBack onBack={() => navigate('/records')} />
            <main className="page-content vault-page">
                {/* Offline Status Badge */}
                <div className="vault-offline-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" />
                    </svg>
                    <span>Data stored locally • Available offline</span>
                    <span className="vault-sync-time">Synced: {new Date(vault.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Tab Switcher */}
                <div className="vault-tabs">
                    {[
                        { id: 'details', label: 'Patient Details' },
                        { id: 'history', label: 'History' },
                        { id: 'prescriptions', label: 'Prescriptions' },
                    ].map(t => (
                        <button key={t.id} className={`chip ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Patient Details Tab */}
                {activeTab === 'details' && (
                    <div className="vault-section">
                        <div className="card vault-patient-card">
                            <div className="vp-header">
                                <div className="vp-avatar">{vault.patient.name.charAt(0)}{vault.patient.name.split(' ')[1]?.charAt(0)}</div>
                                <div className="vp-info">
                                    <span className="vp-name">{vault.patient.name}</span>
                                    <span className="vp-meta">{vault.patient.age} yrs • {vault.patient.gender} • {vault.patient.bloodGroup}</span>
                                </div>
                            </div>
                            <div className="vp-details-grid">
                                <div className="vp-detail">
                                    <span className="vp-detail-label">Village</span>
                                    <span className="vp-detail-value">{vault.patient.village}</span>
                                </div>
                                <div className="vp-detail">
                                    <span className="vp-detail-label">Phone</span>
                                    <span className="vp-detail-value">{vault.patient.phone}</span>
                                </div>
                                <div className="vp-detail">
                                    <span className="vp-detail-label">Aadhar</span>
                                    <span className="vp-detail-value mono">{vault.patient.aadhar}</span>
                                </div>
                                <div className="vp-detail">
                                    <span className="vp-detail-label">Emergency</span>
                                    <span className="vp-detail-value">{vault.patient.emergencyContact}</span>
                                </div>
                            </div>
                            {vault.patient.allergies.length > 0 && (
                                <div className="vp-allergies">
                                    <span className="vp-detail-label">Allergies</span>
                                    <div className="allergy-chips">
                                        {vault.patient.allergies.map((a, i) => (
                                            <span key={i} className="pill pill-danger">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Generate QR Button */}
                        <button className="btn btn-secondary btn-full qr-btn" onClick={() => setShowQR(!showQR)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" /><rect x="2" y="14" width="8" height="8" rx="1" /><rect x="14" y="14" width="4" height="4" /><rect x="20" y="14" width="2" height="2" /><rect x="14" y="20" width="2" height="2" /><rect x="20" y="20" width="2" height="2" />
                            </svg>
                            {showQR ? 'Hide Offline QR ID' : 'Generate Offline QR ID'}
                        </button>

                        {/* QR Code Display */}
                        {showQR && (
                            <div className="card qr-card">
                                <div className="qr-container">
                                    <svg viewBox="0 0 231 231" className="qr-svg">
                                        {qrCells.map((cell, i) => (
                                            cell.filled && (
                                                <rect key={i} x={cell.c * 11} y={cell.r * 11} width="11" height="11" fill="#1F2937" rx="1" />
                                            )
                                        ))}
                                    </svg>
                                </div>
                                <p className="qr-instructions">Show this QR at hospital reception for instant verification — works without internet</p>
                                <span className="qr-id mono">ID: NCR-{vault.patient.aadhar.slice(-4)}-{Date.now().toString(36).toUpperCase().slice(-6)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="vault-section">
                        {vault.history.map((h, i) => (
                            <div className="card vault-history-item" key={i}>
                                <div className="vh-top">
                                    <span className="record-badge" style={{
                                        background: typeColors[h.type]?.bg || '#CCFBF1',
                                        color: typeColors[h.type]?.color || '#0D9488'
                                    }}>{h.type}</span>
                                    <span className="vh-date">{h.date}</span>
                                </div>
                                <span className="vh-doctor">{h.doctor}</span>
                                <p className="vh-summary">{h.summary}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Prescriptions Tab */}
                {activeTab === 'prescriptions' && (
                    <div className="vault-section">
                        {vault.prescriptions.map((rx, i) => (
                            <div className="card vault-rx-item" key={i}>
                                <div className="vrx-top">
                                    <span className="vrx-name">{rx.name}</span>
                                    <span className="vrx-date">{rx.date}</span>
                                </div>
                                <div className="vrx-details">
                                    <span className="pill pill-teal">{rx.dosage}</span>
                                    <span className="pill pill-warning">{rx.days} days</span>
                                </div>
                                <span className="vrx-doctor">Prescribed by {rx.doctor}</span>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <EmergencyFAB />
            <BottomNav />
        </div>
    )
}
