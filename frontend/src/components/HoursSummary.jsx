import { timeToMinutes } from '../utils/openingHours.js'

function calcHours(shifts, employeeId) {
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

  // Max hours for bar scaling — floor at 8 so short weeks look reasonable
  const allHours = employees.map(e => calcHours(shifts, e.id))
  const maxHours = Math.max(...allHours, 8)

  return (
    <section className="hours-summary">
      <h3 className="hours-title">Hours This Week</h3>
      <div className="hours-list">
        {employees.map((emp, i) => {
          const hours = allHours[i]
          const pct   = (hours / maxHours) * 100
          return (
            <div key={emp.id} className="hours-row">
              <span className="emp-dot" style={{ background: emp.colour }} />
              <span className="hours-name">{emp.name}</span>
              <span className="hours-role">{emp.role}</span>
              <div className="hours-bar-track">
                <div
                  className="hours-bar-fill"
                  style={{ width: `${pct}%`, background: emp.colour }}
                />
              </div>
              <span className="hours-value">{hours.toFixed(1)}h</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
