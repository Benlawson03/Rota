const BASE = '/api'

// ── Employees ─────────────────────────────────────────────────────────────

export const employeeApi = {
  getAll: () =>
    fetch(`${BASE}/employees`).then(r => r.json()),

  create: (emp) =>
    fetch(`${BASE}/employees`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(emp),
    }).then(r => r.json()),

  update: (id, emp) =>
    fetch(`${BASE}/employees/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(emp),
    }).then(r => r.json()),

  delete: (id) =>
    fetch(`${BASE}/employees/${id}`, { method: 'DELETE' }),
}

// ── Shifts ────────────────────────────────────────────────────────────────

export const shiftApi = {
  /** weekStart: "YYYY-MM-DD" */
  getByWeek: (weekStart) =>
    fetch(`${BASE}/shifts?weekStart=${weekStart}`).then(r => r.json()),

  create: (shift) =>
    fetch(`${BASE}/shifts`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(shift),
    }).then(r => r.json()),

  update: (id, shift) =>
    fetch(`${BASE}/shifts/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(shift),
    }).then(r => r.json()),

  delete: (id) =>
    fetch(`${BASE}/shifts/${id}`, { method: 'DELETE' }),

  /** Opens the CSV download in a new tab */
  exportCsv: (weekStart) =>
    window.open(`${BASE}/shifts/export?weekStart=${weekStart}`, '_blank'),
}
