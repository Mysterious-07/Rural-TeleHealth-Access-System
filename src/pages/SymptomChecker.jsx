import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import EmergencyFAB from '../components/EmergencyFAB'
import './SymptomChecker.css'

const bodyAreas = [
    { id: 'head', label: 'Head', x: 145, y: 30, w: 50, h: 50 },
    { id: 'chest', label: 'Chest', x: 130, y: 100, w: 80, h: 60 },
    { id: 'abdomen', label: 'Abdomen', x: 130, y: 165, w: 80, h: 55 },
    { id: 'limbs', label: 'Limbs', x: 90, y: 230, w: 160, h: 80 },
]

const symptomsByArea = {
    head: ['Headache', 'Dizziness', 'Blurry Vision', 'Ear Pain', 'Sore Throat'],
    chest: ['Chest Pain', 'Coughing', 'Breathlessness', 'Heart Racing'],
    abdomen: ['Stomach Ache', 'Nausea', 'Bloating', 'Diarrhea', 'Acidity'],
    limbs: ['Joint Pain', 'Swelling', 'Numbness', 'Muscle Cramps'],
}

const durations = ['Today', '2-3 days', '1 week', '2+ weeks']

export default function SymptomChecker() {
    const navigate = useNavigate()
    const [selectedArea, setSelectedArea] = useState(null)
    const [selectedSymptoms, setSelectedSymptoms] = useState([])
    const [duration, setDuration] = useState(null)
    const [severity, setSeverity] = useState(3)
    const [showResult, setShowResult] = useState(false)

    const toggleSymptom = (sym) => {
        setSelectedSymptoms(prev =>
            prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
        )
    }

    const getUrgency = () => {
        if (severity >= 7) return 'high'
        if (severity >= 4) return 'medium'
        return 'low'
    }

    const handleSubmit = () => setShowResult(true)

    const urgency = getUrgency()
    const urgencyConfig = {
        low: { color: '#22C55E', bg: '#DCFCE7', label: 'Low Urgency', text: 'Your symptoms appear mild. Monitor and consult if they persist.' },
        medium: { color: '#F59E0B', bg: '#FEF3C7', label: 'Medium Urgency', text: 'Consider consulting a doctor at your convenience.' },
        high: { color: '#EF4444', bg: '#FEE2E2', label: 'High Urgency', text: 'Please consult a doctor as soon as possible.' },
    }

    return (
        <div className="app-layout">
            <Header title="Symptom Checker" showBack onBack={() => navigate('/')} />
            <main className="page-content symptom-page">
                {/* Warning Banner */}
                <div className="warning-banner">
                    <span>⚠ This is not a diagnosis. Always consult a doctor.</span>
                </div>

                {/* Body Selector */}
                <section className="section">
                    <h3 className="section-title">Select affected area</h3>
                    <div className="body-selector">
                        <svg viewBox="0 0 340 340" className="body-svg">
                            {/* Simple body outline */}
                            <ellipse cx="170" cy="52" rx="28" ry="32" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                            <line x1="170" y1="84" x2="170" y2="200" stroke="#E5E7EB" strokeWidth="2" />
                            <line x1="170" y1="110" x2="115" y2="170" stroke="#E5E7EB" strokeWidth="2" />
                            <line x1="170" y1="110" x2="225" y2="170" stroke="#E5E7EB" strokeWidth="2" />
                            <line x1="170" y1="200" x2="130" y2="310" stroke="#E5E7EB" strokeWidth="2" />
                            <line x1="170" y1="200" x2="210" y2="310" stroke="#E5E7EB" strokeWidth="2" />

                            {bodyAreas.map(area => (
                                <g key={area.id} onClick={() => setSelectedArea(area.id)} style={{ cursor: 'pointer' }}>
                                    <rect
                                        x={area.x} y={area.y} width={area.w} height={area.h}
                                        rx="12"
                                        fill={selectedArea === area.id ? '#CCFBF1' : 'transparent'}
                                        stroke={selectedArea === area.id ? '#0D9488' : 'transparent'}
                                        strokeWidth="2"
                                        className={selectedArea === area.id ? 'area-selected' : ''}
                                    />
                                    <text
                                        x={area.x + area.w / 2} y={area.y + area.h / 2}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fill={selectedArea === area.id ? '#0D9488' : '#6B7280'}
                                        fontSize="12" fontFamily="var(--font-body)" fontWeight="500"
                                    >{area.label}</text>
                                </g>
                            ))}
                        </svg>
                    </div>
                </section>

                {/* Symptom Tags */}
                {selectedArea && (
                    <section className="section symptom-tags-section">
                        <h3 className="section-title">Select symptoms</h3>
                        <div className="symptom-tags">
                            {(symptomsByArea[selectedArea] || []).map(sym => (
                                <button
                                    key={sym}
                                    className={`chip ${selectedSymptoms.includes(sym) ? 'active' : ''}`}
                                    onClick={() => toggleSymptom(sym)}
                                >{sym}</button>
                            ))}
                            <button className="chip add-symptom-chip">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" />
                                </svg>
                                Add symptom
                            </button>
                        </div>
                    </section>
                )}

                {/* Duration */}
                {selectedSymptoms.length > 0 && (
                    <section className="section">
                        <h3 className="section-title">How long?</h3>
                        <div className="duration-pills">
                            {durations.map(d => (
                                <button
                                    key={d}
                                    className={`chip ${duration === d ? 'duration-active' : ''}`}
                                    onClick={() => setDuration(d)}
                                >{d}</button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Severity Slider */}
                {duration && (
                    <section className="section">
                        <h3 className="section-title">Severity</h3>
                        <div className="severity-slider-container">
                            <div className="severity-labels">
                                <span>😊</span>
                                <span>😰</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={severity}
                                onChange={e => setSeverity(Number(e.target.value))}
                                className={`severity-slider severity-${severity <= 3 ? 'low' : severity <= 6 ? 'med' : 'high'}`}
                            />
                            <div className="severity-value mono">{severity}/10</div>
                        </div>
                        <button className="btn btn-primary btn-full" onClick={handleSubmit} style={{ marginTop: '16px' }}>
                            Check Symptoms
                        </button>
                    </section>
                )}

                {/* Results */}
                {showResult && (
                    <section className="section result-section">
                        <div className={`card result-card urgency-${urgency}`}>
                            <div className="result-header" style={{ background: urgencyConfig[urgency].bg }}>
                                {urgency === 'high' && <span className="dot dot-danger dot-pulse" />}
                                <span className="result-urgency" style={{ color: urgencyConfig[urgency].color }}>
                                    {urgencyConfig[urgency].label}
                                </span>
                            </div>
                            <div className="result-body">
                                <p className="result-text">{urgencyConfig[urgency].text}</p>
                                <h4 className="result-conditions-title">Possible conditions:</h4>
                                <ul className="result-conditions">
                                    <li>Common cold / viral infection</li>
                                    <li>Tension headache</li>
                                    <li>Seasonal allergies</li>
                                </ul>
                                <button
                                    className={`btn btn-full ${urgency === 'high' ? 'btn-danger' : 'btn-primary'}`}
                                    onClick={() => navigate('/book')}
                                >
                                    Book Consultation Now
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <EmergencyFAB />
            <BottomNav />
        </div>
    )
}
