#!/bin/bash
# 锂电文献追踪 - 每日自检脚本
# 用法: bash scripts/daily-check.sh
# 退出码: 0=全部通过, 1=有问题

set -e
cd /workspace/lithium-tracking

echo "=== ① DOI去重检查 ==="
python3 -c "
import json
with open('docs/data.json') as f: d=json.load(f)
doi_map = {}
for p in d.get('currentPapers',[]):
    doi = p.get('doi','')
    if doi: doi_map.setdefault(doi,[]).append(('cp',p['id']))
for h in d.get('history',[]):
    for p in h['papers']:
        doi = p.get('doi','')
        if doi: doi_map.setdefault(doi,[]).append(('hist',p['id']))
dups = {k:v for k,v in doi_map.items() if len(v)>1}
if dups:
    for k,v in dups.items():
        print(f'❌ 重复DOI: {k}')
        for s,i in v: print(f'   [{s}] id={i}')
    exit(1)
cp = len(d.get('currentPapers',[]))
hist = sum(len(h['papers']) for h in d.get('history',[]))
print(f'✅ 无DOI重复: currentPapers={cp}, history={hist}, 总计={cp+hist}')
"

echo ""
echo "=== ② 图片路径存在性检查 ==="
python3 -c "
import json,os
with open('docs/data.json') as f: d=json.load(f)
base = 'docs/images/'
errors = []
for p in d.get('currentPapers',[]):
    fname = os.path.basename(p['imageUrl'])
    if not os.path.exists(base+fname):
        errors.append(f'cp id={p[\"id\"]} img missing: {fname}')
for h in d.get('history',[]):
    for p in h['papers']:
        fname = os.path.basename(p['imageUrl'])
        if not os.path.exists(base+fname):
            errors.append(f'hist {h[\"date\"]} id={p[\"id\"]} img missing: {fname}')
if errors:
    for e in errors: print(f'❌ {e}')
    exit(1)
print('✅ 所有图片路径有效')
"

echo ""
echo "=== ③ 必填字段完整性检查 ==="
python3 -c "
import json
with open('docs/data.json') as f: d=json.load(f)
errors = []
for p in d.get('currentPapers',[]):
    for field in ['titleCn','keyPoints','bmsValue','imageUrl','direction','doi','publishDate']:
        val = p.get(field)
        if not val or (isinstance(val,list) and len(val)==0):
            errors.append(f'cp id={p[\"id\"]} missing {field}')
for h in d.get('history',[]):
    for p in h['papers']:
        for field in ['titleCn','keyPoints','bmsValue','imageUrl']:
            val = p.get(field)
            if not val or (isinstance(val,list) and len(val)==0):
                errors.append(f'hist {h[\"date\"]} id={p[\"id\"]} missing {field}')
if errors:
    for e in errors: print(f'❌ {e}')
    exit(1)
cp = len(d.get('currentPapers',[]))
hist = sum(len(h['papers']) for h in d.get('history',[]))
print(f'✅ 所有字段完整: currentPapers={cp}, history={hist}, 总计={cp+hist}')
"

echo ""
echo "=== ④ updateDate 检查 ==="
python3 -c "
import json
from datetime import date
with open('docs/data.json') as f: d=json.load(f)
today = date.today().strftime('%Y-%m-%d')
if d.get('updateDate') != today:
    print(f'⚠️  updateDate={d.get(\"updateDate\")}，应为{today}')
    exit(1)
print(f'✅ updateDate={today}')
"

echo ""
echo "=== 全部检查通过 ✅ ==="
