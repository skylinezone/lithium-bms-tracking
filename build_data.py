import json, shutil

with open('/workspace/lithium-tracking/docs/data.json') as f:
    old = json.load(f)

with open('/workspace/lithium-tracking/new_papers.json') as f:
    new_papers = json.load(f)

existing_dois = set()
for h in old['history']:
    for p in h['papers']:
        existing_dois.add(p.get('doi',''))
for p in old['currentPapers']:
    existing_dois.add(p.get('doi',''))

print(f"Existing DOIs: {len(existing_dois)}")

kept = []
skipped_ids = []
for p in new_papers:
    doi = p.get('doi','')
    if doi in existing_dois:
        skipped_ids.append(p['id'])
        print(f"SKIP id={p['id']} doi={doi[:50]}")
    else:
        kept.append(p)
        existing_dois.add(doi)
        print(f"KEEP id={p['id']} dir={p['direction']}")

new_history_entry = {"date": "2026-03-20", "papers": old['currentPapers']}

new_data = {
    "updateDate": "2026-03-21",
    "currentPapers": kept,
    "history": [new_history_entry] + old['history']
}

with open('/workspace/lithium-tracking/docs/data.json', 'w', encoding='utf-8') as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

total = sum(len(h['papers']) for h in new_data['history']) + len(new_data['currentPapers'])
print(f"\nFinal: currentPapers={len(new_data['currentPapers'])}, history={len(new_data['history'])}, total={total}")
print(f"UpdateDate: {new_data['updateDate']}")
print("Done!")
