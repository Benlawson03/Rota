# Rota Manager — Leisure Centre

A full-stack work-schedule management application built for a uni project.

| Layer    | Stack |
|----------|-------|
| Backend  | Java 17 · Spring Boot 3 · Spring Data JPA · H2 in-memory DB |
| Frontend | React 18 · Vite · date-fns |

---

## Project structure

```
Rota/
├── backend/                   Spring Boot Maven project
│   └── src/main/
│       ├── java/com/rota/
│       │   ├── RotaApplication.java
│       │   ├── config/CorsConfig.java
│       │   ├── controller/
│       │   │   ├── EmployeeController.java
│       │   │   └── ShiftController.java
│       │   ├── model/
│       │   │   ├── Employee.java
│       │   │   └── Shift.java
│       │   └── repository/
│       │       ├── EmployeeRepository.java
│       │       └── ShiftRepository.java
│       └── resources/
│           ├── application.properties
│           ├── schema.sql         ← creates tables on startup
│           └── data.sql           ← seeds example employees & shifts
│
├── frontend/                  React + Vite project
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js             ← all fetch calls to /api
│   │   ├── index.css          ← dark-theme stylesheet
│   │   ├── components/
│   │   │   ├── RotaGrid.jsx
│   │   │   ├── EmployeeSidebar.jsx
│   │   │   ├── ShiftModal.jsx
│   │   │   └── HoursSummary.jsx
│   │   └── utils/
│   │       ├── openingHours.js  ← opening hours + time helpers
│   │       └── coverage.js      ← coverage gap calculation
│   ├── index.html
│   ├── package.json
│   └── vite.config.js         ← proxies /api → localhost:8080
│
└── README.md
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+     |
| Maven | 3.8+  |
| Node | 18+     |
| npm  | 9+      |

---

## Running the app

### 1 — Start the backend

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**.
The H2 console is available at **http://localhost:8080/h2-console**
(JDBC URL: `jdbc:h2:mem:rotadb`, username: `sa`, no password).

### 2 — Start the frontend

Open a **second terminal**:

```bash
cd frontend
npm install        # first time only
npm run dev
```

The app opens at **http://localhost:5173**.
Vite proxies all `/api` requests to the Spring Boot backend automatically.

---

## REST API

### Employees

| Method | Path                  | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/employees`      | List all employees       |
| POST   | `/api/employees`      | Create employee          |
| PUT    | `/api/employees/:id`  | Update employee          |
| DELETE | `/api/employees/:id`  | Delete + cascade shifts  |

**Employee body:**
```json
{ "name": "Alice Johnson", "role": "RECEPTIONIST", "colour": "#3B82F6" }
```

Valid roles: `RECEPTIONIST` · `GYM` · `MANAGER` · `LIFEGUARD` · `HOUSEKEEPER`

### Shifts

| Method | Path                             | Description              |
|--------|----------------------------------|--------------------------|
| GET    | `/api/shifts?weekStart=YYYY-MM-DD` | All shifts for a week  |
| POST   | `/api/shifts`                    | Create shift             |
| PUT    | `/api/shifts/:id`                | Update shift             |
| DELETE | `/api/shifts/:id`                | Delete shift             |
| GET    | `/api/shifts/export?weekStart=…` | Download CSV             |

**Shift body:**
```json
{
  "employeeId": 1,
  "weekStart":  "2026-03-23",
  "dayOfWeek":  "MONDAY",
  "startTime":  "09:00",
  "endTime":    "17:00",
  "notes":      "Morning shift"
}
```

`weekStart` must always be a **Monday**.
Times must fall within that day's opening hours, snapped to 30-min boundaries.

---

## Opening hours

| Day             | Open  | Close |
|-----------------|-------|-------|
| Mon / Wed / Fri | 06:00 | 21:30 |
| Tue / Thu       | 06:00 | 22:00 |
| Saturday        | 07:30 | 20:30 |
| Sunday          | 07:30 | 20:00 |

---

## Coverage rules

Every 30-minute block within opening hours requires **all** of the following:

| Role          | Required |
|---------------|----------|
| Receptionist  | 1        |
| Gym staff     | 1        |
| Manager       | 1        |
| Lifeguard     | 2        |
| Housekeeper   | 1        |

Blocks that don't meet full coverage are flagged in the **Coverage Gaps** panel below the rota grid. Hover over a red time badge to see which roles are missing.

---

## Features

- **Weekly rota grid** — employee rows × day columns, shift chips colour-coded per employee
- **Prev / Next / Today** week navigation
- **Click cell** to add a shift; **click chip** to edit or delete
- **Coverage gap detection** — real-time red highlighting of uncovered 30-min blocks
- **Employee sidebar** — add, edit, delete staff with colour picker
- **Hours summary** — bar chart of total weekly hours per employee
- **CSV export** — download the current week's rota as a spreadsheet-ready file
- **H2 console** — inspect the live database at `/h2-console` during development

---

## Database

The schema is created fresh on every restart (`schema.sql`).
Example employees and shifts are seeded via `data.sql`.

To add more seed data, follow the comments at the top of `data.sql`.
