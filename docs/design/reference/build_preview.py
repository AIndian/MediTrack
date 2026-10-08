"""Apply the checked token register to the dependency-free preview."""
import json
from pathlib import Path
import re

folder = Path(__file__).parent
path = folder / 'index.html'
html = path.read_text(encoding='utf-8')
tokens = json.loads((folder / 'tokens.json').read_text(encoding='utf-8'))
theme_map = {'background':'bg','surface':'surface','text':'text','muted':'secondary','primary':'primary','onBrand':'on-primary','border':'border','surfaceHover':'soft','accent':'accent','focus':'focus','success':'success','successSurface':'success-bg','warning':'warning','warningSurface':'warning-bg','error':'error','errorSurface':'error-bg','info':'info','infoSurface':'info-bg','primaryHover':'primary-hover','primaryPressed':'primary-pressed','surfaceHover':'surface-hover','surfacePressed':'surface-pressed','disabledSurface':'disabled-surface'}
css = []
for name, theme in tokens['themes'].items():
    selector = ':root,.device-viewport' if name == 'light' else '.device-viewport.dark'
    values = ';'.join('--'+dest+':'+theme[src] for src,dest in theme_map.items())
    values += ';--soft:'+theme['surfaceHover']
    css.append(selector+'{'+values+'}')
css.append('''
:root{--brand:#176B5B;--ink:#16332D;--muted:#4F665F;--paper:#FFF;--mint:#E8F3EE}
.device-viewport{font-size:calc(18px * var(--scale))}.device-viewport h1{font-size:1.666667em;font-weight:700}.device-viewport h2{font-size:1.444444em;font-weight:700}.device-viewport h3,.medicine-title h2,.medicine-title h3{font-size:1.333333em;font-weight:600}.device-viewport .section-label h2{font-size:1.222222em;font-weight:600}.device-viewport .small,.device-viewport .nav-label,.device-viewport .btn,.device-viewport .badge,.device-viewport .field>span,.device-viewport .field input,.device-viewport .field select{font-size:.888889em}.screen-body{padding:24px 16px 28px}.card{border-radius:20px;padding:16px}.card.emphasis{padding:15px}.btn-row{gap:16px}.btn+.btn{margin-top:16px}.annotation{background:var(--focus);color:var(--surface)}.device-viewport.dark .annotation{color:#101D19}.large-type .bottom-nav .nav-item{overflow-wrap:anywhere;min-width:0}.large-type .nav-label{font-size:.888889em}.device-viewport :focus-visible{outline:3px solid var(--focus);outline-offset:3px;box-shadow:0 0 0 3px var(--surface)}.btn:hover:not(:disabled){filter:none;background:var(--primary-hover);border-color:var(--primary-hover)}.btn:active:not(:disabled){filter:none;background:var(--primary-pressed);border-color:var(--primary-pressed)}.btn.secondary:hover:not(:disabled),.btn.text:hover:not(:disabled),.list-item:hover:not(:disabled),.icon-button:hover:not(:disabled){filter:none;background:var(--surface-hover);border-color:var(--primary);color:var(--primary)}.btn.secondary:active:not(:disabled),.btn.text:active:not(:disabled),.list-item:active:not(:disabled),.icon-button:active:not(:disabled){background:var(--surface-pressed);color:var(--primary)}.btn.danger:hover:not(:disabled){color:var(--error);background:var(--error-bg);border-color:var(--error)}.btn:disabled{background:var(--disabled-surface);color:var(--secondary);border-color:var(--border)}.state-demo .state-hover{filter:none;background:var(--primary-hover)}.state-demo .state-press{filter:none;background:var(--primary-pressed)}.note-number{background:#5C3CB7}.app-header{padding-left:16px;padding-right:16px}.list-item .item-copy strong{font-size:1.111111em}.list-item .item-copy span{font-size:1em}.device-viewport .app-header .app-brand{font-size:1em}.device-viewport .large-type{overflow-wrap:anywhere}.device-viewport input,.device-viewport select,.device-viewport textarea{min-width:0}.device-viewport .list-item{overflow-wrap:anywhere}.gallery .btn{width:auto;min-width:180px}.state-demo .btn{width:100%;min-width:0}.dialog{font-size:18px}.dialog .btn{font-size:16px}.error-summary{border:2px solid var(--error);padding:16px;background:var(--error-bg);border-radius:12px;color:var(--error);margin-bottom:16px}.error-summary a{color:var(--error)}
@container(min-width:700px){.rail{width:184px}.screen-body{padding:24px}.screen-columns{display:block}.side-content{margin-top:24px}.large-type .rail{width:185px}}
@container(min-width:1000px){.screen-columns{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(250px,.9fr);gap:24px}.side-content{margin-top:0}.large-type .screen-columns{display:block}}
.device-frame:not(.tablet) .landscape .rail{display:none}.device-frame:not(.tablet) .landscape .bottom-nav{display:grid}.device-frame:not(.tablet) .landscape .screen-columns{display:block}.device-frame:not(.tablet) .landscape .screen-body{max-width:680px;margin:auto}.device-frame:not(.tablet) .landscape .app-header{padding-top:6px;padding-bottom:6px}.device-frame:not(.tablet) .landscape .status-bar{display:none}
''')
html = re.sub(r'<style id="final-tokens">.*?</style>', '', html, flags=re.S)
html = html.replace('</head>', '<style id="final-tokens">'+''.join(css)+'</style>\n</head>')
mapped_themes={}
for name,t in tokens['themes'].items():
    mapped_themes[name.title()] = {'background':t['background'],'surface':t['surface'],'text':t['text'],'secondary':t['muted'],'primary':t['primary'],'onPrimary':t['onBrand'],'border':t['border'],'soft':t['surfaceHover'],'accent':t['accent'],'focus':t['focus'],'success':t['success'],'successBg':t['successSurface'],'warning':t['warning'],'warningBg':t['warningSurface'],'error':t['error'],'errorBg':t['errorSurface'],'info':t['info'],'infoBg':t['infoSurface']}
