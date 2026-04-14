#!/usr/bin/env python3
"""Fix the silicon-carbon anode image path in data.json"""
import json

with open('/workspace/lithium-tracking/docs/data.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for p in d.get('currentPapers', []):
    if p['id'] == '2417':
        old = p['imageUrl']
        p['imageUrl'] = './images/si_c_anode_6500mahg_science_2026.jpg'
        print(f'✅ Updated 2417: {old} -> {p["imageUrl"]}')

with open('/workspace/lithium-tracking/docs/data.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
print('✅ data.json saved')
