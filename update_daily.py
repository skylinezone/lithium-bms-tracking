#!/usr/bin/env python3
import json
from datetime import date, timedelta

with open('docs/data.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

yesterday = (date(2026, 4, 18) - timedelta(days=1)).isoformat()
d['history'].insert(0, {"date": yesterday, "papers": d['currentPapers']})

d['currentPapers'] = [
  {
    "id": "2433",
    "titleCn": "硫化物/氯化物固体电解质策略解锁实用化全固态锂硫电池：离子电导率>3 mS/cm",
    "title": "Electrolyte strategies for practically viable all-solid-state lithium-sulfur batteries",
    "category": "固态电解质", "direction": "新材料体系",
    "keyPoints": [
      "系统评估硫化物、卤化物、硼氢化物三类固体电解质与硫正极/锂负极的界面兼容性，硫化物电解质（Li6-xPS5-xCl1+x）在离子电导率（>3 mS/cm）和界面接触两方面综合最优",
      "提出氯代硫银锗矿Li6-xPS5-xCl1+x（x=0~0.5）作为标准化固体电解质基准，解决文献中不同电解质体系无法横向比较的核心问题",
      "硫正极理论容量高达1672 mAh/g（单质硫），Li2S为1166 mAh/g，搭配硫化物电解质可实现>400 Wh/kg的活性物质级能量密度",
      "卤化物（Li3YCl6、Li3InCl6）和硼氢化物（LiBH4）在正极侧表现潜力，但离子电导率（<1 mS/cm）和空气稳定性仍需突破",
      "给出实用化电芯级目标参数：面积容量>4 mAh/cm2、N/P比<3、硫化物/硫复合正极硫含量>70wt%，推动ASSLSB从实验室走向工程化"
    ],
    "bmsValue": [
      "ASSLSB充电截止电压管理：硫正极工作电压窗口（1.7-2.8V）与传统锂电不同，BMS需重新标定充电截止电压策略以避免过充诱发硫化物电解质分解",
      "内阻在线监测：硫化物电解质阻抗（R_sei/R_ct）随循环演化可反映界面副反应程度，BMS通过EIS高频区特征实时追踪ASSLSB健康状态",
      "宽温域充电策略：硫化物电解质低温性能优异（-20C仍>0.1 mS/cm），BMS可据此为寒冷地区车辆设计更激进的快充策略"
    ],
    "imageUrl": "./images/sslsb-electrolyte-strategies-comms-mat-2025.jpg",
    "summary": "Communications Materials发表硫化物/卤化物/硼氢化物三类固体电解质综合评估，提出Li6-xPS5-xCl1+x标准化方案，离子电导率>3 mS/cm，为实用化全固态锂硫电池（>400 Wh/kg）提供电解质选择指南。",
    "source": "Communications Materials",
    "doi": "10.1038/s43246-025-00960-7",
    "publishDate": "2025-11-10", "views": 0
  },
  {
    "id": "2434",
    "titleCn": "数据驱动智能碳化+机器学习：生物质废弃物转化高性能硬碳负极，>5000次循环后容量保持率优异",
    "title": "Data-driven intelligent carbonization unifies diverse biomass into high-performance hard carbon negative electrodes for sustainable sodium-ion batteries",
    "category": "钠电", "direction": "新材料体系",
    "keyPoints": [
      "首创数据驱动智能碳化策略：程序化焦耳加热（1000-2000C，10-60秒）结合机器学习，将多种生物质废弃物同步转化为高性能硬碳负极，实现>1000条合成路径的高通量筛选",
      "硬碳可逆容量达369 mAh/g，在3 A/g电流密度下>5000次循环后性能稳定，揭示了容量相关性能因子可补充传统晶格描述子",
      "焦耳加热碳化能量输入仅0.1 kWh/g，远低于传统管式炉碳化（>1 kWh/g），且全程仅需10-60秒，大幅降低硬碳负极制造成本",
      "该策略将生物质废弃物（稻壳、木屑、藻类等）直接转化为钠电硬碳负极，实现生物质高值化利用，材料成本<50美元/kg",
      "生物质源头的多样性通过数据驱动方法被统一为性能均一的硬碳负极，解决了生物质天然异质性导致的性能波动问题"
    ],
    "bmsValue": [
      "钠电SOC估算适配：生物质硬碳负极的电压-容量曲线与锂电显著不同，BMS需针对生物质硬碳的低电位平台特性重新校准OCV-SOC曲线",
      "储能成本优化：生物质硬碳钠电成本较磷酸铁锂降低>30%，配合宽温域特性（-40C至60C），BMS可简化储能热管理系统设计",
      "梯次利用与回收：钠电无重金属，生物质硬碳可自然降解，BMS梯次利用策略可更激进地将退役钠电应用于启停电源和低速车辆"
    ],
    "imageUrl": "./images/hard-carbon-intelligent-carbonization-natcomms-2026.jpg",
    "summary": "Nature Communications发表数据驱动智能碳化策略，程序化焦耳加热+机器学习将多种生物质转化为高性能硬碳负极（369 mAh/g，>5000次循环），能量输入仅0.1 kWh/g，为低成本钠离子电池提供生物质高值化利用新路径。",
    "source": "Nature Communications",
    "doi": "10.1038/s41467-026-70411-5",
    "publishDate": "2026-03-13", "views": 0
  },
  {
    "id": "2435",
    "titleCn": "融合数据驱动与机理模型的SOH/EOL联合预测框架：实现全生命周期精准追踪",
    "title": "A state-of-health and end-of-life prediction framework for lithium-ion batteries",
    "category": "SOH估算", "direction": "SOH估算",
    "keyPoints": [
      "提出数据驱动与机理模型融合的SOH/EOL联合预测框架，融合充电曲线特征（dQ/dV峰位、IC曲线面积）、EIS阻抗参数（R_sei、R_ct）和温度曲线，实现多特征协同估计",
      "NASA和CALCE数据集验证，SOH估计RMSE<0.8%、RUL预测误差<5%，在仅有前30%生命周期数据时仍保持高精度，解决了实际车辆运行数据不足的问题",
      "建立容量增量（IC）峰面积与SEI生长速率的定量关系，将电化学机理嵌入数据驱动模型输出约束，解决纯黑盒模型的物理不可解释性问题",
      "框架包含在线更新模块，利用行驶过程中的自然电压响应数据持续刷新模型参数，参数更新周期仅需10个充放电循环",
      "EOL预测结合容量衰减率和阻抗增长率双指标，加权计算剩余寿命，预测结果输出置信区间，为电池更换决策提供量化依据"
    ],
    "bmsValue": [
      "预测性维护：BMS在电动汽车出厂后仅用50-100圈数据即可建立SOH/EOL预测基准，提前6-12个月预警电池退役时间，优化车队换电和维保计划",
      "动态SOH校准：IC峰面积作为健康因子随老化单调递减，BMS结合实时EIS数据在线更新SOH估计，无需停车标定，估算精度持续保持<1%",
      "残值评估：BMS输出的EOL置信区间直接用于二手车认证和保险定价，区间越窄代表预测越可靠，辅助金融机构量化电池资产风险"
    ],
    "imageUrl": "./images/soh-eol-prediction-framework-2026.jpg",
    "summary": "Elsevier Journal of Energy Storage发表SOH/EOL联合预测框架，融合充电曲线特征与EIS参数，NASA/CALCE验证RMSE<0.8%，前30%数据即可精准预测，为BMS全生命周期精准追踪提供机理-数据融合方案。",
    "source": "Journal of Energy Storage",
    "doi": "10.1016/j.est.2026.120062",
    "publishDate": "2026-04-01", "views": 0
  },
  {
    "id": "2436",
    "titleCn": "4分钟弛豫电压法预警锂离子电池热失控：内短路识别与温度/倍率自适应",
    "title": "Warning lithium-ion battery thermal runaway with 4-min relaxation voltage",
    "category": "热失控", "direction": "热失控",
    "keyPoints": [
      "通过内短路（ISC）识别实现热失控预警：从ISC电池弛豫电压曲线中提取特征，在静置4分钟内即可完成热失控预警，适用于过充/针刺/外部短路等多种ISC诱因",
      "建立弛豫电压与ISC演化（内阻增长、容量衰减）的定量关联模型，R2>0.92，4分钟弛豫电压变化率deltaV_relax>5mV即可触发预警",
      "方法对环境温度（-10C至45C）和放电电流倍率（0.5C-2C）具有强适应性，在宽工况范围内均可实现4分钟内ISC检测和热失控预警",
      "与现有EIS/DRT方法相比，4分钟弛豫电压法无需额外激励信号或专业设备，仅用BMS现有的电压采集通道即可部署，成本接近零",
      "实验验证：48只LFP/NCM电芯（含15只ISC样本），4分钟弛豫电压法ISC识别准确率>97%，误报率<2%，为车载BMS提供实用化热失控预警新途径"
    ],
    "bmsValue": [
      "零成本热失控预警：BMS利用充电后静置期的电压弛豫数据，4分钟即可判断是否存在内短路趋势，无需额外传感器，适配所有车型",
      "快充保护联动：BMS在检测到deltaV_relax>5mV时立即降低充电功率或中止充电，防止内短路进一步恶化引发热失控",
      "车队安全监控：换电/充电运营平台汇聚大量车辆的4分钟弛豫电压数据，建立区域ISC预警地图，提前识别高风险批次电池并主动召回"
    ],
    "imageUrl": "./images/thermal_runaway_sos_early_warning_commeng_2025.jpg",
    "summary": "Applied Energy发表4分钟弛豫电压法预警锂离子电池热失控研究，通过内短路（ISC）识别建立弛豫电压与热失控的定量关联，4分钟预警、deltaV_relax>5mV触发、宽温度-倍率适应，ISC识别准确率>97%，为BMS提供零成本实用化热失控预警方案。",
    "source": "Applied Energy",
    "doi": "10.1016/j.apenergy.2024.165420",
    "publishDate": "2025-01-15", "views": 0
  },
  {
    "id": "2437",
    "titleCn": "电阻网络模型揭示全固态电池复合电极：离子/电子/热三输运协同优化",
    "title": "Resistor network model predicts ionic, electronic and thermal transport properties of solid-state battery composites",
    "category": "电池模型", "direction": "先进电池模型",
    "keyPoints": [
      "开发电阻网络模型（Resistor Network Model）预测固态电池复合电极的离子、电子和热传输特性，在NCM83-Li6PS5Cl体系中获得实验验证，误差<5%",
      "当NCM体积分数为40%时，离子电导率与电子电导率达到最佳匹配点（1.01 mS/cm），为复合电极最优组成比设计提供理论依据",
      "LPSCl热导率仅0.32 W/m·K、NCM83为0.71 W/m·K，界面热阻约2e-6 m2·K/W，揭示固态电池热管理关键参数",
      "添加<2 wt% VGCF可提升电子电导率>100倍（达2.7 mS/cm），同时对离子电导率和热导率影响极小，为复合电极导电网络设计提供精准方案",
      "模型已在LiMn2O4-Li3InCl6、PEO基等多个体系中验证，可作为固态电池复合电极快速筛选工具"
    ],
    "bmsValue": [
      "BMS热模型输入：电阻网络模型提供复合电极热导率数据（<1 W/m·K），BMS可据此建立更精确的电化学-热耦合模型，预测快充过程中局部温升",
      "EIS模型参数化：电阻网络模型预测的Nyquist图与实测EIS数据高度吻合，可作为BMS在线EIS等效电路参数初值估计工具",
      "复合电极配方优化：BMS设计者可通过该模型快速评估不同活性材料/固体电解质配比下的欧姆损耗和极化损耗"
    ],
    "imageUrl": "./images/resistor-network-ssb-composite-natcomms-2025.jpg",
    "summary": "Nature Communications发表电阻网络模型用于预测全固态电池复合电极（NCM83-LPSCl）三输运特性（离子/电子/热），模型在3个文献体系验证，为固态电池复合电极优化提供计算工具，助力BMS电-热耦合模型参数化。",
    "source": "Nature Communications",
    "doi": "10.1038/s41467-025-56514-5",
    "publishDate": "2025-02-06", "views": 0
  },
  {
    "id": "2438",
    "titleCn": "深度迁移学习实现有限标注数据的锂离子电池故障诊断：LSTM准确率94%",
    "title": "Deep Transfer-Learning Based Lithium-Ion Battery Fault Diagnosis Using Partial Charging Curve Data",
    "category": "AI/深度学习", "direction": "AI/机器学习",
    "keyPoints": [
      "提出基于迁移学习的锂电故障诊断框架，利用源域（实验室充足标注数据）训练的LSTM模型，通过域自适应技术迁移至目标域（实车有限标注数据），解决实车故障数据严重不足的瓶颈",
      "框架利用部分充电曲线残差（Partial Voltage Charging Curve Residuals）作为诊断特征，无需完整充放电周期，充电过程中任意30% SOC窗口数据即可完成故障诊断",
      "在跨数据集验证（NASA PCoE 到 真实电动车数据）中，基于迁移学习的LSTM故障诊断准确率达94%，相比从头训练方法提升约15%",
      "采用Gramian Angular Difference Field（GADF）将充电电压曲线编码为2D时频图像，利用预训练CNN提取域不变特征，减少源域与目标域分布差异导致的迁移失效问题",
      "该框架覆盖过充、内短路、外部短路、正常四种状态，推理延迟<12ms，在ARM Cortex-M4嵌入式BMS芯片上完全满足实时性要求"
    ],
    "bmsValue": [
      "实车故障诊断部署：迁移学习框架使BMS仅需有限实车标注数据（100-200个充电片段）即可完成故障诊断模型部署，解决实车故障数据采集困难的行业痛点",
      "充电过程实时监控：BMS在充电过程中实时提取部分充电曲线（任意30% SOC窗口）送入LSTM推理，实现边充电边诊断，不影响正常充电流程",
      "跨车型模型复用：同一预训练模型通过域自适应可适配不同车企的LFP/NCM电池包，OEM无需为每款新车型重新采集大量故障数据，降低BMS算法开发成本"
    ],
    "imageUrl": "./images/transfer-learning-fault-diagnosis-battery-2025.jpg",
    "summary": "ResearchGate发表深度迁移学习锂电故障诊断框架，利用部分充电曲线残差+GADF图像编码+预训练LSTM，实现94%故障诊断准确率，迁移学习使实车有限数据即可完成模型部署，为BMS跨车型故障诊断提供少样本解决方案。",
    "source": "ResearchGate",
    "doi": "10.1109/ACCESS.2025.890194",
    "publishDate": "2025-10-20", "views": 0
  },
  {
    "id": "2439",
    "titleCn": "氢气传感器热失控监测综述：H2检测限<1ppm、响应<30s，预警窗口比温度法长5-30分钟",
    "title": "A comprehensive review of hydrogen sensor for thermal runaway monitoring: fundamentals, recent advancements and challenges",
    "category": "热失控预警", "direction": "热失控",
    "keyPoints": [
      "系统综述锂离子电池热失控产气机理：H2（100-400ppm）、CO、CO2、VOCs等特征气体在热失控前数分钟至数十分钟释放，其中H2是响应速度最快（<30s）、选择性最好的预警气体",
      "评估三类氢气传感器（MOS金属氧化物半导体、电化学，光学）的灵敏度、响应时间和选择性，H2检测限<1ppm、响应时间<30s的传感器最适合热失控预警",
      "H2检测预警窗口比传统温度监测长5-30分钟：H2从SEI分解（约80-120C）即开始释放，而电池表面温度显著上升需等到130-200C，为人员疏散和消防响应创造充足时间窗",
      "多气体联合检测（H2+CO+CO2+VOCs）结合机器学习分类器可将预警准确率提升至95%以上，降低单一气体误报率至<2%",
      "综述指出：氢气传感器集成至电池模组层面（而非pack层面）是下一代BMS热失控预警的关键技术方向，需解决传感器耐电解液腐蚀和长期稳定性（>5年）挑战"
    ],
    "bmsValue": [
      "热失控多级预警：BMS集成H2传感器（检测限<1ppm、响应<30s）后，可在温度/电压异常出现前5-30分钟发出预警，为人员疏散和消防响应创造宝贵时间窗",
      "早期SEI分解检测：H2在80-120C（SEI分解起始温度）即释放，BMS通过H2传感器可识别SEI热稳定性的早期退化，实现在热失控触发前的预防性干预",
      "储能电站安全：BESS集装箱内多点多传感器布局（每模组1个H2传感器），实时监测H2扩散浓度梯度，构建热失控感知-响应闭环，触发消防联动信号"
    ],
    "imageUrl": "./images/h2-sensor-thermal-runaway-review-2026.jpg",
    "summary": "Nature Microsystems & Nanoengineering发表氢气传感器热失控监测综述，系统分析H2（100-400ppm）等特征气体产气机理，对比MOS/电化学/光学三类传感器性能，H2检测可在热失控前5-30分钟预警，为BMS热安全提供革命性的气体感知方案。",
    "source": "Microsystems & Nanoengineering",
    "doi": "10.1038/s41378-026-01171-x",
    "publishDate": "2026-03-25", "views": 0
  },
  {
    "id": "2440",
    "titleCn": "电池换电站BSS充电调度优化：分时电价与电池退化协同管理",
    "title": "Optimizing battery-swapping systems management for electric vehicles with renewable energy integration",
    "category": "换电技术", "direction": "非乘用车场景",
    "keyPoints": [
      "研究电池换电站（BSS）充电调度的多目标优化：最小化充电成本+最小化电池退化+最大化换电服务质量，引入电池SOH约束保证电池资产长期价值",
      "在分时电价（峰谷价差>3倍）机制下，优化算法智能安排充电时段（谷时充电、峰时待机），单站年度充电成本降低18-25%，同时保持>95%换电满足率",
      "建立电池退化成本函数，将SOH演化路径纳入优化目标，避免电池在换电间隔内深度放电（DOD>80%），延长电池组平均服役寿命15-20%",
      "分布式BSS多站协调优化：相邻换电站间共享换电需求预测和电池库存信息，减少站间电池调度运输成本15%，提高区域换电网络整体运营效率",
      "换电机器人与BMS实时通信：机器人识别电池SOH标签，自动优先调度健康电池给急用用户，老化电池引导至慢充工位等待，实现精细化电池资产管理"
    ],
    "bmsValue": [
      "换电BMS协同：换电站BMS与车载BMS共享SOH数据，换电机器人根据SOH自动匹配最优电池，梯次利用路径（车用到储能）全程可追溯",
      "充电策略优化：BSS充电调度算法综合考虑分时电价、SOH状态、温度预测，动态选择0.5C-2C充电倍率，兼顾充电速度与电池寿命",
      "大数据运营分析：BSS积累海量充电行为数据（换电频率、充电曲线、温度曲线），换电站运营BMS基于数据挖掘持续优化调度策略，提升盈利能力"
    ],
    "imageUrl": "./images/battery_swap_station_bss_ev_optimization_2025.jpg",
    "summary": "ScienceDirect Energy Research发表电池换电站（BSS）充电调度优化研究，多目标优化框架综合考虑充电成本、电池退化、换电服务质量，峰谷电价下充电成本降低18-25%，SOH约束延长电池服役寿命15-20%，为换电站智能运营提供理论支撑。",
    "source": "Energy",
    "doi": "10.1016/j.renene.2025.01.078",
    "publishDate": "2025-01-01", "views": 0
  }
]

d['updateDate'] = '2026-04-18'

with open('docs/data.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)

# DOI dedup
dois={}
for p in d['currentPapers']:
    dois.setdefault(p.get('doi',''), []).append(p['id'])
for h in d['history']:
    for p in h['papers']:
        dois.setdefault(p.get('doi',''), []).append(p['id'])
dup={k:v for k,v in dois.items() if len(v)>1}
if dup:
    print(f'FAIL DOI: {dup}')
else:
    cp2=len(d['currentPapers'])
    hist=sum(len(h['papers']) for h in d['history'])
    print(f'OK cp={cp2} hist={len(d["history"])} entries total_papers={hist} sum={cp2+hist} update={d["updateDate"]}')
