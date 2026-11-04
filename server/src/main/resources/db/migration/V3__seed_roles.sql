-- The two roles the app needs: sign-up assigns USER (AuthService), ADMIN is granted by hand.
-- Only inserted when missing, so databases that were seeded by hand keep their existing ids.
-- The id is chosen explicitly (next free id) because hand-seeded rows used explicit ids and may
-- have left the identity sequence behind. On a new database this gives USER = 1, ADMIN = 2.

INSERT INTO roles (id, name)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM roles), 'USER'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'USER');

INSERT INTO roles (id, name)
SELECT (SELECT COALESCE(MAX(id), 0) + 1 FROM roles), 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');
