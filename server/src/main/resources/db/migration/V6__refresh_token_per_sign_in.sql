-- Each sign-in gets its own refresh token, so a user can stay signed in on several devices
-- (before, signing in on a laptop replaced the phone's token and signed the phone out).
-- The unique constraint on user_id is replaced by a plain index for the per-user lookups.
--
-- The foreign key is dropped and added back around the change: H2 lets the foreign key reuse
-- the unique constraint's index and then keeps that (still unique) index when the constraint
-- is dropped. On PostgreSQL the round trip changes nothing.

ALTER TABLE refresh_token DROP CONSTRAINT fkjtx87i0jvq2svedphegvdwcuy;

ALTER TABLE refresh_token DROP CONSTRAINT ukf95ixxe7pa48ryn1awmh2evt7;

CREATE INDEX idx_refresh_token_user_id ON refresh_token (user_id);

ALTER TABLE refresh_token
    ADD CONSTRAINT fkjtx87i0jvq2svedphegvdwcuy FOREIGN KEY (user_id) REFERENCES users (id);
