"""Summarize all app LCOV records and enforce the 60% line-coverage floor."""
from pathlib import Path
import html
import sys
root = Path(__file__).resolve().parents[1]
(root / 'reports').mkdir(exist_ok=True)
records = {}
current = None
for line in (root / 'coverage/lcov.info').read_text().splitlines():
    if line.startswith('SF:'):
        current = line[3:]
        records.setdefault(current, {})
    elif line.startswith('DA:') and current:
        number, hits, *_ = line[3:].split(',')
        records[current][int(number)] = records[current].get(int(number), 0) + int(hits)
expected = {str(p.relative_to(root)) for p in (root / 'lib').rglob('*.dart')}
normalized = {str(Path(p).relative_to(root)) if Path(p).is_absolute() else p for p in records}
if expected - normalized:
    sys.exit(f'Missing app files in coverage: {expected - normalized}')
rows = [(p, sum(v > 0 for v in lines.values()), len(lines)) for p, lines in sorted(records.items())]
hit, total = sum(r[1] for r in rows), sum(r[2] for r in rows)
percent = 100 * hit / total if total else 0
summary = f'Application line coverage: {hit}/{total} = {percent:.2f}% (minimum 60%)'
(root / 'reports/coverage-summary.txt').write_text(summary + '\n' + '\n'.join(f'{p}: {h}/{n} ({100*h/n:.2f}%)' for p,h,n in rows) + '\n')
body = ''
for p,h,n in rows:
    source = root / p
    detail = '\n'.join(f'<span class="{"hit" if records[p].get(i, 0) else "miss" if i in records[p] else "plain"}">{i:4} {html.escape(line)}</span>' for i,line in enumerate(source.read_text().splitlines(),1))
    body += f'<h2>{html.escape(p)} — {h}/{n} ({100*h/n:.2f}%)</h2><details><summary>Line-by-line coverage</summary><pre>{detail}</pre></details>'
(root / 'reports/coverage.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>MediTrack coverage</title><style>body{font:16px/1.6 system-ui;margin:40px;color:#183B42;background:#F6FAF9}pre{overflow:auto}pre span{display:block}.hit{background:#E3F4E9}.miss{background:#FDE8EA}summary{cursor:pointer}</style><h1>'+summary+'</h1><p>All lib/*.dart files included. Green: executed; pink: unexecuted; plain: not instrumented. This is line coverage, not branch coverage.</p>'+body+'</html>')
print(summary)
if percent < 60:
    sys.exit('Coverage below required minimum')
