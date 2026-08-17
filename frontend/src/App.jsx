import { useEffect, useRef, useState } from 'react'

import {
  Camera,
  CircleStop,
  Hand,
  Gauge,
  Activity,
  ScanLine,
  Box,
  Cpu,
  RotateCcw,
  Linkedin,
  Instagram,
  Github,
  Video,
  Square,
} from 'lucide-react'

import { useHandTracking } from './hooks/useHandTracking'

export default function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  const [isRecording, setIsRecording] = useState(false)

  const {
    state,
    error,
    hands,
    metrics,
    settings,
    setSettings,
    start,
    stop,
  } = useHandTracking(
    videoRef,
    canvasRef
  )

  const running = state === 'running'
  const loading = state === 'loading'
  const hasHands = hands.length > 0

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop()
      }

      stop()
    }
  }, [stop])

  const toggleSetting = (key) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const statusText =
    state === 'running'
      ? 'LIVE'
      : state === 'loading'
        ? 'INITIALIZING'
        : state === 'error'
          ? 'ERROR'
          : 'READY'

  const statusClass =
    state === 'running'
      ? 'status live'
      : 'status'

  /* =========================================================
     RECORDING
     ========================================================= */

  const startRecording = () => {
    const video = videoRef.current

    if (!video || !video.srcObject) {
      return
    }

    try {
      const stream = video.srcObject

      let mimeType = ''

      if (
        MediaRecorder.isTypeSupported(
          'video/webm;codecs=vp9'
        )
      ) {
        mimeType = 'video/webm;codecs=vp9'
      } else if (
        MediaRecorder.isTypeSupported(
          'video/webm;codecs=vp8'
        )
      ) {
        mimeType = 'video/webm;codecs=vp8'
      } else if (
        MediaRecorder.isTypeSupported(
          'video/webm'
        )
      ) {
        mimeType = 'video/webm'
      }

      recordedChunksRef.current = []

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream)

      recorder.ondataavailable = (event) => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          recordedChunksRef.current.push(
            event.data
          )
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(
          recordedChunksRef.current,
          {
            type:
              mimeType ||
              'video/webm',
          }
        )

        if (blob.size === 0) {
          setIsRecording(false)
          return
        }

        const url =
          URL.createObjectURL(blob)

        const timestamp =
          new Date()
            .toISOString()
            .replace(/[:.]/g, '-')

        const link =
          document.createElement('a')

        link.href = url

        link.download =
          `velar-recording-${timestamp}.webm`

        document.body.appendChild(link)

        link.click()

        link.remove()

        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)

        recordedChunksRef.current = []

        setIsRecording(false)
      }

      recorder.onerror = (event) => {
        console.error(
          'Recording error:',
          event
        )

        setIsRecording(false)
      }

      mediaRecorderRef.current =
        recorder

      recorder.start(1000)

      setIsRecording(true)
    } catch (recordingError) {
      console.error(
        'Could not start recording:',
        recordingError
      )

      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    const recorder =
      mediaRecorderRef.current

    if (
      recorder &&
      recorder.state !== 'inactive'
    ) {
      recorder.stop()
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  /* =========================================================
     STOP CAMERA
     ========================================================= */

  const handleStopCamera = () => {
    if (isRecording) {
      stopRecording()
    }

    stop()
  }

  return (
    <div className="app-shell">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="topbar">

        {/* ===================================================
            LEFT — BOLD VELAR MARK
            =================================================== */}

        <div
          className="brand-mark"
          aria-label="VELAR"
          title="VELAR"
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="
                M6 8
                L19.2 34.2
                C21.3 38.4 26.7 38.4 28.8 34.2
                L42 8
              "
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>


        {/* ===================================================
            CENTER — VELAR
            =================================================== */}

        <div className="brand">

          <span>
            VELAR
          </span>

          <small>
            REAL-TIME HAND INTELLIGENCE
          </small>

        </div>


        {/* ===================================================
            RIGHT SIDE
            =================================================== */}

        <div className="header-right">

          <span className="header-author">
            Sayanth Paul Tom
          </span>


          <div className="header-socials">

            {/* GITHUB */}

            <a
              href="https://github.com/manjakkadan"
              target="_blank"
              rel="noopener noreferrer"
              className="header-social-link"
              aria-label="GitHub"
              title="GitHub"
            >
              <Github
                size={17}
                strokeWidth={1.7}
              />
            </a>


            {/* LINKEDIN */}

            <a
              href="https://www.linkedin.com/in/sayanthpaultom/"
              target="_blank"
              rel="noopener noreferrer"
              className="header-social-link"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <Linkedin
                size={17}
                strokeWidth={1.7}
              />
            </a>


            {/* INSTAGRAM */}

            <a
              href="https://www.instagram.com/sayanthpaultom/"
              target="_blank"
              rel="noopener noreferrer"
              className="header-social-link"
              aria-label="Instagram"
              title="Instagram"
            >
              <Instagram
                size={17}
                strokeWidth={1.7}
              />
            </a>

          </div>


          {/* LIVE STATUS */}

          <div className={statusClass}>

            <span>
              ●
            </span>

            {statusText}

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN WORKSPACE
          ===================================================== */}

      <main className="workspace">


        {/* ===================================================
            HERO
            =================================================== */}

        <div className="hero-copy">

          <div>

            <h1>
              Vision,
              <span>
                {' '}in motion.
              </span>
            </h1>

            <p>
              Real-time hand detection,
              tracking and gesture recognition.
            </p>

          </div>


          {/* =================================================
              CONTROLS
              ================================================= */}

          <div className="hero-controls">


            {/* STOP CAMERA */}

            {running && (

              <button
                className="
                  control-button
                  stop-camera-button
                "
                onClick={handleStopCamera}
                title="Stop Camera"
              >

                <CircleStop
                  size={14}
                />

                <span>
                  Stop Camera
                </span>

              </button>

            )}


            {/* RECORD */}

            {running && (

              <button
                className={`
                  control-button
                  record-button
                  ${isRecording ? 'recording' : ''}
                `}
                onClick={toggleRecording}
                title={
                  isRecording
                    ? 'Stop Recording'
                    : 'Start Recording'
                }
              >

                {isRecording ? (

                  <Square
                    size={11}
                    fill="currentColor"
                  />

                ) : (

                  <Video
                    size={14}
                  />

                )}

                <span>
                  {isRecording
                    ? 'Stop Recording'
                    : 'Record'}
                </span>

              </button>

            )}


            {/* MEDIAPIPE */}

            <div className="engine-pill">

              <span />

              MEDIAPIPE VISION ENGINE

            </div>

          </div>

        </div>


        {/* ===================================================
            MAIN GRID
            =================================================== */}

        <div className="main-grid">


          {/* =================================================
              CAMERA
              ================================================= */}

          <section className="stage-shell">

            <div className="camera-stage">

              <video
                ref={videoRef}
                muted
                playsInline
                className={
                  running
                    ? 'visible'
                    : ''
                }
              />


              <canvas
                ref={canvasRef}
              />


              {/* EMPTY STATE */}

              {!running && (

                <div className="empty-state">

                  <div className="empty-icon">

                    {state === 'error' ? (

                      <RotateCcw
                        size={22}
                        strokeWidth={1.5}
                      />

                    ) : (

                      <Camera
                        size={22}
                        strokeWidth={1.5}
                      />

                    )}

                  </div>


                  <h2>

                    {state === 'error'
                      ? 'Camera unavailable'
                      : loading
                        ? 'Initializing vision'
                        : 'Ready when you are'}

                  </h2>


                  <p>

                    {error ||
                      (
                        loading
                          ? 'Preparing the camera and hand detection engine.'
                          : 'Start the camera to begin real-time hand analysis.'
                      )}

                  </p>


                  {state === 'error' ? (

                    <button
                      className="primary"
                      onClick={start}
                    >

                      <RotateCcw
                        size={14}
                      />

                      Try Again

                    </button>

                  ) : (

                    <button
                      className="primary"
                      onClick={start}
                      disabled={loading}
                    >

                      <Camera
                        size={14}
                      />

                      {loading
                        ? 'Starting...'
                        : 'Start Camera'}

                    </button>

                  )}

                </div>

              )}


              {/* LIVE */}

              {running && (

                <div className="stage-chip">

                  <span className="live-dot" />

                  LIVE

                </div>

              )}


              {/* RECORDING */}

              {isRecording && (

                <div className="recording-chip">

                  <span />

                  RECORDING

                </div>

              )}

            </div>


            {/* STAGE ACTIONS */}

            <div className="stage-actions">

              {!running && (

                <button
                  className="primary"
                  onClick={start}
                  disabled={loading}
                >

                  <Camera
                    size={14}
                  />

                  {loading
                    ? 'Starting...'
                    : 'Start Camera'}

                </button>

              )}

              <span className="privacy-note">

                Camera processing happens locally.

              </span>

            </div>

          </section>


          {/* =================================================
              RIGHT INFORMATION RAIL
              ================================================= */}

          <aside className="rail">


            {/* DETECTION */}

            <section className="rail-section">

              <div className="section-label">

                <ScanLine size={12} />

                DETECTION

              </div>


              <div className="metric-row">

                <span>

                  <Hand size={12} />

                  Hands

                </span>

                <strong>
                  {hands.length}
                </strong>

              </div>


              <div className="metric-row">

                <span>

                  <Activity size={12} />

                  Gesture

                </span>

                <strong>

                  {hasHands
                    ? hands[0].gesture
                    : '—'}

                </strong>

              </div>


              <div className="metric-row">

                <span>

                  <Gauge size={12} />

                  Confidence

                </span>

                <strong>

                  {metrics.confidence
                    ? `${Math.round(
                        metrics.confidence
                      )}%`
                    : '—'}

                </strong>

              </div>

            </section>


            {/* TRACKING */}

            <section className="rail-section">

              <div className="section-label">

                <Hand size={12} />

                TRACKING

              </div>


              {hands.length > 0 ? (

                hands.map((hand) => (

                  <div
                    className="hand-card"
                    key={hand.id}
                  >

                    <div className="hand-dot" />

                    <div>

                      <strong>
                        HAND #{hand.id}
                      </strong>

                      <small>
                        {hand.hand}
                      </small>

                    </div>

                    <em>

                      {Math.round(
                        hand.confidence
                      )}%

                    </em>

                  </div>

                ))

              ) : (

                <p className="muted">

                  No hands detected.
                  Place your hand inside
                  the camera frame.

                </p>

              )}

            </section>


            {/* VISUALIZATION */}

            <section className="rail-section">

              <div className="section-label">

                <Box size={12} />

                VISUALIZATION

              </div>


              <button
                className="toggle"
                onClick={() =>
                  toggleSetting('landmarks')
                }
              >

                <span>
                  Landmarks
                </span>

                <div
                  className={`
                    switch
                    ${
                      settings.landmarks
                        ? 'on'
                        : ''
                    }
                  `}
                >

                  <span />

                </div>

              </button>


              <button
                className="toggle"
                onClick={() =>
                  toggleSetting('skeleton')
                }
              >

                <span>
                  Skeleton
                </span>

                <div
                  className={`
                    switch
                    ${
                      settings.skeleton
                        ? 'on'
                        : ''
                    }
                  `}
                >

                  <span />

                </div>

              </button>


              <button
                className="toggle"
                onClick={() =>
                  toggleSetting('boxes')
                }
              >

                <span>
                  Bounding Box
                </span>

                <div
                  className={`
                    switch
                    ${
                      settings.boxes
                        ? 'on'
                        : ''
                    }
                  `}
                >

                  <span />

                </div>

              </button>


              <button
                className="toggle"
                onClick={() =>
                  toggleSetting('labels')
                }
              >

                <span>
                  Labels
                </span>

                <div
                  className={`
                    switch
                    ${
                      settings.labels
                        ? 'on'
                        : ''
                    }
                  `}
                >

                  <span />

                </div>

              </button>

            </section>


            {/* SYSTEM */}

            <section className="rail-section">

              <div className="section-label">

                <Cpu size={12} />

                SYSTEM

              </div>


              <div className="metric-row">

                <span>
                  FPS
                </span>

                <strong>
                  {metrics.fps || '—'}
                </strong>

              </div>


              <div className="metric-row">

                <span>
                  Inference
                </span>

                <strong>

                  {metrics.inference
                    ? `${metrics.inference} ms`
                    : '—'}

                </strong>

              </div>


              <div className="metric-row">

                <span>
                  Engine
                </span>

                <strong>
                  MediaPipe
                </strong>

              </div>

            </section>

          </aside>

        </div>


        {/* ===================================================
            BOTTOM METRICS
            =================================================== */}

        <div className="bottom-bar">

          <div>

            <span>
              HANDS
            </span>

            <strong>
              {hands.length}
            </strong>

          </div>


          <div>

            <span>
              GESTURE
            </span>

            <strong>

              {hasHands
                ? hands[0].gesture
                : '—'}

            </strong>

          </div>


          <div>

            <span>
              FPS
            </span>

            <strong>
              {metrics.fps || '—'}
            </strong>

          </div>


          <div>

            <span>
              CONFIDENCE
            </span>

            <strong>

              {metrics.confidence
                ? `${Math.round(
                    metrics.confidence
                  )}%`
                : '—'}

            </strong>

          </div>

        </div>

      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer>

        <span>
          VELAR · REAL-TIME VISION
        </span>

        <span>
          LOCAL PROCESSING
        </span>

      </footer>

    </div>
  )
}