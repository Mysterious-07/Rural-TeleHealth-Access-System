# NabhaCare — Rural TeleHealth Access System Technical Documentation

## 1. Project Overview
NabhaCare is a specialized telehealth platform designed for rural health access (specifically targeting Nabha Civil Hospital, Punjab). It prioritizes low-bandwidth connectivity (2G/3G optimizations), offline capabilities, and multilingual support (English, Punjabi, Hindi).

---

## 2. Core Workflows

### 2.1. Patient Authentication (OTP-based)
1. **Input**: Patient enters their phone number (pre-filled with `+91`).
2. **Request**: `POST /api/auth/patient/request-otp` generates a 6-digit code.
3. **Verification**: `POST /api/auth/patient/verify-otp` validates the code.
4. **Session**: On success, a JWT is issued and stored in `localStorage`.

### 2.2. Tele-Consultation (WebRTC)
1. **Booking**: Patient selects a specialty and doctor in `BookConsultation.jsx`.
2. **Room Entry**: Patient/Doctor enters `ConsultationRoom.jsx`.
3. **Bandwidth Check**: The system detects network speed (HD/SD/Audio-Only).
4. **Negotiation**: Peer connection is established via WebRTC.
5. **Low Data Optimization**: If "Low Data Mode" is enabled, bitrate is capped at 150kbps and video may be disabled for a real-time transcript fallback.

### 2.3. Offline Health Vault
1. **Sync**: While online, records are synced to `localStorage`.
2. **Offline Mode**: User can view encrypted health IDs and records without internet.
3. **QR ID**: Generates a unique QR code for physical hospital visits.

---

## 3. System Architecture & Modules

### 3.1. Frontend Modules (React + Vite)
- **Contexts**:
  - `AuthContext`: Manages login, registration, OTP flows, and user state.
  - `AppContext`: Manages global connectivity status (Online/Syncing/Offline) and language.
- **Components**:
  - `Header`: Multilingual nav with sync status indicator.
  - `ProtectedRoute`: Role-based access control (Patient, Doctor, Admin).
  - `BottomNav`: Mobile-first navigation bar.
- **Pages**:
  - `Home`: Dashboard with health savings impact stats.
  - `ConsultationRoom`: WebRTC implementation with adaptive bitrate.
  - `AITriage`: Low-data chat assistant for symptom screening.

### 3.2. Backend Modules (Node.js + Express)
- **Database**: `lowdb` (JSON-based) for lightweight, portable data storage.
- **Security**: `bcryptjs` for password hashing and `jsonwebtoken` for session management.
- **API Server**: Express server handling auth, dashboard stats, and user management.

---

## 4. API Reference

### Authentication APIs
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login` | POST | Login for Doctors/Admins (Phone + Password) |
| `/api/auth/register` | POST | User registration (Doctor/Admin) |
| `/api/auth/patient/request-otp` | POST | Request 6-digit OTP for patient phone |
| `/api/auth/patient/verify-otp` | POST | Verify OTP and issue JWT session |
| `/api/auth/me` | GET | Retrieve current user profile from token |

### Data & Management APIs
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/dashboard` | GET | Fetch role-specific stats and records |
| `/api/admin/stats` | GET | Admin-only system usage statistics |
| `/api/users` | GET | Admin-only list of all registered users |

---

## 5. Technical Specifications for Rural Use

### 5.1. Low Bandwidth Optimizations (WebRTC)
- **Bitrate Capping**: Max 150kbps for video during 2G/3G connectivity.
- **Audio-Only Fallback**: Automatic transition to audio-only if ICE connection fails or speed is too low.
- **Adaptive Bitrate**: SD (400kbps) and HD (1000kbps) modes for 4G/Wi-Fi.

### 5.2. Multilingual Support
- **English**: Default technical/admin interface.
- **Punjabi (Gurmukhi)**: Primary local language for patients in Nabha/Punjab.
- **Hindi (Devanagari)**: Secondary local language.

### 5.3. Sync Logic
- Uses `localStorage` as a primary data source for the frontend, syncing with the backend `db.json` when connectivity transitions to `synced`.

---

## 6. Directory Structure
```text
├── public/              # Static assets (Favicons, etc.)
├── server/              # Node.js backend
│   ├── db.json          # JSON Database (lowdb)
│   └── index.js         # API Server & Routes
├── src/
│   ├── components/      # Reusable UI & Layout components
│   ├── contexts/        # Auth & App state management
│   ├── pages/           # Screen views (Home, Consult, etc.)
│   └── App.jsx          # Main routing & configuration
└── README.md            # Quickstart guide
```
