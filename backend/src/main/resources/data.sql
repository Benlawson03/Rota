-- ============================================================
-- Rota Manager — Seed Data
-- ============================================================
--
-- HOW TO ADD A NEW EMPLOYEE
-- ─────────────────────────
--   INSERT INTO employees (name, role, colour)
--   VALUES ('Full Name', 'ROLE', '#HEXCOLOR');
--
--   Valid roles : RECEPTIONIST | GYM | MANAGER | LIFEGUARD | HOUSEKEEPER
--   colour      : any valid CSS hex, e.g. '#3B82F6'
--
-- ============================================================

-- One example employee per role
INSERT INTO employees (name, role, colour) VALUES ('Alice Johnson', 'RECEPTIONIST', '#3B82F6');
INSERT INTO employees (name, role, colour) VALUES ('Ben Carter',    'GYM',          '#10B981');
INSERT INTO employees (name, role, colour) VALUES ('Clara Smith',   'MANAGER',      '#F59E0B');
INSERT INTO employees (name, role, colour) VALUES ('David Lee',     'LIFEGUARD',    '#EF4444');
INSERT INTO employees (name, role, colour) VALUES ('Eva Brown',     'HOUSEKEEPER',  '#8B5CF6');

-- ============================================================
-- HOW TO ADD A SHIFT
-- ──────────────────
--   INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
--   VALUES (<emp_id>, '<YYYY-MM-DD>', '<DAY>', '<HH:MM>', '<HH:MM>', '<optional note>');
--
--   week_start  : must be a Monday (the ISO week start)
--   day_of_week : MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY
--   start_time  : must fall within that day's opening hours, snapped to 30-min blocks
--   end_time    : must be after start_time and within opening hours
--   notes       : optional free text; use NULL if not needed
--
-- Opening hours:
--   Mon / Wed / Fri  →  06:00 – 21:30
--   Tue / Thu        →  06:00 – 22:00
--   Sat              →  07:30 – 20:30
--   Sun              →  07:30 – 20:00
-- ============================================================

-- Example shifts for the week starting 2026-03-23 (Mon)
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (1, '2026-03-23', 'MONDAY',    '09:00', '17:00', 'Morning reception');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (2, '2026-03-23', 'MONDAY',    '06:00', '14:00', 'Early gym shift');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (3, '2026-03-23', 'MONDAY',    '08:00', '16:00', 'Manager opening');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (4, '2026-03-23', 'MONDAY',    '09:00', '15:00', 'Pool morning');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (5, '2026-03-23', 'MONDAY',    '07:00', '13:00', 'Early clean');

INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (1, '2026-03-23', 'WEDNESDAY', '12:00', '20:00', 'Afternoon shift');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (3, '2026-03-23', 'WEDNESDAY', '08:00', '16:00', NULL);
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (2, '2026-03-23', 'WEDNESDAY', '14:00', '21:30', 'Late gym cover');

INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (3, '2026-03-23', 'FRIDAY',    '10:00', '18:00', NULL);
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (4, '2026-03-23', 'FRIDAY',    '12:00', '18:00', 'Pool afternoon');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (5, '2026-03-23', 'FRIDAY',    '10:00', '16:00', NULL);

INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (1, '2026-03-23', 'SATURDAY',  '07:30', '14:00', 'Weekend opener');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (4, '2026-03-23', 'SATURDAY',  '07:30', '13:30', 'Weekend pool');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
  VALUES (5, '2026-03-23', 'SUNDAY',    '07:30', '12:00', 'Sunday clean');
