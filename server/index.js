import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { nanoid } from 'nanoid'
import twilio from 'twilio'
import cron from 'node-cron'

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000
const JWT_SECRET = process.env.JWT_SECRET || 'nabha-dev-secret'

const twilioClient = process.env.TWILIO_ACCOUNT_SID 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json())

const adapter = new JSONFile(new URL('./db.json', import.meta.url))
const db = new Low(adapter, { users: [], communications: [], appointments: [], otps: [], queue: [], smsLogs: [], queueSettings: [], consultationReports: [] })

const sendSMS = async (to, message, type = 'GENERAL') => {
  const log = {
    id: `sms_${Date.now()}`,
    to, message, type,
    status: 'PENDING',
    sentAt: Date.now(),
    twilioSid: null
  };
  try {
    if (!twilioClient || process.env.NODE_ENV === 'development') {
      console.log(`\n📱 SMS [DEV]\nTo: ${to}\n${message}\n`);
      log.status = 'DEV_LOGGED';
      log.twilioSid = 'DEV_' + Date.now();
    } else {
      const r = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });
      log.status = 'SENT';
      log.twilioSid = r.sid;
    }
  } catch (e) {
    log.status = 'FAILED';
    log.error = e.message;
    console.error('SMS failed:', e.message);
  }
  db.data.smsLogs ||= [];
  db.data.smsLogs.push(log);
  await db.write();
  return log;
};

const MSG = {
  booked: (name, pos, doctor, wait, lang) => ({
    ENGLISH: `NabhaCare: Hi ${name}!\nQueue position: #${pos}\nDoctor: ${doctor}\nWait: ~${wait} mins\nApp not needed. Reply STATUS anytime.`,
    PUNJABI: `NabhaCare: ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${name}!\nਕਤਾਰ ਨੰਬਰ: #${pos}\nਡਾਕਟਰ: ${doctor}\nਇੰਤਜ਼ਾਰ: ~${wait} ਮਿੰਟ\nSTATUS ਲਿਖੋ ਸਥਿਤੀ ਜਾਣਨ ਲਈ।`,
    HINDI: `NabhaCare: नमस्ते ${name}!\nकतार नंबर: #${pos}\nडॉक्टर: ${doctor}\nप्रतीक्षा: ~${wait} मिनट\nSTATUS लिखें स्थिति जानने के लिए।`
  })[lang] || `NabhaCare: Hi ${name}! Queue #${pos}. Doctor: ${doctor}. Wait: ~${wait} mins.`,

  next: (name, doctor, lang) => ({
    ENGLISH: `NabhaCare: ${name}, YOU ARE NEXT!\nDr. ${doctor} will call in ~5 mins.\nKeep phone free and nearby.`,
    PUNJABI: `NabhaCare: ${name}, ਤੁਹਾਡੀ ਵਾਰੀ ਆ ਗਈ!\nਡਾ. ${doctor} ~5 ਮਿੰਟ ਵਿੱਚ ਕਾਲ ਕਰਨਗੇ।\nਫ਼ੋਨ ਕੋਲ ਰੱਖੋ।`,
    HINDI: `NabhaCare: ${name}, आपकी बारी आ गई!\nडॉ. ${doctor} ~5 मिनट में कॉल करेंगे।\nफोन पास रखें।`
  })[lang] || `NabhaCare: ${name} YOU ARE NEXT! Dr. ${doctor} calls in ~5 mins.`,

  status: (name, pos, wait, doctor, lang) => ({
    ENGLISH: `NabhaCare Status:\n${name}: #${pos} in queue\nDoctor: ${doctor}\nWait: ~${wait} mins`,
    PUNJABI: `NabhaCare ਸਥਿਤੀ:\n${name}: #${pos} ਕਤਾਰ ਵਿੱਚ\nਡਾਕਟਰ: ${doctor}\nਇੰਤਜ਼ਾਰ: ~${wait} ਮਿੰਟ`,
    HINDI: `NabhaCare स्थिति:\n${name}: #${pos} कतार में\nडॉक्टर: ${doctor}\nप्रतीक्षा: ~${wait} मिनट`
  })[lang] || `NabhaCare: ${name} is #${pos}. Wait ~${wait} mins.`,

  cancelled: (name, doctor, lang) => ({
    ENGLISH: `NabhaCare: ${name}, appointment with ${doctor} cancelled.\nReply CONSULT to rebook.`,
    PUNJABI: `NabhaCare: ${name}, ${doctor} ਨਾਲ ਅਪੌਇੰਟਮੈਂਟ ਰੱਦ ਹੋਈ।\nਦੁਬਾਰਾ ਬੁੱਕ ਕਰਨ ਲਈ CONSULT ਲਿਖੋ।`,
    HINDI: `NabhaCare: ${name}, ${doctor} के साथ अपॉइंटमेंट रद्द हुई।\nदोबारा बुक करने के लिए CONSULT लिखें।`
  })[lang] || `NabhaCare: ${name} appointment cancelled. Reply CONSULT to rebook.`
};

