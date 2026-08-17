const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0))

function fingerExtended(lm, tip, pip, mcp, wrist) {
  const tipDist = dist(lm[tip], wrist)
  const pipDist = dist(lm[pip], wrist)
  const mcpDist = dist(lm[mcp], wrist)
  return tipDist > pipDist * 1.08 && pipDist > mcpDist * 0.92
}

function getFingerStates(lm) {
  const wrist = lm[0]
  return {
    index: fingerExtended(lm, 8, 6, 5, wrist),
    middle: fingerExtended(lm, 12, 10, 9, wrist),
    ring: fingerExtended(lm, 16, 14, 13, wrist),
    pinky: fingerExtended(lm, 20, 18, 17, wrist),
  }
}

export function recognizeGesture(lm) {
  if (!lm || lm.length < 21) return { name: 'Unknown', confidence: 0 }
  const f = getFingerStates(lm)
  const thumbUp = lm[4].y < lm[3].y && lm[4].y < lm[2].y
  const thumbDown = lm[4].y > lm[3].y && lm[4].y > lm[2].y
  const count = Object.values(f).filter(Boolean).length

  let name = 'Tracking'
  if (thumbUp && count === 0) name = 'Thumbs Up'
  else if (thumbDown && count === 0) name = 'Thumbs Down'
  else if (f.index && f.middle && !f.ring && !f.pinky) name = 'Peace'
  else if (f.index && !f.middle && !f.ring && !f.pinky) name = 'Point'
  else if (f.index && f.middle && f.ring && f.pinky && thumbUp) name = 'Open Palm'
  else if (count === 0 && !thumbUp && !thumbDown) name = 'Fist'
  else if (f.index && f.middle && !f.ring && !f.pinky && dist(lm[4], lm[8]) < dist(lm[4], lm[12]) * 0.8) name = 'OK'

  const base = name === 'Tracking' ? 0.78 : 0.92
  const confidence = Math.min(0.995, base + Math.min(0.06, Math.abs(lm[0].z || 0) * 0.02))
  return { name, confidence }
}

export function landmarkBounds(lm) {
  const xs = lm.map(p => p.x), ys = lm.map(p => p.y)
  return {
    x: Math.min(...xs), y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  }
}
