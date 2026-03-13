import { useState, useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import Header from '../components/Header'
import './Login.css' // Reuse login styles

const roleLabels = {
  patient: {
    title: 'Patient Registration',
    subtitle: 'Create your health account',
    hint: 'Join NabhaCare for easy access to doctors',
  },
  doctor: {
    title: 'Doctor Registration',
    subtitle: 'Join our medical network',
    hint: 'Provide care to rural patients via tele-consultation',
  },
  pharmacist: {
    title: 'Pharmacist Registration',
    subtitle: 'Pharmacy Partner Portal',
    hint: 'Manage digital prescriptions and medicine availability',
  }
}

export default function Register() {
  const { role } = useParams()
  const navigate = useNavigate()
  const { register } = useContext(AuthContext)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+91')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [location, setLocation] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const roleKey = role === 'doctor' ? 'doctor' : role === 'pharmacist' ? 'pharmacist' : 'patient'
  const labels = roleLabels[roleKey]

  const handleRegister = async (ev) => {
    ev.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload = {
        name: name.trim(),
        role: roleKey,
        age,
        location: location.trim()
      }

      if (roleKey === 'patient') {
        const cleanedPhone = phone.trim().replace(/\s/g, '')
        payload.phone = cleanedPhone.startsWith('+91') ? cleanedPhone : `+91${cleanedPhone}`
      } else {
        payload.email = email.trim()
        payload.password = password
      }

      await register(payload)
      
      if (roleKey === 'patient') {
        navigate('/login/patient', { replace: true })
      } else {
        const next = roleKey === 'doctor' ? '/doctor' : '/pharmacy'
        navigate(next, { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <Header title={labels.title} />
      <main className="page-content login-container">
        <div className="login-card">
          <h2>{labels.subtitle}</h2>
          <p className="login-hint">{labels.hint}</p>

          <form onSubmit={handleRegister} className="login-form">
            <label className="input-group">
              <span>Full Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                type="text"
                required
              />
            </label>

            <div className="input-row">
              <label className="input-group">
                <span>Age</span>
                <input
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  type="number"
                  required
                />
              </label>

              <label className="input-group">
                <span>Location</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Village/City"
                  type="text"
                  required
                />
              </label>
            </div>

            {roleKey === 'patient' ? (
              <label className="input-group">
                <span>Phone Number</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  type="tel"
                  required
                />
              </label>
            ) : (
              <>
                <label className="input-group">
                  <span>Email Address</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                    required
                  />
                </label>

                <label className="input-group">
                  <span>Create Password</span>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </label>
              </>
            )}

            {error ? <div className="login-error">{error}</div> : null}

            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Creating Account…' : 'Register Now'}
            </button>

            <div className="login-footer">
              <div className="login-links">
                <Link to="/register/patient">Patient</Link>
                <span className="divider">•</span>
                <Link to="/register/doctor">Doctor</Link>
                <span className="divider">•</span>
                <Link to="/register/pharmacist">Pharmacist</Link>
              </div>
              <div className="register-redirect">
                Already have an account? <Link to={`/login/${roleKey}`}>Sign in here</Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
