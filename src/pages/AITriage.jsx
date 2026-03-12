import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import EmergencyFAB from '../components/EmergencyFAB'
import './AITriage.css'

const triageResponses = {
    'fever': { guidance: 'Consult Doctor', urgency: 'medium', advice: 'Fever above 100°F for more than 2 days needs medical attention. Stay hydrated and rest.', conditions: ['Viral fever', 'Typhoid', 'Dengue (if with body ache)'] },
    'headache': { guidance: 'Self-Care', urgency: 'low', advice: 'Try rest in a dark room. Take Paracetamol 500mg if needed. Consult if persists > 3 days.', conditions: ['Tension headache', 'Migraine', 'Dehydration'] },
    'chest pain': { guidance: 'Consult Doctor', urgency: 'high', advice: '⚠ Chest pain can be serious. Please consult a doctor immediately. Do not ignore.', conditions: ['Angina', 'Acid reflux (GERD)', 'Muscle strain'] },
    'cough': { guidance: 'Self-Care', urgency: 'low', advice: 'Drink warm water with honey. Steam inhalation helps. Consult if cough persists > 1 week.', conditions: ['Common cold', 'Allergic cough', 'Bronchitis'] },
    'stomach pain': { guidance: 'Consult Doctor', urgency: 'medium', advice: 'Avoid spicy food. If pain is severe or with vomiting, consult a doctor soon.', conditions: ['Gastritis', 'Food poisoning', 'Ulcer'] },
    'breathing': { guidance: 'Consult Doctor', urgency: 'high', advice: '⚠ Difficulty breathing needs urgent attention. Please see a doctor now.', conditions: ['Asthma', 'Pneumonia', 'Anxiety/panic attack'] },
    'vomiting': { guidance: 'Consult Doctor', urgency: 'medium', advice: 'Stay hydrated with ORS. If vomiting persists > 24hrs, consult a doctor.', conditions: ['Gastroenteritis', 'Food poisoning', 'Infection'] },
    'dizziness': { guidance: 'Self-Care', urgency: 'low', advice: 'Sit down and rest. Drink water. If dizzy spells recur, consult a doctor.', conditions: ['Low blood pressure', 'Dehydration', 'Vertigo'] },
    'joint pain': { guidance: 'Self-Care', urgency: 'low', advice: 'Apply warm compress. Rest the joint. Take pain relief if needed. Consult if swelling occurs.', conditions: ['Arthritis', 'Muscle strain', 'Injury'] },
    'skin rash': { guidance: 'Consult Doctor', urgency: 'medium', advice: 'Avoid scratching. Keep area clean. Consult a doctor for proper diagnosis.', conditions: ['Allergic reaction', 'Fungal infection', 'Eczema'] },
}

function getTriageResponse(input) {
    const lower = input.toLowerCase()
    for (const [keyword, response] of Object.entries(triageResponses)) {
        if (lower.includes(keyword)) return response
    }
    return {
        guidance: 'Consult Doctor',
        urgency: 'medium',
        advice: 'I understand your concern. For accurate diagnosis, please consult a doctor. You can book a consultation through the app.',
        conditions: ['Multiple possibilities — doctor consultation recommended']
    }
}

