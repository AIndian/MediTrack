#!/usr/bin/env python3
"""Run the same checks locally and in CI; no Python packages required."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--web', action='store_true', help='Also build the web release')
args = parser.parse_args()
flutter = shutil.which('flutter')
dart = shutil.which('dart')
if not flutter or not dart:
    sys.exit('Install Flutter and add its bin directory to PATH. See README.md.')
required = (root / '.flutter-version').read_text().strip()
# A newly cloned SDK may print first-run setup messages before its JSON.
# Complete that initialization before requesting machine-readable output.
subprocess.run([flutter, '--version'], cwd=root, check=True)
installed = json.loads(subprocess.check_output([flutter, '--version', '--machine'], cwd=root, text=True))
if installed['frameworkVersion'] != required:
    sys.exit(f"Use Flutter {required}; found {installed['frameworkVersion']}.")

def run(*command):
    print('\n> ' + ' '.join(command), flush=True)
    subprocess.run(command, cwd=root, check=True)

try:
    run(flutter, 'pub', 'get', '--enforce-lockfile')
    run(dart, 'format', '--output=none', '--set-exit-if-changed', 'lib', 'test', 'tool/preview_test.dart')
    run(flutter, 'analyze')
    run(flutter, 'test', '--coverage', '--reporter=expanded')
    run(sys.executable, 'tool/coverage_report.py')
    if args.web:
        run(flutter, 'build', 'web', '--release')
except subprocess.CalledProcessError as error:
    sys.exit(error.returncode)
print('\nAll checks passed.')
