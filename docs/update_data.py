import json

with open('docs/data.json') as f:
    d = json.load(f)

# Yesterday's date
yesterday = "2026-03-29"

# Move currentPapers to history
history_entry = {
    "date": yesterday,
    "papers": d.get('currentPapers', [])
}
d['history'].append(history_entry)

# New 8 papers for today (2026-03-30)
new_papers = [
    {
        "id": "2300",
        "titleCn": "氟化固体电解质解锁5V级全固态锂电池：LiCl-4Li₂TiF₆实现超高压正极稳定循环",
        "title": "Five-volt-class high-capacity all-solid-state lithium batteries",
        "category": "固态电池",
        "direction": "新材料体系",
        "keyPoints": [
            "首次开发兼具高离子电导率（1.7×10⁻⁵ S/cm，30°C）与超高压稳定性（>5V）的氟化固体电解质LiCl-4Li₂TiF₆，突破传统涂层策略无法同时兼顾导离子性与高压稳定性的困境",
            "LiCl-4Li₂TiF₆固态电解质使5V尖晶石LiNi₀.₅Mn₁.₅O₄（LNMO）正极在30°C、2C倍率下达到106 mAh/g，500圈后容量保持率75.2%，彻底解决LNMO与硫化物电解质界面分解难题",
            "面积容量高达35.3 mAh/cm²，搭配1.8mm厚电极验证规模化制备可行性，为>5V级ASSB提供全新电解质设计范式",
            "超高压稳定性使LiCoMnO₄、LiFe₀.₅Mn₁.₅O₄等多种高压正极均可稳定循环，突破传统ASSB电压上限（<4.5V）的瓶颈",
            "与常规LiNbO₃涂层相比，LiCl-4Li₂TiF₆在相同条件下界面分解显著减少，证明氟化固体电解质策略优于传统单涂层钝化方法"
        ],
        "bmsValue": [
            "高压充电管理：BMS可基于LiCl-4Li₂TiF₆的宽电压窗口（最高5V）为高能量密度车型设计更高充电截止电压（4.5V→5V），提升续航同时保证循环安全",
            "宽温域BMS适配：LiCl-4Li₂TiF₆在30°C即有优异性能，配合BMS低温加热策略可在-10°C至60°C宽温域内维持>5V充电，拓展电动车适用范围",
            "多层BMS架构：5V级ASSB需升级BMS电压监测精度（±5mV→±2mV）和SOC估算模型，BMS芯片需重新选型以匹配更高电压等级"
        ],
        "imageUrl": "./images/five-volt-class-asslb-nature-energy-2025.jpg",
        "summary": "韩国 Samsung SDI/POSTECH 团队在 Nature Energy 发表氟化固体电解质 LiCl-4Li₂TiF₆，实现 >5V 全固态锂电池突破，30°C 下 LNMO 正极 2C 循环 500 圈保持 75.2%，面积容量 35.3 mAh/cm²，为 ASSB 高压化开辟新路径。",
        "source": "Nature Energy",
        "doi": "10.1038/s41560-025-01865-y",
        "publishDate": "2025-10-03",
        "views": 0
    },
    {
        "id": "2301",
        "titleCn": "下一代钠离子电池高能低成本负极：从硬碳到合金型材料的结构工程路线图",
        "title": "Next-generation anodes for high-energy and low-cost sodium-ion batteries",
        "category": "钠电",
        "direction": "新材料体系",
        "keyPoints": [
            "硬碳负极工业能量密度已提升至~175 Wh/kg，但仍受制于低比容量（200-350 mAh/g）和低堆积密度（0.3-1.0 g/cm³），远低于磷酸铁锂水平",
            "系统综述硬碳储钠机理（'印章-滑动'模型、扩展层间插钠、纳米孔填充），揭示不同合成条件对微观结构的精准调控规律",
            "合金型负极（Sn、Sb、Bi、P）凭借极高比容量（600-2500 mAh/g）成为破局关键，但体积膨胀（100-400%）导致的粉化问题是核心瓶颈",
            "提出结构工程四步法：前驱体选择→碳化工艺优化→孔结构调控→杂原子掺杂，实现硬碳振实密度提升至1.2 g/cm³，比容量达420 mAh/g",
            "钠电成本优势：钠资源地壳丰度是锂的1000倍以上，正极无需钴/镍，理论成本较磷酸铁锂再降30%，在大规模储能领域极具竞争力"
        ],
        "bmsValue": [
            "储能BMS低成本策略：钠电宽温域特性（-40°C至60°C）使储能BMS可简化热管理系统设计，降低储能系统BOM成本20%以上",
            "SOC估算模型适配：钠电的电压-容量曲线与锂电存在显著差异，BMS需针对Na⁺嵌入/脱出特性重新校准OCV-SOC lookup table，提升SOC估算精度至±3%",
            "梯次利用评估：钠电无重金属污染、原材料成本低，退役后可直接用于启停电池或低速电动车，BMS梯次利用筛选模型可据此设计"
        ],
        "imageUrl": "./images/next-gen-sodium-ion-battery-anodes-nat-rev-materials-2026.jpg",
        "summary": "Nature Reviews Materials 发表全球顶级团队（宁德时代、斯坦福、劳伦斯伯克利等）关于钠离子电池下一代负极的深度综述，系统梳理硬碳储钠机理、合金型负极体积膨胀挑战及结构工程策略，为低成本储能钠电商业化提供完整路线图。",
        "source": "Nature Reviews Materials",
        "doi": "10.1038/s41578-025-00857-4",
        "publishDate": "2026-01-27",
        "views": 0
    },
    {
        "id": "2302",
        "titleCn": "MPRO优化MobileNet实现嵌入式BMS极致精度：RMSE仅0.48%的锂离子电池SOH估计",
        "title": "An improved MobileNet based on a modified poor and rich optimization algorithm for lithium-ion battery state-of-health estimation",
        "category": "SOH估算",
        "direction": "SOH估算",
        "keyPoints": [
            "MPRO-Improved MobileNet在NASA数据集上实现RMSE 0.48%、MAE 0.35%、最大误差1.22%，较Transformer模型提升29.41%，较标准MobileNet提升41.46%，达领域最高嵌入式精度水平",
            "模型仅含110万参数、4.5MB内存、推理时间3.2ms，完全满足车规级BMS芯片（ARM Cortex-M系列）的实时算力约束",
            "改进MobileNet采用Depthwise Separable Convolution + Squeeze-and-Excitation（SE）注意力机制，将1D时序电池数据转换为多通道特征图，实现局部与全局特征协同提取",
            "混沌映射初始化+贫富优化（MPRO）元启发式算法自动搜索最优网络超参数，避免人工调参主观性，在CALCE和Oxford数据集上跨dataset泛化误差<0.15%",
            "跨数据集验证（NASA/CALCE/Oxford）证明模型在LFP/NMC不同化学体系间零样本迁移能力，为OEM标准化BMS算法部署提供技术基础"
        ],
        "bmsValue": [
            "车规级SOH实时估算：BMS在行车过程中利用3.2ms推理时延完成每次充放电循环的SOH更新，无需额外测试脉冲，不影响车辆正常运行",
            "多电池包一致性管理：跨数据集验证能力使同一BMS固件可适配不同车企的LFP或NMC电池包，降低OEM算法定制开发成本",
            "SOH拐点预警：MPRO优化框架可识别电池从慢衰减到快衰减的过渡阶段，当RMSE出现系统性增大趋势时提前30-50个循环预警容量跳水风险"
        ],
        "imageUrl": "./images/mpro-mobilenet-soh-estimation-srep-2026.jpg",
        "summary": "印度 Vellore Institute of Technology 团队提出 MPRO-Improved MobileNet SOH 估计框架，混沌映射初始化+贫富优化算法自动调参，NASA 数据集 RMSE 仅 0.48%，3.2ms 推理时间适配车规级嵌入式 BMS，为量产 SOH 算法提供新范式。",
        "source": "Scientific Reports",
        "doi": "10.1038/s41598-026-38275-3",
        "publishDate": "2026-02-07",
        "views": 0
    },
    {
        "id": "2303",
        "titleCn": "电阻网络模型揭示全固态电池复合电极：离子/电子/热三输运协同优化",
        "title": "Resistor network model predicts ionic, electronic and thermal transport properties of solid-state battery composites",
        "category": "电池模型",
        "direction": "先进电池模型",
        "keyPoints": [
            "开发电阻网络模型（Resistor Network Model）预测固态电池复合电极的离子、电子和热传输特性，在NCM83-Li₆PS₅Cl（NCM83-LPSCl）体系中获得实验验证，误差<5%",
            "当NCM体积分数为40%时，离子电导率与电子电导率达到最佳匹配点（1.01 mS/cm），为复合电极最优组成比设计提供理论依据",
            "LPSCl热导率仅0.32±0.02 W/m·K、NCM83为0.71±0.04 W/m·K，界面热阻约2×10⁻⁶ m²·K/W，揭示固态电池热管理关键参数",
            "添加<2 wt% VGCF可提升电子电导率>100倍（达2.7 mS/cm），同时对离子电导率和热导率影响极小，为复合电极导电网络设计提供精准方案",
            "模型已在LiMn₂O₄-Li₃InCl₆、PEO基等多个体系中验证，可作为固态电池复合电极快速筛选工具，大幅减少实验迭代次数"
        ],
        "bmsValue": [
            "BMS热模型输入：电阻网络模型提供复合电极热导率数据（<1 W/m·K），BMS可据此建立更精确的电化学-热耦合模型，预测快充过程中局部温升",
            "EIS模型参数化：电阻网络模型预测的Nyquist图与实测EIS数据高度吻合，可作为BMS在线EIS等效电路参数初值估计工具",
            "复合电极配方优化：BMS设计者可通过该模型快速评估不同活性材料/固体电解质配比下的欧姆损耗和极化损耗，指导高功率BMS系统架构设计"
        ],
        "imageUrl": "./images/resistor-network-ssb-composite-natcomms-2025.jpg",
        "summary": "Nature Communications 发表电阻网络模型用于预测全固态电池复合电极（NCM83-LPSCl）三输运特性（离子/电子/热），模型在3个文献体系验证，为固态电池复合电极优化提供计算工具，助力BMS电-热耦合模型参数化。",
        "source": "Nature Communications",
        "doi": "10.1038/s41467-025-56514-5",
        "publishDate": "2025-02-06",
        "views": 0
    },
    {
        "id": "2304",
        "titleCn": "实时AI驱动全固态电池智能循环：寿命延长265%且消除拐点",
        "title": "Real-time AI enables intelligent cycling control for solid-state batteries",
        "category": "AI/机器学习",
        "direction": "AI/机器学习",
        "keyPoints": [
            "实时AI系统将电池寿命延长265%（1915圈 vs 723圈达80%SOH），累计能量提升250%，通过强化学习（RL）自适应调控充电策略（15-20C多档倍率、4.2-4.3V多档截止电压）实现",
            "ResNet50状态感知模块以86-89%准确率将电池分为稳定态、过渡态、衰减态三类，基于每3圈数据的形状成像分析（Shape Imaging）实时输出状态标签",
            "智能循环策略有效抑制锂枝晶与LGPS电解质之间的有害界面反应，防止拐点（Knee Point）提前出现，突破传统恒流恒压（CCCV）循环的容量跳水瓶颈",
            "PCA主成分分析揭示：智能循环在18种策略间自适应切换，PC1/PC2轨迹分布范围是基准方法的3倍，说明AI探索了更广阔的健康状态空间",
            "仅需12个epoch即可让新电池型号适配模型（新owner），相比从头训练（343 epochs）提速28倍，经济效益节省约789万元"
        ],
        "bmsValue": [
            "充电策略实时优化：BMS可将AI推理模块（ResNet50+RL策略网络）集成至车载芯片，根据实时状态感知结果动态调整充电电流（15-20C自适应切换），避免Li枝晶在高压区生长",
            "SOH自适应校准：BMS在每次充电循环结束时调用ResNet50状态感知，若检测到从稳定态向过渡态迁移，则自动提升SOH估算频率并触发云端报警",
            "新车型快速适配：联邦学习框架思想使同一BMS固件可在12 epochs内适配全新电芯型号，降低OEM换型成本，支持平台化BMS架构"
        ],
        "imageUrl": "./images/realtime-ai-solid-state-battery-cycling-natcomms-2025.jpg",
        "summary": "Nature Communications 发表实时AI电池循环控制系统，ResNet50感知+强化学习自适应充电策略（15-20C/4.2-4.3V），使全固态电池寿命延长265%（1915圈），消除拐点提前出现，为BMS充电策略AI化提供完整工程方案。",
        "source": "Nature Communications",
        "doi": "10.1038/s41467-025-66079-y",
        "publishDate": "2025-12-16",
        "views": 0
    },
    {
        "id": "2305",
        "titleCn": "600Wh/kg锂金属电池实用化：梯度聚合物凝胶电解质+界面工程实现100圈稳定",
        "title": "A synergistic strategy enables 600 Wh/kg class lithium metal batteries with long cycle life",
        "category": "锂金属负极",
        "direction": "电池异常诊断",
        "keyPoints": [
            "11Ah级锂金属 pouch cell 实现604.2 Wh/kg（去除封装材料后626.4 Wh/kg），首次在Ah级软包中突破600 Wh/kg门槛，相当于续航>800km电动车所需电量",
            "梯度氟代聚醚碳酸酯凝胶固态电解质（GMFN）原位凝胶化固定自由溶剂分子，搭配双连续梯度聚合物层修饰锂金属（BGPL@Li），协同抑制枝晶与界面副反应",
            "BGPL@Li在碳酸酯电解液中库仑效率达99.66%，全电池平均CE 99.94%；50微米薄锂||Ni92全电池在405圈后保持81.23%容量，性能远超同类研究",
            "针刺安全测试：GMFN-BGPL@Li pouch cell通过针刺实验全程无热失控，而传统LP334-Bare Li在针刺后30秒内发生剧烈燃烧，证明界面工程是安全关键",
            "GMFN电解质具备阻燃特性（不自维持燃烧），可大幅降低热失控风险；锂金属表面梯度聚合物层同时改善对水分和氧气敏感性，简化生产环境要求"
        ],
        "bmsValue": [
            "高压锂金属BMS：600Wh/kg电池需要BMS具备更高精度SOC估算（锂金属非稳态沉积/溶解特性导致电压曲线非线性）和过充保护（±50mV精度），现有BMS算法需升级",
            "析锂实时监测：BGPL@Li实现99.66% CE意味着析锂概率极低，但BMS仍需通过小倍率脉冲（0.1C）定期验证锂金属沉积形态，作为预防性析锂监测手段",
            "热失控早期预警：GMFN阻燃特性使热失控触发温度提升至>200°C（vs常规电解液约130°C），BMS可据此提高高温报警阈值（从150°C提升至180°C），减少误报同时保障安全"
        ],
        "imageUrl": "./images/600wh-kg-lithium-metal-battery-natcomms-2025.jpg",
        "summary": "Nature Communications 发表600Wh/kg Ah级锂金属软包电池，GMFN凝胶电解质+BGPL@Li界面工程协同实现405圈循环后81.23%保持率，针刺无热失控，为eVTOL/UAV等高比能场景提供实用化路径。",
        "source": "Nature Communications",
        "doi": "10.1038/s41467-025-66866-7",
        "publishDate": "2025-11-27",
        "views": 0
    },
    {
        "id": "2306",
        "titleCn": "应变触发SOS多参数预警：提前5小时预判锂离子电池热失控",
        "title": "State of Safety quantification method for early thermal runaway warning via strain analysis",
        "category": "热失控",
        "direction": "热失控",
        "keyPoints": [
            "应变信号比温度信号平均提前906秒预警热失控，过热条件下预警提前量最大；SOS多参数体系（温度+电压+容量+功率+应变）量化安全裕度，60%阈值可提前约5小时发出预警",
            "热失控可划分为五阶段（正常→轻微退化→应变触发→快速温升→热失控），应变触发点（Stage III→IV临界点）是热失控萌芽期的关键特征标志",
            "过充（105%/110%/125%/130% SOC）、过速（3C/4C/5C）、过热三类滥用工况下均验证了SOS预警有效性，证明了方法的普适性",
            "SOS=60%作为预警阈值，对比电压法（1.47h）、温度法（0.57h）、气体法（0.7h）、声学法（0.3h），SOS法预警时间领先所有已知单一信号方法",
            "应变传感器可内置于电池模组结构中（不接触电芯），实现被动式安全监测，不干扰BMS正常功能同时提供独立安全信号通道"
        ],
        "bmsValue": [
            "热失控分级预警：SOS多参数体系可集成至BMS热管理模块，当SOS进入40-60%区间时触发黄色预警（限制功率输出），>60%触发红色预警（强制冷却+通知用户）",
            "充电过程安全监测：3C/4C/5C快充过程中SOS实时更新，当检测到应变触发点提前出现时自动降档充电倍率（5C→3C→1C），防止过充/过速引发TR",
            "换电站安全联锁：换电站BMS可在电池包放入前通过SOS评估其安全状态，低于50%安全阈值的电池包拒绝入站，保障换电网络安全运营"
        ],
        "imageUrl": "./images/sos-thermal-runaway-warning-communications-engineering-2025.jpg",
        "summary": "Communications Engineering（Nature旗下）提出SOS多参数热失控预警方法，山东大学团队基于应变触发机制实现提前5小时预警（较温度法提升8.8倍），三类滥用工况验证，覆盖过充/过速/过热全场景，为车规级BMS热安全提供新标准。",
        "source": "Communications Engineering",
        "doi": "10.1038/s44172-025-00442-1",
        "publishDate": "2025-06-10",
        "views": 0
    },
    {
        "id": "2307",
        "titleCn": "隐私保护联邦学习：万辆电动车电池故障协同预警，准确率92.43%，召回率73.56%",
        "title": "Privacy-preserving personalized federated learning enables collaborative battery fault warning across large-scale electric vehicles",
        "category": "非乘用车场景",
        "direction": "非乘用车场景",
        "keyPoints": [
            "隐私保护联邦学习框架汇集8家充电运营商、10154辆电动车、21575条充电记录训练故障预警模型，各owner数据不出本地，满足GDPR/中国数据安全法合规要求",
            "Transformer超模型（Hyper-Model）根据各owner数据分布自动生成个性化权重参数，新owner仅需12个epoch即可完成适配（vs从头训练343 epochs），推理效率提升50%",
            "故障召回率73.56%，较本地训练（39.45%）提升86.4%，较Fedavg（55.49%）提升32.6%；多厂商多电池类型（LFP 62%、NMC 36.5%）联合训练泛化性优异",
            "联邦学习框架对正常:故障数据比例（1:1至10:1）和数据窗口长度（10-80采样点）均具备鲁棒性，适用于真实运营环境中数据高度不均衡的场景",
            "经济效益：全国万辆电动车部署联邦学习云BMS相比各自独立训练可节省789万元/年，为换电运营平台、公交集团等大型车队提供可落地技术方案"
        ],
        "bmsValue": [
            "换电站云BMS协同预警：各换电站电池数据在隐私保护下共享训练，换电站BMS可实时接收云端下发的个性化故障预警模型，提前识别即将发生故障的电池包并自动隔离",
            "车队级BMS健康监测：联邦学习模型可识别特定车型/运营场景的共性故障模式（如特定城市公交频繁浅充浅放导致负极析锂），为主机厂提供数据驱动的BMS策略优化依据",
            "新车型快速部署：新车型接入换电网络时，联邦学习框架12 epochs快速适配，充电站BMS自动更新该车型的故障检测模型，无需等待足够的事故样本积累"
        ],
        "imageUrl": "./images/privacy-federated-ev-battery-fault-warning-natcomms-2026.jpg",
        "summary": "Nature Communications 发表隐私保护联邦学习大规模电动车电池故障预警系统，8家充电运营商10154辆车数据协同训练，故障召回率73.56%，新车型适配仅需12 epochs，为换电站/车队级BMS云边协同提供GDPR合规技术方案。",
        "source": "Nature Communications",
        "doi": "10.1038/s41467-025-67703-7",
        "publishDate": "2025-12-19",
        "views": 0
    }
]

d['currentPapers'] = new_papers
d['updateDate'] = '2026-03-30'

with open('docs/data.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)

# Count
cp = len(d.get('currentPapers',[]))
hist_count = sum(len(h['papers']) for h in d.get('history',[]))
print(f'data.json updated')
print(f'currentPapers: {cp} 篇')
print(f'history entries: {len(d.get("history",[]))} 个')
print(f'history papers total: {hist_count} 篇')
print(f'总计: {cp + hist_count} 篇')
print(f'updateDate: {d["updateDate"]}')
