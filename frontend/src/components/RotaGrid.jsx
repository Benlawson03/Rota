import { format, addDays } from 'date-fns'
import { DAYS, DAY_LABELS, OPENING_HOURS } from '../utils/openingHours.js'
import { getMissingRoles } from '../utils/coverage.js'

export default function RotaGrid({
  weekStart,
  employees,
  shifts,
  uncoveredBlocks,
  onAddShift,
  onEditShift,
}) {
  // Group uncovered block keys by day for quick lookup
  const uncoveredByDay = {}
  for (const key of uncoveredBlocks) {
    const [day, time] = key.split(':')
    if (!uncoveredByDay[day]) uncoveredByDay[day] = []
    uncoveredByDay[day].push(time)
  }

  return (
    <div className="rota-section">
      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="rota-scroll">
        <table className="rota-table">
          <thead>
            <tr>
              <th className="col-employee">Employee</th>
              {DAYS.map((day, i) => {
                const date    = addDays(weekStart, i)
                const hasGaps = (uncoveredByDay[day]?.length ?? 0) > 0
                const hours   = OPENING_HOURS[day]
                return (
                  <th key={day} className={`col-day${hasGaps ? ' col-day--gap' : ''}`}>
                    <div className="day-header">
                      <span className="day-name">{DAY_LABELS[day]}</span>
                      <span className="day-date">{format(date, 'd MMM')}</span>
                      <span className="day-hours">{hours.open}–{hours.close}</span>
                      {hasGaps && (
                        <span
                          className="gap-badge"
                          title={`${uncoveredByDay[day].length} uncovered 30-min blocks`}
                        >
                          {uncoveredByDay[day].length}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-grid">
                  No employees yet — add staff in the sidebar to start building the rota.
                </td>
              </tr>
            ) : (
              employees.map(emp => (
                <tr key={emp.id}>
                  <td className="cell-employee">
                    <span className="emp-dot" style={{ background: emp.colour }} />
                    <div className="emp-meta">
                      <span className="emp-name">{emp.name}</span>
                      <span className="emp-role">{emp.role}</span>
                    </div>
                  </td>

                  {DAYS.map(day => {
                    const dayShifts = shifts.filter(
                      s => s.employee?.id === emp.id && s.dayOfWeek === day
                    )
                    return (
                      <td
                        key={day}
                        className="cell-shift"
                        onClick={() => onAddShift(emp, day)}
                      >
                        {dayShifts.map(shift => (
                          <div
                            key={shift.id}
                            className="shift-chip"
                            style={{
                              background:   emp.colour + '28',
                              borderColor:  emp.colour,
                            }}
                            onClick={e => { e.stopPropagation(); onEditShift(shift) }}
                          >
                            <span className="chip-time">
                              {shift.startTime.slice(0, 5)}–{shift.endTime.slice(0, 5)}
                            </span>
                            {shift.notes && (
                              <span className="chip-note">{shift.notes}</span>
                            )}
                          </div>
                        ))}

                        {dayShifts.length === 0 && (
                          <span className="add-hint">+</span>
                        )}
                        {dayShifts.length > 0 && (
                          <span
                            className="add-more"
                            onClick={e => { e.stopPropagation(); onAddShift(emp, day) }}
                            title="Add another shift"
                          >
                            +
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Coverage gaps panel ─────────────────────────────────────────── */}
      {Object.keys(uncoveredByDay).length > 0 && (
        <div className="coverage-panel">
          <div className="coverage-panel-title">
            <span className="coverage-icon">⚠</span>
            Coverage Gaps — the following 30-min blocks are missing required staff
          </div>
          <div className="coverage-days-list">
            {DAYS.filter(d => uncoveredByDay[d]?.length > 0).map(day => (
              <div key={day} className="coverage-day-group">
                <span className="coverage-day-label">{DAY_LABELS[day]}</span>
                <div className="coverage-blocks">
                  {[...uncoveredByDay[day]].sort().map(time => {
                    const missing = getMissingRoles(shifts, day, time)
                    return (
                      <span
                        key={time}
                        className="coverage-block"
                        title={`Missing: ${missing.join(', ')}`}
                      >
                        {time}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
