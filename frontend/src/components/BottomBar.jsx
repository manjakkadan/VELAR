export default function BottomBar({ metrics, hands }) {
  return <div className="bottom-bar">
    <div><span>HANDS</span><strong>{hands.length}</strong></div>
    <div><span>FPS</span><strong>{metrics.fps || '—'}</strong></div>
    <div><span>LATENCY</span><strong>{metrics.inference ? `${metrics.inference} ms` : '—'}</strong></div>
    <div><span>CONFIDENCE</span><strong>{metrics.confidence ? `${(metrics.confidence * 100).toFixed(1)}%` : '—'}</strong></div>
  </div>
}
