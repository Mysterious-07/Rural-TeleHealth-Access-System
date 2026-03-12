import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import EmergencyFAB from '../components/EmergencyFAB'
import './MedicineFinder.css'

const filters = ['All', 'Available', 'Generic', 'Affordable', 'Nearest']

const medicines = [
    {
        name: 'Paracetamol 500mg', generic: 'Acetaminophen', type: 'tablet', price: 15,
        availability: [
            { pharmacy: 'Sharma Medical', distance: 0.3, distanceLabel: '0.3 km', inStock: true, price: '₹15' },
            { pharmacy: 'City Pharmacy', distance: 1.2, distanceLabel: '1.2 km', inStock: false, price: '₹18' },
            { pharmacy: 'Nabha Health Store', distance: 0.5, distanceLabel: '0.5 km', inStock: true, price: '₹12' },
        ]
    },
    {
        name: 'Amoxicillin 250mg', generic: 'Amoxicillin Trihydrate', type: 'capsule', price: 45,
        availability: [
            { pharmacy: 'Nabha Health Store', distance: 0.5, distanceLabel: '0.5 km', inStock: true, price: '₹45' },
            { pharmacy: 'Sharma Medical', distance: 0.3, distanceLabel: '0.3 km', inStock: true, price: '₹52' },
        ]
    },
    {
        name: 'Cough Syrup (Benadryl)', generic: 'Diphenhydramine', type: 'syrup', price: 85,
        availability: [
            { pharmacy: 'City Pharmacy', distance: 1.2, distanceLabel: '1.2 km', inStock: true, price: '₹85' },
            { pharmacy: 'Nabha Health Store', distance: 0.5, distanceLabel: '0.5 km', inStock: false, price: '₹90' },
        ]
    },
    {
        name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', type: 'tablet', price: 8,
        availability: [
            { pharmacy: 'Sharma Medical', distance: 0.3, distanceLabel: '0.3 km', inStock: true, price: '₹8' },
        ]
    },
    {
        name: 'Metformin 500mg', generic: 'Metformin HCl', type: 'tablet', price: 25,
        availability: [
            { pharmacy: 'City Pharmacy', distance: 1.2, distanceLabel: '1.2 km', inStock: true, price: '₹25' },
            { pharmacy: 'Sharma Medical', distance: 0.3, distanceLabel: '0.3 km', inStock: false, price: '₹28' },
            { pharmacy: 'Nabha Health Store', distance: 0.5, distanceLabel: '0.5 km', inStock: true, price: '₹22' },
        ]
    },
    {
        name: 'ORS Sachets', generic: 'Oral Rehydration Salts', type: 'sachet', price: 10,
        availability: [
            { pharmacy: 'Sharma Medical', distance: 0.3, distanceLabel: '0.3 km', inStock: true, price: '₹10' },
            { pharmacy: 'City Pharmacy', distance: 1.2, distanceLabel: '1.2 km', inStock: true, price: '₹12' },
        ]
    },
]

export default function MedicineFinder() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const [expanded, setExpanded] = useState(null)

    const filtered = useMemo(() => {
        let result = medicines.filter(m =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.generic.toLowerCase().includes(search.toLowerCase())
        )

        if (activeFilter === 'Available') {
            result = result.filter(m => m.availability.some(a => a.inStock))
        } else if (activeFilter === 'Generic') {
            result = result.map(m => ({ ...m, showGeneric: true }))
        } else if (activeFilter === 'Affordable') {
            result = [...result].sort((a, b) => a.price - b.price)
        } else if (activeFilter === 'Nearest') {
            result = result.filter(m => m.availability.some(a => a.inStock))
            result = [...result].sort((a, b) => {
                const nearestA = Math.min(...a.availability.filter(x => x.inStock).map(x => x.distance))
                const nearestB = Math.min(...b.availability.filter(x => x.inStock).map(x => x.distance))
                return nearestA - nearestB
            })
        }

        return result
    }, [search, activeFilter])

    const getNearestAvailable = (med) => {
        const inStock = med.availability.filter(a => a.inStock).sort((a, b) => a.distance - b.distance)
        return inStock[0] || null
    }

    return (
        <div className="app-layout">
            <Header title="Sehat Bhandar" showBack onBack={() => navigate('/')} />
            <main className="page-content medicine-page">
                {/* Search Bar */}
                <div className="search-bar-container">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="search-input"
                        placeholder="Search medicines..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className="mic-btn" aria-label="Voice search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    </button>
                </div>

                {/* Location */}
                <div className="location-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" fill="white" />
                    </svg>
                    <span className="location-text">Nabha, Punjab</span>
                    <button className="change-link">Change</button>
                </div>

                {/* Filter Chips */}
                <div className="chips-scroll">
                    {filters.map(f => (
                        <button
                            key={f}
                            className={`chip ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >{f}</button>
                    ))}
                </div>

                {/* Results Count */}
                <div className="results-count">
                    <span>{filtered.length} {filtered.length === 1 ? 'medicine' : 'medicines'} found</span>
                </div>

                {/* Medicine Cards */}
                <div className="medicine-list">
                    {filtered.map((med, i) => {
                        const nearest = getNearestAvailable(med)
                        return (
                            <div className="card medicine-card" key={i}>
                                <div className="med-row" onClick={() => setExpanded(expanded === i ? null : i)}>
                                    <div className={`med-icon ${med.type === 'syrup' || med.type === 'sachet' ? 'med-icon-gold' : 'med-icon-teal'}`}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={med.type === 'syrup' || med.type === 'sachet' ? '#F59E0B' : '#0D9488'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="7" width="18" height="10" rx="5" /><line x1="12" y1="7" x2="12" y2="17" />
                                        </svg>
                                    </div>
                                    <div className="med-info">
                                        <span className="med-name">{med.name}</span>
                                        <span className="med-generic">{med.generic}</span>
                                        <div className="med-tags">
                                            {nearest ? (
                                                <span className="pill pill-success" style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                    ● In Stock
                                                </span>
                                            ) : (
                                                <span className="pill pill-danger" style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                    ● Out of Stock
                                                </span>
                                            )}
                                            {nearest && (
                                                <span className="distance-tag">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                                                    </svg>
                                                    {nearest.distanceLabel} away
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <svg className={`expand-icon ${expanded === i ? 'expanded' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                                {expanded === i && (
                                    <div className="availability-list">
                                        <div className="avail-header">
                                            <span>Pharmacy</span>
                                            <span>Status</span>
                                            <span>Distance</span>
                                            <span>Price</span>
                                        </div>
                                        {med.availability.sort((a, b) => a.distance - b.distance).map((a, j) => (
                                            <div className={`availability-row ${a.inStock ? '' : 'out-of-stock'}`} key={j}>
                                                <span className="avail-pharmacy">{a.pharmacy}</span>
                                                <span className={a.inStock ? 'text-success' : 'text-danger'}>
                                                    {a.inStock ? '● Available' : '● Out'}
                                                </span>
                                                <span className="avail-distance">{a.distanceLabel}</span>
                                                <span className="avail-price mono">{a.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </main>

            {/* Map Toggle FAB */}
            <button className="map-fab">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                View on Map
            </button>

            <EmergencyFAB />
            <BottomNav />
        </div>
    )
}
