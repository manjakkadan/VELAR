````markdown
# VELAR — Real-Time Hand Intelligence

VELAR is a real-time computer vision application for hand detection, tracking, and gesture recognition using a webcam.

The application uses **MediaPipe Hand Landmarker** for real-time hand tracking directly in the browser. A lightweight **FastAPI backend** is included for session management and detection-event telemetry.

---

## Features

- Real-time hand detection
- Multi-hand tracking
- 21-point hand landmark detection
- Hand skeleton visualization
- Bounding-box visualization
- Gesture recognition
- Handedness detection
- Confidence display
- Real-time FPS monitoring
- Inference-time monitoring
- Start/stop camera controls
- Browser-based video recording
- Configurable visualization controls
- Responsive dark-themed interface
- Lightweight FastAPI backend
- Session creation API
- Detection-event telemetry API
- Backend health-check endpoint

---

# Technology Stack

## Frontend

- React
- JavaScript
- Vite
- Tailwind CSS
- MediaPipe Tasks Vision
- MediaPipe Hand Landmarker
- Lucide React
- Browser MediaRecorder API

## Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

## Computer Vision

- MediaPipe Hand Landmarker
- Real-time hand landmark detection
- Hand tracking
- Handedness classification
- Custom landmark-based gesture recognition

---

# Project Structure

```text
VELAR/
│
├── backend/
│   ├── app/
│   │   ├── __pycache__/
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useHandTracking.js
│   │   ├── lib/
│   │   │   └── gestureRecognition.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── readme.md
````

---

# Requirements

Before running VELAR, make sure the following are installed:

* Node.js 18 or newer
* npm
* Python 3.x
* pip
* Git
* A modern web browser
* A working webcam

Recommended browsers:

* Google Chrome
* Microsoft Edge

You can verify Node.js and npm with:

```bash
node --version
npm --version
```

Verify Python with:

```bash
python --version
```

Verify pip with:

```bash
pip --version
```

---

# Installation

## 1. Clone the Repository

Clone the GitHub repository:

```bash
git clone https://github.com/manjakkadan/VELAR.git
```

Move into the project directory:

```bash
cd VELAR
```

---

# Frontend Setup

The frontend contains the main VELAR user interface and real-time MediaPipe hand tracking.

## 1. Open the Frontend Directory

From the project root:

```bash
cd frontend
```

## 2. Install Dependencies

Run:

```bash
npm install
```

The project uses:

```text
@mediapipe/tasks-vision@0.10.21
```

If npm reports a MediaPipe package-version error, install the compatible version explicitly:

```bash
npm install @mediapipe/tasks-vision@0.10.21
```

## 3. Start the Frontend

Run:

```bash
npm run dev
```

Vite will start the development server.

The terminal will display a URL similar to:

```text
http://localhost:5173/
```

Open the displayed URL in Chrome or Microsoft Edge.

---

# Backend Setup

VELAR includes a lightweight **FastAPI** backend.

The backend provides:

* API health checking
* Session creation
* Detection-event telemetry

The real-time MediaPipe inference runs directly in the browser and does not depend on the backend for the video-processing loop.

## 1. Open the Backend Directory

From the project root:

```bash
cd backend
```

## 2. Create a Python Virtual Environment

On Windows:

```powershell
python -m venv .venv
```

Activate the environment:

```powershell
.venv\Scripts\activate
```

After activation, the terminal should show something similar to:

```text
(.venv) PS C:\Users\<username>\Desktop\VELAR\backend>
```

## 3. Install Backend Dependencies

Run:

```powershell
pip install -r requirements.txt
```

## 4. Start the FastAPI Server

From the `backend` directory:

```powershell
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

---

# Running Frontend and Backend Together

For full development, run the frontend and backend in **two separate terminals**.

## Terminal 1 — Backend

From the project root:

