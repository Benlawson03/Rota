-- ============================================================
-- Rota Manager — Real Staff Data
-- ============================================================
--
-- HOW TO ADD AN EMPLOYEE
-- ───────────────────────────────────────────────────────────
--   INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours)
--   VALUES ('Name', 'ROLE', 'GENDER', '#HEX', min_hours, max_hours_or_NULL);
--
--   role   : RECEPTIONIST | GYM | MANAGER | LIFEGUARD | HOUSEKEEPER | BEAUTY
--   gender : MALE | FEMALE
--   colour : any CSS hex colour
--   contracted_hours     : minimum weekly hours
--   max_contracted_hours : set for variable contracts (e.g. 32 min / 40 max); NULL = fixed
--
-- HOW TO ADD A QUALIFICATION (MANAGER and LIFEGUARD only)
-- ───────────────────────────────────────────────────────────
--   INSERT INTO employee_qualifications (employee_id, qualification)
--   VALUES (<id>, 'QUALIFICATION');
--   qualification : RIFLES | ARCHERY | AXE_THROWING | BOATS
--
-- HOW TO ADD AVAILABILITY
-- ───────────────────────────────────────────────────────────
--   INSERT INTO employee_availability (employee_id, day_of_week)
--   VALUES (<id>, 'DAY');
--   day_of_week : MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY
-- ============================================================

-- ── Management / Senior staff ─────────────────────────────────────────────
--  id  name              role      gender   colour    contracted  max
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Caroline',  'MANAGER',   'FEMALE', '#F59E0B', 40, NULL);  -- id=1  top manager, early or late DM
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Anita',     'MANAGER',   'FEMALE', '#FBBF24', 40, NULL);  -- id=2  admin + DM, early or late
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Paul',      'MANAGER',   'MALE',   '#EF4444', 40, NULL);  -- id=3  health & safety DM, early or late
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Chloe',     'BEAUTY',    'FEMALE', '#EC4899', 40, NULL);  -- id=4  beauty staff + can cover DM

-- ── Leisure team leaders ──────────────────────────────────────────────────
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Greg',      'LIFEGUARD', 'MALE',   '#6366F1', 40, NULL);  -- id=5  team leader, all activities + LG + DM
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Tom',       'LIFEGUARD', 'MALE',   '#8B5CF6', 40, NULL);  -- id=6  team leader, all activities + LG + DM

-- ── Seasonal / variable contract staff (32–40 hrs) ───────────────────────
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Jamal',     'LIFEGUARD', 'MALE',   '#10B981', 32, 40);    -- id=7
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Stephen',   'LIFEGUARD', 'MALE',   '#14B8A6', 32, 40);    -- id=8
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Izzy D',    'LIFEGUARD', 'FEMALE', '#3B82F6', 32, 40);    -- id=9
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Dylan',     'LIFEGUARD', 'MALE',   '#06B6D4', 32, 40);    -- id=10
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Brodie',    'LIFEGUARD', 'MALE',   '#84CC16', 32, 40);    -- id=11

-- ── Part-time / fixed contract staff ─────────────────────────────────────
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Elysia',    'LIFEGUARD', 'FEMALE', '#F472B6', 24, NULL);  -- id=12
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Kam',       'LIFEGUARD', 'MALE',   '#A78BFA', 24, NULL);  -- id=13
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Iris',      'LIFEGUARD', 'FEMALE', '#67E8F9', 24, NULL);  -- id=14
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Megan',     'LIFEGUARD', 'FEMALE', '#FB923C', 20, NULL);  -- id=15
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Ben',       'LIFEGUARD', 'MALE',   '#34D399', 16, NULL);  -- id=16
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Jack',      'LIFEGUARD', 'MALE',   '#60A5FA', 16, NULL);  -- id=17
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Issy Z',    'LIFEGUARD', 'FEMALE', '#F9A8D4', 16, NULL);  -- id=18
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Bella H',   'LIFEGUARD', 'FEMALE', '#93C5FD', 12, NULL);  -- id=19
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Chloe',     'LIFEGUARD', 'FEMALE', '#86EFAC', 12, NULL);  -- id=20  NB: different Chloe from id=4
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Luca',      'LIFEGUARD', 'MALE',   '#FCA5A5', 12, NULL);  -- id=21
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Heather',   'LIFEGUARD', 'FEMALE', '#FDBA74', 12, NULL);  -- id=22
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Arvind',    'LIFEGUARD', 'MALE',   '#C084FC', 12, NULL);  -- id=23
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Adam',      'LIFEGUARD', 'MALE',   '#4ADE80', 12, NULL);  -- id=24
INSERT INTO employees (name, role, gender, colour, contracted_hours, max_contracted_hours) VALUES
  ('Sander',    'LIFEGUARD', 'MALE',   '#9CA3AF',  4, NULL);  -- id=25  Sun only, 08:00–12:00

