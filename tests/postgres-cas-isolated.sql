\set ON_ERROR_STOP on
BEGIN;
CREATE SCHEMA demo;
CREATE TABLE demo.snapshots (
 user_id uuid PRIMARY KEY, payload jsonb NOT NULL,
 revision bigint NOT NULL DEFAULT 0 CHECK (revision>=0)
);
CREATE FUNCTION demo.save_snapshot(p_owner uuid,p_expected bigint,p_payload jsonb)
RETURNS TABLE(accepted boolean, actual_revision bigint, actual_payload jsonb)
LANGUAGE plpgsql AS $$
DECLARE current_row demo.snapshots%ROWTYPE;
BEGIN
 IF p_owner IS NULL OR p_expected IS NULL OR p_expected<0 OR p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' THEN
   RAISE EXCEPTION 'Invalid CAS input' USING ERRCODE='22023';
 END IF;
 IF p_expected=0 THEN
   INSERT INTO demo.snapshots(user_id,payload,revision) VALUES(p_owner,p_payload,1)
   ON CONFLICT (user_id) DO NOTHING;
   IF FOUND THEN RETURN QUERY SELECT true,1::bigint,p_payload; RETURN; END IF;
 END IF;
 SELECT * INTO current_row FROM demo.snapshots WHERE user_id=p_owner FOR UPDATE;
 IF NOT FOUND THEN RETURN QUERY SELECT false,0::bigint,NULL::jsonb; RETURN; END IF;
 IF current_row.revision<>p_expected THEN
  RETURN QUERY SELECT false,current_row.revision,current_row.payload; RETURN;
 END IF;
 UPDATE demo.snapshots s SET payload=p_payload,revision=s.revision+1 WHERE s.user_id=p_owner;
 RETURN QUERY SELECT true,current_row.revision+1,p_payload;
END $$;
DO $$
DECLARE a uuid='00000000-0000-4000-8000-000000000001';
 b uuid='00000000-0000-4000-8000-000000000002';
 result record;
BEGIN
 SELECT * INTO result FROM demo.save_snapshot(a,0,'{"food":["one"],"daily":["yes"]}');
 IF NOT result.accepted OR result.actual_revision<>1 THEN RAISE EXCEPTION 'first create failed'; END IF;
 SELECT * INTO result FROM demo.save_snapshot(a,0,'{"food":["stale"]}');
 IF result.accepted OR result.actual_revision<>1 OR result.actual_payload->'food'<>'["one"]'::jsonb THEN RAISE EXCEPTION 'stale write accepted'; END IF;
 SELECT * INTO result FROM demo.save_snapshot(a,1,'{"food":[],"daily":["yes"]}');
 IF NOT result.accepted OR result.actual_revision<>2 THEN RAISE EXCEPTION 'delete failed'; END IF;
 SELECT * INTO result FROM demo.save_snapshot(a,1,'{"food":["resurrect"],"daily":["new"]}');
 IF result.accepted OR result.actual_payload->'food'<>'[]'::jsonb THEN RAISE EXCEPTION 'deletion resurrected'; END IF;
 BEGIN
  PERFORM * FROM demo.save_snapshot(a,2,'[]'::jsonb);
  RAISE EXCEPTION 'array snapshot unexpectedly accepted' USING ERRCODE='PX001';
 EXCEPTION WHEN SQLSTATE 'PX001' THEN RAISE;
           WHEN SQLSTATE '22023' THEN NULL;
 END;
 IF (SELECT revision FROM demo.snapshots WHERE user_id=a)<>2
    OR (SELECT payload->'food' FROM demo.snapshots WHERE user_id=a)<>'[]'::jsonb THEN
  RAISE EXCEPTION 'invalid payload altered saved snapshot';
 END IF;
 SELECT * INTO result FROM demo.save_snapshot(b,8,'{"food":["must-not-insert"]}');
 IF result.accepted OR result.actual_revision<>0 THEN RAISE EXCEPTION 'invalid first revision accepted'; END IF;
 IF EXISTS(SELECT 1 FROM demo.snapshots WHERE user_id=b) THEN RAISE EXCEPTION 'invalid first revision inserted row'; END IF;
 SELECT * INTO result FROM demo.save_snapshot(b,0,'{"food":["other"]}');
 IF NOT result.accepted THEN RAISE EXCEPTION 'second account failed'; END IF;
 IF (SELECT payload->'food' FROM demo.snapshots WHERE user_id=a)<>'[]'::jsonb THEN RAISE EXCEPTION 'cross-account corruption'; END IF;
 RAISE NOTICE 'PASS synthetic postgres CAS: create, stale write, deletion, isolation';
END $$;
ROLLBACK;
