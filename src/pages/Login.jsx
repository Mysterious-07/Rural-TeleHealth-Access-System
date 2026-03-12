import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Header from '../components/Header'
import './Login.css'

const roleLabels = {
  patient: {
    title: 'Patient Login',
    subtitle: 'Sign in using one-time passcode (OTP)',
    hint: 'Enter your email, request an OTP, then verify it to sign in',
  },
  doctor: { title: 'Doctor Login', subtitle: 'Access your doctor portal', hint: 'Use doctor@nabha.local / Doctor@123' },
  admin: { title: 'Admin Login', subtitle: 'Access the admin console', hint: 'Use admin@nabha.local / Admin@123' },
}

export default function Login() {
  const { role } = useParams()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'
  const navigate = useNavigate()
  const { login, requestOtp, verifyOtp } = useContext(AuthContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const roleKey = role === 'doctor' ? 'doctor' : role === 'admin' ? 'admin' : 'patient'
  const labels = roleLabels[roleKey]

  const redirectAfterLogin = (user) => {
    const defaultNext = user?.role === 'patient' ? '/' : '/dashboard'
    navigate(next === '/' ? defaultNext : next, { replace: true })
  }

  const handlePasswordLogin = async (ev) => {
    ev.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await login({ email, password, role: roleKey })
      redirectAfterLogin(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleRequestOtp = async (ev) => {
    ev.preventDefault()
    setError('')
    setOtpMessage('')
    setBusy(true)
    try {
      const res = await requestOtp({ email })
      setOtpSent(true)
      setOtpMessage(`OTP sent (for demo): ${res.otp}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleVerifyOtp = async (ev) => {
    ev.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await verifyOtp({ email, otp })
      redirectAfterLogin(user)
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

          {roleKey === 'patient' ? (
            <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="login-form">
              <label className="input-group">
                <span>Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </label>

              {otpSent && (
                <label className="input-group">
                  <span>OTP</span>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    type="text"
                    required
                  />
                </label>
              )}

              {otpMessage ? <div className="login-hint" style={{ color: '#047857' }}>{otpMessage}</div> : null}
              {error ? <div className="login-error">{error}</div> : null}

              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? 'Working…' : otpSent ? 'Verify OTP' : 'Send OTP'}
              </button>

              <div className="login-footer">
                <div className="login-links">
                  <Link to="/login/patient">Patient</Link>
                  <span className="divider">•</span>
                  <Link to="/login/doctor">Doctor</Link>
                  <span className="divider">•</span>
                  <Link to="/login/admin">Admin</Link>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin} className="login-form">
              <label className="input-group">
                <span>Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </label>

              <label className="input-group">
                <span>Password</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  required
                />
              </label>

              {error ? <div className="login-error">{error}</div> : null}

              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? 'Working…' : 'Sign in'}
              </button>

              <div className="login-footer">
                <div className="login-links">
                  <Link to="/login/patient">Patient</Link>
                  <span className="divider">•</span>
                  <Link to="/login/doctor">Doctor</Link>
                  <span className="divider">•</span>
                  <Link to="/login/admin">Admin</Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
