import { DAYS, OPENING_HOURS, timeToMinutes, minutesToTime } from './openingHours.js'

// ── Required coverage per 30-min block ───────────────────────────────────

export const REQUIRED_COVERAGE = {
  RECEPTIONIST: 1,
  GYM:          1,
  MANAGER:      1,
  LIFEGUARD:    2,
  HOUSEKEEPER:  1,   // can be covered by a LIFEGUARD
}

/**
 * Returns a Set of "DAY:HH:MM" strings for every 30-min block within
 * opening hours that fails ANY coverage rule:
 *
 *   Role requirements (LIFEGUARD counts toward HOUSEKEEPER):
 *     ≥1 RECEPTIONIST, ≥1 GYM, ≥1 MANAGER, ≥2 LIFEGUARD, ≥1 HOUSEKEEPER
 *
 *   Gender requirement:
 *     ≥1 MALE and ≥1 FEMALE (across any role) every block
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

      // Lifeguard can fill the housekeeper slot
      const covered =
        recep >= 1 &&
        gym   >= 1 &&
        mgr   >= 1 &&
        lg    >= 2 &&
        (hk + lg) >= 1 &&   // lifeguard satisfies housekeeper requirement
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
 * Returns the list of missing requirements for a specific day + block start time.
 * Used for tooltip display.
 *
 * @param {Array}  shifts
 * @param {string} day       — e.g. "MONDAY"
 * @param {string} blockTime — e.g. "09:00"
 * @returns {string[]}
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

  const missing = []
  if (recep < 1)          missing.push('Receptionist')
  if (gym < 1)            missing.push('Gym')
  if (mgr < 1)            missing.push('Manager')
  if (lg < 2)             missing.push(`Lifeguard ×${Math.max(0, 2 - lg)}`)
  if ((hk + lg) < 1)      missing.push('Housekeeper')
  if (male < 1)           missing.push('Male staff')
  if (female < 1)         missing.push('Female staff')

  return missing
}