const recalculateQueue = async (doctorId) => {
  const waiting = db.data.queue
    .filter(q => q.doctorId === doctorId && q.status === 'WAITING')
    .sort((a, b) => a.bookedAt - b.bookedAt);

  const avgMin = db.data.queueSettings?.[0]?.avgMinutes || 10;

  for (let i = 0; i < waiting.length; i++) {
    const item = waiting[i];
    const oldPos = item.position;
    const newPos = i + 1;
    const newWait = i * avgMin;
    const idx = db.data.queue.findIndex(q => q.id === item.id);

    db.data.queue[idx].position = newPos;
    db.data.queue[idx].estimatedWaitMinutes = newWait;

    if (newPos === 1 && oldPos !== 1) {
      await sendSMS(
        item.patientPhone,
        MSG.next(item.patientName, item.doctorName, item.language),
        'YOU_ARE_NEXT'
      );
      db.data.queue[idx].notifiedAt = Date.now();
    }
  }
  await db.write();
};

const getPatientQueue = (patientId) => {
  return db.data.queue.find(
    q => q.patientId === patientId && q.status === 'WAITING'
  );
};

async function initDb() {
  await db.read()
  db.data ||= { users: [], communications: [], appointments: [], otps: [] }

  // Seed default data if none exist
  if (!db.data.users || db.data.users.length === 0) {
    const admin = {
      id: nanoid(),
      name: 'Nabha Administrator',
      phone: '+919999999999',
      role: 'admin',
      passwordHash: bcrypt.hashSync('Admin@123', 10),
    }
    const doctor = {
      id: nanoid(),
      name: 'Dr. Rajinder Singh',
      phone: '+918888888888',
      role: 'doctor',
      passwordHash: bcrypt.hashSync('Doctor@123', 10),
    }
    const patient = {
      id: nanoid(),
      name: 'Gurpreet Singh',
      phone: '+919876543210',
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
  const payload = { id: user.id, name: user.name, role: user.role, phone: user.phone, email: user.email }
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
  const { email, password, role } = req.body || {}
  if (role === 'patient') {
    return res.status(400).json({ message: 'Patient login must use the OTP flow.' });
  }

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required for this role' })
  }

  await db.read()
  const user = (db.data.users || []).find(u => u.email === email && u.role === role)
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const valid = bcrypt.compareSync(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = createToken(user)
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

app.post('/api/auth/register', async (req, res) => {
  const { name, phone, email, password, role, age, location } = req.body || {}

  if (!name || !role) {
    return res.status(400).json({ message: 'Name and role are required' })
  }

  if (role === 'patient' && !phone) {
    return res.status(400).json({ message: 'Phone number is required for patient registration' })
  }

  if (role !== 'patient' && (!email || !password)) {
    return res.status(400).json({ message: 'Email and password are required for this role' })
  }

  await db.read()
  db.data.users ||= []

  // Check existence
  const exists = role === 'patient' 
    ? db.data.users.some(u => u.phone === phone && u.role === 'patient')
    : db.data.users.some(u => u.email === email && u.role === role);

  if (exists) {
    return res.status(409).json({ message: `A user with that ${role === 'patient' ? 'phone number' : 'email'} already exists` })
  }

  const newUser = {
    id: nanoid(),
    name,
    role,
    phone: role === 'patient' ? phone : null,
    email: role !== 'patient' ? email : null,
    age: age || null,
    location: location || null,
    passwordHash: password ? bcrypt.hashSync(password, 10) : null,
  }

  db.data.users.push(newUser)
  await db.write()

  if (role === 'patient') {
    return res.status(201).json({ success: true, message: 'Registration successful. Please log in using OTP.' })
  }

  const token = createToken(newUser)
  return res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } })
})