-- ── Qualifications ────────────────────────────────────────────────────────
-- Greg (5): all activities
INSERT INTO employee_qualifications VALUES (5, 'RIFLES');
INSERT INTO employee_qualifications VALUES (5, 'ARCHERY');
INSERT INTO employee_qualifications VALUES (5, 'AXE_THROWING');
INSERT INTO employee_qualifications VALUES (5, 'BOATS');
-- Tom (6): all activities
INSERT INTO employee_qualifications VALUES (6, 'RIFLES');
INSERT INTO employee_qualifications VALUES (6, 'ARCHERY');
INSERT INTO employee_qualifications VALUES (6, 'AXE_THROWING');
INSERT INTO employee_qualifications VALUES (6, 'BOATS');
-- Seasonal staff
INSERT INTO employee_qualifications VALUES (7,  'RIFLES');           -- Jamal
INSERT INTO employee_qualifications VALUES (8,  'ARCHERY');          -- Stephen
INSERT INTO employee_qualifications VALUES (10, 'ARCHERY');          -- Dylan
INSERT INTO employee_qualifications VALUES (11, 'ARCHERY');          -- Brodie
INSERT INTO employee_qualifications VALUES (11, 'AXE_THROWING');
INSERT INTO employee_qualifications VALUES (11, 'BOATS');
INSERT INTO employee_qualifications VALUES (16, 'AXE_THROWING');     -- Ben
INSERT INTO employee_qualifications VALUES (16, 'BOATS');

-- ── Availability ──────────────────────────────────────────────────────────
-- All staff: available every day (no holidays requested yet)
-- To restrict a day, remove that row.
-- Sander: Sunday only (he works the fixed 08:00–12:00 Sunday shift)

