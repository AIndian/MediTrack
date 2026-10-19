"""Regression checks for the shared Flutter/React reporter, with synthetic LCOV."""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

REPORTER = Path(__file__).resolve().parents[3] / 'tool' / 'coverage_report.py'


class CoverageReportTest(unittest.TestCase):
    def test_both_targets_require_complete_coverage_and_enforce_the_floor(self):
        with tempfile.TemporaryDirectory() as folder:
            repo = Path(folder)
            (repo / 'tool').mkdir()
            shutil.copyfile(REPORTER, repo / 'tool' / 'coverage_report.py')
            for react in [False, True]:
                with self.subTest(react=react):
                    root = repo / 'react' if react else repo
                    source = 'src/app.jsx' if react else 'lib/app.dart'
                    (root / source).parent.mkdir(parents=True)
                    (root / source).write_text('first\nsecond\nthird\n', encoding='utf-8')
                    (root / 'coverage').mkdir()
                    lcov = root / 'coverage/lcov.info'
                    command = [sys.executable, str(repo / 'tool/coverage_report.py')]
                    if react:
                        command.append('--react')

                    def run(content):
                        lcov.write_text(content, encoding='utf-8')
                        return subprocess.run(command, capture_output=True, text=True)

                    for filename in [source, source.replace('/', '\\'), str(root / source)]:
                        result = run(f'SF:{filename}\nDA:1,1\nDA:2,1\nDA:3,0\nend_of_record\n')
                        self.assertEqual(result.returncode, 0, result.stderr)
                        self.assertIn('66.67%', (root / 'reports/coverage-summary.txt').read_text())
                        self.assertTrue((root / 'reports/coverage.html').is_file())
                    self.assertNotEqual(run(f'SF:{source}\nDA:1,1\nDA:2,0\nDA:3,0\n').returncode, 0)
                    self.assertNotEqual(run('').returncode, 0)
                    self.assertNotEqual(run(f'SF:{source}\nend_of_record\n').returncode, 0)
                    self.assertNotEqual(run('SF:unexpected.js\nDA:1,1\n').returncode, 0)
                    self.assertNotEqual(run(f'SF:{source}\nDA:1,1\nSF:extra.js\nDA:1,1\n').returncode, 0)


if __name__ == '__main__':
    unittest.main()
