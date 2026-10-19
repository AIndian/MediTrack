"""Summarize all app LCOV records and enforce the 60% line-coverage floor."""
from pathlib import Path
import argparse
import html
import sys
root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--react', action='store_true', help='Report React src/ coverage separately')
args = parser.parse_args()
source_dir = 'src' if args.react else 'lib'
extensions = {'.js', '.jsx'} if args.react else {'.dart'}
if args.react:
    root = root / 'react'
(root / 'reports').mkdir(exist_ok=True)
records = {}
current = None
for line in (root / 'coverage/lcov.info').read_text(encoding='utf-8').splitlines():
    if line.startswith('SF:'):
        current = line[3:].replace('\\', '/')
        if Path(current).is_absolute():
            current = Path(current).relative_to(root).as_posix()
        records.setdefault(current, {})
    elif line.startswith('DA:') and current:
        number, hits, *_ = line[3:].split(',')
        records[current][int(number)] = records[current].get(int(number), 0) + int(hits)
expected = {p.relative_to(root).as_posix() for p in (root / source_dir).rglob('*') if p.suffix in extensions}
if not expected:
    sys.exit('No application source files found')
if expected - records.keys():
    sys.exit(f'Missing app files in coverage: {expected - records.keys()}')
if records.keys() - expected:
    sys.exit(f'Unexpected files in app coverage: {records.keys() - expected}')
if any(not records[p] for p in expected):
    sys.exit('Application file has no instrumented lines')
rows = [(p, sum(v > 0 for v in lines.values()), len(lines)) for p, lines in sorted(records.items())]
hit, total = sum(r[1] for r in rows), sum(r[2] for r in rows)
percent = 100 * hit / total if total else 0
summary = f'Application line coverage: {hit}/{total} = {percent:.2f}% (minimum 60%)'
(root / 'reports/coverage-summary.txt').write_text(summary + '\n' + '\n'.join(f'{p}: {h}/{n} ({100*h/n:.2f}%)' for p,h,n in rows) + '\n', encoding='utf-8')
body = ''
for p,h,n in rows:
    source = root / p
    detail = '\n'.join(f'<span class="{"hit" if records[p].get(i, 0) else "miss" if i in records[p] else "plain"}">{i:4} {html.escape(line)}</span>' for i,line in enumerate(source.read_text(encoding='utf-8').splitlines(),1))
    body += f'<h2>{html.escape(p)} — {h}/{n} ({100*h/n:.2f}%)</h2><details><summary>Line-by-line coverage</summary><pre>{detail}</pre></details>'
(root / 'reports/coverage.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>MediTrack coverage</title><style>body{font:16px/1.6 system-ui;margin:40px;color:#183B42;background:#F6FAF9}pre{overflow:auto}pre span{display:block}.hit{background:#E3F4E9}.miss{background:#FDE8EA}summary{cursor:pointer}</style><h1>'+summary+f'</h1><p>All application files under {source_dir}/ included. Green: executed; pink: unexecuted; plain: not instrumented. This is line coverage, not branch coverage.</p>'+body+'</html>', encoding='utf-8')
print(summary)
if percent < 60:
    sys.exit('Coverage below required minimum')
