import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './ConsultationRoom.css'

const SPEED_LABELS = { fast: 'HD', medium: 'SD', slow: 'Audio Only' }
const SPEED_COLORS = { fast: '#22C55E', medium: '#F59E0B', slow: '#6B7280' }

function simulateNetworkSpeed() {
    const r = Math.random()
    if (r < 0.3) return 'slow'
    if (r < 0.6) return 'medium'
    return 'fast'
}

export default function ConsultationRoom() {
    const navigate = useNavigate()
    const [muted, setMuted] = useState(false)
    const [cameraOff, setCameraOff] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [lowDataMode, setLowDataMode] = useState(false)
    const [networkSpeed, setNetworkSpeed] = useState('fast')
    const [autoAdaptive, setAutoAdaptive] = useState(true)
    const [chatInput, setChatInput] = useState('')
    const [liveTranscript, setLiveTranscript] = useState([])
    const [mediaError, setMediaError] = useState('')
    const [permissionState, setPermissionState] = useState('pending')
    const [isConnectingMedia, setIsConnectingMedia] = useState(true)
    const [hasLocalVideo, setHasLocalVideo] = useState(false)
    const [isPeerConnected, setIsPeerConnected] = useState(false)
    const [chatMessages, setChatMessages] = useState([
        { from: 'doctor', text: 'Hello, how are you feeling today?', time: '2:31 PM' },
        { from: 'patient', text: 'I have headache and fever since 2 days', time: '2:32 PM' },
    ])

    const timerRef = useRef(null)
    const transcriptRef = useRef(null)
    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const localStreamRef = useRef(null)
    const peerConnectionRef = useRef(null)

    // WebRTC Configuration optimized for low bandwidth (2G/3G)
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    }

    // Function to set bitrate limits for 2G/3G
    const setBitrateLimits = async (pc, maxBitrateKbps) => {
        const senders = pc.getSenders()
        for (const sender of senders) {
            if (sender.track?.kind === 'video') {
                const params = sender.getParameters()
                if (!params.encodings) params.encodings = [{}]
                params.encodings[0].maxBitrate = maxBitrateKbps * 1000
                await sender.setParameters(params)
                console.log(`Video bitrate limited to ${maxBitrateKbps}kbps`)
            }
        }
    }

    const initWebRTC = async (stream) => {
        const pc = new RTCPeerConnection(rtcConfig)
        peerConnectionRef.current = pc

        // Add tracks to peer connection
        stream.getTracks().forEach(track => pc.addTrack(track, stream))

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real app, send candidate to signaling server
                console.log('New ICE candidate:', event.candidate)
            }
        }

        pc.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind)
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0]
            }
            setIsPeerConnected(true)
        }

        pc.onconnectionstatechange = () => {
            console.log('Connection state:', pc.connectionState)
            if (pc.connectionState === 'connected') {
                setIsPeerConnected(true)
                // Apply low-bandwidth optimizations once connected
                if (lowDataMode || networkSpeed === 'slow') {
                    setBitrateLimits(pc, 150) // 150kbps for 2G/3G
                }
            }
        }

        // Mock signaling: Create offer
        try {
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: !isAudioMode,
            })
            await pc.setLocalDescription(offer)
            // Send offer to signaling server...
        } catch (err) {
            console.error('Failed to create WebRTC offer:', err)
        }
    }

    // Simulated network speed fluctuations
    useEffect(() => {
        timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
        const networkSim = setInterval(() => {
            const speed = simulateNetworkSpeed()
            setNetworkSpeed(speed)
        }, 4000)
        return () => {
            clearInterval(timerRef.current)
            clearInterval(networkSim)
        }
    }, [])

    // Auto-adaptive: force audio+text when speed is slow or lowDataMode is on
    const effectiveMode = lowDataMode ? 'slow' : (autoAdaptive ? networkSpeed : networkSpeed)
    const isAudioMode = effectiveMode === 'slow' || lowDataMode

    useEffect(() => {
        let isMounted = true

        const startMedia = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                if (!isMounted) return
                setPermissionState('unsupported')
                setMediaError('Camera and microphone are not supported in this browser.')
                setIsConnectingMedia(false)
                return
            }

            try {
                setIsConnectingMedia(true)
                setMediaError('')

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                    },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                })

                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop())
                    return
                }

                localStreamRef.current = stream
                setPermissionState('granted')
                setHasLocalVideo(stream.getVideoTracks().length > 0)

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream
                }

                // Initialize WebRTC
                await initWebRTC(stream)
            } catch (error) {
                if (!isMounted) return

                setPermissionState('denied')
                setHasLocalVideo(false)

                if (error?.name === 'NotAllowedError') {
                    setMediaError('Camera and microphone permission was denied. Please allow access and reload the page.')
                } else if (error?.name === 'NotFoundError') {
                    setMediaError('No camera or microphone was found on this device.')
                } else if (error?.name === 'NotReadableError') {
                    setMediaError('Camera or microphone is already in use by another application.')
                } else {
                    setMediaError('Unable to start camera and microphone for this consultation.')
                }
            } finally {
                if (isMounted) {
                    setIsConnectingMedia(false)
                }
            }
        }

        startMedia()

        return () => {
            isMounted = false
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop())
                localStreamRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current
        }
    }, [hasLocalVideo])

    useEffect(() => {
        if (peerConnectionRef.current && peerConnectionRef.current.connectionState === 'connected') {
            const bitrate = (lowDataMode || networkSpeed === 'slow') ? 150 : (networkSpeed === 'medium' ? 400 : 1000)
            setBitrateLimits(peerConnectionRef.current, bitrate)
        }
    }, [lowDataMode, networkSpeed])

    useEffect(() => {
        const audioTrack = localStreamRef.current?.getAudioTracks?.()[0]
        if (audioTrack) {
            audioTrack.enabled = !muted
        }
    }, [muted])

    useEffect(() => {
        const videoTrack = localStreamRef.current?.getVideoTracks?.()[0]
        if (videoTrack) {
            videoTrack.enabled = !cameraOff && !isAudioMode
        }
    }, [cameraOff, isAudioMode])

    // Simulate live transcript lines appearing
    useEffect(() => {
        if (!isAudioMode) {
            setLiveTranscript([])
            return
        }

        const lines = [
            { speaker: 'Dr. Singh', text: 'Can you describe the pain?', delay: 2000 },
            { speaker: 'You', text: "It's a sharp pain in the forehead", delay: 5000 },
            { speaker: 'Dr. Singh', text: 'Any nausea or blurry vision?', delay: 8000 },
            { speaker: 'You', text: 'Some dizziness when standing', delay: 11000 },
        ]

        const timeouts = lines.map((line) =>
            setTimeout(() => {
                setLiveTranscript(prev => [...prev, line])
            }, line.delay)
        )

        return () => timeouts.forEach(clearTimeout)
    }, [isAudioMode])

    // Auto scroll transcript
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
        }
    }, [liveTranscript])

    const formatTime = (s) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }

    const sendChat = () => {
        if (!chatInput.trim()) return
        const now = new Date()
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        setChatMessages(prev => [...prev, { from: 'patient', text: chatInput, time: timeStr }])
        setChatInput('')

        setTimeout(() => {
            setChatMessages(prev => [...prev, { from: 'doctor', text: 'I understand. Let me check your previous records.', time: timeStr }])
        }, 1500)
    }

    const handleEndCall = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop())
            localStreamRef.current = null
        }
        navigate('/')
    }

    const bandwidthLabel = lowDataMode ? 'Low Data' : SPEED_LABELS[networkSpeed]
    const bandwidthColor = lowDataMode ? '#6B7280' : SPEED_COLORS[networkSpeed]
    const showVideoPreview = !cameraOff && !isAudioMode && hasLocalVideo && permissionState === 'granted'

    return (
        <div className="consultation-room">
            {mediaError && (
                <div className="media-status-banner error">
                    {mediaError}
                </div>
            )}

            {!mediaError && isConnectingMedia && (
                <div className="media-status-banner">
                    Connecting camera and microphone...
                </div>
            )}

            {permissionState === 'granted' && !isConnectingMedia && (
                <div className="media-status-banner success">
                    Camera and microphone connected
                </div>
            )}

            {/* Network Auto-Adaptive Banner */}
            {isAudioMode && (
                <div className="low-bw-banner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {lowDataMode ? 'Low Data Mode — Audio + Real-time Text active' : 'Auto-adapted to Audio + Text — poor connection detected'}
                </div>
            )}

            <div className="consult-topbar">
                <div className="bandwidth-indicator">
                    <div className="bw-bars">
                        <div className={`bw-bar ${networkSpeed !== 'slow' ? 'active' : ''}`} style={{ height: '8px', background: networkSpeed !== 'slow' ? bandwidthColor : '#374151' }} />
                        <div className={`bw-bar ${networkSpeed === 'fast' ? 'active' : ''}`} style={{ height: '14px', background: networkSpeed === 'fast' ? bandwidthColor : '#374151' }} />
                        <div className={`bw-bar ${networkSpeed === 'fast' ? 'active' : ''}`} style={{ height: '20px', background: networkSpeed === 'fast' ? bandwidthColor : '#374151' }} />
                    </div>
                    <span className="bw-pill-inline" style={{ background: bandwidthColor }}>{bandwidthLabel}</span>
                </div>

                <div className="consult-toggles">
                    <label className="toggle-row">
                        <span className="toggle-label">Auto-Adapt</span>
                        <div className={`toggle-switch ${autoAdaptive ? 'on' : ''}`} onClick={() => setAutoAdaptive(!autoAdaptive)}>
                            <div className="toggle-knob" />
                        </div>
                    </label>
                    <label className="toggle-row">
                        <span className="toggle-label">Low Data</span>
                        <div className={`toggle-switch ${lowDataMode ? 'on' : ''}`} onClick={() => setLowDataMode(!lowDataMode)}>
                            <div className="toggle-knob" />
                        </div>
                    </label>
                </div>
            </div>

            {!isAudioMode ? (
                <>
                    <div className="video-main">
                        <div className="remote-video-surface">
                            {isPeerConnected ? (
                                <video
                                    ref={remoteVideoRef}
                                    className="remote-video"
                                    autoPlay
                                    playsInline
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="video-placeholder">
                                    <div className="video-avatar-large">RS</div>
                                    <div className="video-wave" />
                                </div>
                            )}
                        </div>

                        <div className="video-overlay">
                            <span className="doctor-name-overlay">Dr. Rajinder Singh</span>
                            <span className="specialty-tag">{isPeerConnected ? 'Connected • WebRTC' : 'Connecting...'}</span>
                        </div>
                    </div>

                    <div className={`pip-view ${showVideoPreview ? '' : 'pip-view-placeholder'}`}>
                        {showVideoPreview ? (
                            <video
                                ref={localVideoRef}
                                className="local-video"
                                autoPlay
                                muted
                                playsInline
                            />
                        ) : (
                            <div className="pip-avatar">
                                {cameraOff ? 'Camera Off' : 'No Video'}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="audio-text-layout">
                    <div className="audio-feed">
                        <div className="audio-avatar-ring">
                            <div className="audio-avatar">RS</div>
                        </div>
                        <span className="audio-doctor-name">Dr. Rajinder Singh</span>
                        <span className="audio-specialty">General Physician</span>
                        <div className="audio-wave-bars">
                            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                                <div key={i} className="wave-bar" style={{ '--bar-h': `${h * 6}px`, animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>
                    </div>

                    <div className="live-transcript" ref={transcriptRef}>
                        <div className="transcript-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            <span>Live Transcript</span>
                            <span className="transcript-live-dot" />
                        </div>
                        <div className="transcript-body">
                            {liveTranscript.map((line, i) => (
                                <div key={i} className={`transcript-line ${line.speaker === 'You' ? 'you' : 'doc'}`}>
                                    <span className="transcript-speaker">{line.speaker}:</span>
                                    <span className="transcript-text">{line.text}</span>
                                </div>
                            ))}
                            {liveTranscript.length === 0 && (
                                <div className="transcript-placeholder">Listening... transcript will appear here</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showChat && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <span>Chat</span>
                        <button onClick={() => setShowChat(false)}>✕</button>
                    </div>
                    <div className="chat-messages">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.from === 'patient' ? 'sent' : 'received'}`}>
                                <span className="msg-text">{msg.text}</span>
                                <span className="msg-time">{msg.time}</span>
                            </div>
                        ))}
                    </div>
                    <div className="chat-input-row">
                        <input
                            className="input chat-input"
                            placeholder="Type a message..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendChat()}
                        />
                        <button className="btn btn-primary btn-sm" onClick={sendChat}>Send</button>
                    </div>
                </div>
            )}

            <div className="controls-panel">
                <span className="call-timer mono">{formatTime(seconds)}</span>
                <div className="controls-row">
                    <button className={`control-btn ${muted ? 'active-control' : ''}`} onClick={() => setMuted(!muted)} aria-label="Toggle mute">
                        {muted ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" /><path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .76-.12 1.49-.34 2.18" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                        )}
                    </button>

                    <button
                        className={`control-btn ${cameraOff || isAudioMode ? 'active-control' : ''}`}
                        onClick={() => setCameraOff(!cameraOff)}
                        aria-label="Toggle camera"
                        disabled={isAudioMode || permissionState !== 'granted'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {cameraOff || isAudioMode ? (
                                <><line x1="1" y1="1" x2="23" y2="23" /><path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h4a2 2 0 012 2v9.34" /><circle cx="12" cy="13" r="3" /></>
                            ) : (
                                <><polygon points="23 7 16 12 23 17" /><rect x="1" y="5" width="15" height="14" rx="2" /></>
                            )}
                        </svg>
                    </button>

                    <button className={`control-btn ${lowDataMode ? 'active-control-gold' : ''}`} onClick={() => setLowDataMode(!lowDataMode)} aria-label="Toggle Low Data Mode">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={lowDataMode ? '#F59E0B' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12.55a11 11 0 0114.08 0" /><path d="M1.42 9a16 16 0 0121.16 0" /><path d="M8.53 16.11a6 6 0 016.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
                        </svg>
                    </button>

                    <button className="control-btn" onClick={() => setShowChat(!showChat)} aria-label="Toggle chat">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                    </button>

                    <button className="control-btn end-call" onClick={handleEndCall} aria-label="End call">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 002.59 3.4z" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