html = re.sub(r'const themes=\{.*?\};\nfunction foundations', 'const themes='+json.dumps(mapped_themes,separators=(',',':'))+';\nconst approvedPairs='+json.dumps(tokens['approvedPairs'],separators=(',',':'))+';\nfunction foundations', html, flags=re.S)
html = re.sub(r'const approvedPairs=.*?;\nconst approvedPairs=', 'const approvedPairs=',html,flags=re.S)
# Use the same complete color register as the submitted specification.
if 'rows=approvedPairs.map' not in html:
    html = html.replace("document.getElementById('foundationsContent').innerHTML=", "rows=approvedPairs.map(p=>`<tr><td>${p.theme}</td><td>${p.purpose} · ${p.foregroundToken} / ${p.backgroundToken}</td><td>${p.foreground} / ${p.background}</td><td><a href=\"${p.webaim}\" target=\"_blank\" rel=\"noopener\"><strong>${p.ratio.toFixed(2)}:1</strong></a></td><td>Pass · ${p.threshold}:1<br>WebAIM ${p.webAIMVerification.webAIM.ratio}:1</td></tr>`).join('');document.getElementById('foundationsContent').innerHTML=")
replacements={
    "['Primary / Deep teal','#075E64'":"['Primary / Deep teal','#176B5B'",
    "['Secondary / Slate','#52686C','Supporting information']":"['Secondary / Blue','#275D8C','Secondary emphasis and supporting actions']",
    "['Accent / Violet','#674997','Accessibility annotations and emphasis']":"['Accent / Amber','#7A4B00','Limited visual emphasis; pair with a label']",
    "['H1','32 / 48','700','Screen title; one per screen']":"['H1','36 / 54','700','Occasional large page title; one H1 per screen']",
    "['H2','24 / 36','700','Major content section']":"['H2','30 / 45','700','Primary screen title styling']",
    "['H3','20 / 30','700','Medicine title or card heading']":"['H3','26 / 39','700','Tablet pane or dialog heading']",
    "['H4','18 / 27','650','Small section heading']":"['H4','24 / 36','600','Medicine and card headings']",
    "['H5','16 / 24','700','Grouped field heading']":"['H5','22 / 33','600','Time groups and subsections']",
    "['H6','16 / 24','600','Minor heading; avoid deep hierarchy']":"['H6','20 / 30','600','Small section heading']",
    "['Action','18 / 27','700','Primary action labels']":"['Label','16 / 24','600','Buttons, inputs, navigation, and badges']",
    'Use 4, 8, 12, 16, 20, 24, 32, and 40px. Screen padding: 20px phone / 32px tablet.':'Use 4, 8, 12, 16, 24, 32, and 48px. Screen padding: 16px phone / 24px tablet.',
    'Cards use 20px padding and 18px radius.':'Cards use 16px padding and 20px radius.',
    'Card 20px inset; rows ≥64px':'Card 16px inset; rows ≥64px',
    'All text pairings below use the stricter 4.5:1 target. Verify handoff tokens with the':'All 198 approved usages were checked locally and all 136 unique pairs were verified with the WebAIM API. Click any ratio to inspect the exact colors in the',
    'Mark as Taken':'Mark Taken',
    "title:'Time for your medicine'":"title:'Medication reminder'",
    'Heading “Time for your medicine”.':'Heading “Medication reminder”.',
    'Lisinopril':'Amlodipine',
    '10 mg':'5 mg',
    '7:00 AM':'8:00 AM',
    '7:03 AM':'8:02 AM',
    "supply:'30',refill:'5'":"supply:'8',refill:'10'",
    '30 tablets recorded. Low-supply reminder at 5 tablets.':'8 tablets recorded. Low-supply reminder at 10 tablets.',
    '<span>30</span>':'<span>8</span>',
    '<span>5 tablets</span>':'<span>10 tablets</span>',
    'Metformin: 30 tablets recorded':'Metformin: 8 tablets recorded · 1 refill recorded',
    "'1'} of 3 doses recorded":"'1'} of 4 doses recorded Taken",
    'aria-valuemax="3" aria-valuenow="${state.dose':'aria-valuemax="4" aria-valuenow="${state.dose',
    "state.dose==='Taken'?67:33":"state.dose==='Taken'?50:25",
    '<span>2 medicines</span>':'<span>3 medicines</span>',
    "${listItem('Metformin','500 mg · Twice daily','medication_detail','pill')}${listItem('Amlodipine','5 mg · Daily at 8:00 AM','medication_detail','pill')}":"${listItem('Amlodipine','5 mg · Daily at 8:00 AM','medication_detail','pill')}${listItem('Metformin','500 mg · Twice daily · Low supply','medication_detail','pill')}${listItem('Vitamin D3','1,000 IU · Daily at noon','medication_detail','pill')}",
    "<div class=\"list\">${listItem('Metformin · 500 mg','6:00 PM · 1 tablet','dose_reminder','clock')}</div>":"<div class=\"list\">${listItem('Vitamin D3 · 1,000 IU','12:00 PM · Upcoming','medication_detail','clock')}${listItem('Metformin · 500 mg','6:00 PM · Upcoming','dose_reminder','clock')}</div>",
    "${btn('Archive medicine','archive','danger')}":"${btn('Archive medicine','archive','secondary')}${btn('Remove medicine','remove','danger')}",
    "else if(name==='archive')":"else if(name==='remove')openDialog('Remove Metformin?',`<p>Remove this medicine record? Archive it instead if you want to keep the record.</p><p>Removal and history policy must be finalized in the implemented app. No real information is deleted by this prototype.</p>`,btn('Cancel','cancel','secondary')+btn('Remove in preview','archive-confirm','danger'));else if(name==='archive')",
    "document.getElementById('dialog').showModal()":"document.getElementById('dialog').showModal();document.getElementById('dialogTitle').setAttribute('tabindex','-1');document.getElementById('dialogTitle').focus()",
    "document.getElementById('formError').textContent='Enter the required medicine information before continuing.';el.focus();return":"const summary=document.getElementById('formError');summary.className='error-summary';summary.setAttribute('tabindex','-1');summary.innerHTML='Enter the required medicine information before continuing. <a href=\"#'+fields[invalid]+'\">Go to the missing field</a>';summary.focus();return",
    'September 30 – October 6, 2026':'September 29 – October 5, 2026',
    '<p class="summary-stat">18 <small>of 21 Taken</small></p>':'<p class="summary-stat">24 <small>of 28 Taken · 86%</small></p>',
    '2 Skipped · 1 Missed':'2 Skipped · 2 Missed',
    'Medicines · 2':'Medicines · 3',
    'None recorded in this period':'October 3 · Evening Metformin changed from 6:30 PM to 6:00 PM',
    'at 7 AM':'at 8 AM',
    '3px ring with 3px offset':'3px ring with a 3px surface-colored gap',
    'Hover: 6% darker. Press: 14% darker.':'Hover and press use the verified primaryHover and primaryPressed tokens.',
}
for old,new in replacements.items():
    html=html.replace(old,new)