-- Helper to insert all 7 days per person:
-- Caroline (1)
INSERT INTO employee_availability VALUES (1,'MONDAY'),(1,'TUESDAY'),(1,'WEDNESDAY'),(1,'THURSDAY'),(1,'FRIDAY'),(1,'SATURDAY'),(1,'SUNDAY');
-- Anita (2)
INSERT INTO employee_availability VALUES (2,'MONDAY'),(2,'TUESDAY'),(2,'WEDNESDAY'),(2,'THURSDAY'),(2,'FRIDAY'),(2,'SATURDAY'),(2,'SUNDAY');
-- Paul (3)
INSERT INTO employee_availability VALUES (3,'MONDAY'),(3,'TUESDAY'),(3,'WEDNESDAY'),(3,'THURSDAY'),(3,'FRIDAY'),(3,'SATURDAY'),(3,'SUNDAY');
-- Chloe Beauty (4)
INSERT INTO employee_availability VALUES (4,'MONDAY'),(4,'TUESDAY'),(4,'WEDNESDAY'),(4,'THURSDAY'),(4,'FRIDAY'),(4,'SATURDAY'),(4,'SUNDAY');
-- Greg (5)
INSERT INTO employee_availability VALUES (5,'MONDAY'),(5,'TUESDAY'),(5,'WEDNESDAY'),(5,'THURSDAY'),(5,'FRIDAY'),(5,'SATURDAY'),(5,'SUNDAY');
-- Tom (6)
INSERT INTO employee_availability VALUES (6,'MONDAY'),(6,'TUESDAY'),(6,'WEDNESDAY'),(6,'THURSDAY'),(6,'FRIDAY'),(6,'SATURDAY'),(6,'SUNDAY');
-- Jamal (7)
INSERT INTO employee_availability VALUES (7,'MONDAY'),(7,'TUESDAY'),(7,'WEDNESDAY'),(7,'THURSDAY'),(7,'FRIDAY'),(7,'SATURDAY'),(7,'SUNDAY');
-- Stephen (8)
INSERT INTO employee_availability VALUES (8,'MONDAY'),(8,'TUESDAY'),(8,'WEDNESDAY'),(8,'THURSDAY'),(8,'FRIDAY'),(8,'SATURDAY'),(8,'SUNDAY');
-- Izzy D (9)
INSERT INTO employee_availability VALUES (9,'MONDAY'),(9,'TUESDAY'),(9,'WEDNESDAY'),(9,'THURSDAY'),(9,'FRIDAY'),(9,'SATURDAY'),(9,'SUNDAY');
-- Dylan (10)
INSERT INTO employee_availability VALUES (10,'MONDAY'),(10,'TUESDAY'),(10,'WEDNESDAY'),(10,'THURSDAY'),(10,'FRIDAY'),(10,'SATURDAY'),(10,'SUNDAY');
-- Brodie (11)
INSERT INTO employee_availability VALUES (11,'MONDAY'),(11,'TUESDAY'),(11,'WEDNESDAY'),(11,'THURSDAY'),(11,'FRIDAY'),(11,'SATURDAY'),(11,'SUNDAY');
-- Elysia (12)
INSERT INTO employee_availability VALUES (12,'MONDAY'),(12,'TUESDAY'),(12,'WEDNESDAY'),(12,'THURSDAY'),(12,'FRIDAY'),(12,'SATURDAY'),(12,'SUNDAY');
-- Kam (13)
INSERT INTO employee_availability VALUES (13,'MONDAY'),(13,'TUESDAY'),(13,'WEDNESDAY'),(13,'THURSDAY'),(13,'FRIDAY'),(13,'SATURDAY'),(13,'SUNDAY');
-- Iris (14)
INSERT INTO employee_availability VALUES (14,'MONDAY'),(14,'TUESDAY'),(14,'WEDNESDAY'),(14,'THURSDAY'),(14,'FRIDAY'),(14,'SATURDAY'),(14,'SUNDAY');
-- Megan (15)
INSERT INTO employee_availability VALUES (15,'MONDAY'),(15,'TUESDAY'),(15,'WEDNESDAY'),(15,'THURSDAY'),(15,'FRIDAY'),(15,'SATURDAY'),(15,'SUNDAY');
-- Ben (16)
INSERT INTO employee_availability VALUES (16,'MONDAY'),(16,'TUESDAY'),(16,'WEDNESDAY'),(16,'THURSDAY'),(16,'FRIDAY'),(16,'SATURDAY'),(16,'SUNDAY');
-- Jack (17)
INSERT INTO employee_availability VALUES (17,'MONDAY'),(17,'TUESDAY'),(17,'WEDNESDAY'),(17,'THURSDAY'),(17,'FRIDAY'),(17,'SATURDAY'),(17,'SUNDAY');
-- Issy Z (18)
INSERT INTO employee_availability VALUES (18,'MONDAY'),(18,'TUESDAY'),(18,'WEDNESDAY'),(18,'THURSDAY'),(18,'FRIDAY'),(18,'SATURDAY'),(18,'SUNDAY');
-- Bella H (19)
INSERT INTO employee_availability VALUES (19,'MONDAY'),(19,'TUESDAY'),(19,'WEDNESDAY'),(19,'THURSDAY'),(19,'FRIDAY'),(19,'SATURDAY'),(19,'SUNDAY');
-- Chloe LG (20)
INSERT INTO employee_availability VALUES (20,'MONDAY'),(20,'TUESDAY'),(20,'WEDNESDAY'),(20,'THURSDAY'),(20,'FRIDAY'),(20,'SATURDAY'),(20,'SUNDAY');
-- Luca (21)
INSERT INTO employee_availability VALUES (21,'MONDAY'),(21,'TUESDAY'),(21,'WEDNESDAY'),(21,'THURSDAY'),(21,'FRIDAY'),(21,'SATURDAY'),(21,'SUNDAY');
-- Heather (22)
INSERT INTO employee_availability VALUES (22,'MONDAY'),(22,'TUESDAY'),(22,'WEDNESDAY'),(22,'THURSDAY'),(22,'FRIDAY'),(22,'SATURDAY'),(22,'SUNDAY');
-- Arvind (23)
INSERT INTO employee_availability VALUES (23,'MONDAY'),(23,'TUESDAY'),(23,'WEDNESDAY'),(23,'THURSDAY'),(23,'FRIDAY'),(23,'SATURDAY'),(23,'SUNDAY');
-- Adam (24)
INSERT INTO employee_availability VALUES (24,'MONDAY'),(24,'TUESDAY'),(24,'WEDNESDAY'),(24,'THURSDAY'),(24,'FRIDAY'),(24,'SATURDAY'),(24,'SUNDAY');
-- Sander (25) — Sunday only
INSERT INTO employee_availability VALUES (25,'SUNDAY');
