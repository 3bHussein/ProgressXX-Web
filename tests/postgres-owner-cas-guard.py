"""Guard regressions: run the real harness with subprocess calls intercepted."""
import os
import runpy
import unittest
from unittest.mock import patch

TARGET = 'tests/postgres-owner-cas-acceptance.py'
VALID = {'PGHOST': 'localhost', 'PGDATABASE': 'synthetic_cas', 'PGUSER': 'postgres', 'PGPASSWORD': 'test-only'}


class ReachedSubprocess(Exception):
    pass


class GuardTests(unittest.TestCase):
    def test_unsafe_targets_stop_before_any_process(self):
        cases = [{}, {**VALID, 'PGHOST': 'production.invalid'},
                 {**VALID, 'PGDATABASE': 'production'}, {**VALID, 'PGPORT': '6432'},
                 {**VALID, 'PGUSER': 'service_role'}, {**VALID, 'PG_DUMP_CONTAINER': 'bad;command'}]
        for env in cases:
            with self.subTest(env=env), patch.dict(os.environ, env, clear=True), patch('subprocess.run') as run:
                with self.assertRaises(SystemExit):
                    runpy.run_path(TARGET)
                run.assert_not_called()

    def test_host_and_database_are_pinned_despite_pg_overrides(self):
        env = {**VALID, 'PGHOSTADDR': '203.0.113.1', 'PGSERVICE': 'production', 'PGOPTIONS': 'anything'}
        with patch.dict(os.environ, env, clear=True), patch('subprocess.run', side_effect=ReachedSubprocess) as run:
            with self.assertRaises(ReachedSubprocess):
                runpy.run_path(TARGET)
            command = run.call_args.args[0]
            self.assertEqual(command[command.index('-h') + 1], '127.0.0.1')
            self.assertEqual(command[command.index('-d') + 1], 'synthetic_cas')
            self.assertEqual(command[command.index('-U') + 1], 'postgres')
            safe_env = run.call_args.kwargs['env']
            self.assertNotIn('PGHOSTADDR', safe_env)
            self.assertNotIn('PGSERVICE', safe_env)
            self.assertNotIn('PGOPTIONS', safe_env)


if __name__ == '__main__':
    unittest.main()
