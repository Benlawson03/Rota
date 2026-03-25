# Rota Manager — Leisure Centre

A full-stack work-schedule management application built for a university project.

| Layer    | Stack |
|----------|-------|
| Backend  | Java 17 · Spring Boot 3 · Spring Data JPA · H2 in-memory DB |
| Frontend | React 18 · Vite · date-fns |

---

## Project structure

```
Rota/
├── backend/
│   └── src/main/
│       ├── java/com/rota/
│       │   ├── RotaApplication.java
│       │   ├── config/CorsConfig.java
│       │   ├── controller/
│       │   │   ├── EmployeeController.java
│       │   │   ├── ShiftController.java
│       │   │   └── SchedulerController.java
│       │   ├── model/
│       │   │   ├── Employee.java       ← includes gender, contractedHours,
│       │   │   └── Shift.java            qualifications, availability
│       │   ├── repository/
│       │   │   ├── EmployeeRepository.java
│       │   │   └── ShiftRepository.java
│       │   └── service/
│       │       └── SchedulerService.java ← auto-scheduling algorithm
│       └── resources/
│           ├── application.properties
│           ├── schema.sql              ← employees, qualifications,
│           └── data.sql                  availability, shifts tables
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── RotaGrid.jsx
│   │   │   ├── EmployeeSidebar.jsx    ← gender, hours, availability, qualifications
│   │   │   ├── ShiftModal.jsx
│   │   │   └── HoursSummary.jsx      ← contracted vs scheduled, diff highlight
│   │   └── utils/
│   │       ├── openingHours.js
│   │       └── coverage.js           ← role + gender coverage checks
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Prerequisites

| Tool  | Version |
|-------|---------|
| Java  | 17+     |
| Maven | 3.8+    |
| Node  | 18+     |
| npm   | 9+      |

---

## Running the app

### 1 — Start the backend

```bash
cd backend
mvn spring-boot:run
```

API starts on **http://localhost:8080**.

### 2 — Start the frontend (second terminal)

```bash
cd frontend
npm install        # first time only
npm run dev
```

App opens at **http://localhost:5173**.
Vite proxies all `/api` requests to Spring Boot automatically.

---

## H2 console (live database)

Open **http://localhost:8080/h2-console** while the backend is running.

| Field    | Value              |
|----------|--------------------|
| JDBC URL | `jdbc:h2:mem:rotadb` |
| Username | `sa`               |
| Password | *(leave blank)*    |

---

## REST API

### Employees — `/api/employees`

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/employees` | List all |
| POST   | `/api/employees` | Create |
| PUT    | `/api/employees/:id` | Update |
| DELETE | `/api/employees/:id` | Delete + cascade shifts |

**Body (create / update):**
```json
{
  "name":            "Alice Johnson",
  "role":            "RECEPTIONIST",
  "gender":          "FEMALE",
  "colour":          "#3B82F6",
  "contractedHours": 37,
  "qualifications":  [],
  "availability":    ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"]
}
```

Valid roles: `RECEPTIONIST` · `GYM` · `MANAGER` · `LIFEGUARD` · `HOUSEKEEPER`
Valid genders: `MALE` · `FEMALE`
Qualifications (`MANAGER` and `LIFEGUARD` only): `RIFLES` · `ARCHERY` · `AXE_THROWING`

### Shifts — `/api/shifts`

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/shifts?weekStart=YYYY-MM-DD` | Shifts for week |
| POST   | `/api/shifts` | Create |
| PUT    | `/api/shifts/:id` | Update |
| DELETE | `/api/shifts/:id` | Delete |
| GET    | `/api/shifts/export?weekStart=…` | Download CSV |

### Scheduler — `/api/scheduler`

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/scheduler/generate?weekStart=YYYY-MM-DD` | Auto-generate schedule |

Returns:
```json
{
  "shifts": [ ... ],
  "uncoveredBlocks": ["MONDAY:06:00", "TUESDAY:14:30"]
}
```

---

## Domain rules

### Opening hours

| Day             | Open  | Close |
|-----------------|-------|-------|
| Mon / Wed / Fri | 06:00 | 21:30 |
| Tue / Thu       | 06:00 | 22:00 |
| Saturday        | 07:30 | 20:30 |
| Sunday          | 07:30 | 20:00 |

### Coverage requirements (every 30-min block)

| Role          | Required |
|---------------|----------|
| Receptionist  | ≥ 1      |
| Gym staff     | ≥ 1      |
| Manager       | ≥ 1      |
| Lifeguard     | ≥ 2      |
| Housekeeper   | ≥ 1 (a Lifeguard also satisfies this) |
| Male staff    | ≥ 1 (any role) |
| Female staff  | ≥ 1 (any role) |

Blocks failing any rule are flagged red in the Coverage Gaps panel.

### Qualifications

Only `MANAGER` and `LIFEGUARD` employees may hold activity qualifications:
`RIFLES`, `ARCHERY`, `AXE_THROWING`.

### Contracted hours

Each employee has a weekly contracted hours value. The auto-scheduler targets
this exactly. The Hours Summary panel shows contracted vs scheduled hours with
a red diff indicator for any mismatch.

---

## Auto-scheduler algorithm (Most Constrained First)

Implemented in `SchedulerService.java`:

1. **Rank employees** by number of available days, ascending — employees with fewer
   available days are scheduled first (most constrained).

2. **Rank days** by number of available employees, ascending — days with fewer staff
   options are filled first (hardest to fill).

3. **For each employee** (most constrained first):
   - Determine which days in the week they can work (from their `availability`).
   - Calculate shift length per day:
     `shiftMins = contractedHours × 60 ÷ availableDays`, rounded to 30-min blocks.
     Leftover minutes are distributed to the first N days so the total matches exactly.
   - Position each shift centred within that day's opening hours.
   - Clamp to the day's open/close times.

4. **Save** all generated shifts, replacing any existing shifts for that week.

5. **Coverage check** — every 30-min block is checked against all six requirements.
   Unresolved blocks are returned in `uncoveredBlocks` for UI display.

> **Note:** With only the five seed employees the scheduler will always produce
> coverage gaps (there are not enough staff for full coverage). Add more employees
> to see a fully covered schedule.

---

## Features

- Weekly rota grid — employee rows × day columns, colour-coded shift chips
- Prev / Next / Today week navigation
- Click cell to add a shift; click chip to edit or delete
- **Auto-Schedule** button — one click generates the full week, then shows a flash
  message indicating whether full coverage was achieved
- Coverage gap detection — red panel with time blocks and missing roles (hover for tooltip)
- Employee sidebar — add/edit/delete staff with gender badge, contracted hours, availability
  checkboxes, qualification checkboxes (Manager/Lifeguard only)
- Hours summary table — contracted vs scheduled hours with diff column (red if not exact)
- CSV export — download the current week as a spreadsheet-ready file
- H2 console for live database inspection during development