# Interaction identity, native dialog scaling, and responsive presentation fixes.
fixes = {
    'data-go="${id}">${icon(ico)}<span class="item-copy">':'data-go="${id}" data-medicine="${title.startsWith(\'Amlodipine\')?\'Amlodipine\':title.startsWith(\'Vitamin D3\')?\'Vitamin D3\':\'Metformin\'}">${icon(ico)}<span class="item-copy">',
    "symptomSaved:false};":"symptomSaved:false,symptomRecord:null,otherDose:'Taken',selectedMedication:'Metformin',correctionTarget:'Metformin',undoRecord:null};",
    'if(go){if(document':'if(go){state.selectedMedication=go.dataset.medicine||\'Metformin\';if(document',
    "${medicineCard()}<div class=\"section-label\"><h2>Later today</h2>":"${medicineCard()}<div class=\"list\">${listItem('Amlodipine · 5 mg',state.otherDose+' · 8:00 AM · Recorded 8:02 AM','dose_history','check')}</div><div class=\"section-label\"><h2>Later today</h2>",
    "${listItem('Record a symptom','Save a note for your next visit','symptoms','symptom')}":"${listItem('Record a symptom','Save a note for your next visit','symptoms','symptom')}${listItem('Appointment summary','Prepare for your next visit','appointment_summary','report')}",
    "state.dose==='Due'?btn('Mark Taken','taken','','check')+btn('Skip dose','skip','secondary')":"state.dose==='Due'?btn('Mark Taken','taken','','check').replace('<button ','<button aria-label=\"Mark 8 AM Metformin dose Taken\" ')+btn('Skip dose','skip','secondary').replace('<button ','<button aria-label=\"Skip 8 AM Metformin dose\" ')",
    "${badge('Taken at 8:02 AM','success','check')}":"${badge(state.otherDose==='Taken'?'Taken at 8:02 AM':state.otherDose,state.otherDose==='Taken'?'success':'warning','check')}",
    "let dialogInvoker=null,previousDose='Due';":"let dialogInvoker=null,previousDose='Due';",
    "function recordDose(value){previousDose=state.dose;state.dose=value;state.snack=`Dose marked ${value}. Saved on this device.`;":"function recordDose(value){let target=state.correctionTarget||'Metformin';let key=target==='Amlodipine'?'otherDose':'dose';state.undoRecord={key,old:state[key]};state[key]=value;state.snack=`${target} marked ${value}. Saved on this device.`;",
    "function action(name){if(name==='taken')":"function action(name){if(name==='correct-other'){state.correctionTarget='Amlodipine';name='correct';}else if(['correct','taken','skip'].includes(name)){state.correctionTarget='Metformin';}if(name==='taken')",
    "state.dose=previousDose;state.snack='';":"if(state.undoRecord)state[state.undoRecord.key]=state.undoRecord.old;state.snack='';",
    '<p>Metformin · October 6 · 8:00 AM</p><fieldset>':'<p>${state.correctionTarget} · October 6 · 8:00 AM</p><fieldset>',
    "state.symptomSaved=true;renderScreen();":"state.symptomRecord={name:name.value.trim(),severity:document.querySelector('[name=\"severity\"]:checked').value,date:document.getElementById('symptom-date').value,time:document.getElementById('symptom-time').value,note:document.getElementById('symptom-note').value.trim()};state.symptomSaved=true;renderScreen();",
    "state.symptomSaved?'Headache':'Tiredness'":"state.symptomSaved?escapeHtml(state.symptomRecord.name):'Tiredness'",
    "state.symptomSaved?'Today · 9:15 AM':'October 5 · 3:30 PM'":"state.symptomSaved?escapeHtml(state.symptomRecord.date)+' · '+formatTime(state.symptomRecord.time):'October 4 · 2:15 PM'",
    "${badge('Mild','info')}":"${badge(state.symptomSaved?escapeHtml(state.symptomRecord.severity):'Mild','info')}",
    "state.symptomSaved?'Started after breakfast. I would like to mention this at my next visit.':'Felt tired in the afternoon. Added a note for my appointment.'":"state.symptomSaved?escapeHtml(state.symptomRecord.note):'Rested in the afternoon.'",
    '<p>Tiredness · Mild · October 5</p>':'<p>Tiredness · Mild · October 4 · 2:15 PM</p>',
    '<p>Headache · Mild · October 6</p>':'',
    'Symptoms · 2 notes':'Symptoms · 1 note',
    '<br>1 tablet · 8:00 AM</p></div></details>':'<br>1 tablet · 8:00 AM</p><p style="margin-top:15px"><strong>Vitamin D3 · 1,000 IU</strong><br>Daily · 12:00 PM</p></div></details>',
    "${switchRow('Caregiver access','Share selected information after review.','caregiver',state.toggles.careggiver)}":"${switchRow('Caregiver access','Share selected information after review.','caregiver',state.toggles.caregiver)}",
    "${switchRow('Allow schedule changes'":"${switchRow('Missed-dose alerts','Let an approved caregiver see missed-dose alerts.','caregiverAlerts',state.toggles.caregiverAlerts)}${switchRow('Allow schedule changes'",
    "['caregiver','edits','calendar'].includes(k)":"['caregiver','caregiverAlerts','edits','calendar'].includes(k)",
    "state.toggles[k]=!state.toggles[k];renderScreen();announce":"state.toggles[k]=!state.toggles[k];renderScreen();document.querySelector('#screenBody [data-switch=\"'+k+'\"]')?.focus();announce",
    "state.toggles[k]=true;closeDialog();renderScreen();announce":"state.toggles[k]=true;closeDialog();renderScreen();document.querySelector('#screenBody [data-switch=\"'+k+'\"]')?.focus();announce",
    '<h2>Saved on this device</h2><p class="subtext" style="margin-top:10px">':'<h2>Saved on this device</h2><button class="inline-link" data-action="sync-review">Review sync conflict example</button><p class="subtext" style="margin-top:10px">',
    "else if(name==='demo-loading')":"else if(name==='sync-review')openDialog('Review two saved versions',`<p>Both copies of the Metformin evening time are preserved until you choose.</p><div class=\"card\"><strong>On this device</strong><p>6:00 PM · Updated October 6 at 9:20 AM</p></div><div class=\"card\"><strong>Previously synced copy</strong><p>6:30 PM · Updated October 5 at 4:10 PM</p></div><p>No version is silently overwritten. This is a design example only.</p>`,btn('Keep both for now','cancel','secondary')+btn('Use this device version','sync-confirm'));else if(name==='sync-confirm'){closeDialog();openDialog('Choice saved in preview',`<p>The 6:00 PM version is selected. The alternative remains available in the review record; no actual sync occurs.</p>`,btn('Done','cancel'))}else if(name==='demo-loading')",
    'Focus enters the first choice':'Focus enters the dialog heading',
    'Dialog: focus enters the first choice':'Dialog: focus enters the dialog heading',
}
for old,new in fixes.items():
    if old in html:
        html=html.replace(old,new)
