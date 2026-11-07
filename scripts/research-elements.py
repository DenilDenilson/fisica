"""Refresh a local RSC appearance audit; downloaded pages are not distributed."""
import json, re, subprocess, concurrent.futures
from pathlib import Path
snapshot=Path('/tmp/fisica-periodic.json')
subprocess.run(['curl','-fsSL','--max-time','30','https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON','-o',str(snapshot)],check=True)
raw=json.loads(snapshot.read_text())['Table']
cols=raw['Columns']['Column']
rows=[dict(zip(cols,r['Cell'])) for r in raw['Row']]
def fetch(row):
 n=int(row['AtomicNumber']); slug=row['Name'].lower()
 url=f'https://periodic-table.rsc.org/element/{n}/{slug}'
 p=subprocess.run(['curl','-fsSL','--max-time','20',url],capture_output=True,text=True)
 html=p.stdout
 text=re.sub(r'<[^>]+>',' ',html)
 text=re.sub(r'\s+',' ',text)
 m=re.search(r'Appearance</strong>.*?class="accordian_details">(.*?)</div>',html,re.S)
 return {'number':n,'url':url,'appearance':re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',m.group(1))).strip() if m else None,'retrieved':p.returncode==0}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 audit=list(pool.map(fetch,rows))
Path('/tmp/fisica-rsc-audit.json').write_text(json.dumps(audit,indent=2))
print('RSC pages retrieved:',sum(r['retrieved'] for r in audit),'of',len(audit))
print('Appearances parsed:',sum(bool(r['appearance']) for r in audit))
print('Missing:',[r['number'] for r in audit if not r['appearance']])
