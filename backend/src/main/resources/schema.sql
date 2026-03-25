-- ============================================================
-- Rota Manager — Database Schema
-- ============================================================

DROP TABLE IF EXISTS employee_qualifications;
DROP TABLE IF EXISTS employee_availability;
DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS employees;

-- ── employees ────────────────────────────────────────────────────────────
CREATE TABLE employees (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    role             VARCHAR(20)  NOT NULL,  -- RECEPTIONIST | GYM | MANAGER | LIFEGUARD | HOUSEKEEPER
    gender           VARCHAR(6)   NOT NULL,  -- MALE | FEMALE
    colour           VARCHAR(7)   NOT NULL,  -- CSS hex, e.g. '#3B82F6'
    contracted_hours INT          NOT NULL   -- weekly contracted hours (hard cap)
);

-- ── employee_qualifications (only MANAGER and LIFEGUARD can have these) ──
-- RIFLES | ARCHERY | AXE_THROWING
CREATE TABLE employee_qualifications (
    employee_id   BIGINT      NOT NULL,
    qualification VARCHAR(20) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ── employee_availability ────────────────────────────────────────────────
-- Days the employee is available to work: MONDAY … SUNDAY
CREATE TABLE employee_availability (
    employee_id BIGINT      NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ── shifts ───────────────────────────────────────────────────────────────
CREATE TABLE shifts (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id  BIGINT      NOT NULL,
    week_start   DATE        NOT NULL,  -- always the Monday of the ISO week
    day_of_week  VARCHAR(10) NOT NULL,  -- MONDAY … SUNDAY
    start_time   TIME        NOT NULL,  -- snapped to 30-min boundaries
    end_time     TIME        NOT NULL,
    notes        VARCHAR(255),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
