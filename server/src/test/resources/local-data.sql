-- Demo data for the "local" profile (see application-local.properties).
INSERT INTO roles (id, name) VALUES (1, 'USER'), (2, 'ADMIN');

-- One course row per node id used by the CPE and EE study-plan maps.
INSERT INTO courses (id, name, label, description, credit_hours, created_at, updated_at)
SELECT x, 'Course ' || x, 'Course ' || x, 'Demo course', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM SYSTEM_RANGE(1, 200);

INSERT INTO dr_email (name, email, department) VALUES
  ('Dr. Example One', 'one@example.edu', 'Computer Engineering'),
  ('Dr. Example Two', 'two@example.edu', 'Electrical Engineering');
