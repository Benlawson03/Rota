import { useState } from 'react'
import { employeeApi } from '../api.js'

const ROLES         = ['RECEPTIONIST', 'GYM', 'MANAGER', 'LIFEGUARD', 'HOUSEKEEPER', 'BEAUTY']
const GENDERS       = ['MALE', 'FEMALE']
const ALL_DAYS      = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const DAY_SHORT     = { MONDAY:'Mon', TUESDAY:'Tue', WEDNESDAY:'Wed', THURSDAY:'Thu',
                        FRIDAY:'Fri', SATURDAY:'Sat', SUNDAY:'Sun' }
const QUALIFICATIONS = ['RIFLES', 'ARCHERY', 'AXE_THROWING', 'BOATS']
const QUAL_ROLES    = ['MANAGER', 'LIFEGUARD']   // only these roles may have qualifications

const PRESET_COLOURS = [
  '#3B82F6','#10B981','#F59E0B','#EF4444',
  '#8B5CF6','#EC4899','#06B6D4','#F97316',
  '#84CC16','#14B8A6',
]

// ── Employee form ─────────────────────────────────────────────────────────

function EmployeeForm({ initial, onSave, onCancel }) {
  const [name,               setName]               = useState(initial?.name               ?? '')
  const [role,               setRole]               = useState(initial?.role               ?? ROLES[0])
  const [gender,             setGender]             = useState(initial?.gender             ?? 'MALE')
  const [colour,             setColour]             = useState(initial?.colour             ?? PRESET_COLOURS[0])
  const [contractedHours,    setContractedHours]    = useState(initial?.contractedHours    ?? 37)
  const [maxContractedHours, setMaxContractedHours] = useState(initial?.maxContractedHours ?? '')
  const [qualifications,     setQualifications]     = useState(new Set(initial?.qualifications ?? []))
  const [availability,       setAvailability]       = useState(new Set(initial?.availability   ?? ALL_DAYS))

  const toggleQual = (q) => {
    setQualifications(prev => {
      const next = new Set(prev)
      next.has(q) ? next.delete(q) : next.add(q)
      return next
    })
  }

  const toggleDay = (d) => {
    setAvailability(prev => {
      const next = new Set(prev)
      next.has(d) ? next.delete(d) : next.add(d)
      return next
    })
  }

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      role,
      gender,
      colour,
      contractedHours:    Number(contractedHours),
      maxContractedHours: maxContractedHours !== '' ? Number(maxContractedHours) : null,
      qualifications:     QUAL_ROLES.includes(role) ? [...qualifications] : [],
      availability:       [...availability],
    })
  }

  return (
    <form className="emp-form" onSubmit={submit}>
      {/* Name */}
      <input
        className="input"
        placeholder="Full name"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
        required
      />

      {/* Role */}
      <div className="form-row">
        <div className="field">
          <label className="field-label">Role</label>
          <select className="input" value={role} onChange={e => setRole(e.target.value)}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Gender */}
        <div className="field">
          <label className="field-label">Gender</label>
          <div className="toggle-group">
            {GENDERS.map(g => (
              <button
                key={g}
                type="button"
                className={`toggle-btn${gender === g ? ' toggle-btn--on' : ''}`}
                onClick={() => setGender(g)}
              >
                {g === 'MALE' ? '♂ M' : '♀ F'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contracted hours */}
      <div className="form-row">
        <div className="field">
          <label className="field-label">Min hrs / week</label>
          <input
            className="input"
            type="number"
            min={1} max={168} step={0.5}
            value={contractedHours}
            onChange={e => setContractedHours(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Max hrs <span className="optional">(variable)</span></label>
          <input
            className="input"
            type="number"
            min={1} max={168} step={0.5}
            placeholder="Same as min"
            value={maxContractedHours}
            onChange={e => setMaxContractedHours(e.target.value)}
          />
        </div>
      </div>

      {/* Colour */}
      <div className="colour-row">
        <label className="colour-label">Colour</label>
        <div className="colour-presets">
          {PRESET_COLOURS.map(c => (
            <button
              key={c} type="button"
              className={`colour-swatch${colour === c ? ' colour-swatch--active' : ''}`}
              style={{ background: c }}
              onClick={() => setColour(c)}
            />
          ))}
        </div>
        <input type="color" value={colour} onChange={e => setColour(e.target.value)}
               className="colour-picker" title="Custom colour" />
      </div>

      {/* Availability */}
      <div className="field">
        <label className="field-label">Availability</label>
        <div className="day-checks">
          {ALL_DAYS.map(d => (
            <label key={d} className={`day-check${availability.has(d) ? ' day-check--on' : ''}`}>
              <input
                type="checkbox"
                checked={availability.has(d)}
                onChange={() => toggleDay(d)}
              />
              {DAY_SHORT[d]}
            </label>
          ))}
        </div>
      </div>

      {/* Qualifications — only for MANAGER and LIFEGUARD */}
      {QUAL_ROLES.includes(role) && (
        <div className="field">
          <label className="field-label">Qualifications</label>
          <div className="qual-checks">
            {QUALIFICATIONS.map(q => (
              <label key={q} className={`qual-check${qualifications.has(q) ? ' qual-check--on' : ''}`}>
                <input
                  type="checkbox"
                  checked={qualifications.has(q)}
                  onChange={() => toggleQual(q)}
                />
                {q.replace('_', ' ')}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-sm">Save</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────

export default function EmployeeSidebar({ employees, onChanged }) {
  const [adding,  setAdding]  = useState(false)
  const [editing, setEditing] = useState(null) // employee id

  const handleAdd = async (data) => {
    await employeeApi.create(data)
    setAdding(false)
    onChanged()
  }

  const handleEdit = async (data) => {
    await employeeApi.update(editing, data)
    setEditing(null)
    onChanged()
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee and all their shifts?')) {
      await employeeApi.delete(id)
      onChanged()
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Staff</h2>
        {!adding && (
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            + Add
          </button>
        )}
      </div>

      {adding && (
        <EmployeeForm onSave={handleAdd} onCancel={() => setAdding(false)} />
      )}

      <ul className="emp-list">
        {employees.length === 0 && !adding && (
          <li className="emp-empty">No staff yet — click Add to get started.</li>
        )}

        {employees.map(emp => (
          <li key={emp.id} className="emp-item">
            {editing === emp.id ? (
              <EmployeeForm
                initial={emp}
                onSave={handleEdit}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="emp-row">
                <span className="emp-dot" style={{ background: emp.colour }} />
                <div className="emp-meta">
                  <span className="emp-name">{emp.name}</span>
                  <div className="emp-tags">
                    <span className="emp-role">{emp.role}</span>
                    <span className={`gender-badge gender-badge--${emp.gender?.toLowerCase()}`}>
                      {emp.gender === 'MALE' ? '♂' : '♀'}
                    </span>
                    <span className="hours-badge">
                      {emp.contractedHours}{emp.maxContractedHours ? `–${emp.maxContractedHours}` : ''}h
                    </span>
                  </div>
                  {emp.qualifications?.length > 0 && (
                    <div className="qual-tags">
                      {emp.qualifications.map(q => (
                        <span key={q} className="qual-tag">{q.replace('_', ' ')}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="emp-actions">
                  <button className="icon-btn" title="Edit"   onClick={() => setEditing(emp.id)}>✏️</button>
                  <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => handleDelete(emp.id)}>🗑</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
