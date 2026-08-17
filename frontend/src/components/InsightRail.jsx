import { Activity, Hand, Gauge, Settings2 } from 'lucide-react'

export default function InsightRail({ hands, metrics, settings, setSettings }) {
  const toggle = key => setSettings(s => ({ ...s, [key]: !s[key] }))
  const main = hands[0]
  return <aside className="rail">
    <div className="rail-section">
      <div className="section-label">DETECTION</div>
      <div className="metric-row"><span><Hand size={15}/> Hands</span><strong>{hands.length}</strong></div>
      <div className="metric-row"><span>Gesture</span><strong>{main?.gesture || '—'}</strong></div>
      <div className="metric-row"><span>Confidence</span><strong>{main ? `${(main.confidence * 100).toFixed(1)}%` : '—'}</strong></div>
    </div>
    <div className="rail-section">
      <div className="section-label">PERFORMANCE</div>
      <div className="metric-row"><span><Gauge size={15}/> FPS</span><strong>{metrics.fps || '—'}</strong></div>
      <div className="metric-row"><span><Activity size={15}/> Inference</span><strong>{metrics.inference ? `${metrics.inference} ms` : '—'}</strong></div>
    </div>
    <div className="rail-section">
      <div className="section-label"><Settings2 size={14}/> VIEW</div>
      {[["landmarks","Landmarks"],["skeleton","Skeleton"],["boxes","Bounding boxes"],["labels","Labels"]].map(([key,label]) => <button className="toggle" key={key} onClick={() => toggle(key)}><span>{label}</span><span className={`switch ${settings[key] ? 'on' : ''}`}><span/></span></button>)}
    </div>
    <div className="rail-section hands-list">
      <div className="section-label">TRACKING</div>
      {hands.length ? hands.map(h => <div className="hand-card" key={h.id}><span className="hand-dot"/><div><strong>Hand #{h.id}</strong><small>{h.hand} · {h.gesture}</small></div><em>{(h.confidence * 100).toFixed(0)}%</em></div>) : <p className="muted">Hands will appear here once detected.</p>}
    </div>
  </aside>
}
