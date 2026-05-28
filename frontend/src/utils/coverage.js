import { DAYS, OPENING_HOURS, OUTDOOR_POOL_STAFF, timeToMinutes, minutesToTime } from './openingHours.js'

// ── Lifeguard requirement is time-dependent ───────────────────────────────
// 10:30–19:00 = outdoor pool open → need 1 extra lifeguard poolside → 3 total
const POOL_OPEN  = timeToMinutes(OUTDOOR_POOL_STAFF.open)   // 630
const POOL_CLOSE = timeToMinutes(OUTDOOR_POOL_STAFF.close)  // 1140

function requiredLifeguards(blockStartMins) {
  return (blockStartMins >= POOL_OPEN && blockStartMins < POOL_CLOSE) ? 3 : 2
}

// ── Base coverage requirements (non-lifeguard) ───────────────────────────
export const BASE_COVERAGE = {
  RECEPTIONIST: 1,
  GYM:          1,
  MANAGER:      1,
  HOUSEKEEPER:  1,   // can be covered by a LIFEGUARD
}

/**
 * Returns a Set of "DAY:HH:MM" strings for every 30-min block within
 * opening hours that fails ANY coverage rule:
 *
 *   Roles:
 *     ≥1 RECEPTIONIST, ≥1 GYM, ≥1 MANAGER
 *     ≥2 LIFEGUARD (≥3 during outdoor pool hours 10:30–19:00)
 *     ≥1 HOUSEKEEPER (a LIFEGUARD counts toward this)
 *
 *   Gender:
 *     ≥1 MALE and ≥1 FEMALE across any role every block
 *
 * @param {Array} shifts — shifts for the current week from the API
 * @returns {Set<string>}
 */
export function computeUncoveredBlocks(shifts) {
  const uncovered = new Set()

  for (const day of DAYS) {
    const hours     = OPENING_HOURS[day]
    const openMins  = timeToMinutes(hours.open)
    const closeMins = timeToMinutes(hours.close)
    const dayShifts = shifts.filter(s => s.dayOfWeek === day)

    for (let t = openMins; t < closeMins; t += 30) {
      const blockEnd = t + 30

      let recep = 0, gym = 0, mgr = 0, lg = 0, hk = 0
      let male = 0, female = 0

      for (const shift of dayShifts) {
        const sStart = timeToMinutes(shift.startTime.slice(0, 5))
        const sEnd   = timeToMinutes(shift.endTime.slice(0, 5))
        if (sStart > t || sEnd < blockEnd) continue

        const role = shift.employee?.role
        if (role === 'RECEPTIONIST') recep++
        else if (role === 'GYM')     gym++
        else if (role === 'MANAGER') mgr++
        else if (role === 'LIFEGUARD') lg++
        else if (role === 'HOUSEKEEPER') hk++

        const gender = shift.employee?.gender
        if (gender === 'MALE')   male++
        else if (gender === 'FEMALE') female++
      }

      const lgRequired = requiredLifeguards(t)
      const covered =
        recep >= 1 &&
        gym   >= 1 &&
        mgr   >= 1 &&
        lg    >= lgRequired &&
        (hk + lg) >= 1 &&
        male   >= 1 &&
        female >= 1

      if (!covered) {
        uncovered.add(`${day}:${minutesToTime(t)}`)
      }
    }
  }

  return uncovered
}

/**
 * Returns a human-readable list of missing requirements for a block.
 * Used for tooltip display.
 */
export function getMissingRoles(shifts, day, blockTime) {
  const blockStart = timeToMinutes(blockTime)
  const blockEnd   = blockStart + 30
  const dayShifts  = shifts.filter(s => s.dayOfWeek === day)

  let recep = 0, gym = 0, mgr = 0, lg = 0, hk = 0
  let male = 0, female = 0

  for (const shift of dayShifts) {
    const sStart = timeToMinutes(shift.startTime.slice(0, 5))
    const sEnd   = timeToMinutes(shift.endTime.slice(0, 5))
    if (sStart > blockStart || sEnd < blockEnd) continue

    const role = shift.employee?.role
    if (role === 'RECEPTIONIST') recep++
    else if (role === 'GYM')     gym++
    else if (role === 'MANAGER') mgr++
    else if (role === 'LIFEGUARD') lg++
    else if (role === 'HOUSEKEEPER') hk++

    const gender = shift.employee?.gender
    if (gender === 'MALE')   male++
    else if (gender === 'FEMALE') female++
  }

  const lgRequired = requiredLifeguards(blockStart)
  const missing = []
  if (recep < 1)         missing.push('Receptionist')
  if (gym < 1)           missing.push('Gym staff')
  if (mgr < 1)           missing.push('Manager')
  if (lg < lgRequired)   missing.push(`Lifeguard ×${Math.max(0, lgRequired - lg)}${lgRequired === 3 ? ' (pool)' : ''}`)
  if ((hk + lg) < 1)     missing.push('Housekeeper')
  if (male < 1)          missing.push('Male staff')
  if (female < 1)        missing.push('Female staff')

  return missing
}
