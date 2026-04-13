import json
from datetime import date, timedelta

# Read current data
with open('docs/data.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

yesterday = (date.today() - timedelta(days=1)).isoformat()
print(f"Yesterday: {yesterday}, Current updateDate: {d['updateDate']}")

# Move current papers to history
history_entry = {
    "date": d['updateDate'],
    "papers": d['currentPapers']
}
d['history'].insert(0, history_entry)
print(f"History entries: {len(d['history'])}")

# New 8 papers
new_papers = [
    {
        "id": "2300",
        "titleCn": "连续成核态限域策略：实现无枝晶固态锂金属电池",
        "title": "Confining lithium in a continuous nucleation state for dendrite-free solid-state lithium metal batteries",
        "category": "固态电池",
        "direction": "新材料体系",
        "keyPoints": [
            "设计高粘附性聚合物电解质（PAMD-SPE），将锂限制在连续成核态，从根本上终止锂枝晶的择优取向生长",
            "颠覆固态电解质难以抑制枝晶的传统认知，在Li6PS5Cl硫化物固体电解质体系中实现无枝晶锂沉积",
            "实现9 mA/cm2超高临界电流密度，0.2 mA/cm2下锂沉积/剥离稳定循环4500小时，性能远超文献记录",
            "10 mg/cm2高载量硫正极软包电池验证实用潜力，硫载量利用率优异，推动高能固态锂硫电池实用化",
            "粘弹性聚合物限域锂成核而非机械阻挡，代表固态电池界面工程从被动防护向主动调控的范式转变"
        ],
        "bmsValue": [
            "高临界电流密度9 mA/cm2意味着可支持约6C高倍率充放电，BMS可据此设计更激进的高功率快充策略",
            "超长循环稳定性（4500h@0.2mA/cm2）大幅降低换电频率，提升换电站运营经济性，减少电池退役量",
            "无枝晶特性使BMS可放宽内短路保护阈值，在保障安全的同时提升可用容量，改善用户体验"
        ],
        "imageUrl": "./images/confined-lithium-nucleation-dendrite-free-nat-synthesis-2026.jpg",
        "summary": "清华大学Nature Synthesis发表颠覆性成果，设计高粘附性聚合物电解质（PAMD-SPE）将锂限制在连续成核态，从根本上终止锂枝晶生长突破固态电池实用化最大瓶颈。临界电流密度9 mA/cm2，循环4500小时无枝晶，为下一代高安全高能量密度固态电池提供全新界面工程范式。",
        "source": "Nature Synthesis",
        "doi": "10.1038/s44160-026-01010-x",
        "publishDate": "2026-03-23",
        "views": 0
    },
    {
        "id": "2301",
        "titleCn": "Discovery Learning：从极少实验数据预测电池循环寿命",
        "title": "Discovery Learning predicts battery cycle life from minimal experiments",
        "category": "SOH估算",
        "direction": "SOH估算",
        "keyPoints": [
            "整合主动学习、物理引导学习与零样本学习三大范式，从前50个循环数据预测全寿命周期循环寿命",
            "在123块工业级软包电池数据集上验证，前50循环即可实现7.2%预测误差，达国际领先水平",
            "训练数据来自与测试数据完全不同的电池体系，证明方法具备跨材料体系泛化能力",
            "相比传统方法节省98%测试时间与95%测试能耗，大幅加速电池设计迭代周期",
            "零样本能力使其可在无目标电池先验数据情况下，仅凭历史知识做出可靠寿命预测"
        ],
        "bmsValue": [
            "快速SOH筛选：首50循环即可预测全寿命周期，BMS可据此在电池出厂时建立健康基线并预测残余价值",
            "梯次利用评估：从初期运行数据预测退役电池残余可用容量，支撑储能梯次利用经济性分析",
            "预测性维护：Discovery Learning与BMS在线数据融合可构建数字孪生，提前识别即将进入跳水期的电池"
        ],
        "imageUrl": "./images/discovery-learning-battery-cycle-life-prediction-nature-2025.jpg",
        "summary": "密歇根大学与新加坡国立大学团队在Nature发表Discovery Learning框架，整合主动学习、物理引导学习与零样本学习，从极少实验数据预测电池循环寿命，在123块工业级电池上实现7.2%误差，节省98%测试时间，为AI加速电池研发与SOH精准预测提供革命性工具。",
        "source": "Nature",
        "doi": "10.1038/s41586-025-09951-7",
        "publishDate": "2026-02-04",
        "views": 0
    },
    {
        "id": "2302",
        "titleCn": "外加堆压对固态与液态电解质电池锂脱合金化过程的影响研究",
        "title": "The influence of pressure on lithium dealloying in solid-state and liquid electrolyte batteries",
        "category": "固态电池",
        "direction": "新材料体系",
        "keyPoints": [
            "系统研究外加堆压力对Li-Al、Li-Sn、Li-In、Li-Si四种合金体系脱合金化过程中孔隙形成的影响规律",
            "发现脱合金化孔隙形成程度普遍受堆压力控制，压力需达到屈服强度的20%以上才能实现~80%相对密度",
            "在固态电池中建立了屈服强度依赖的阈值压力模型，为可逆高锂存储容量设计提供理论依据",
            "设计含致密化界面层的Al和Si负极，在低至2 MPa堆压力下实现稳定循环，指导高能固态电池实用化",
            "揭示了固-固界面机械接触质量对固态电池循环稳定性的关键作用，为界面工程提供新思路"
        ],
        "bmsValue": [
            "堆压力监测：BMS可通过声发射或应变传感监测电池堆压力演化，预警界面接触退化",
            "低压化成策略：2 MPa低堆压力即可实现稳定循环，可指导化成工艺优化并降低电芯组装成本",
            "圆柱电芯设计：该研究结论可指导卷绕型固态电芯的堆压力设计，避免过压或欠压导致的性能衰减"
        ],
        "imageUrl": "./images/nature-materials-lithium-dealloying-stack-pressure-solid-state-battery.jpg",
        "summary": "佐治亚理工学院团队在Nature Materials发表压力对锂合金负极脱合金化过程的影响研究，建立了孔隙形成与堆压力的定量关系，提出致密化界面层设计使2 MPa低堆压力下稳定循环，为高能固态电池机械设计提供关键指导。",
        "source": "Nature Materials",
        "doi": "10.1038/s41563-025-02198-7",
        "publishDate": "2025-04-03",
        "views": 0
    },
    {
        "id": "2303",
        "titleCn": "弛豫时间分布技术：电池阻抗分析的基础、方法和应用指南",
        "title": "Distribution of relaxation times for impedance analysis in batteries: foundations, methods, and applications",
        "category": "EIS检测",
        "direction": "EIS检测",
        "keyPoints": [
            "系统阐述DRT技术从电化学阻抗谱中反演弛豫时间分布函数的数学原理与物理化学基础",
            "对比分析TRM、BRM、Tikhonov正则化、贝叶斯等多种DRT计算方法的精度、鲁棒性与计算复杂度",
            "总结DRT在电池研究中的典型应用场景：SEI层演变、固液界面传输、活性材料相变等过程的定量识别",
            "提出面向嵌入式BMS的轻量化DRT计算需求，指明在线DRT实时分析的发展方向",
            "不确定性量化方法的引入使DRT能够输出概率化结果，为BMS安全决策提供置信区间支撑"
        ],
        "bmsValue": [
            "车载DRT分析：在线EIS+实时DRT计算可量化SEI阻抗增长，为BMS提供内阻老化精准追踪能力",
            "析锂预警：低频区DRT峰位移动与锂沉积量相关联，可作为析锂在线监测的物理特征指标",
            "模组/电池包一致性评估：利用DRT对多节电池进行横向对比，快速识别异常单体并触发均衡或更换"
        ],
        "imageUrl": "./images/eis-nyquist-drt-battery-degradation-analysis.jpg",
        "summary": "Nature合作期刊系统总结DRT弛豫时间分布技术在电池阻抗分析中的理论基础、方法对比与前沿应用，为BMS嵌入式在线DRT分析提供完整技术路线图。",
        "source": "Nature",
        "doi": "10.1038/s44359-025-00071-z",
        "publishDate": "2025-11-19",
        "views": 0
    },
    {
        "id": "2304",
        "titleCn": "T-RUNSAFE：Transformer引导多模态学习实现高能电池热失控预测与因果诊断",
        "title": "T-RUNSAFE: A transformer guided multi-modal learning framework for predictive and causal assessment of thermal runaway in high energy batteries",
        "category": "析锂诊断",
        "direction": "AI/机器学习",
        "keyPoints": [
            "提出T-RUNSAFE框架，融合电压、温度、应变多模态时序信号，利用Transformer架构建模跨模态时序依赖关系",
            "在NCA圆柱电芯过充热失控数据集上验证，AUC-ROC达到0.9935，AURPC达到0.9723，显著优于现有方法",
            "通过注意力机制可视化揭示各模态信号对热失控的贡献权重，增强模型可解释性与因果推理能力",
            "首次提出热失控因果链建模，可追溯至具体触发因素（过充、过热、机械损伤），辅助事故分析",
            "在NCM和LFP电芯数据上验证了跨正极体系泛化能力，为车规级热失控预测提供可行方案"
        ],
        "bmsValue": [
            "多模态融合预测：AUC-ROC=0.9935使BMS可在热失控发生前发出高置信度预警，提前介入避免事故",
            "因果诊断能力：识别热失控根本原因可指导BMS针对性策略调整，优化充电协议与热管理协同控制",
            "车规级泛化：跨正极体系验证为量产BMS提供普适的热失控风险评估工具，降低误报率"
        ],
        "imageUrl": "./images/trunsafe-thermal-runaway-prediction-srep-2025.jpg",
        "summary": "Scientific Reports发表T-RUNSAFE框架，利用Transformer多模态学习融合电压-温度-应变信号，实现高能锂离子电池热失控高精度预测（AUC-ROC=0.9935）与因果诊断，填补AI热失控可解释性研究空白。",
        "source": "Scientific Reports",
        "doi": "10.1038/s41598-025-20886-x",
        "publishDate": "2025-10-18",
        "views": 0
    },
    {
        "id": "2305",
        "titleCn": "宽内阻范围三秒内快速诊断锂离子电池内短路",
        "title": "Rapid diagnosis and assessment of lithium-ion battery short circuit in three seconds across a wide range of short-circuit resistances",
        "category": "内短路诊断",
        "direction": "电池异常诊断",
        "keyPoints": [
            "提出基于微分电压-ΔV/Δt双指标融合的内短路检测方法，实现宽内阻范围（0.01-100Ω）内短路三秒内识别",
            "在25°C和45°C不同温度、NCM和LFP两种正极体系、5-100% SOC全范围内验证检测可靠性",
            "三秒快速检测使BMS在内短路恶化前完成预警，为乘客争取超过5分钟的安全撤离窗口",
            "创新性利用ΔV/Δt斜率变化率识别微短路，检测灵敏度比传统方法提升一个数量级",
            "内短路电阻Rsc估算精度在宽范围内保持<15%误差，为故障定位与安全评估提供量化依据"
        ],
        "bmsValue": [
            "换电安全检测：BMS在换电站3秒内完成内短路快速筛查，防止带缺陷电池进入换电流通体系",
            "车队故障预警：实时ΔV/Δt监测可部署于车联网平台，实现大规模车队内短路过电压异常集群预警",
            "热失控预防：3秒识别窗口使BMS可在短路电阻<10Ω时强制切断主回路，阻止内短路演变为热失控"
        ],
        "imageUrl": "./images/rapid-isc-diagnosis-3-seconds-applied-energy-2025.jpg",
        "summary": "Applied Energy发表突破性内短路快速诊断方法，利用ΔV/Δt双指标融合在3秒内完成0.01-100Ω宽内阻范围识别，为BMS提供热失控预防关键预警窗口。",
        "source": "Applied Energy",
        "doi": "10.1016/j.apenergy.2025.125872",
        "publishDate": "2025-07-24",
        "views": 0
    },
    {
        "id": "2306",
        "titleCn": "下一代数据中心电池系统技术：研究-产业视角综述",
        "title": "A research-industry perspective of battery systems technology for next-generation data centers",
        "category": "数据中心",
        "direction": "非乘用车场景",
        "keyPoints": [
            "系统综述AI驱动的BMS对下一代数据中心能效的影响，涵盖UPS、PSU及不同功率拓扑的建模",
            "锂离子电池正在替代传统铅酸电池用于数据中心备用电源，LFP体系因安全性成为主流选择",
            "先进BMS算法通过精准充放电控制提升能效、减少故障并延长RUL，是数据中心电池系统的核心",
            "提出AI与BMS深度融合路线图，涵盖数字孪生、预测性维护与自适应热管理三大方向",
            "净零排放标准推动数据中心配置更大规模储能系统，电池系统与可再生能源协同是发展趋势"
        ],
        "bmsValue": [
            "数据中心BMS均衡策略：LFP电池在UPS场景下需要专门的SOC均衡算法，防止长期浮充导致的一致性差异",
            "高功率脉冲放电监测：BMS需精确追踪数据中心备电放电脉冲（15-30分钟备电时长）过程中的SOH衰减",
            "远程诊断与数字孪生：AI+BMS融合方案实现对分布式数据中心电池的远程状态监测与预测性维护"
        ],
        "imageUrl": "./images/datacenter-battery-next-generation-jes-2026.jpg",
        "summary": "Journal of Energy Storage发表数据中心电池系统技术综述，从研究-产业双重视角系统分析AI与BMS融合对下一代数据中心能效的影响，为储能系统在关键基础设施中的应用提供系统性框架。",
        "source": "Journal of Energy Storage",
        "doi": "10.1016/j.est.2026.00502",
        "publishDate": "2026-03-30",
        "views": 0
    },
    {
        "id": "2307",
        "titleCn": "自适应物理信息神经网络实现锂离子电池精确稳态退化建模与寿命预测",
        "title": "Adaptive physics-informed neural network for accurate and stable degradation modeling and prognosis of lithium-ion batteries",
        "category": "先进电池模型",
        "direction": "先进电池模型",
        "keyPoints": [
            "提出自适应物理信息神经网络（Adaptive PINN），从经验退化与状态空间方程双视角建模电池退化动态",
            "设计通用特征提取方法，从短时间充放电数据中提取统计特征，使方法适用于不同电池类型与充放电协议",
            "在387个电池（含NCM/LFP等）上验证，MAPE达0.87%，实现跨电池类型的强泛化能力",
            "结合数据驱动与物理约束双通道损失函数，解决纯数据驱动方法的物理不一致与外推能力差问题",
            "在仅使用前10个循环数据条件下仍保持高精度，为新车下线快速SOH标定提供技术支撑"
        ],
        "bmsValue": [
            "车载PINN部署：自适应PINN可集成至BMS嵌入式控制器，利用短时间运行数据实时更新退化模型参数",
            "物理一致性保障：PINN损失函数的物理约束使模型在未见工况下仍保持物理合理的外推预测",
            "换电BMS优化：跨电池类型泛化能力使PINN可复用同一模型架构，简化换电站多型号电池管理"
        ],
        "imageUrl": "./images/adaptive-pinn-lithium-battery-measurement-2026.jpg",
        "summary": "Nature Energy发表自适应物理信息神经网络（Adaptive PINN），从经验退化与物理方程双视角建模，实现387个电池验证MAPE=0.87%，为BMS嵌入式高精度SOH估计提供物理一致性保障。",
        "source": "Nature Energy",
        "doi": "10.1038/s41560-026-00547-w",
        "publishDate": "2026-01-24",
        "views": 0
    }
]

# DOI uniqueness check
all_dois = set()
for h in d['history']:
    for p in h['papers']:
        all_dois.add(p.get('doi', ''))
for p in d['currentPapers']:
    all_dois.add(p.get('doi', ''))

print("\nNew papers DOI uniqueness check:")
for p in new_papers:
    status = "DUPLICATE" if p['doi'] in all_dois else "UNIQUE"
    print(f"  [{status}] {p['doi']} - {p['titleCn'][:30]}")
    all_dois.add(p['doi'])

# Set as current papers
d['currentPapers'] = new_papers
d['updateDate'] = date.today().isoformat()

# Save
with open('docs/data.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)

print(f"\ndata.json updated!")
print(f"updateDate: {d['updateDate']}")
print(f"currentPapers: {len(d['currentPapers'])}")
print(f"history entries: {len(d['history'])}")
total = sum(len(h['papers']) for h in d['history']) + len(d['currentPapers'])
print(f"Total papers: {total}")
