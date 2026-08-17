````markdown
# VELAR — Real-Time Hand Intelligence

VELAR is a real-time computer vision application for hand detection, tracking, and gesture recognition using a webcam.

The application uses MediaPipe Hand Landmarker to perform real-time hand tracking directly in the browser.

## Features

- Real-time hand detection
- Multi-hand tracking
- 21-point hand landmark detection
- Hand skeleton visualization
- Bounding-box visualization
- Gesture recognition
- Handedness detection
- Detection confidence
- Real-time FPS monitoring
- Inference-time monitoring
- Start/stop camera controls
- Browser-based video recording
- Configurable visualization controls
- Responsive dark interface

## Tech Stack

### Computer Vision

- MediaPipe Tasks Vision
- MediaPipe Hand Landmarker

### Frontend

- React
- JavaScript
- Vite
- Tailwind CSS
- Lucide React

### Backend

- Python
- Flask/FastAPI

## Requirements

Before running the application, install:

- Node.js
- npm
- Python 3.x
- A modern web browser
- Webcam/camera access

Recommended browsers:

- Google Chrome
- Microsoft Edge

## Project Structure

```text
dheera/
│
├── backend/
│
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   └── package-lock.json
│
└── README.md
````

## Frontend Setup

Open a terminal in the project directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

The project uses:

```text
@mediapipe/tasks-vision@0.10.21
```

If required:

```bash
npm install @mediapipe/tasks-vision@0.10.21
```

## Run the Application

From the `frontend` directory:

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173
```

Allow camera access when prompted.

Click **Start Camera** to begin hand detection.

## How It Works

The webcam provides a live video stream to the browser.

MediaPipe Hand Landmarker processes the video frames and detects hand landmarks.

The detected landmarks are used to:

1. Track the hand
2. Determine handedness
3. Calculate hand boundaries
4. Recognize predefined gestures
5. Draw landmarks
6. Draw the hand skeleton
7. Display bounding boxes
8. Display gesture labels
9. Calculate confidence
10. Monitor real-time performance

## Gesture Recognition

Gesture recognition is implemented using the detected hand landmarks.

The landmark relationships are analyzed to identify predefined hand gestures.

The detected gesture is displayed in the interface together with the hand tracking information.

## Recording

VELAR uses the browser's MediaRecorder API for video recording.

When recording is stopped, the captured video is generated as a WebM file and downloaded locally.

## AI Tools Used

### MediaPipe Hand Landmarker

MediaPipe Hand Landmarker is the primary computer-vision/AI component.

It provides:

* Hand detection
* Hand landmarks
* Hand tracking
* Handedness classification
* Real-time inference

### AI-Assisted Development

AI tools were used during development to assist with:

* React application structure
* UI development
* MediaPipe integration
* Debugging JavaScript errors
* Hand-tracking logic
* Responsive styling
* Recording functionality
* Error handling
* Documentation

The generated code was tested and modified during implementation.

## Challenges Faced

### MediaPipe Package Compatibility

The initial MediaPipe package version caused an npm package-resolution error.

The compatible version used during development was:

```text
@mediapipe/tasks-vision@0.10.21
```

### Camera Initialization

The application required handling browser camera permissions and correctly connecting the webcam stream to the video element.

### Hand Landmark Processing

MediaPipe result structures required careful handling when processing multiple detected hands and their landmarks.

### Mirrored Camera Display

Front-facing cameras commonly display a mirrored image.

The video and canvas visualization were adjusted so that the hand visualization remains aligned with the displayed camera feed.

### GPU Compatibility

The application attempts to use GPU acceleration for MediaPipe inference and falls back to CPU processing when GPU initialization is unavailable.

## Privacy

Camera processing is performed locally in the browser.

The webcam stream does not need to be uploaded to an external service for hand detection.

Recordings are also generated locally using the browser's MediaRecorder API.

## Author

### Sayanth Paul Tom

GitHub: [https://github.com/manjakkadan](https://github.com/manjakkadan)

LinkedIn: [https://www.linkedin.com/in/sayanthpaultom/](https://www.linkedin.com/in/sayanthpaultom/)

Instagram: [https://www.instagram.com/sayanthpaultom/](https://www.instagram.com/sayanthpaultom/)

## Submission

This project was developed as part of the Dheera technical assignment.

```
