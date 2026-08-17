import { Camera, RotateCcw, Scan } from 'lucide-react'

export default function CameraStage({ videoRef, canvasRef, state, error, onStart, onStop, onRetry, hands }) {
  const running = state === 'running'
  return (
    <section className="stage-shell">
      <div className="camera-stage">
        <video ref={videoRef} muted playsInline className={running ? 'visible' : ''} />
        <canvas ref={canvasRef} />
        {!running && <div className="empty-state">
          <div className="empty-icon"><Scan size={25} strokeWidth={1.5} /></div>
          <h2>{state === 'loading' ? 'Preparing vision' : state === 'error' ? 'Camera unavailable' : 'Ready when you are'}</h2>
          <p>{state === 'loading' ? 'Starting the camera and hand landmark model.' : state === 'error' ? error : 'Start the camera to begin real-time hand analysis.'}</p>
          {state === 'error' ? <button className="primary" onClick={onRetry}><RotateCcw size={16}/> Try again</button> : state !== 'loading' && <button className="primary" onClick={onStart}><Camera size={16}/> Start Camera</button>}
        </div>}
        {running && <div className="stage-chip">{hands.length ? `${hands.length} ${hands.length === 1 ? 'hand' : 'hands'} tracked` : 'No hands detected'}</div>}
      </div>
      <div className="stage-actions">
        <button className={running ? 'secondary' : 'primary'} onClick={running ? onStop : onStart} disabled={state === 'loading'}>{running ? 'Stop Camera' : 'Start Camera'}</button>
        <span className="privacy-note">Video stays on this device during detection.</span>
      </div>
    </section>
  )
}
