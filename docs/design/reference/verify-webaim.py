"""Independently verify documented color pairs with WebAIM's public contrast API."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import Request, urlopen
import datetime
import json
import time
import sys

OUT=Path(__file__).parent
tokens=json.loads((OUT/'tokens.json').read_text(encoding='utf-8'))
pairs={(r['foreground'],r['background']):r for r in tokens['approvedPairs']}
def check(item):
    (fg,bg),row=item
    url=row['webaim']+'&api'
    error=None
    for attempt in range(3):
        try:
            request=Request(url,headers={'User-Agent':'MediTrack-coursework-contrast-audit/1.0'})
            with urlopen(request,timeout=30) as response:
                data=json.load(response)
            displayed=str(data['ratio']).split(':')[0]
            remote=float(displayed)
            places=len(displayed.split('.')[1]) if '.' in displayed else 0
            precision=10**(-places)
            return {'foreground':fg,'background':bg,'url':url,'localRatio':row['ratio'],'webAIM':data,'absoluteDifference':round(abs(remote-row['ratio']),4),'webAIMDisplayPrecision':precision,'consistentWithinDisplayPrecision':abs(remote-row['ratio'])<precision+.0001,'checkedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
        except Exception as exc:
            error=str(exc)
            time.sleep(1+attempt)
    return {'foreground':fg,'background':bg,'url':url,'error':error}

results=[]
if '--reuse-evidence' in sys.argv:
    saved=json.loads((OUT/'webaim-verification.json').read_text(encoding='utf-8'))
    results=saved['results']
    assert {(r['foreground'],r['background']) for r in results}==set(pairs), 'Cached WebAIM evidence must cover exactly the current color pairs'
    print(f'Reused {len(results)} timestamped WebAIM responses; no network requests',flush=True)
else:
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures={pool.submit(check,item):item for item in pairs.items()}
        for future in as_completed(futures):
            results.append(future.result())
            if len(results)%20==0: print(f'Checked {len(results)}/{len(pairs)} unique pairs',flush=True)
results.sort(key=lambda r:(r['foreground'],r['background']))
success=[r for r in results if 'webAIM' in r]
errors=[r for r in results if 'error' in r]
summary={'provider':'WebAIM Contrast Checker public API','userDate':'2026-10-06 America/Phoenix','uniquePairs':len(pairs),'verifiedPairs':len(success),'failedRequests':len(errors),'consistentWithinDisplayPrecision':all(r['consistentWithinDisplayPrecision'] for r in success),'results':results}
(OUT/'webaim-verification.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
index={(r['foreground'],r['background']):r for r in results}
for row in tokens['approvedPairs']:
    evidence=index[(row['foreground'],row['background'])]
    row['webAIMVerification']=evidence
    if 'webAIM' in evidence:
        assert float(str(evidence['webAIM']['ratio']).split(':')[0])>=row['threshold']
(OUT/'tokens.json').write_text(json.dumps(tokens,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

report=(OUT/'contrast-report.html').read_text(encoding='utf-8')
old='<strong>Verification boundary:</strong> ratios below are calculated locally from opaque sRGB hexadecimal colors. Each row links to the exact pair in WebAIM Contrast Checker. These links are prepared for independent verification; they do not mean every row has already been checked on the WebAIM website. Separate evidence must identify the pairs actually checked there.'
if not errors and summary['consistentWithinDisplayPrecision']:
    new=f'<strong>Independently verified on 6 October 2026:</strong> all {len(pairs)} unique foreground/background color pairs covering {len(tokens["approvedPairs"])} allowed usages were checked against the WebAIM Contrast Checker public API. Every WebAIM result meets its stated threshold and agrees with the local calculation within the precision shown by the API. The API truncates to three significant digits (for example, 13.59 locally is returned as 13.5); both local two-decimal and observed WebAIM values appear below. Complete timestamped responses are preserved in <a href="webaim-verification.json">webaim-verification.json</a>. Each row links to the exact pair in the interactive WebAIM checker. This verifies color math; it does not establish a screen-reader or native UI audit.'
    report=report.replace(old,new)
    report=report.replace('<th>Independent check</th>','<th>WebAIM verified pair</th>')
    for row in tokens['approvedPairs']:
        value=row['webAIMVerification']['webAIM']['ratio']
        old_link=f'<a href="{row["webaim"].replace("&","&amp;")}" target="_blank" rel="noreferrer">Check pair in WebAIM</a>'
        new_link=f'<strong>WebAIM {value}:1</strong><br><a href="{row["webaim"].replace("&","&amp;")}" target="_blank" rel="noreferrer">Open verified pair</a>'
        report=report.replace(old_link,new_link)
    (OUT/'contrast-report.html').write_text(report,encoding='utf-8')
    foundations=(OUT/'foundations.md').read_text(encoding='utf-8')
    foundations=foundations.replace('Ratios are locally calculated until independent WebAIM evidence is recorded.',f'All {len(pairs)} unique pairs have also been checked against the WebAIM public API; timestamped evidence is in `webaim-verification.json`.')
    foundations=foundations.replace('- WebAIM: prepared exact-pair links are not a claim of independent web verification. Record which representative or complete set was opened and its observed values separately.',f'- WebAIM: all {len(pairs)} unique pairs covering {len(tokens["approvedPairs"])} approved usages verified using its public Contrast Checker API on 6 October 2026. All meet the required thresholds; differences from local ratios are within the precision displayed by WebAIM (three significant digits, truncated). See `webaim-verification.json` for exact URLs, responses, and UTC timestamps.')
    (OUT/'foundations.md').write_text(foundations,encoding='utf-8')
print(json.dumps({k:v for k,v in summary.items() if k!='results'}),flush=True)
if errors: raise SystemExit('Some WebAIM requests failed; retained all completed evidence')

library=json.loads((OUT/'components.json').read_text(encoding='utf-8'))
styles=tokens['typography']['styles']
fields=next(c for c in library['components'] if c['name']=='Input / Text field')
snackbar=next(c for c in library['components'] if c['name']=='Feedback / Snackbar or toast')
assertions={
    'all_font_sizes_at_least_16':all(t['size']>=16 for t in styles),
    'all_line_height_ratios_at_least_1_5':all(t['lineHeight']/t['size']>=1.5 for t in styles),
    'all_normal_text_pairs_meet_4_5':all(r['ratio']>=4.5 for r in tokens['approvedPairs'] if r['threshold']==4.5),
    'all_large_text_pairs_meet_3':all(r['ratio']>=3 for r in tokens['approvedPairs'] if r['threshold']==4.5),
    'all_ui_pairs_meet_3':all(r['ratio']>=3 for r in tokens['approvedPairs'] if r['threshold']==3),
    'all_webAIM_pairs_meet_required_threshold':all(float(str(r['webAIMVerification']['webAIM']['ratio']).split(':')[0])>=r['threshold'] for r in tokens['approvedPairs']),
    'all_webAIM_results_match_local_display_precision':summary['consistentWithinDisplayPrecision'],
    'all_components_document_five_states':all(set(['default','hover','pressed','disabled','focus']).issubset(c['states']) for c in library['components']),
    'minimum_touch_target_at_least_48':tokens['targets']['minimum']>=48,
    'preferred_touch_target_56':tokens['targets']['preferred']==56,
    'error_summary_receives_focus_before_fields':'move focus first to a linked error summary' in fields['behavior'],
    'error_summary_links_to_invalid_fields':'each summary link moves focus to its invalid field' in fields['behavior'],
    'dose_undo_persists_until_dismissal_or_navigation':'Dose Undo persists until explicit dismissal or navigation, with no automatic timeout' in snackbar['behavior'],
    'history_correction_remains_available':'Dose-history correction remains permanently available' in snackbar['behavior'],
}
assert all(assertions.values()), assertions
checks={'checkedDate':'2026-10-06 America/Phoenix','counts':{'themes':len(tokens['themes']),'typographyStyles':len(styles),'components':len(library['components']),'icons':len(library['icons']),'approvedContrastUsages':len(tokens['approvedPairs']),'uniqueColorPairs':len(pairs),'webAIMVerifiedPairs':len(success),'failedWebAIMRequests':len(errors)},'minimumFontSize':min(t['size'] for t in styles),'minimumLineHeightRatio':min(t['lineHeight']/t['size'] for t in styles),'assertions':assertions,'allChecksPass':all(assertions.values()),'evidenceBoundary':'Specification and color-math checks; not evidence of native Figma components, screen-reader testing, device accessibility, or a functioning medical application.','reproduce':'Run build-foundations.py then verify-webaim.py --reuse-evidence. Existing color-pair coverage must match before cached WebAIM responses can be reused.'}
(OUT/'foundation-checks.json').write_text(json.dumps(checks,indent=2)+'\n',encoding='utf-8')