if "if(s==='medication_detail'&&state.selectedMedication" not in html:
    html=html.replace("if(s==='medication_form'){", """if(s==='medication_detail'&&state.selectedMedication!=='Metformin'){const med=state.selectedMedication;const amount=med==='Amlodipine'?'5 mg':'1,000 IU';const time=med==='Amlodipine'?'8:00 AM':'12:00 PM';main=`<article class="card"><h2>${mark(2)}${med}</h2><p class="subtext">${amount}</p><div class="detail-grid"><div class="term">Schedule</div><div class="value">Daily at ${time}</div><div class="term">Instructions saved by Margaret</div><div class="value">${med==='Amlodipine'?'Use the instructions saved from your prescription label.':'Instructions not added'}</div></div></article>${goto('View dose history','dose_history','secondary','history')}`;side=notice('This is a saved demonstration record. Open Metformin to explore the complete editing and refill flow.');}
if(s==='medication_form'){""")
extra_css='''<style id="preview-final-polish">
.workspace-stage{align-items:center;overflow:hidden}.device-frame{transform-origin:top center;flex:none}.large-type .bottom-nav .nav-item{flex-direction:column;align-items:center;padding:8px 4px}.large-type .bottom-nav .nav-label{white-space:normal;overflow-wrap:normal;word-break:normal;font-size:.888889em}.dialog{background:var(--surface);color:var(--text);border-color:var(--primary)}.dialog h2{font-size:1.444444em}.dialog p{color:var(--secondary)}.dialog .btn{font-size:.888889em}.dialog :focus-visible{outline:3px solid var(--focus);outline-offset:3px;box-shadow:0 0 0 3px var(--surface)}.dialog::backdrop{background:#101D1988}
</style>'''
html=re.sub(r'<style id="preview-final-polish">.*?</style>','',html,flags=re.S).replace('</head>',extra_css+'</head>')
extra_js='''
function fitFrame(){const stage=document.querySelector('.workspace-stage'),frame=document.getElementById('deviceFrame');const w=parseFloat(document.getElementById('deviceViewport').style.width)+20;const scale=Math.min(1,(stage.clientWidth-28)/w);frame.style.zoom=scale;const dialog=document.getElementById('dialog');const computed=getComputedStyle(document.getElementById('deviceViewport'));['bg','surface','text','secondary','primary','on-primary','border','subtle','soft','accent','focus','success','success-bg','warning','warning-bg','error','error-bg','info','info-bg','primary-hover','primary-pressed','surface-hover','surface-pressed','disabled-surface'].forEach(k=>dialog.style.setProperty('--'+k,computed.getPropertyValue('--'+k)));dialog.style.fontSize=(18*Number(state.text)/100)+'px';dialog.style.colorScheme=state.theme;document.getElementById('deviceCaption').textContent+=scale<.999?' · Fit '+Math.round(scale*100)+'%':'';}
new ResizeObserver(()=>{applySettings();fitFrame()}).observe(document.querySelector('.workspace-stage'));
document.addEventListener('click',e=>{if(e.target.closest('[data-setting]'))fitFrame()});document.getElementById('deviceSelect').addEventListener('change',fitFrame);fitFrame();
'''
if 'function fitFrame()' not in html:
    html=html.replace('window.MediTrackPreview=',extra_js+'\nwindow.MediTrackPreview=')
path.write_text(html,encoding='utf-8')
script=re.search(r'<script>(.*?)</script>',html,re.S).group(1)
(folder/'preview-syntax-check.js').write_text(script,encoding='utf-8')
print('Preview tokens synchronized. Check JavaScript syntax before browser QA.')
