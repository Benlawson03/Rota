-- ============================================================
-- Rota Manager — Seed Data
-- ============================================================
--
-- HOW TO ADD AN EMPLOYEE
-- ───────────────────────────────────────────────────────────
--   INSERT INTO employees (name, role, gender, colour, contracted_hours)
--   VALUES ('Full Name', 'ROLE', 'GENDER', '#HEX', hours);
--
--   role   : RECEPTIONIST | GYM | MANAGER | LIFEGUARD | HOUSEKEEPER
--   gender : MALE | FEMALE
--   colour : any CSS hex colour, e.g. '#3B82F6'
--   contracted_hours : total hours per week (hard cap for auto-scheduler)
--
-- HOW TO ADD A QUALIFICATION (MANAGER and LIFEGUARD only)
-- ───────────────────────────────────────────────────────────
--   INSERT INTO employee_qualifications (employee_id, qualification)
--   VALUES (<id>, 'QUALIFICATION');
--
--   qualification : RIFLES | ARCHERY | AXE_THROWING
--
-- HOW TO ADD AVAILABILITY
-- ───────────────────────────────────────────────────────────
--   INSERT INTO employee_availability (employee_id, day_of_week)
--   VALUES (<id>, 'DAY');
--
--   day_of_week : MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY
--
-- ============================================================

-- ── Employees (one per role, mixed genders) ──────────────────────────────
--                                          name               role            gender    colour     hours
INSERT INTO employees (name, role, gender, colour, contracted_hours) VALUES
  ('Alice Johnson', 'RECEPTIONIST', 'FEMALE', '#3B82F6', 37);  -- id=1
INSERT INTO employees (name, role, gender, colour, contracted_hours) VALUES
  ('Ben Carter',    'GYM',          'MALE',   '#10B981', 40);  -- id=2
INSERT INTO employees (name, role, gender, colour, contracted_hours) VALUES
  ('Clara Smith',   'MANAGER',      'FEMALE', '#F59E0B', 40);  -- id=3
INSERT INTO employees (name, role, gender, colour, contracted_hours) VALUES
  ('David Lee',     'LIFEGUARD',    'MALE',   '#EF4444', 35);  -- id=4
INSERT INTO employees (name, role, gender, colour, contracted_hours) VALUES
  ('Eva Brown',     'HOUSEKEEPER',  'FEMALE', '#8B5CF6', 30);  -- id=5

-- ── Qualifications (MANAGER and LIFEGUARD only) ───────────────────────────
INSERT INTO employee_qualifications (employee_id, qualification) VALUES (3, 'RIFLES');
INSERT INTO employee_qualifications (employee_id, qualification) VALUES (3, 'ARCHERY');
INSERT INTO employee_qualifications (employee_id, qualification) VALUES (4, 'AXE_THROWING');

-- ── Availability ──────────────────────────────────────────────────────────
-- Alice: Mon–Fri
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (1, 'MONDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (1, 'TUESDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (1, 'WEDNESDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (1, 'THURSDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (1, 'FRIDAY');

-- Ben: Mon, Wed, Fri, Sat
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (2, 'MONDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (2, 'WEDNESDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (2, 'FRIDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (2, 'SATURDAY');

-- Clara: Mon–Sat
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (3, 'MONDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (3, 'TUESDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (3, 'WEDNESDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (3, 'THURSDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (3, 'FRIDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (3, 'SATURDAY');

-- David: Tue, Thu, Sat, Sun
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (4, 'TUESDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (4, 'THURSDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (4, 'SATURDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (4, 'SUNDAY');

-- Eva: Mon, Wed, Fri
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (5, 'MONDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (5, 'WEDNESDAY');
INSERT INTO employee_availability (employee_id, day_of_week) VALUES (5, 'FRIDAY');

-- ── Example shifts for week starting 2026-03-23 (Mon) ─────────────────────
--
-- HOW TO ADD A SHIFT
--   INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes)
--   VALUES (<id>, '<YYYY-MM-DD>', '<DAY>', '<HH:MM>', '<HH:MM>', '<note or NULL>');
--   week_start must always be a Monday; times must be within that day's opening hours
--   and snapped to 30-min boundaries.
--
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes) VALUES
  (1, '2026-03-23', 'MONDAY',    '09:00', '16:30', 'Front desk AM');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes) VALUES
  (2, '2026-03-23', 'MONDAY',    '07:00', '15:00', 'Gym morning');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes) VALUES
  (3, '2026-03-23', 'MONDAY',    '06:00', '14:00', 'Opening manager');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes) VALUES
  (5, '2026-03-23', 'MONDAY',    '07:00', '12:00', 'Morning clean');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes) VALUES
  (4, '2026-03-23', 'TUESDAY',   '09:00', '17:00', 'Pool cover');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes) VALUES
  (3, '2026-03-23', 'TUESDAY',   '10:00', '17:00', NULL);
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes) VALUES
  (1, '2026-03-23', 'WEDNESDAY', '12:00', '19:30', 'Afternoon shift');
INSERT INTO shifts (employee_id, week_start, day_of_week, start_time, end_time, notes) VALUES
  (3, '2026-03-23', 'FRIDAY',    '10:00', '18:00', NULL);
