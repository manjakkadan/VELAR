/**
 * Euclidean distance between two MediaPipe landmark points.
 * z is optional (some landmark sets omit depth), so it defaults to 0.
 */
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0))

/**
 * Determines whether a single finger is "extended" (straightened out)
 * or "curled" (folded into the palm).
 *
 * Approach: compare each joint's distance from the wrist.
 * If the fingertip is meaningfully farther from the wrist than the
 * middle joint (PIP), and the middle joint is roughly as far out as
 * the base joint (MCP), the finger is treated as extended.
 *
 * The 1.08 / 0.92 multipliers are tolerance margins (not exact ratios)
 * to absorb natural hand jitter and camera noise — tuned empirically.
 *
 * @param lm     full 21-point landmark array for one hand
 * @param tip    index of the fingertip landmark
 * @param pip    index of the middle joint landmark
 * @param mcp    index of the base knuckle landmark
 * @param wrist  wrist landmark (lm[0]), passed in to avoid re-lookup
 */
function fingerExtended(lm, tip, pip, mcp, wrist) {
  const tipDist = dist(lm[tip], wrist)
  const pipDist = dist(lm[pip], wrist)
  const mcpDist = dist(lm[mcp], wrist)
  return tipDist > pipDist * 1.08 && pipDist > mcpDist * 0.92
}

/**
 * Runs fingerExtended() for all four non-thumb fingers using
 * MediaPipe's fixed landmark indices:
 *   Index:  tip 8,  pip 6,  mcp 5
 *   Middle: tip 12, pip 10, mcp 9
 *   Ring:   tip 16, pip 14, mcp 13
 *   Pinky:  tip 20, pip 18, mcp 17
 * (Thumb is handled separately in recognizeGesture — it bends
 * sideways rather than up/down, so this distance check doesn't apply to it.)
 */
function getFingerStates(lm) {
  const wrist = lm[0]
  return {
    index: fingerExtended(lm, 8, 6, 5, wrist),
    middle: fingerExtended(lm, 12, 10, 9, wrist),
    ring: fingerExtended(lm, 16, 14, 13, wrist),
    pinky: fingerExtended(lm, 20, 18, 17, wrist),
  }
}

/**
 * Classifies a static hand pose into one of a fixed set of named gestures,
 * based purely on the current frame's landmark positions (no motion history).
 *
 * Supported gestures: Thumbs Up, Thumbs Down, Peace, Point, Open Palm,
 * Fist, OK. Anything that doesn't match a known pattern falls back to
 * "Tracking" (hand is visible, but no specific gesture recognized).
 *
 * @param lm  21-point landmark array for one hand, or undefined/short array
 * @returns   { name: string, confidence: number }
 */
export function recognizeGesture(lm) {
  // MediaPipe always returns 21 landmarks per hand; guard against
  // partial/missing data (e.g. hand leaving frame mid-detection).
  if (!lm || lm.length < 21) return { name: 'Unknown', confidence: 0 }

  const f = getFingerStates(lm)

  // Thumb orientation is judged by y-position relative to its own
  // lower joints (landmarks 2, 3, 4), since the thumb moves along a
  // different axis than the other fingers and fingerExtended() doesn't fit it.
  const thumbUp = lm[4].y < lm[3].y && lm[4].y < lm[2].y
  const thumbDown = lm[4].y > lm[3].y && lm[4].y > lm[2].y

  const count = Object.values(f).filter(Boolean).length

  // Gesture rules are checked in order of specificity — more distinctive
  // poses (Thumbs Up/Down) are checked before general ones (Tracking).
  let name = 'Tracking'
  if (thumbUp && count === 0) name = 'Thumbs Up'
  else if (thumbDown && count === 0) name = 'Thumbs Down'
  else if (f.index && f.middle && !f.ring && !f.pinky) name = 'Peace'
  else if (f.index && !f.middle && !f.ring && !f.pinky) name = 'Point'
  else if (f.index && f.middle && f.ring && f.pinky && thumbUp) name = 'Open Palm'
  else if (count === 0 && !thumbUp && !thumbDown) name = 'Fist'
  // OK sign: index and middle extended, AND thumb tip is closer to the
  // index tip than to the middle tip (i.e. thumb+index are pinched together).
  else if (f.index && f.middle && !f.ring && !f.pinky && dist(lm[4], lm[8]) < dist(lm[4], lm[12]) * 0.8) name = 'OK'

  // Confidence is a heuristic display value, not a true statistical
  // confidence: recognized gestures start higher (0.92) than the
  // generic "Tracking" state (0.78), with a small boost based on how
  // far the wrist is from the camera plane (z-depth).
  const base = name === 'Tracking' ? 0.78 : 0.92
  const confidence = Math.min(0.995, base + Math.min(0.06, Math.abs(lm[0].z || 0) * 0.02))

  return { name, confidence }
}

/**
 * Computes an axis-aligned bounding box (in normalized 0–1 coordinates,
 * matching MediaPipe's output space) that encloses all 21 landmarks
 * of one hand. Used to draw the bounding box and to position the
 * on-screen label near the hand.
 */
export function landmarkBounds(lm) {
  const xs = lm.map(p => p.x), ys = lm.map(p => p.y)
  return {
    x: Math.min(...xs), y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  }
}