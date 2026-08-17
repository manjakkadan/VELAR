import { useCallback, useEffect, useRef, useState } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { recognizeGesture, landmarkBounds } from '../lib/gestureRecognition'

const WASM =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'

const MODEL_ASSET_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

export function useHandTracking(videoRef, canvasRef) {
  const landmarkerRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(0)
  const fpsTimesRef = useRef([])

  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const [hands, setHands] = useState([])

  const [metrics, setMetrics] = useState({
    fps: 0,
    inference: 0,
    confidence: 0,
  })

  const [settings, setSettings] = useState({
    landmarks: true,
    skeleton: true,
    boxes: true,
    labels: true,
  })

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [canvasRef])

  const draw = useCallback(
    (results) => {
      const canvas = canvasRef.current
      const video = videoRef.current

      if (!canvas || !video) return

      const ctx = canvas.getContext('2d')

      const w = video.videoWidth || 1280
      const h = video.videoHeight || 720

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      ctx.clearRect(0, 0, w, h)

      const connections = HandLandmarker.HAND_CONNECTIONS

      const colors = ['#f5f5f7', '#a8b3ff']

      results.landmarks.forEach((lm, i) => {
        const bounds = landmarkBounds(lm)
        const gesture = recognizeGesture(lm)

        const hand =
          results.handedness?.[i]?.[0]?.categoryName ||
          `Hand ${i + 1}`

        const stroke = colors[i % colors.length]

        const px = (x) => x * w
        const py = (y) => y * h

        /*
         * ---------------------------------------------------------
         * BOUNDING BOX
         * ---------------------------------------------------------
         */

        if (settings.boxes) {
          ctx.strokeStyle = stroke
          ctx.lineWidth = 1.5

          ctx.strokeRect(
            px(bounds.x),
            py(bounds.y),
            px(bounds.width),
            py(bounds.height)
          )
        }

        /*
         * ---------------------------------------------------------
         * HAND SKELETON
         * ---------------------------------------------------------
         */

        if (settings.skeleton) {
          ctx.strokeStyle = stroke
          ctx.lineWidth = 2

          connections.forEach(({ start, end }) => {
            const p = lm[start]
            const q = lm[end]

            if (!p || !q) return

            ctx.beginPath()
            ctx.moveTo(px(p.x), py(p.y))
            ctx.lineTo(px(q.x), py(q.y))
            ctx.stroke()
          })
        }

        /*
         * ---------------------------------------------------------
         * LANDMARKS
         * ---------------------------------------------------------
         */

        if (settings.landmarks) {
          ctx.fillStyle = stroke

          lm.forEach((p) => {
            ctx.beginPath()
            ctx.arc(
              px(p.x),
              py(p.y),
              3.2,
              0,
              Math.PI * 2
            )
            ctx.fill()
          })
        }

        /*
         * ---------------------------------------------------------
         * LABEL
         *
         * The entire canvas is mirrored with CSS so that the
         * camera behaves like a normal selfie camera.
         *
         * Therefore the label itself is counter-mirrored here
         * so that the text remains readable.
         * ---------------------------------------------------------
         */

        if (settings.labels) {
          const label = `${hand}  ·  ${gesture.name}`

          ctx.font =
            '600 14px Inter, system-ui, sans-serif'

          const labelWidth =
            ctx.measureText(label).width + 20

          const originalX = px(bounds.x)

          /*
           * Position the label at the mirrored bounding-box
           * location.
           */
          const labelX = Math.max(
            12,
            Math.min(
              w - labelWidth - 12,
              w - originalX - labelWidth
            )
          )

          const labelY = Math.max(
            30,
            py(bounds.y) - 10
          )

          ctx.save()

          /*
           * Counter-mirror only the label.
           */
          ctx.translate(w, 0)
          ctx.scale(-1, 1)

          ctx.fillStyle = 'rgba(8, 9, 10, .88)'

          ctx.beginPath()
          ctx.roundRect(
            labelX,
            labelY - 22,
            labelWidth,
            30,
            9
          )
          ctx.fill()

          ctx.fillStyle = '#f5f5f7'

          ctx.fillText(
            label,
            labelX + 10,
            labelY - 2
          )

          ctx.restore()
        }
      })
    },
    [canvasRef, videoRef, settings]
  )

  const loop = useCallback(
    (timestamp) => {
      const video = videoRef.current
      const detector = landmarkerRef.current

      if (
        !video ||
        !detector ||
        video.readyState < 2
      ) {
        rafRef.current =
          requestAnimationFrame(loop)

        return
      }

      /*
       * Limit processing to approximately 40 FPS.
       * This prevents unnecessary CPU/GPU usage.
       */
      if (
        timestamp - lastTimeRef.current <
        25
      ) {
        rafRef.current =
          requestAnimationFrame(loop)

        return
      }

      lastTimeRef.current = timestamp

      const start = performance.now()

      const results =
        detector.detectForVideo(
          video,
          timestamp
        )

      const inference =
        performance.now() - start

      draw(results)

      /*
       * ---------------------------------------------------------
       * DETECTED HAND DATA
       * ---------------------------------------------------------
       */

      const detected =
        results.landmarks.map((lm, i) => {
          const gesture =
            recognizeGesture(lm)

          return {
            id: i + 1,

            hand:
              results.handedness?.[i]?.[0]
                ?.displayName ||
              results.handedness?.[i]?.[0]
                ?.categoryName ||
              `Hand ${i + 1}`,

            gesture: gesture.name,

            confidence:
              gesture.confidence,
          }
        })

      setHands(detected)

      /*
       * ---------------------------------------------------------
       * FPS
       * ---------------------------------------------------------
       */

      fpsTimesRef.current.push(timestamp)

      fpsTimesRef.current =
        fpsTimesRef.current.filter(
          (t) => timestamp - t < 1000
        )

      const fps =
        fpsTimesRef.current.length

      /*
       * ---------------------------------------------------------
       * CONFIDENCE
       * ---------------------------------------------------------
       */

      const confidence =
        detected.length
          ? detected.reduce(
              (sum, hand) =>
                sum + hand.confidence,
              0
            ) / detected.length
          : 0

      setMetrics({
        fps,
        inference: Math.round(inference),
        confidence,
      })

      rafRef.current =
        requestAnimationFrame(loop)
    },
    [draw, videoRef]
  )

  const start = useCallback(async () => {
    try {
      setError('')
      setState('loading')

      /*
       * Initialize MediaPipe and camera in parallel.
       */
      const [vision, stream] =
        await Promise.all([
          FilesetResolver.forVisionTasks(WASM),

          navigator.mediaDevices.getUserMedia({
            video: {
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
              facingMode: 'user',
            },
            audio: false,
          }),
        ])

      const options = {
        runningMode: 'VIDEO',

        numHands: 2,

        minHandDetectionConfidence: 0.55,

        minHandPresenceConfidence: 0.55,

        minTrackingConfidence: 0.55,
      }

      let detector

      /*
       * Try GPU first.
       */
      try {
        detector =
          await HandLandmarker.createFromOptions(
            vision,
            {
              ...options,

              baseOptions: {
                modelAssetPath:
                  MODEL_ASSET_PATH,

                delegate: 'GPU',
              },
            }
          )
      } catch (gpuError) {
        /*
         * Fall back to CPU if GPU initialization
         * fails.
         */
        console.warn(
          'GPU delegate unavailable; falling back to CPU.',
          gpuError
        )

        detector =
          await HandLandmarker.createFromOptions(
            vision,
            {
              ...options,

              baseOptions: {
                modelAssetPath:
                  MODEL_ASSET_PATH,

                delegate: 'CPU',
              },
            }
          )
      }

      landmarkerRef.current =
        detector

      streamRef.current =
        stream

      const video =
        videoRef.current

      if (!video) {
        throw new Error(
          'Video element unavailable.'
        )
      }

      video.srcObject = stream

      await video.play()

      setState('running')

      rafRef.current =
        requestAnimationFrame(loop)
    } catch (e) {
      console.error(e)

      streamRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        )

      setError(
        e?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access and try again.'
          : 'Could not initialize the camera or hand model.'
      )

      setState('error')
    }
  }, [loop, videoRef])

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(
        rafRef.current
      )
    }

    rafRef.current = null

    streamRef.current
      ?.getTracks()
      .forEach((track) =>
        track.stop()
      )

    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject =
        null
    }

    landmarkerRef.current?.close()

    landmarkerRef.current = null

    setHands([])

    setMetrics({
      fps: 0,
      inference: 0,
      confidence: 0,
    })

    clearCanvas()

    setState('idle')
  }, [clearCanvas, videoRef])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return {
    state,
    error,
    hands,
    metrics,
    settings,
    setSettings,
    start,
    stop,
  }
}