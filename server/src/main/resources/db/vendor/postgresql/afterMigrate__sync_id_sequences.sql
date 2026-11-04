-- Flyway callback: runs after every migrate, on PostgreSQL only (see spring.flyway.locations).
--
-- Rows inserted by hand with explicit ids (the courses, the first roles) don't advance the
-- table's identity sequence, so the next insert without an id fails with a duplicate key
-- (e.g. an admin adding a course in the map editor). This moves every identity sequence in
-- the schema past the highest id in its table. It never moves a sequence backwards.

DO $$
DECLARE
    t      text;
    seq    text;
    max_id bigint;
    last   bigint;
    called boolean;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE table_schema = current_schema() AND column_name = 'id' AND is_identity = 'YES'
    LOOP
        seq := pg_get_serial_sequence(quote_ident(t), 'id');
        CONTINUE WHEN seq IS NULL;
        EXECUTE format('SELECT COALESCE(MAX(id), 0) FROM %I', t) INTO max_id;
        EXECUTE format('SELECT last_value, is_called FROM %s', seq) INTO last, called;
        -- The next id the sequence would hand out is last + 1 once used, else last.
        IF (CASE WHEN called THEN last + 1 ELSE last END) <= max_id THEN
            PERFORM setval(seq, max_id, true);
        END IF;
    END LOOP;
END $$;
