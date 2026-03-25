import { timeToMinutes } from '../utils/openingHours.js'

function scheduledHours(shifts, employeeId) {
  return shifts
    .filter(s => s.employee?.id === employeeId)
    .reduce((sum, s) => {
      const mins =
        timeToMinutes(s.endTime.slice(0, 5)) -
        timeToMinutes(s.startTime.slice(0, 5))
      return sum + mins
    }, 0) / 60
}

export default function HoursSummary({ employees, shifts }) {
  if (employees.length === 0) return null

  return (
    <section className="hours-summary">
      <h3 className="hours-title">Hours This Week</h3>

      <div className="hours-table">
        {/* Header */}
        <div className="hours-header">
          <span>Employee</span>
          <span>Role</span>
          <span className="num">Contracted</span>
          <span className="num">Scheduled</span>
          <span className="num">Diff</span>
          <span className="bar-col">Bar</span>
        </div>

        {employees.map(emp => {
          const contracted = emp.contractedHours
          const scheduled  = scheduledHours(shifts, emp.id)
          const diff       = +(scheduled - contracted).toFixed(1)
          const exact      = diff === 0
          const pct        = contracted > 0
            ? Math.min((scheduled / contracted) * 100, 130)
            : 0

          return (
            <div key={emp.id} className="hours-row">
              <div className="hours-emp">
                <span className="emp-dot" style={{ background: emp.colour }} />
                <span className="hours-name">{emp.name}</span>
              </div>

              <span className="hours-role">{emp.role}</span>

              <span className="num">{contracted}h</span>

              <span className="num">{scheduled.toFixed(1)}h</span>

              <span className={`num diff-val${exact ? '' : ' diff-val--bad'}`}>
                {diff === 0 ? '✓' : (diff > 0 ? `+${diff}h` : `${diff}h`)}
              </span>

              <div className="bar-col">
                <div className="hours-bar-track">
                  <div
                    className={`hours-bar-fill${exact ? '' : ' hours-bar-fill--over'}`}
                    style={{ width: `${Math.min(pct, 100)}%`, background: emp.colour }}
                  />
                  {/* Red overflow indicator */}
                  {pct > 100 && (
                    <div className="hours-bar-overflow" style={{ width: `${pct - 100}%` }} />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