```powershell
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

## Terminal 2 — Frontend

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

---

# Camera Setup

When VELAR is opened for the first time, the browser may ask for camera permission.

Select:

```text
Allow
```

Then click:

```text
Start Camera
```

The webcam stream will appear in the application.

If camera permission was previously denied:

1. Open the browser's site settings.
2. Find the Camera permission.
3. Change it to **Allow**.
4. Refresh the VELAR page.
5. Click **Start Camera** again.

---

# Using VELAR

## Start Camera

Starts the webcam and MediaPipe hand-tracking pipeline.

## Stop Camera

Stops the webcam stream and MediaPipe processing.

## Hand Detection

When a hand is visible in the camera frame, VELAR detects and tracks it in real time.

The interface displays:

* Number of detected hands
* Handedness
* Gesture
* Confidence
* FPS
* Inference time

## Landmarks

Shows or hides the detected hand landmarks.

MediaPipe provides 21 landmarks for each detected hand.

## Skeleton

Shows or hides the connections between the hand landmarks.

## Bounding Box

Shows or hides the bounding box around the detected hand.

## Labels

Shows or hides information displayed over the detected hand.

## Record

Starts browser-based video recording using the browser's `MediaRecorder` API.

## Stop Recording

Stops the recording and generates the captured video as a local WebM file.

---

# Gesture Recognition

VELAR uses the detected MediaPipe hand landmarks as the input for gesture recognition.

The application analyzes the spatial relationships between hand landmarks to identify predefined gestures.

The detected gesture is displayed in the interface together with the corresponding hand information.

---

# Performance Monitoring

VELAR displays real-time performance information including:

### FPS

The approximate number of processed frames per second.

### Inference

The time taken by the MediaPipe inference operation for a processed frame.

### Confidence

The confidence value associated with the detected hand classification.

These metrics provide feedback about the real-time performance of the application.

---

# How the System Works

The processing pipeline is approximately:

```text
Webcam
   │
   ▼
Browser Video Stream
   │
   ▼
MediaPipe Hand Landmarker
   │
   ▼
21 Hand Landmarks
   │
   ├── Handedness
   │
   ├── Gesture Recognition
   │
   ├── Bounding Box
   │
   ├── Skeleton
   │
   └── Confidence
   │
   ▼
VELAR User Interface
```

The backend operates separately for lightweight API functionality:

```text
VELAR Frontend
      │
      ├── Session API
      │
      └── Detection Telemetry
             │
             ▼
       FastAPI Backend
