import { useState } from 'react'
import { employeeApi } from '../api.js'

const ROLES = ['RECEPTIONIST', 'GYM', 'MANAGER', 'LIFEGUARD', 'HOUSEKEEPER']

const PRESET_COLOURS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
  '#84CC16', '#14B8A6',
]

// ── Employee add/edit form ────────────────────────────────────────────────

function EmployeeForm({ initial, onSave, onCancel }) {
  const [name,   setName]   = useState(initial?.name   ?? '')
  const [role,   setRole]   = useState(initial?.role   ?? ROLES[0])
  const [colour, setColour] = useState(initial?.colour ?? PRESET_COLOURS[0])

  const submit = (e) => {
    e.preventDefault()
    if (name.trim()) onSave({ name: name.trim(), role, colour })
  }

  return (
    <form className="emp-form" onSubmit={submit}>
      <input
        className="input"
        placeholder="Full name"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
        required
      />

      <select className="input" value={role} onChange={e => setRole(e.target.value)}>
        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      <div className="colour-row">
        <label className="colour-label">Colour</label>
        <div className="colour-presets">
          {PRESET_COLOURS.map(c => (
            <button
              key={c}
              type="button"
              className={`colour-swatch${colour === c ? ' colour-swatch--active' : ''}`}
              style={{ background: c }}
              onClick={() => setColour(c)}
            />
          ))}
        </div>
        <input
          type="color"
          value={colour}
          onChange={e => setColour(e.target.value)}
          title="Custom colour"
          className="colour-picker"
        />
      </div>

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
                  <span className="emp-role">{emp.role}</span>
                </div>
                <div className="emp-actions">
                  <button
                    className="icon-btn"
                    title="Edit"
                    onClick={() => setEditing(emp.id)}
                  >✏️</button>
                  <button
                    className="icon-btn icon-btn--danger"
                    title="Delete"
                    onClick={() => handleDelete(emp.id)}
                  >🗑</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
