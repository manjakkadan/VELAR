import { Circle } from 'lucide-react'

export default function TopBar({ state }) {
  const live = state === 'running'
  const label = state === 'loading' ? 'Initializing' : live ? 'Live' : state === 'error' ? 'Attention' : 'Ready'
  return (
    <header className="topbar">
      <div className="brand"><span>Hand</span><small>REAL-TIME VISION</small></div>
      <div className={`status ${live ? 'live' : ''}`}><Circle size={8} fill="currentColor" />{label}</div>
    </header>
  )
}