```

The real-time camera and MediaPipe inference pipeline is designed to continue working without making video inference dependent on the backend.

---

# Backend API

The FastAPI backend exposes the following endpoints.

## Health Check

```http
GET /api/health
```

Example response:

```json
{
  "status": "ok",
  "service": "hand-api",
  "time": "2026-..."
}
```

This endpoint can be used to verify that the backend is running.

---

## Create Session

```http
POST /api/sessions
```

Creates a unique session ID for a web client.

Example response:

```json
{
  "session_id": "generated-uuid",
  "created_at": "2026-..."
}
```

---

## Record Detection Event

```http
POST /api/events
```

Accepts detection telemetry containing:

* Session ID
* Hand
* Gesture
* Confidence
* Timestamp

Example structure:

```json
{
  "session_id": "example-session",
  "hand": "Right",
  "gesture": "Open Palm",
  "confidence": 0.92,
  "timestamp": 1234567890
}
```

The endpoint accepts the event without making real-time video inference dependent on the backend.

---

# API Documentation

FastAPI automatically provides interactive API documentation.

After starting the backend, open:

```text
http://127.0.0.1:8000/docs
```

This provides an interactive interface for testing the available API endpoints.

---

# Troubleshooting

## `npm` is not recognized

Install Node.js and restart the terminal.

Verify:

```bash
node --version
npm --version
```

---

## `python` is not recognized

Install Python 3.x and make sure Python is added to PATH.

Verify:

```bash
python --version
```

---

## MediaPipe Package Installation Error

If npm reports that a MediaPipe version cannot be found, run:

```bash
npm install @mediapipe/tasks-vision@0.10.21
```

---

## Camera Is Not Showing

Check that:

* A webcam is connected.
* Browser camera permission is enabled.
* Another application is not currently using the webcam.
* Chrome or Edge has permission to access the camera.
* The VELAR page has been refreshed after changing permissions.

---

## Hand Is Not Detected

Try the following:

* Move the hand closer to the camera.
* Make sure the hand is fully visible.
* Improve the lighting.
* Keep the hand inside the camera frame.
* Make sure the camera is running.
* Refresh the page and start the camera again.

---

## Backend Does Not Start

Make sure the virtual environment is activated:

```powershell
.venv\Scripts\activate
```

Then install the dependencies again:

```powershell
pip install -r requirements.txt
```

Start the server:

```powershell
uvicorn app.main:app --reload
```

---

## Port Already in Use

If port `8000` is already being used, run FastAPI on another port:

```powershell
uvicorn app.main:app --reload --port 8001
```

For the frontend, Vite can similarly use another available port.

---

## AI Tools Used

### 1. Claude

Used for logic and problem-solving — working through the hand-tracking approach
and gesture-recognition logic, structuring the detection pipeline, debugging
issues, and drafting documentation.

### 2. ChatGPT

Used for code generation and implementation — writing and refining React
components, MediaPipe integration code, error handling, and UI/responsive
styling.

### Validating AI Output

One example: the initial AI-generated camera/canvas rendering caused a mirrored
mismatch between the displayed video feed and the drawn landmarks. I diagnosed
the root cause — the coordinate flip wasn't applied consistently — and worked
with Claude to implement the fix.

### AI-Assisted Development

Both tools were used as assistants during implementation. Suggestions were
tested and modified before being integrated into the final application.

---

# Challenges Faced

## 1. MediaPipe Package Compatibility

The initial MediaPipe package version used by the project caused an npm package-resolution error because the requested version was unavailable.

The compatible version used in the final implementation is:

```text
@mediapipe/tasks-vision@0.10.21
```

This version is explicitly used by the application.

---

## 2. Camera Initialization

The application needed to correctly request browser camera access and connect the webcam stream to the video element.

Camera permission handling and initialization errors were handled in the frontend.

---

## 3. Hand Landmark Processing

MediaPipe returns structured landmark and handedness data for each detected hand.

The application processes these results to:

* Identify individual hands
* Determine handedness
* Calculate boundaries
* Recognize gestures
* Draw landmarks
* Draw skeleton connections
* Display detection information

---

## 4. Mirrored Camera Display

Front-facing webcams commonly display a mirrored image.

The video and canvas rendering were adjusted so that the visualization remains aligned with the displayed camera feed.

---

## 5. GPU Compatibility

The application attempts to initialize MediaPipe using GPU acceleration.

If GPU initialization is unavailable, the application falls back to CPU processing.

This provides a more robust experience across different systems.

---

## 6. Real-Time Performance

Real-time hand tracking requires processing camera frames continuously.

The application uses `requestAnimationFrame` and controls the processing frequency to maintain responsive performance while monitoring FPS and inference time.

---

# Privacy

Camera processing for hand detection is performed locally in the browser.

The webcam stream does not need to be uploaded to an external service for MediaPipe hand detection.

Recordings are generated locally using the browser's `MediaRecorder` API.

---
## Demo Video

A short demonstration of VELAR showing real-time hand detection,
gesture recognition, visualization controls, performance metrics,
and recording.

The Demo Video Link: (https://drive.google.com/file/d/1AHYcHB7hBYXYJ_D0wDR4SaRY22AOKlWr/view?usp=sharing)

---

# Author

## Sayanth Paul Tom

GitHub:

[https://github.com/manjakkadan](https://github.com/manjakkadan)

LinkedIn:

[https://www.linkedin.com/in/sayanthpaultom/](https://www.linkedin.com/in/sayanthpaultom/)

Instagram:

[https://www.instagram.com/sayanthpaultom/](https://www.instagram.com/sayanthpaultom/)

---
