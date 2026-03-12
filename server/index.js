import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { nanoid } from 'nanoid'

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000
const JWT_SECRET = process.env.JWT_SECRET || 'nabha-dev-secret'

const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json())

const adapter = new JSONFile(new URL('./db.json', import.meta.url))
const db = new Low(adapter, { users: [], communications: [], appointments: [], otps: [] })

async function initDb() {
  await db.read()
  db.data ||= { users: [], communications: [], appointments: [], otps: [] }

  // Seed default data if none exist
  if (!db.data.users || db.data.users.length === 0) {
    const admin = {
      id: nanoid(),
      name: 'Nabha Administrator',
      email: 'admin@nabha.local',
      role: 'admin',
      passwordHash: bcrypt.hashSync('Admin@123', 10),
    }
    const doctor = {
      id: nanoid(),
      name: 'Dr. Rajinder Singh',
      email: 'doctor@nabha.local',
      role: 'doctor',
      passwordHash: bcrypt.hashSync('Doctor@123', 10),
    }
    const patient = {
      id: nanoid(),
      name: 'Gurpreet Singh',
      email: 'patient@nabha.local',
      role: 'patient',
      passwordHash: bcrypt.hashSync('Patient@123', 10),
    }

    db.data.users = [admin, doctor, patient]
    db.data.communications = [
      {
        id: nanoid(),
        from: doctor.id,
        to: patient.id,
        subject: 'Follow-up on prescriptions',
        message: 'Hi Gurpreet, please take Paracetamol 500mg twice a day and book a follow-up next week.',
        createdAt: new Date().toISOString(),
      },
      {
        id: nanoid(),
        from: patient.id,
        to: doctor.id,
        subject: 'Re: Follow-up on prescriptions',
        message: 'Thank you, doctor. I will do that and report back in a week.',
        createdAt: new Date().toISOString(),
      },
    ]
    db.data.appointments = [
      {
        id: nanoid(),
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        status: 'scheduled',
        type: 'video',
      },
    ]

    db.data.otps = []
    await db.write()
    console.log('Seeded database with default users and sample communications/appointments')
  }
}

function createToken(user) {
  const payload = { id: user.id, email: user.email, name: user.name, role: user.role }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

function requireAuth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) {
      return res.status(401).json({ message: 'Missing authorization token' })
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET)
      req.user = payload
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: 'Not authorized' })
      }
      next()
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' })
    }
  }
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  await db.read()
  const user = (db.data.users || []).find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // Patients must login via OTP; password-based login is not supported for patients.
  if (user.role === 'patient') {
    return res.status(400).json({ message: 'Patient login must use OTP. Please use the patient login flow.' })
  }

  const valid = bcrypt.compareSync(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = createToken(user)
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body || {}
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password and role are required' })
  }

  if (role === 'patient') {
    return res.status(400).json({ message: 'Patient sign-up must use OTP-based flow. Please use OTP registration.' })
  }

  await db.read()
  db.data.users ||= []

  const exists = db.data.users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role)
  if (exists) {
    return res.status(409).json({ message: 'A user with that email and role already exists' })
  }

  const newUser = {
    id: nanoid(),
    name,
    email,
    role,
    passwordHash: bcrypt.hashSync(password, 10),
  }

  db.data.users.push(newUser)
  await db.write()

  const token = createToken(newUser)
  return res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } })
})

app.get('/api/auth/me', requireAuth(), (req, res) => {
  return res.json({ user: req.user })
})

// Patient OTP flow
app.post('/api/auth/patient/request-otp', async (req, res) => {
  const { email } = req.body || {}
  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  await db.read()
  db.data.otps ||= []
  db.data.users ||= []

  // Create patient user if not already exists
  let patient = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'patient')
  if (!patient) {
    patient = {
      id: nanoid(),
      name: email.split('@')[0],
      email,
      role: 'patient',
      passwordHash: bcrypt.hashSync(nanoid(10), 10), // placeholder
    }
    db.data.users.push(patient)
  }

  // Generate OTP (6 digit)
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString() // 10 minutes

  // Store OTP (overwrite any existing for same email)
  db.data.otps = (db.data.otps || []).filter(o => o.email.toLowerCase() !== email.toLowerCase())
  db.data.otps.push({ id: nanoid(), email: email.toLowerCase(), code: otp, expiresAt })
  await db.write()

  // In real world, send OTP via SMS/Email. Here we return it directly for dev.
  return res.json({ message: 'OTP sent', otp })
})

app.post('/api/auth/patient/verify-otp', async (req, res) => {
  const { email, otp } = req.body || {}
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  await db.read()
  db.data.otps ||= []
  db.data.users ||= []

  const record = (db.data.otps || []).find(o => o.email.toLowerCase() === email.toLowerCase() && o.code === otp)
  if (!record) {
    return res.status(401).json({ message: 'Invalid OTP' })
  }

  if (new Date(record.expiresAt) < new Date()) {
    return res.status(401).json({ message: 'OTP expired' })
  }

  // Remove used otp
  db.data.otps = (db.data.otps || []).filter(o => o.id !== record.id)

  let patient = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'patient')
  if (!patient) {
    patient = {
      id: nanoid(),
      name: email.split('@')[0],
      email,
      role: 'patient',
      passwordHash: bcrypt.hashSync(nanoid(10), 10),
    }
    db.data.users.push(patient)
  }

  await db.write()

  const token = createToken(patient)
  return res.json({ token, user: { id: patient.id, name: patient.name, email: patient.email, role: patient.role } })
})

app.get('/api/admin/stats', requireAuth('admin'), async (req, res) => {
  await db.read()
  const counts = (db.data.users || []).reduce(
    (acc, user) => {
      if (user.role === 'patient') acc.patients += 1
      if (user.role === 'doctor') acc.doctors += 1
      if (user.role === 'admin') acc.admins += 1
      return acc
    },
    { patients: 0, doctors: 0, admins: 0 }
  )
  return res.json({ stats: counts })
})

app.get('/api/dashboard', requireAuth(), async (req, res) => {
  await db.read()
  const users = (db.data.users || []).map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
  const communications = (db.data.communications || []).map(c => ({
    ...c,
    createdAt: c.createdAt || null,
  }))
  const appointments = (db.data.appointments || []).map(a => ({
    ...a,
  }))

  const isAdmin = req.user.role === 'admin'

  // If not admin, limit data to the current user
  const filteredUsers = isAdmin ? users : users.filter(u => u.id === req.user.id || u.role === 'doctor' || u.role === 'patient')
  const filteredCommunications = isAdmin
    ? communications
    : communications.filter(c => c.from === req.user.id || c.to === req.user.id)
  const filteredAppointments = isAdmin
    ? appointments
    : appointments.filter(a => a.patientId === req.user.id || a.doctorId === req.user.id)

  return res.json({
    stats: {
      users: users.length,
      communications: communications.length,
      appointments: appointments.length,
    },
    user: req.user,
    users: filteredUsers,
    communications: filteredCommunications,
    appointments: filteredAppointments,
  })
})

app.get('/api/users', requireAuth('admin'), async (req, res) => {
  await db.read()
  return res.json({ users: (db.data.users || []).map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })) })
})

app.listen(PORT, async () => {
  await initDb()
  console.log(`Auth server listening on http://localhost:${PORT}`)
})
