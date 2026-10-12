-- TEST FIXTURE ONLY: disposable synthetic_cas database, never a Supabase migration.
-- Simulates identity injected by a verified gateway; does NOT verify JWTs or Supabase Auth.
BEGIN;
CREATE ROLE px_cas_test_app NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE px_cas_test_writer NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE px_cas_test_anon NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE SCHEMA px_cas_auth;
REVOKE ALL ON SCHEMA px_cas_auth FROM PUBLIC;
GRANT USAGE ON SCHEMA px_cas_auth TO px_cas_test_app,px_cas_test_writer,px_cas_test_anon;
CREATE FUNCTION px_cas_auth.uid() RETURNS uuid
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
REVOKE ALL ON FUNCTION px_cas_auth.uid() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION px_cas_auth.uid() TO px_cas_test_app,px_cas_test_writer;
CREATE TABLE px_cas_auth.snapshots (
 user_id uuid PRIMARY KEY,
 payload jsonb NOT NULL CHECK (jsonb_typeof(payload)='object'),
 revision bigint NOT NULL CHECK (revision>0 AND revision<=9007199254740991)
);
ALTER TABLE px_cas_auth.snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE px_cas_auth.snapshots FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_read ON px_cas_auth.snapshots FOR SELECT TO px_cas_test_app
 USING ((SELECT px_cas_auth.uid())=user_id);
CREATE POLICY owner_write ON px_cas_auth.snapshots FOR ALL TO px_cas_test_writer
 USING ((SELECT px_cas_auth.uid())=user_id)
 WITH CHECK ((SELECT px_cas_auth.uid())=user_id);
GRANT SELECT ON px_cas_auth.snapshots TO px_cas_test_app;
GRANT SELECT,INSERT,UPDATE ON px_cas_auth.snapshots TO px_cas_test_writer;
-- The app has no INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES privileges.
-- Privilege separation needs a narrow writer entry point. This test-only definer
-- is owned by a non-owner/non-superuser/NOBYPASSRLS role so RLS still applies.
CREATE FUNCTION px_cas_auth.save_snapshot(expected_revision bigint,next_payload jsonb)
RETURNS TABLE(accepted boolean,actual_revision bigint,actual_payload jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 owner_id uuid:=px_cas_auth.uid();
 prior px_cas_auth.snapshots%ROWTYPE;
BEGIN
 IF owner_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='28000'; END IF;
 IF expected_revision IS NULL OR expected_revision<0 OR expected_revision>=9007199254740991
    OR next_payload IS NULL OR jsonb_typeof(next_payload)<>'object' THEN
  RAISE EXCEPTION 'Invalid CAS input' USING ERRCODE='22023';
 END IF;
 IF expected_revision=0 THEN
  INSERT INTO px_cas_auth.snapshots(user_id,payload,revision) VALUES(owner_id,next_payload,1)
  ON CONFLICT(user_id) DO NOTHING;
  IF FOUND THEN RETURN QUERY SELECT true,1::bigint,next_payload;RETURN;END IF;
 END IF;
 SELECT * INTO prior FROM px_cas_auth.snapshots WHERE user_id=owner_id FOR UPDATE;
 IF NOT FOUND THEN RETURN QUERY SELECT false,0::bigint,NULL::jsonb;RETURN;END IF;
 IF prior.revision<>expected_revision THEN
  RETURN QUERY SELECT false,prior.revision,prior.payload;RETURN;
 END IF;
 UPDATE px_cas_auth.snapshots s SET payload=next_payload,revision=s.revision+1 WHERE s.user_id=owner_id;
 RETURN QUERY SELECT true,prior.revision+1,next_payload;
END $$;
ALTER FUNCTION px_cas_auth.save_snapshot(bigint,jsonb) OWNER TO px_cas_test_writer;
REVOKE ALL ON FUNCTION px_cas_auth.save_snapshot(bigint,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION px_cas_auth.save_snapshot(bigint,jsonb) TO px_cas_test_app;
COMMIT;
