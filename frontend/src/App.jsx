import { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, addWeeks, subWeeks, addDays } from 'date-fns'
import { employeeApi, shiftApi } from './api.js'
import RotaGrid       from './components/RotaGrid.jsx'
import EmployeeSidebar from './components/EmployeeSidebar.jsx'
import ShiftModal     from './components/ShiftModal.jsx'
import HoursSummary   from './components/HoursSummary.jsx'
import { computeUncoveredBlocks } from './utils/coverage.js'

function getWeekStart(date) {
  return startOfWeek(date, { weekStartsOn: 1 }) // ISO week: Monday
}

function fmt(date) {
  return format(date, 'yyyy-MM-dd')
}

export default function App() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [employees, setEmployees] = useState([])
  const [shifts,    setShifts]    = useState([])
  const [loading,   setLoading]   = useState(true)
  // modal: null | { mode:'add', employee, day } | { mode:'edit', shift }
  const [modal, setModal] = useState(null)

  const weekStartStr = fmt(weekStart)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [emps, shfts] = await Promise.all([
        employeeApi.getAll(),
        shiftApi.getByWeek(weekStartStr),
      ])
      setEmployees(emps)
      setShifts(shfts)
    } finally {
      setLoading(false)
    }
  }, [weekStartStr])

  useEffect(() => { loadAll() }, [loadAll])

  const uncoveredBlocks = computeUncoveredBlocks(shifts)

  // ── Week navigation ────────────────────────────────────────────────────
  const prevWeek = () => setWeekStart(w => subWeeks(w, 1))
  const nextWeek = () => setWeekStart(w => addWeeks(w, 1))
  const goToday  = () => setWeekStart(getWeekStart(new Date()))

  // ── Modal helpers ──────────────────────────────────────────────────────
  const openAdd  = (employee, day) => setModal({ mode: 'add', employee, day })
  const openEdit = (shift)         => setModal({ mode: 'edit', shift })
  const closeModal = ()            => setModal(null)

  const onShiftSaved = async () => {
    closeModal()
    const shfts = await shiftApi.getByWeek(weekStartStr)
    setShifts(shfts)
  }

  const onEmployeesChanged = async () => {
    const [emps, shfts] = await Promise.all([
      employeeApi.getAll(),
      shiftApi.getByWeek(weekStartStr),
    ])
    setEmployees(emps)
    setShifts(shfts)
  }

  // ── Week label ─────────────────────────────────────────────────────────
  const weekEnd   = addDays(weekStart, 6)
  const weekLabel = `${format(weekStart, 'EEE d MMM')} – ${format(weekEnd, 'EEE d MMM yyyy')}`

  const gapCount = uncoveredBlocks.size

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-title">
          <h1>Rota Manager</h1>
          <span className="app-subtitle">Leisure Centre</span>
        </div>

        <div className="week-nav">
          <button className="btn btn-ghost" onClick={prevWeek}>← Prev</button>
          <button className="btn btn-ghost" onClick={goToday}>Today</button>
          <span className="week-label">{weekLabel}</span>
          <button className="btn btn-ghost" onClick={nextWeek}>Next →</button>
        </div>

        <div className="header-right">
          {gapCount > 0 && (
            <span className="gap-pill">{gapCount} coverage gap{gapCount !== 1 ? 's' : ''}</span>
          )}
          <button
            className="btn btn-export"
            onClick={() => shiftApi.exportCsv(weekStartStr)}
          >
            Export CSV
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="app-body">
        <EmployeeSidebar employees={employees} onChanged={onEmployeesChanged} />

        <main className="main-content">
          {loading ? (
            <div className="loading">
              <span className="loading-spinner" />
              Loading rota…
            </div>
          ) : (
            <>
              <RotaGrid
                weekStart={weekStart}
                employees={employees}
                shifts={shifts}
                uncoveredBlocks={uncoveredBlocks}
                onAddShift={openAdd}
                onEditShift={openEdit}
              />
              <HoursSummary employees={employees} shifts={shifts} />
            </>
          )}
        </main>
      </div>

      {/* ── Shift Modal ─────────────────────────────────────────────────── */}
      {modal && (
        <ShiftModal
          mode={modal.mode}
          shift={modal.shift}
          defaultEmployee={modal.employee}
          defaultDay={modal.day}
          employees={employees}
          weekStart={weekStartStr}
          onSaved={onShiftSaved}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