app.get('/api/auth/me', requireAuth(), (req, res) => {
  return res.json({ user: req.user })
})

app.post('/api/auth/patient/request-otp', async (req, res) => {
  const { phone } = req.body || {}
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' })
  }

  await db.read()
  const user = (db.data.users || []).find(u => u.phone === phone && u.role === 'patient');
  if (!user) {
      return res.status(404).json({ message: 'No patient found with this number. Please register first.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString() // 10 minutes

  db.data.otps = (db.data.otps || []).filter(o => o.phone !== phone)
  db.data.otps.push({ id: nanoid(), phone, code: otp, expiresAt })
  await db.write()

  // In real world, send OTP via SMS. Here we return it directly for dev.
  return res.json({ message: 'OTP sent', otp })
})

app.post('/api/auth/patient/verify-otp', async (req, res) => {
  const { phone, otp } = req.body || {}
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' })
  }

  await db.read()
  const record = (db.data.otps || []).find(o => o.phone === phone && o.code === otp)
  if (!record) {
    return res.status(401).json({ message: 'Invalid OTP' })
  }

  if (new Date(record.expiresAt) < new Date()) {
    return res.status(401).json({ message: 'OTP expired' })
  }

  db.data.otps = (db.data.otps || []).filter(o => o.id !== record.id)
  const user = db.data.users.find(u => u.phone === phone && u.role === 'patient')
  
  await db.write()

  const token = createToken(user)
  return res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } })
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
  const users = (db.data.users || []).map(u => ({ id: u.id, name: u.name, phone: u.phone, role: u.role }))
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
  return res.json({ users: (db.data.users || []).map(u => ({ id: u.id, name: u.name, phone: u.phone, role: u.role })) })
})

// AI Consultation Summary & Report Saving
app.post('/api/consultations/save-report', requireAuth(), async (req, res) => {
  const { patientId, doctorId, transcript, durationSeconds } = req.body || {};
  
  if (!patientId || !doctorId || !transcript) {
    return res.status(400).json({ success: false, message: 'Missing report data' });
  }

  // Mock AI Logic: In a real app, you would send 'transcript' to an AI API (like OpenAI/Gemini)
  // to generate a concise summary. Here we simulate it.
  const aiSummary = `This was a ${Math.round(durationSeconds / 60)} minute consultation. Key points discussed: ${transcript.substring(0, 100)}... Based on the dialogue, the patient reported symptoms and the doctor provided medical guidance.`;
  
  const report = {
    id: `rep_${Date.now()}`,
    patientId,
    doctorId,
    date: new Date().toISOString(),
    durationSeconds,
    transcriptSnippet: transcript.substring(0, 500), // Store partial transcript for context
    summary: aiSummary,
    status: 'finalized'
  };

  await db.read();
  db.data.consultationReports ||= [];
  db.data.consultationReports.push(report);
  await db.write();

  return res.json({ success: true, data: report });
});

app.get('/api/consultations/reports', requireAuth(), async (req, res) => {
  await db.read();
  const reports = db.data.consultationReports || [];
  
  // Filter based on role
  const filtered = req.user.role === 'admin' 
    ? reports 
    : reports.filter(r => r.patientId === req.user.id || r.doctorId === req.user.id);
    
  return res.json({ success: true, data: filtered });
});

