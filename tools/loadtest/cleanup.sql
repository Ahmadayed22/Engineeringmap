-- Removes the lt_<n> users the load test creates (and everything they made).
-- Local/staging only:  docker exec -i engmap-test-db psql -U postgres -d engineeringmap < tools/loadtest/cleanup.sql
BEGIN;
CREATE TEMP TABLE lt_users AS
  SELECT id FROM users WHERE username LIKE 'lt\_%' AND email LIKE '%@loadtest.local';
-- Tables whose foreign keys don't cascade:
DELETE FROM refresh_token WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM tracking WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM comments WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM resource WHERE user_id IN (SELECT id FROM lt_users);
-- The rest (timetable, exam dates, uploads, votes, notifications, ...) cascade.
DELETE FROM users WHERE id IN (SELECT id FROM lt_users);
SELECT count(*) AS remaining_test_users FROM users WHERE email LIKE '%@loadtest.local';
COMMIT;
