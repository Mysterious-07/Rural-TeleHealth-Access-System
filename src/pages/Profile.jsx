import { useEffect, useState, useContext } from 'react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import EmergencyFAB from '../components/EmergencyFAB'
import { AppContext } from '../App'
import './Profile.css'

const PROFILE_KEY = 'nabha_user_profile'

const defaultProfile = {
    name: 'Gurpreet Singh',
    age: 45,
    gender: 'Male',
    village: 'Dhanaula, Punjab',
    phone: '+91 98765 43210',
    role: 'patient',
    occupation: 'Farmer',
    aadhar: 'XXXX-XXXX-7842',
}

export default function Profile() {
    const { language } = useContext(AppContext)
    const [profile, setProfile] = useState(defaultProfile)
    const [editing, setEditing] = useState(false)

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(PROFILE_KEY)
            if (stored) {
                setProfile(JSON.parse(stored))
            }
        } catch {
            // ignore
        }
    }, [])

    const saveProfile = (next) => {
        setProfile(next)
        try {
            window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
        } catch {
            // ignore
        }
    }

    const labels = {
        en: {
            title: 'My Profile',
            subtitle: 'Your basic details are stored securely on this device.',
            name: 'Full Name',
            age: 'Age',
            gender: 'Gender',
            village: 'Village',
            phone: 'Number',
            role: 'Role',
            occupation: 'Occupation',
            aadhar: 'Aadhar (last 4)',
            edit: 'Edit Details',
            save: 'Save',
            cancel: 'Cancel',
        },
        pa: {
            title: 'ਮੇਰੀ ਪ੍ਰੋਫ਼ਾਈਲ',
            subtitle: 'ਤੁਹਾਡੀ ਬੁਨਿਆਦੀ ਜਾਣਕਾਰੀ ਇਸ ਡਿਵਾਈਸ \'ਤੇ ਸੁਰੱਖਿਅਤ ਹੈ।',
            name: 'ਪੂਰਾ ਨਾਮ',
            age: 'ਉਮਰ',
            gender: 'ਲਿੰਗ',
            village: 'ਪਿੰਡ',
            phone: 'ਨੰਬਰ',
            role: 'ਭੂਮਿਕਾ',
            occupation: 'ਰੋਜ਼ਗਾਰ',
            aadhar: 'ਆਧਾਰ (ਆਖਰੀ 4)',
            edit: 'ਵੇਰਵੇ ਸੋਧੋ',
            save: 'ਸੇਵ ਕਰੋ',
            cancel: 'ਰੱਦ ਕਰੋ',
        },
        hi: {
            title: 'मेरी प्रोफ़ाइल',
            subtitle: 'आपकी बुनियादी जानकारी इस डिवाइस पर सुरक्षित है।',
            name: 'पूरा नाम',
            age: 'उम्र',
            gender: 'लिंग',
            village: 'गाँव',
            phone: 'नंबर',
            role: 'भूमिका',
            occupation: 'पेशा',
            aadhar: 'आधार (आख़िरी 4)',
            edit: 'विवरण बदलें',
            save: 'सेव करें',
            cancel: 'रद्द करें',
        },
    }

    const t = labels[language] || labels.en

    const handleChange = (field, value) => {
        saveProfile({ ...profile, [field]: value })
    }

    return (
        <div className="app-layout">
            <Header title={t.title} />
            <main className="page-content profile-page">
                <section className="profile-card card">
                    <div className="profile-header-row">
                        <div className="profile-avatar">
                            {profile.name
                                .split(' ')
                                .map(part => part[0])
                                .join('')
                                .slice(0, 2)}
                        </div>
                        <div className="profile-header-text">
                            <h2 className="profile-name">{profile.name}</h2>
                            <p className="profile-subtitle">{t.subtitle}</p>
                        </div>
                    </div>

                    <div className="profile-grid">
                        <div className="profile-field">
                            <span className="profile-label">{t.name}</span>
                            {editing ? (
                                <input
                                    className="profile-input"
                                    value={profile.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                />
                            ) : (
                                <span className="profile-value">{profile.name}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">{t.age}</span>
                            {editing ? (
                                <input
                                    className="profile-input"
                                    type="number"
                                    value={profile.age}
                                    onChange={e => handleChange('age', e.target.value)}
                                />
                            ) : (
                                <span className="profile-value">{profile.age}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">{t.gender}</span>
                            {editing ? (
                                <input
                                    className="profile-input"
                                    value={profile.gender}
                                    onChange={e => handleChange('gender', e.target.value)}
                                />
                            ) : (
                                <span className="profile-value">{profile.gender}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">{t.village}</span>
                            {editing ? (
                                <input
                                    className="profile-input"
                                    value={profile.village}
                                    onChange={e => handleChange('village', e.target.value)}
                                />
                            ) : (
                                <span className="profile-value">{profile.village}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">{t.phone}</span>
                            {editing ? (
                                <input
                                    className="profile-input"
                                    value={profile.phone}
                                    onChange={e => {
                                        const val = e.target.value
                                        const nextVal = val.startsWith('+91') ? val : `+91${val}`
                                        handleChange('phone', nextVal)
                                    }}
                                    type="tel"
                                />
                            ) : (
                                <span className="profile-value mono">{profile.phone}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">{t.role}</span>
                            {editing ? (
                                <select
                                    className="profile-input"
                                    value={profile.role}
                                    onChange={e => handleChange('role', e.target.value)}
                                >
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="pharmacist">Pharmacist</option>
                                </select>
                            ) : (
                                <span className="profile-value">{profile.role}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">{t.occupation}</span>
                            {editing ? (
                                <input
                                    className="profile-input"
                                    value={profile.occupation}
                                    onChange={e => handleChange('occupation', e.target.value)}
                                />
                            ) : (
                                <span className="profile-value">{profile.occupation}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">{t.aadhar}</span>
                            {editing ? (
                                <input
                                    className="profile-input"
                                    value={profile.aadhar}
                                    onChange={e => handleChange('aadhar', e.target.value)}
                                />
                            ) : (
                                <span className="profile-value mono">{profile.aadhar}</span>
                            )}
                        </div>
                    </div>

                    <div className="profile-actions">
                        {editing ? (
                            <>
                                <button
                                    className="btn btn-secondary btn-full"
                                    onClick={() => setEditing(false)}
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    className="btn btn-primary btn-full"
                                    onClick={() => setEditing(false)}
                                >
                                    {t.save}
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn btn-primary btn-full"
                                onClick={() => setEditing(true)}
                            >
                                {t.edit}
                            </button>
                        )}
                    </div>
                </section>
            </main>
            <EmergencyFAB />
            <BottomNav />
        </div>
    )
}

