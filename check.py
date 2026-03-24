#!/usr/bin/env python3
import json
import os

# Read data
with open('docs/data.json', 'r') as f:
    data = json.load(f)

# Step 5: DOI deduplication
current_dois = set()
history_dois = set()
duplicate_dois = []

for p in data['currentPapers']:
    if p.get('doi'):
        if p['doi'] in history_dois:
            duplicate_dois.append((p['id'], p['doi'], 'in history'))
            print(f"⚠️ currentPapers {p['id']} DOI {p['doi']} already in history")
        elif p['doi'] in current_dois:
            duplicate_dois.append((p['id'], p['doi'], 'duplicate in current'))
            print(f"⚠️ currentPapers {p['id']} DOI {p['doi']} duplicate in current")
        else:
            current_dois.add(p['doi'])

for h in data['history']:
    for p in h['papers']:
        if p.get('doi'):
            history_dois.add(p['doi'])

cp_count = len(data['currentPapers'])
hist_count = sum(len(h['papers']) for h in data['history'])

print(f"\n✅ DOI去重检查:")
print(f"   currentPapers: {cp_count} 篇")
print(f"   history papers: {hist_count} 篇")
print(f"   总计: {cp_count + hist_count} 篇")
print(f"   重复DOI数量: {len(duplicate_dois)}")
print(f"   所有DOI唯一: {len(duplicate_dois) == 0}")

# Step 6: Image path existence check
base = 'docs/images/'
errors = []
for p in data.get('currentPapers', []):
    img = p.get('imageUrl', '')
    if img:
        fname = os.path.basename(img)
        if not os.path.exists(base + fname):
            errors.append(f'currentPapers {p["id"]} img missing: {fname}')
        else:
            size = os.path.getsize(base + fname)
            if size < 5000:
                errors.append(f'currentPapers {p["id"]} img too small: {fname} ({size}B)')

for h in data.get('history', []):
    for p in h['papers']:
        img = p.get('imageUrl', '')
        if img:
            fname = os.path.basename(img)
            if not os.path.exists(base + fname):
                errors.append(f'history {h["date"]} {p["id"]} img missing: {fname}')

if errors:
    print('\n❌ 图片缺失:')
    for e in errors:
        print(f'   {e}')
else:
    print('\n✅ 所有图片路径有效')

# Step 7: Required fields check
field_errors = []
required = ['titleCn', 'keyPoints', 'bmsValue', 'imageUrl', 'direction', 'doi', 'publishDate']
for p in data.get('currentPapers', []):
    for f in required:
        if f not in p or not p[f]:
            field_errors.append(f'cp id={p["id"]} missing {f}')

for h in data.get('history', []):
    for p in h['papers']:
        for f in ['titleCn', 'keyPoints', 'bmsValue', 'imageUrl']:
            if f not in p or not p[f]:
                field_errors.append(f'history {h["date"]} id={p["id"]} missing {f}')

if field_errors:
    print('\n❌ 字段缺失:')
    for e in field_errors:
        print(f'   {e}')
else:
    print('✅ 所有字段完整')
    
print(f'\n📊 最终统计:')
print(f'   updateDate: {data["updateDate"]}')
print(f'   currentPapers: {cp_count} 篇')
print(f'   history: {hist_count} 篇')
print(f'   总计: {cp_count + hist_count} 篇')
