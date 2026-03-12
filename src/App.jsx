import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState, createContext } from 'react'
import Home from './pages/Home'
import BookConsultation from './pages/BookConsultation'
import ConsultationRoom from './pages/ConsultationRoom'
import HealthRecords from './pages/HealthRecords'
import SymptomChecker from './pages/SymptomChecker'
import MedicineFinder from './pages/MedicineFinder'
import DoctorDashboard from './pages/DoctorDashboard'
import OfflineVault from './pages/OfflineVault'
import AITriage from './pages/AITriage'
import Profile from './pages/Profile'
import './App.css'

export const AppContext = createContext()

function App() {
  const [connectivity, setConnectivity] = useState('synced') // synced | syncing | offline
  const [language, setLanguage] = useState('en')

  // keep language sticky across refreshes (default ENG on first visit)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('nabha_lang')
      if (stored === 'en' || stored === 'pa' || stored === 'hi') {
        setLanguage(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('nabha_lang', language)
    } catch {
      // ignore
    }
  }, [language])

  const toggleConnectivity = () => {
    const states = ['synced', 'syncing', 'offline']
    const idx = (states.indexOf(connectivity) + 1) % states.length
    setConnectivity(states[idx])
  }

  return (
    <AppContext.Provider value={{ connectivity, setConnectivity, toggleConnectivity, language, setLanguage }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookConsultation />} />
          <Route path="/consultation" element={<ConsultationRoom />} />
          <Route path="/records" element={<HealthRecords />} />
          <Route path="/symptoms" element={<SymptomChecker />} />
          <Route path="/medicine" element={<MedicineFinder />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/vault" element={<OfflineVault />} />
          <Route path="/ai-triage" element={<AITriage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
