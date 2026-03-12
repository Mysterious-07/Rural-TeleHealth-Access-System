import { useState } from 'react'
import './PrescriptionPad.css'

const emptyMedicine = { name: '', dosage: '', frequency: '', days: '' }

export default function PrescriptionPad({ onClose }) {
    const [diagnosis, setDiagnosis] = useState('')
    const [medicines, setMedicines] = useState([
        { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', days: '5' },
        { name: 'Amoxicillin', dosage: '250mg', frequency: 'Thrice daily', days: '7' },
    ])
    const [instructions, setInstructions] = useState('')
    const [notifyPharmacy, setNotifyPharmacy] = useState(true)

    const addMedicine = () => setMedicines([...medicines, { ...emptyMedicine }])

    const updateMedicine = (idx, field, value) => {
        const updated = [...medicines]
        updated[idx][field] = value
        setMedicines(updated)
    }

    const removeMedicine = (idx) => {
        setMedicines(medicines.filter((_, i) => i !== idx))
    }

    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="prescription-modal" role="dialog" aria-label="Prescription Pad">
                {/* Header */}
                <div className="rx-modal-header">
                    <div className="rx-header-info">
                        <h2 className="rx-header-title">Gurpreet Singh</h2>
                        <div className="rx-header-meta">
                            <span>Age: 45 • Male</span>
                            <span>March 12, 2026</span>
                        </div>
                    </div>
                    <button className="rx-close-btn" onClick={onClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="rx-modal-body">
                    {/* Diagnosis */}
                    <div className="rx-section">
                        <label className="rx-section-label">DIAGNOSIS</label>
                        <input
                            className="input"
                            placeholder="Enter diagnosis..."
                            value={diagnosis}
                            onChange={e => setDiagnosis(e.target.value)}
                        />
                    </div>

                    {/* Medicine Table */}
                    <div className="rx-section">
                        <label className="rx-section-label">MEDICINES</label>
                        <div className="rx-table-wrap">
                            <div className="rx-table-header">
                                <span>Medicine</span>
                                <span>Dosage</span>
                                <span>Frequency</span>
                                <span>Days</span>
                                <span></span>
                            </div>
                            {medicines.map((med, i) => (
                                <div className={`rx-table-row ${i % 2 === 1 ? 'alt' : ''}`} key={i}>
                                    <input className="input rx-inline-input" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} placeholder="Name" />
                                    <input className="input rx-inline-input" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} placeholder="Dose" />
                                    <input className="input rx-inline-input" value={med.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} placeholder="Freq" />
                                    <input className="input rx-inline-input mono" value={med.days} onChange={e => updateMedicine(i, 'days', e.target.value)} placeholder="Days" style={{ maxWidth: '64px' }} />
                                    <button className="rx-remove-btn" onClick={() => removeMedicine(i)} aria-label="Remove medicine">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <button className="add-medicine-btn" onClick={addMedicine}>
                                + Add Medicine
                            </button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="rx-section">
                        <label className="rx-section-label">INSTRUCTIONS</label>
                        <textarea
                            className="input"
                            placeholder="Additional instructions for the patient..."
                            rows="3"
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="rx-modal-footer">
                    <label className="pharmacy-checkbox">
                        <input type="checkbox" checked={notifyPharmacy} onChange={e => setNotifyPharmacy(e.target.checked)} />
                        <span className="checkbox-custom"></span>
                        Notify pharmacy
                    </label>
                    <div className="rx-footer-buttons">
                        <button className="btn btn-ghost">Save Draft</button>
                        <button className="btn btn-secondary">Print</button>
                        <button className="btn btn-primary">Send to Patient App</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