export default function AITriage() {
    const navigate = useNavigate()
    const [messages, setMessages] = useState([
        { from: 'ai', text: 'Sat Sri Akal! 🙏 I\'m your AI health assistant. Tell me your symptoms and I\'ll help guide you.', time: new Date() },
        { from: 'ai', text: 'You can type symptoms like "fever", "headache", "chest pain", "cough" etc.', time: new Date() },
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [triageResult, setTriageResult] = useState(null)
    const chatEndRef = useRef(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const sendMessage = () => {
        if (!input.trim()) return
        const userMsg = { from: 'user', text: input, time: new Date() }
        setMessages(prev => [...prev, userMsg])
        const userInput = input
        setInput('')
        setIsTyping(true)

        // Simulate AI processing
        setTimeout(() => {
            const response = getTriageResponse(userInput)
            setTriageResult(response)

            const aiMsg = {
                from: 'ai',
                text: response.advice,
                time: new Date(),
                triage: response,
            }
            setMessages(prev => [...prev, aiMsg])
            setIsTyping(false)

            // Store triage for doctor's queue (simulated)
            try {
                const stored = JSON.parse(localStorage.getItem('nabhacare_triage_queue') || '[]')
                stored.push({
                    symptoms: userInput,
                    urgency: response.urgency,
                    guidance: response.guidance,
                    timestamp: new Date().toISOString(),
                    patient: 'Gurpreet Singh'
                })
                localStorage.setItem('nabhacare_triage_queue', JSON.stringify(stored))
            } catch (e) { /* silent */ }
        }, 1200)
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    const urgencyStyles = {
        low: { color: '#22C55E', bg: '#DCFCE7', label: '🟢 Low Priority — Self-Care' },
        medium: { color: '#F59E0B', bg: '#FEF3C7', label: '🟡 Medium Priority — Consult Doctor' },
        high: { color: '#EF4444', bg: '#FEE2E2', label: '🔴 High Priority — Urgent Consultation' },
    }

    return (
        <div className="app-layout">
            <Header title="AI Health Assistant" showBack onBack={() => navigate('/symptoms')} />
            <main className="page-content triage-page">
                {/* Warning */}
                <div className="warning-banner" style={{ marginBottom: 0 }}>
                    <span>⚠ AI guidance only — not a medical diagnosis</span>
                </div>

                {/* Chat Messages */}
                <div className="triage-chat">
                    {messages.map((msg, i) => (
                        <div key={i} className={`triage-msg ${msg.from === 'user' ? 'user-msg' : 'ai-msg'}`}>
                            {msg.from === 'ai' && (
                                <div className="ai-avatar-sm">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2">
                                        <path d="M12 3l1.5 4.5H18l-3.5 2.5L16 14.5 12 12l-4 2.5 1.5-4.5L6 7.5h4.5z" />
                                    </svg>
                                </div>
                            )}
                            <div className={`msg-bubble ${msg.from}`}>
                                <p className="msg-content">{msg.text}</p>
                                {/* Triage result card inline */}
                                {msg.triage && (
                                    <div className="triage-result-inline" style={{ background: urgencyStyles[msg.triage.urgency].bg, borderColor: urgencyStyles[msg.triage.urgency].color }}>
                                        <span className="triage-priority" style={{ color: urgencyStyles[msg.triage.urgency].color }}>
                                            {urgencyStyles[msg.triage.urgency].label}
                                        </span>
                                        <div className="triage-conditions">
                                            <span className="triage-cond-label">Possible:</span>
                                            {msg.triage.conditions.map((c, j) => (
                                                <span key={j} className="triage-cond-item">• {c}</span>
                                            ))}
                                        </div>
                                        {msg.triage.guidance === 'Consult Doctor' && (
                                            <button className={`btn btn-sm btn-full ${msg.triage.urgency === 'high' ? 'btn-danger' : 'btn-primary'}`} onClick={() => navigate('/book')}>
                                                Book Consultation Now
                                            </button>
                                        )}
                                    </div>
                                )}
                                <span className="msg-timestamp">{formatTime(msg.time)}</span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="triage-msg ai-msg">
                            <div className="ai-avatar-sm">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2">
                                    <path d="M12 3l1.5 4.5H18l-3.5 2.5L16 14.5 12 12l-4 2.5 1.5-4.5L6 7.5h4.5z" />
                                </svg>
                            </div>
                            <div className="msg-bubble ai typing-bubble">
                                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Quick Symptom Chips */}
                <div className="quick-symptoms">
                    {['Fever', 'Headache', 'Cough', 'Stomach pain', 'Dizziness', 'Joint pain'].map(s => (
                        <button key={s} className="chip" onClick={() => { setInput(s); }}>
                            {s}
                        </button>
                    ))}
                </div>

                {/* Input Bar */}
                <div className="triage-input-bar">
                    <input
                        className="input triage-input"
                        placeholder="Describe your symptoms..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    />
                    <button className="btn btn-primary triage-send" onClick={sendMessage} disabled={!input.trim()}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </main>
            <EmergencyFAB />
        </div>
    )
}
