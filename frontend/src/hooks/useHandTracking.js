import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FilesetResolver,
  HandLandmarker,
} from '@mediapipe/tasks-vision'

import {
  recognizeGesture,
  landmarkBounds,
} from '../lib/gestureRecognition'

const WASM =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'

const MODEL_ASSET_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

/**
 * Core hand-tracking hook. Owns the entire MediaPipe lifecycle:
 * starting/stopping the webcam, running the detection loop, drawing
 * results onto the canvas, and exposing live state (hands, FPS,
 * inference time, confidence) back to the UI.
 *
 * @param videoRef  ref to the <video> element showing the webcam feed
 * @param canvasRef ref to the <canvas> element used for overlay drawing
 */
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


  /* =========================================================
     CLEAR CANVAS
     ========================================================= */

  const clearCanvas = useCallback(() => {

    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    )

  }, [canvasRef])


  /* =========================================================
     DRAW HAND RESULTS

     Renders bounding boxes, skeleton lines, landmark dots, and
     labels for every detected hand onto the canvas, based on
     the current toggle settings (settings.boxes/skeleton/etc).

     Runs once per detection frame. Resizes the canvas to match
     the video's native resolution before drawing, so overlays
     stay pixel-aligned regardless of display size.
     ========================================================= */

  const draw = useCallback(
    (results) => {

      const canvas = canvasRef.current
      const video = videoRef.current

      if (!canvas || !video) return

      const ctx = canvas.getContext('2d')

      if (!ctx) return


      const width =
        video.videoWidth || 1280

      const height =
        video.videoHeight || 720


      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {

        canvas.width = width
        canvas.height = height

      }


      ctx.clearRect(
        0,
        0,
        width,
        height
      )


      if (!results?.landmarks) {
        return
      }


      const connections =
        HandLandmarker.HAND_CONNECTIONS


      const colors = [
        '#f5f5f7',
        '#a8b3ff',
      ]


      results.landmarks.forEach(
        (landmarks, index) => {

          const bounds =
            landmarkBounds(landmarks)

          const gesture =
            recognizeGesture(landmarks)


          const handedness =
            results.handedness?.[index]?.[0]


          const handName =
            handedness?.displayName ||
            handedness?.categoryName ||
            `Hand ${index + 1}`


          /*
           * MediaPipe handedness confidence.
           * Value is between 0 and 1.
           */

          const confidence =
            typeof handedness?.score === 'number'
              ? handedness.score
              : 0


          const stroke =
            colors[index % colors.length]


          const px =
            (x) => x * width

          const py =
            (y) => y * height


          /* =================================================
             BOUNDING BOX
             ================================================= */

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


          /* =================================================
             SKELETON
             ================================================= */

          if (settings.skeleton) {

            ctx.strokeStyle = stroke
            ctx.lineWidth = 2

            connections.forEach(
              ({ start, end }) => {

                const pointA =
                  landmarks[start]

                const pointB =
                  landmarks[end]


                if (
                  !pointA ||
                  !pointB
                ) {
                  return
                }


                ctx.beginPath()

                ctx.moveTo(
                  px(pointA.x),
                  py(pointA.y)
                )

                ctx.lineTo(
                  px(pointB.x),
                  py(pointB.y)
                )

                ctx.stroke()

              }
            )

          }


          /* =================================================
             LANDMARKS
             ================================================= */

          if (settings.landmarks) {

            ctx.fillStyle = stroke

            landmarks.forEach(
              (point) => {

                ctx.beginPath()

                ctx.arc(
                  px(point.x),
                  py(point.y),
                  3.2,
                  0,
                  Math.PI * 2
                )

                ctx.fill()

              }
            )

          }


          /* =================================================
             LABEL

             IMPORTANT — mirrored camera fix:
             The <video>/<canvas> pair is flipped horizontally via
             CSS (scaleX(-1)) so the feed behaves like a mirror,
             which feels natural to the user. That same CSS flip
             would also flip any TEXT drawn on the canvas, making
             labels render backwards.

             Fix: apply an equal-and-opposite flip (ctx.scale(-1,1))
             just for the label block, cancelling out the CSS mirror
             so the text reads normally. Boxes/skeleton/dots are left
             mirrored on purpose — only the label needs this correction.
             ================================================= */

          if (settings.labels) {

            const confidenceText =
              `${Math.round(
                confidence * 100
              )}%`


            const label =
              `${handName}  ·  ${gesture.name}  ·  ${confidenceText}`


            ctx.font =
              '600 14px Inter, system-ui, sans-serif'


            const labelWidth =
              ctx.measureText(label).width + 20


            const labelHeight =
              30


            const labelX =
              Math.max(
                12,
                Math.min(
                  width - labelWidth - 12,
                  px(bounds.x)
                )
              )


            const labelY =
              Math.max(
                30,
                py(bounds.y) - 10
              )


            /*
             * Because the entire canvas is flipped
             * with CSS, flip ONLY the label back.
             */

            ctx.save()


            ctx.translate(
              width,
              0
            )

            ctx.scale(
              -1,
              1
            )


            /*
             * Convert the original label position
             * into the counter-mirrored coordinate system.
             */

            const mirroredX =
              width -
              labelX -
              labelWidth


            /* =============================================
               LABEL BACKGROUND
               ============================================= */

            ctx.fillStyle =
              'rgba(8, 9, 10, .88)'


            if (
              typeof ctx.roundRect ===
              'function'
            ) {

              ctx.beginPath()

              ctx.roundRect(
                mirroredX,
                labelY - 22,
                labelWidth,
                labelHeight,
                9
              )

              ctx.fill()

            } else {

              ctx.fillRect(
                mirroredX,
                labelY - 22,
                labelWidth,
                labelHeight
              )

            }


            /* =============================================
               LABEL TEXT
               ============================================= */

            ctx.fillStyle =
              '#f5f5f7'


            ctx.fillText(
              label,
              mirroredX + 10,
              labelY - 2
            )


            ctx.restore()

          }

        }
      )

    },

    [
      canvasRef,
      videoRef,
      settings,
    ]
  )


  /* =========================================================
     DETECTION LOOP

     Runs continuously via requestAnimationFrame while the camera
     is active. Each pass: throttles to ~40fps, runs MediaPipe
     inference on the current video frame, draws the results,
     converts raw landmarks into simplified hand summaries for
     the UI, and updates FPS/inference/confidence metrics.
     ========================================================= */

  const loop = useCallback(
    (timestamp) => {

      const video =
        videoRef.current

      const detector =
        landmarkerRef.current


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
       */

      if (
        timestamp -
          lastTimeRef.current <
        25
      ) {

        rafRef.current =
          requestAnimationFrame(loop)

        return

      }


      lastTimeRef.current =
        timestamp


      /* =====================================================
         INFERENCE TIME
         ===================================================== */

      const inferenceStart =
        performance.now()


      let results


      try {

        results =
          detector.detectForVideo(
            video,
            timestamp
          )

      } catch (detectionError) {

        console.error(
          'MediaPipe detection error:',
          detectionError
        )

        rafRef.current =
          requestAnimationFrame(loop)

        return

      }


      const inferenceTime =
        performance.now() -
        inferenceStart


      /* =====================================================
         DRAW
         ===================================================== */

      draw(results)


      /* =====================================================
         PROCESS HANDS
         ===================================================== */

      const detected =
        (results.landmarks || []).map(
          (landmarks, index) => {

            const gesture =
              recognizeGesture(
                landmarks
              )


            const handedness =
              results.handedness?.[index]?.[0]


            const handName =
              handedness?.displayName ||
              handedness?.categoryName ||
              `Hand ${index + 1}`


            const confidence =
              typeof handedness?.score === 'number'
                ? handedness.score
                : 0


            return {

              id:
                index + 1,

              hand:
                handName,

              gesture:
                gesture.name,

              confidence:
                confidence,

            }

          }
        )


      setHands(
        detected
      )


      /* =====================================================
         FPS
         ===================================================== */

      fpsTimesRef.current.push(
        timestamp
      )


      fpsTimesRef.current =
        fpsTimesRef.current.filter(
          (time) =>
            timestamp - time < 1000
        )


      const fps =
        fpsTimesRef.current.length


      /* =====================================================
         AVERAGE CONFIDENCE
         ===================================================== */

      const averageConfidence =
        detected.length > 0

          ? detected.reduce(
              (total, hand) =>
                total +
                hand.confidence,
              0
            ) / detected.length

          : 0


      /* =====================================================
         METRICS
         ===================================================== */

      setMetrics({

        fps:

          fps,

        inference:

          Math.round(
            inferenceTime
          ),

        confidence:

          averageConfidence * 100,

      })


      rafRef.current =
        requestAnimationFrame(loop)

    },

    [
      draw,
      videoRef,
    ]
  )


  /* =========================================================
     START CAMERA

     Requests webcam access and loads the MediaPipe model in
     parallel, then attempts GPU-accelerated inference first.
     If GPU delegation fails (unsupported hardware/browser), it
     transparently falls back to CPU so the app still works —
     see the try/catch around HandLandmarker.createFromOptions.

     On any failure, maps the browser's raw error name (e.g.
     NotAllowedError) to a human-readable message for the UI.
     ========================================================= */

  const start = useCallback(
    async () => {

      try {

        setError('')
        setState('loading')


        /* ===================================================
           LOAD MEDIAPIPE + CAMERA
           =================================================== */

        const [
          vision,
          stream,
        ] = await Promise.all([

          FilesetResolver.forVisionTasks(
            WASM
          ),

          navigator.mediaDevices.getUserMedia(
            {
              video: {

                width: {
                  ideal: 1280,
                },

                height: {
                  ideal: 720,
                },

                facingMode:
                  'user',

              },

              audio: false,

            }
          ),

        ])


        /* ===================================================
           MEDIAPIPE OPTIONS
           =================================================== */

        const options = {

          runningMode:
            'VIDEO',

          numHands:
            2,

          minHandDetectionConfidence:
            0.55,

          minHandPresenceConfidence:
            0.55,

          minTrackingConfidence:
            0.55,

        }


        let detector


        /* ===================================================
           GPU
           =================================================== */

        try {

          detector =
            await HandLandmarker.createFromOptions(
              vision,
              {

                ...options,

                baseOptions: {

                  modelAssetPath:
                    MODEL_ASSET_PATH,

                  delegate:
                    'GPU',

                },

              }
            )

        } catch (gpuError) {

          console.warn(
            'GPU delegate unavailable. Falling back to CPU.',
            gpuError
          )


          /* ================================================
             CPU FALLBACK
             ================================================ */

          detector =
            await HandLandmarker.createFromOptions(
              vision,
              {

                ...options,

                baseOptions: {

                  modelAssetPath:
                    MODEL_ASSET_PATH,

                  delegate:
                    'CPU',

                },

              }
            )

        }


        landmarkerRef.current =
          detector

        streamRef.current =
          stream


        /* ===================================================
           CONNECT CAMERA
           =================================================== */

        const video =
          videoRef.current


        if (!video) {

          throw new Error(
            'Video element is unavailable.'
          )

        }


        video.srcObject =
          stream


        await video.play()


        /* ===================================================
           RESET
           =================================================== */

        lastTimeRef.current =
          0

        fpsTimesRef.current =
          []

        setHands([])

        setMetrics({

          fps:
            0,

          inference:
            0,

          confidence:
            0,

        })


        /* ===================================================
           START LOOP
           =================================================== */

        setState(
          'running'
        )


        rafRef.current =
          requestAnimationFrame(loop)

      } catch (cameraError) {

        console.error(
          'Camera / MediaPipe initialization error:',
          cameraError
        )


        streamRef.current
          ?.getTracks()
          .forEach(
            (track) =>
              track.stop()
          )


        streamRef.current =
          null


        let message =
          'Could not initialize the camera or hand model.'


        if (
          cameraError?.name ===
          'NotAllowedError'
        ) {

          message =
            'Camera permission was denied. Allow camera access and try again.'

        } else if (
          cameraError?.name ===
          'NotFoundError'
        ) {

          message =
            'No camera was found. Connect a webcam and try again.'

        } else if (
          cameraError?.name ===
          'NotReadableError'
        ) {

          message =
            'The camera is already being used by another application.'

        }


        setError(
          message
        )

        setState(
          'error'
        )

      }

    },

    [
      loop,
      videoRef,
    ]
  )


  /* =========================================================
     STOP CAMERA

     Reverses everything start() set up: cancels the animation
     frame loop, stops all camera tracks, detaches the video
     stream, closes the MediaPipe detector, resets metrics/state,
     and clears the canvas. Called both by the user's Stop button
     and by the cleanup effect below on unmount.
     ========================================================= */

  const stop = useCallback(
    () => {

      if (rafRef.current) {

        cancelAnimationFrame(
          rafRef.current
        )

      }


      rafRef.current =
        null


      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        )


      streamRef.current =
        null


      if (videoRef.current) {

        videoRef.current.pause()

        videoRef.current.srcObject =
          null

      }


      if (
        landmarkerRef.current
      ) {

        try {

          landmarkerRef.current.close()

        } catch (closeError) {

          console.warn(
            'MediaPipe detector close error:',
            closeError
          )

        }

      }


      landmarkerRef.current =
        null


      setHands([])


      setMetrics({

        fps:
          0,

        inference:
          0,

        confidence:
          0,

      })


      fpsTimesRef.current =
        []

      lastTimeRef.current =
        0


      clearCanvas()


      setState(
        'idle'
      )

    },

    [
      clearCanvas,
      videoRef,
    ]
  )


  /* =========================================================
     CLEANUP
     ========================================================= */

  useEffect(() => {

    return () => {

      if (rafRef.current) {

        cancelAnimationFrame(
          rafRef.current
        )

      }


      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        )


      try {

        landmarkerRef.current?.close()

      } catch {

        // Detector already closed.

      }

    }

  }, [])


  /* =========================================================
     RETURN
     ========================================================= */

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