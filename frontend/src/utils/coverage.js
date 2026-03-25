import { DAYS, OPENING_HOURS, timeToMinutes, minutesToTime } from './openingHours.js'

// ── Required coverage per 30-min block ───────────────────────────────────
export const REQUIRED_COVERAGE = {
  RECEPTIONIST: 1,
  GYM:          1,
  MANAGER:      1,
  LIFEGUARD:    2,
  HOUSEKEEPER:  1,
}

/**
 * Returns a Set of strings in the format "DAY:HH:MM" for every 30-min block
 * within opening hours that does NOT meet full coverage requirements.
 *
 * @param {Array} shifts  — the shifts array from the API for the current week
 * @returns {Set<string>}
 */
export function computeUncoveredBlocks(shifts) {
  const uncovered = new Set()

  for (const day of DAYS) {
    const hours = OPENING_HOURS[day]
    if (!hours) continue

    const openMins  = timeToMinutes(hours.open)
    const closeMins = timeToMinutes(hours.close)
    const dayShifts = shifts.filter(s => s.dayOfWeek === day)

    for (let t = openMins; t < closeMins; t += 30) {
      const blockEnd = t + 30

      // Count how many staff of each role cover this block
      const coverage = { RECEPTIONIST: 0, GYM: 0, MANAGER: 0, LIFEGUARD: 0, HOUSEKEEPER: 0 }

      for (const shift of dayShifts) {
        const role = shift.employee?.role
        if (!role || !(role in coverage)) continue
        const sStart = timeToMinutes(shift.startTime.slice(0, 5))
        const sEnd   = timeToMinutes(shift.endTime.slice(0, 5))
        // A shift covers this block if it starts at or before t AND ends at or after blockEnd
        if (sStart <= t && sEnd >= blockEnd) {
          coverage[role]++
        }
      }

      const allCovered = Object.entries(REQUIRED_COVERAGE).every(
        ([role, required]) => coverage[role] >= required
      )

      if (!allCovered) {
        uncovered.add(`${day}:${minutesToTime(t)}`)
      }
    }
  }

  return uncovered
}

/**
 * Returns the list of missing role labels for a specific day + block start time.
 * Used for tooltip/detail display.
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

  const coverage = { RECEPTIONIST: 0, GYM: 0, MANAGER: 0, LIFEGUARD: 0, HOUSEKEEPER: 0 }

  for (const shift of dayShifts) {
    const role = shift.employee?.role
    if (!role || !(role in coverage)) continue
    const sStart = timeToMinutes(shift.startTime.slice(0, 5))
    const sEnd   = timeToMinutes(shift.endTime.slice(0, 5))
    if (sStart <= blockStart && sEnd >= blockEnd) {
      coverage[role]++
    }
  }

  return Object.entries(REQUIRED_COVERAGE)
    .filter(([role, required]) => coverage[role] < required)
    .map(([role]) => role)
}
