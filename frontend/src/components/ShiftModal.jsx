import { useState } from 'react'
import { DAYS, DAY_LABELS, getTimeOptions } from '../utils/openingHours.js'
import { shiftApi } from '../api.js'

export default function ShiftModal({
  mode,            // 'add' | 'edit'
  shift,           // existing shift (edit mode)
  defaultEmployee, // pre-selected employee (add mode)
  defaultDay,      // pre-selected day (add mode)
  employees,
  weekStart,       // "YYYY-MM-DD"
  onSaved,
  onClose,
}) {
  const [employeeId, setEmployeeId] = useState(
    String(shift?.employee?.id ?? defaultEmployee?.id ?? employees[0]?.id ?? '')
  )
  const [day,       setDay]       = useState(shift?.dayOfWeek ?? defaultDay ?? 'MONDAY')
  const [startTime, setStartTime] = useState(shift?.startTime?.slice(0, 5) ?? '')
  const [endTime,   setEndTime]   = useState(shift?.endTime?.slice(0, 5)   ?? '')
  const [notes,     setNotes]     = useState(shift?.notes ?? '')
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)

  const timeOptions = getTimeOptions(day)

  // When the day changes, reset times if they're now outside the new day's hours
  const changeDay = (newDay) => {
    const opts = getTimeOptions(newDay)
    setDay(newDay)
    if (startTime && !opts.includes(startTime)) setStartTime('')
    if (endTime   && !opts.includes(endTime))   setEndTime('')
  }

  const validate = () => {
    if (!employeeId) return 'Please select an employee.'
    if (!startTime)  return 'Please select a start time.'
    if (!endTime)    return 'Please select an end time.'
    if (startTime >= endTime) return 'End time must be after start time.'
    return ''
  }

  const handleSave = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setSaving(true)
    try {
      const payload = {
        employeeId: Number(employeeId),
        weekStart,
        dayOfWeek: day,
        startTime,
        endTime,
        notes: notes.trim() || null,
      }

      if (mode === 'edit') {
        await shiftApi.update(shift.id, payload)
      } else {
        await shiftApi.create(payload)
      }
      onSaved()
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Delete this shift?')) {
      await shiftApi.delete(shift.id)
      onSaved()
    }
  }

  // End-time options: only times strictly after startTime
  const endTimeOptions = startTime
    ? timeOptions.filter(t => t > startTime)
    : timeOptions.slice(1)

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Edit Shift' : 'Add Shift'}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label className="field-label">Employee</label>
            <select
              className="input"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
            >
              <option value="">Select employee…</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.role}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Day</label>
            <select className="input" value={day} onChange={e => changeDay(e.target.value)}>
              {DAYS.map(d => (
                <option key={d} value={d}>{DAY_LABELS[d]}</option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Start time</label>
              <select
                className="input"
                value={startTime}
                onChange={e => { setStartTime(e.target.value); setEndTime('') }}
              >
                <option value="">Select…</option>
                {timeOptions.slice(0, -1).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label">End time</label>
              <select
                className="input"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                disabled={!startTime}
              >
                <option value="">Select…</option>
                {endTimeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Notes <span className="optional">(optional)</span></label>
            <input
              className="input"
              placeholder="e.g. Early shift cover"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div>
            {mode === 'edit' && (
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            )}
          </div>
          <div className="modal-footer-right">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Add Shift'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
