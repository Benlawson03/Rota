-- ============================================================
-- Rota Manager — Database Schema
-- ============================================================

DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS employees;

-- employees: one row per staff member
CREATE TABLE employees (
    id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    role   VARCHAR(20)  NOT NULL,   -- RECEPTIONIST | GYM | MANAGER | LIFEGUARD | HOUSEKEEPER
    colour VARCHAR(7)   NOT NULL    -- CSS hex colour, e.g. '#3B82F6'
);

-- shifts: one row per shift block
CREATE TABLE shifts (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id  BIGINT      NOT NULL,
    week_start   DATE        NOT NULL,  -- always the Monday of that ISO week
    day_of_week  VARCHAR(10) NOT NULL,  -- MONDAY … SUNDAY
    start_time   TIME        NOT NULL,  -- snapped to 30-min boundaries
    end_time     TIME        NOT NULL,
    notes        VARCHAR(255),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
