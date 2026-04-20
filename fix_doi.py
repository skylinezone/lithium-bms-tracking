import json

with open('docs/data.json') as f:
    d = json.load(f)

# Replace h2-sensor-tr-2026 with the new thermal runaway paper
for i, p in enumerate(d['currentPapers']):
    if p['id'] == 'h2-sensor-tr-2026':
        d['currentPapers'][i] = {
            "id": "tr-mechstress-2025",
            "titleCn": "基于应力从指数增长向线性增长转变点识别的锂离子电池热失控新型预警方法",
            "title": "A novel early warning method for thermal runaway of lithium-ion batteries based on mechanical stress exponential-to-linear growth transition detection",
            "category": "热失控应力预警",
            "direction": "热失控预警与安全",
            "keyPoints": [
                "提出基于机械应力从指数增长向线性增长转变点识别的新型热失控预警方法，在安全阀开启前即可预测热失控",
                "预警时间超过30分钟，在安全阀开启前发出预警，为BMS紧急响应提供充裕时间窗口",
                "基于应力分布模式分析，优化压力传感器布置位置，降低硬件成本的同时保证检测可靠性",
                "机械应力信号可通过电池外壳应变片或嵌入式压力传感器获取，无需电池内部侵入式测量",
                "该方法与热失控链式反应模型结合，可实现从正常→应力预警→安全阀开启→热失控的全流程监控"
            ],
            "bmsValue": [
                "机械应力信号采集成本低（外壳应变片），BMS可据此在安全阀开启前30分钟触发冷却系统和故障隔离",
                "优化压力传感器布置方案可减少传感器数量（从每个电芯1个降至每模组1个），降低BMS硬件成本",
                "应力-温度双参数融合比单一温度参数SOS更早预警，BMS热安全三级预警体系可基于此方法重构"
            ],
            "imageUrl": "./images/battery-failure-diagnosis-deep-learning-srep-2026.jpg",
            "summary": "Process Safety and Environmental Protection (PSEP, Elsevier) 2025论文，通过识别机械应力从指数增长向线性增长的转变点，在安全阀开启前30分钟以上实现热失控提前预警，基于应力分布模式优化传感器布置，为BMS热安全管理提供低成本高可靠的应力监测方案。",
            "source": "Process Safety and Environmental Protection",
            "doi": "10.1016/j.psep.2025.107626",
            "publishDate": "2025-06-01",
            "views": 11
        }
        print("Replaced h2-sensor-tr-2026 with tr-mechstress-2025")
        break

# Verify no duplicate DOI
known = {}
for h in d.get('history', []):
    for p in h['papers']:
        known[p['doi']] = p['id']

for p in d.get('currentPapers', []):
    if p['doi'] in known:
        print(f"ERROR: duplicate DOI {p['doi']} for {p['id']}")
    else:
        known[p['doi']] = p['id']
        print(f"OK: {p['id']} | {p['doi']}")

with open('docs/data.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)

print("Saved successfully")
print(f"currentPapers count: {len(d['currentPapers'])}")