// POST /api/queue/book — patient joins queue 
app.post('/api/queue/book', requireAuth(), async (req, res) => {
  try {
    await db.read()
    const { doctorId, chiefComplaint } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !chiefComplaint)
      return res.status(400).json({ success: false, error: 'doctorId and chiefComplaint required' });

    const alreadyIn = db.data.queue.find(
      q => q.patientId === patientId && q.doctorId === doctorId && q.status === 'WAITING'
    );
    if (alreadyIn)
      return res.status(409).json({ success: false, error: 'Already in queue', data: alreadyIn });

    const doctor = db.data.users?.find(u => u.id === doctorId);
    const patient = db.data.users?.find(u => u.id === patientId);
    if (!doctor || !patient)
      return res.status(404).json({ success: false, error: 'Doctor or patient not found' });

    const currentQueue = db.data.queue.filter(
      q => q.doctorId === doctorId && q.status === 'WAITING'
    );
    const maxSize = db.data.queueSettings?.[0]?.maxSize || 20;
    if (currentQueue.length >= maxSize)
      return res.status(400).json({ success: false, error: 'Queue is full' });

    const avgMin = db.data.queueSettings?.[0]?.avgMinutes || 10;
    const position = currentQueue.length + 1;
    const estimatedWaitMinutes = (position - 1) * avgMin;

    const item = {
      id: `q_${Date.now()}`,
      patientId, patientName: patient.name,
      patientPhone: patient.phone,
      doctorId, doctorName: doctor.name,
      chiefComplaint, position,
      estimatedWaitMinutes,
      status: 'WAITING',
      language: patient.language || 'ENGLISH',
      bookedAt: Date.now(),
      notifiedAt: null, lastReminderAt: null,
      consultationStartedAt: null, consultationEndedAt: null
    };

    db.data.queue.push(item);
    await db.write();

    await sendSMS(
      patient.phone,
      MSG.booked(patient.name, position, doctor.name, estimatedWaitMinutes, item.language),
      'QUEUE_BOOKED'
    );

    if (position === 1) {
      await sendSMS(
        patient.phone,
        MSG.next(patient.name, doctor.name, item.language),
        'YOU_ARE_NEXT'
      );
      const idx = db.data.queue.findIndex(q => q.id === item.id);
      db.data.queue[idx].notifiedAt = Date.now();
      await db.write();
    }

    return res.status(201).json({
      success: true,
      data: { queueId: item.id, position, estimatedWaitMinutes, smsSent: true }
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/queue/my-status — patient checks own position 
app.get('/api/queue/my-status', requireAuth(), (req, res) => {
  const item = getPatientQueue(req.user.id);
  if (!item)
    return res.status(404).json({ success: false, inQueue: false, error: 'Not in any queue' });
  return res.json({ success: true, inQueue: true, data: item });
});

// GET /api/queue/doctor/:doctorId — doctor sees full queue 
app.get('/api/queue/doctor/:doctorId', requireAuth(), (req, res) => {
  if (req.user.role !== 'doctor' && req.user.role !== 'admin')
    return res.status(403).json({ success: false, error: 'Access denied' });

  const queue = db.data.queue
    .filter(q => q.doctorId === req.params.doctorId && q.status === 'WAITING')
    .sort((a, b) => a.position - b.position);

  return res.json({
    success: true,
    data: {
      totalWaiting: queue.length,
      queue: queue.map(q => ({
        queueId: q.id, position: q.position,
        patientName: q.patientName, patientPhone: q.patientPhone,
        chiefComplaint: q.chiefComplaint,
        waitMinutes: q.estimatedWaitMinutes,
        isNext: q.position === 1
      }))
    }
  });
});

// POST /api/queue/:id/complete — doctor marks done, queue advances 
app.post('/api/queue/:id/complete', requireAuth(), async (req, res) => {
  if (req.user.role !== 'doctor' && req.user.role !== 'admin')
    return res.status(403).json({ success: false, error: 'Access denied' });

  await db.read()
  const idx = db.data.queue.findIndex(q => q.id === req.params.id);
  if (idx === -1)
    return res.status(404).json({ success: false, error: 'Not found' });

  const item = db.data.queue[idx];
  db.data.queue[idx].status = 'COMPLETED';
  db.data.queue[idx].consultationEndedAt = Date.now();
  await db.write();

  await recalculateQueue(item.doctorId);

  const remaining = db.data.queue.filter(
    q => q.doctorId === item.doctorId && q.status === 'WAITING'
  ).length;

  return res.json({
    success: true,
    message: 'Consultation completed. Queue advanced.',
    data: { remaining, nextPatient: db.data.queue.find(
      q => q.doctorId === item.doctorId && q.status === 'WAITING' && q.position === 1
    )?.patientName || 'Queue empty' }
  });
});

// POST /api/queue/:id/cancel — cancel and notify 
app.post('/api/queue/:id/cancel', requireAuth(), async (req, res) => {
  await db.read()
  const idx = db.data.queue.findIndex(q => q.id === req.params.id);
  if (idx === -1)
    return res.status(404).json({ success: false, error: 'Not found' });

  const item = db.data.queue[idx];
  if (req.user.role === 'patient' && item.patientId !== req.user.id)
    return res.status(403).json({ success: false, error: 'Cannot cancel others appointment' });

  db.data.queue[idx].status = 'CANCELLED';
  db.data.queue[idx].cancelledAt = Date.now();
  await db.write();

  await sendSMS(
    item.patientPhone,
    MSG.cancelled(item.patientName, item.doctorName, item.language),
    'CANCELLED'
  );
  await recalculateQueue(item.doctorId);

  return res.json({ success: true, message: 'Cancelled successfully' });
});

// POST /api/queue/sms-webhook — handles patient SMS replies 
app.post('/api/queue/sms-webhook', async (req, res) => {
  const msg = (req.body.Body || '').trim().toUpperCase();
  const from = req.body.From;
  await db.read()
  const twiml = new twilio.twiml.MessagingResponse();

  const patient = db.data.users?.find(u => u.phone === from);
  if (!patient) {
    twiml.message('NabhaCare: Number not registered. Visit nabhacare.com');
    return res.type('text/xml').send(twiml.toString());
  }

  const lang = patient.language || 'ENGLISH';

  if (msg === 'STATUS') {
    const item = getPatientQueue(patient.id);
    if (!item) {
      twiml.message({ ENGLISH: `NabhaCare: ${patient.name}, not in any queue. Reply CONSULT to book.`, PUNJABI: `NabhaCare: ਕਿਸੇ ਕਤਾਰ ਵਿੱਚ ਨਹੀਂ। CONSULT ਲਿਖੋ।`, HINDI: `NabhaCare: किसी कतार में नहीं। CONSULT लिखें।` }[lang]);
    } else {
      twiml.message(MSG.status(item.patientName, item.position, item.estimatedWaitMinutes, item.doctorName, lang));
    }
  } else if (msg === 'CANCEL') {
    const item = getPatientQueue(patient.id);
    if (!item) {
      twiml.message('NabhaCare: No active booking to cancel.');
    } else {
      const idx = db.data.queue.findIndex(q => q.id === item.id);
      db.data.queue[idx].status = 'CANCELLED';
      db.data.queue[idx].cancelledAt = Date.now();
      await db.write();
      await recalculateQueue(item.doctorId);
      twiml.message({ ENGLISH: `Appointment with ${item.doctorName} cancelled. Reply CONSULT to rebook.`, PUNJABI: `${item.doctorName} ਨਾਲ ਅਪੌਇੰਟਮੈਂਟ ਰੱਦ। CONSULT ਲਿਖੋ।`, HINDI: `${item.doctorName} के साथ अपॉइंटमेंट रद्द। CONSULT लिखें।` }[lang]);
    }
  } else if (msg === 'CONSULT') {
    twiml.message(`NabhaCare: Book here:\n${process.env.FRONTEND_URL}/consult`);
  } else {
    twiml.message({ ENGLISH: `NabhaCare Commands:\nSTATUS - your position\nCANCEL - cancel booking\nCONSULT - book appointment`, PUNJABI: `NabhaCare ਕਮਾਂਡਾਂ:\nSTATUS - ਸਥਿਤੀ\nCANCEL - ਰੱਦ ਕਰੋ\nCONSULT - ਬੁੱਕ ਕਰੋ`, HINDI: `NabhaCare कमांड:\nSTATUS - स्थिति\nCANCEL - रद्द करें\nCONSULT - बुक करें` }[lang]);
  }

  return res.type('text/xml').send(twiml.toString());
});

cron.schedule('*/5 * * * *', async () => {
  await db.read()
  const now = Date.now();
  const longWaiting = db.data.queue.filter(q => 
    q.status === 'WAITING' && 
    q.bookedAt < now - 30 * 60 * 1000 && 
    (!q.lastReminderAt || q.lastReminderAt < now - 60 * 60 * 1000)
  );
  for (const item of longWaiting) {
    await sendSMS(item.patientPhone, 
      MSG.status(item.patientName, item.position, item.estimatedWaitMinutes, item.doctorName, item.language), 
      'WAIT_REMINDER'
    );
    const idx = db.data.queue.findIndex(q => q.id === item.id);
    db.data.queue[idx].lastReminderAt = now;
    await db.write();
  }
});

app.listen(PORT, async () => {
  await initDb()
  console.log(`Auth server listening on http://localhost:${PORT}`)
})
