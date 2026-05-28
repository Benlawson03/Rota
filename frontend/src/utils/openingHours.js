// ── Outdoor pool staff hours (all days) ──────────────────────────────────
// Public opening: 11:00–18:30.  Staff required: 10:30–19:00.
// During this window the lifeguard requirement increases from 2 → 3.
export const OUTDOOR_POOL_STAFF = { open: '10:30', close: '19:00' }

// ── Opening hours per day ─────────────────────────────────────────────────
export const OPENING_HOURS = {
  MONDAY:    { open: '06:00', close: '21:30' },
  TUESDAY:   { open: '06:00', close: '22:00' },
  WEDNESDAY: { open: '06:00', close: '21:30' },
  THURSDAY:  { open: '06:00', close: '22:00' },
  FRIDAY:    { open: '06:00', close: '21:30' },
  SATURDAY:  { open: '07:30', close: '20:30' },
  SUNDAY:    { open: '07:30', close: '20:00' },
}

export const DAYS = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
]

export const DAY_LABELS = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** "09:30" → 570 */
export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** 570 → "09:30" */
export function minutesToTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

/**
 * Returns an array of 30-min block start times within opening hours for a day.
 * e.g. MONDAY → ["06:00","06:30","07:00",…,"21:00"]  (last block ends at 21:30)
 */
export function get30MinBlocks(day) {
  const hours = OPENING_HOURS[day]
  if (!hours) return []
  const start = timeToMinutes(hours.open)
  const end   = timeToMinutes(hours.close)
  const blocks = []
  for (let t = start; t < end; t += 30) {
    blocks.push(minutesToTime(t))
  }
  return blocks
}

/**
 * Returns time options (including the closing time) suitable for dropdown selects.
 * e.g. MONDAY → ["06:00",…,"21:30"]
 */
export function getTimeOptions(day) {
  const hours = OPENING_HOURS[day]
  if (!hours) return []
  const start = timeToMinutes(hours.open)
  const end   = timeToMinutes(hours.close)
  const options = []
  for (let t = start; t <= end; t += 30) {
    options.push(minutesToTime(t))
  }
  return options
}
