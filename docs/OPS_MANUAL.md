# OPS_MANUAL.md — 锂电文献追踪系统 维护手册

> 本文件是每日推送的唯一执行标准。所有 cron 任务和人工操作必须严格遵守本手册。
> 每次发现 bug 并修复后，必须立即更新本手册，防止同类问题重复发生。

---

## 一、系统架构（必读）

```
cron触发
  → 执行文献搜索（8大方向各1-2篇）
  → 生成 data.json（当日8篇 + 历史累积）
  → 补充每篇论文的 titleCn / keyPoints / bmsValue / imageUrl
  → pnpm build → dist/
  → cp dist/index.html docs/          ← 注意：不删除 docs/ 原有内容
  → cp dist/assets/*.css docs/assets/  ← 仅复制同名文件
  → cp dist/assets/*.js docs/assets/
  → git add + git commit + git push（含5次重试，延迟 5s→10s→20s→40s→80s）
  → GitHub Pages 自动从 docs/ 构建网站（3-5分钟生效）
```

**⚠️ 关键禁忌：**
- 禁止 `rm -rf docs/` 或 `rsync --delete`
- 禁止 `cp -r dist/ docs/`（会覆盖 docs/images/ 等整个目录）
- 禁止 push 失败后不重试就放弃

---

## 二、每日推送检查清单

每次 cron 执行完毕，必须逐项确认：

- [ ] **不要在 App.tsx 中按年份过滤文献**（2025-03-19曾因 `publishDate < 2025` 过滤导致16篇2024年论文被隐藏，仅显示10篇，应显示全部26篇）
- [ ] `currentPapers` 有 8 篇，每篇包含：
  - [ ] `titleCn`（中文标题，必填）
  - [ ] `keyPoints`（5条，每条40-60字，含具体数值）
  - [ ] `bmsValue`（3条，每条40-60字，含具体BMS应用场景）
  - [ ] `imageUrl`（指向 `./images/xxx.jpg`，文件必须在 `docs/images/` 中存在）
  - [ ] `direction`（8大统一方向，见第二章）
  - [ ] `category`（论文原始分类，如"锂金属负极"）
- [ ] `history` 今日条目有 8 篇（每篇含 `titleCn`/`keyPoints`/`bmsValue`/`imageUrl`/`direction`）
- [ ] `git push` 成功
- [ ] 网页可访问：https://skylinezone.github.io/lithium-bms-tracking/

---

## 三、8大研究方向（必须严格遵守）

> ⚠️ 重要：本系统有两套分类：
> - `category`（原始分类）：用于显示论文的具体研究方向（如"锂金属负极"）
> - `direction`（统一方向）：用于方向筛选，必须映射到以下8大方向之一
>
> 每篇论文必须同时包含 `category` 和 `direction` 字段。

### 8大统一方向定义（方向 Tab）

| 序号 | 方向名称 | 包含内容 |
|------|---------|---------|
| ① | 新材料体系 | 固态电池（硫化物/聚合物/氧化物固态电解质）、凝聚态电池、钠离子电池、硅基负极、锂金属负极、锂硫电池、富锂/高镍正极、单晶NMC、全固态电池等**所有新材料体系**的反应机理、特性对比；以及针对新材料体系的电池模型 |
| ② | SOH估算 | SOH快速估算、寿命衰减/跳水机理、寿命预测模型、循环寿命模型、加速老化测试、SOH估计误差分析等 |
| ③ | 先进电池模型 | 等效电路模型（ECM）、电化学模型（P2D/SPMe）、老化模型、机理模型；电池模型参数检测方法、参数辨识方法（HPPC、脉冲测试、EIS拟合等）、模型简化与降阶、模型验证方法 |
| ④ | EIS检测 | 电化学阻抗谱（EIS）、动态EIS（DEIS）、阻抗谱测量方法、阻抗数据分析（Nyquist/Bode图）、等效电路拟合、弛豫时间分布（DRT）、EIS在线监测、EIS与电池老化关联、EIS诊断应用 |
| ⑤ | AI/机器学习 | 深度学习/机器学习在BMS中的应用：SOC估算、SOH估计、寿命预测、析锂诊断、异常诊断、充电策略优化、电池模型参数辨识、迁霪学习、数字孪生等 |
| ⑥ | 电池异常诊断 | 析锂诊断（电压/应变/声学信号）、自放电检测、内短路诊断（Rdc方法）、容量跳水诊断、微短路检测、析锂机理与修复策略、寿命衰减延缓方法、主动均衡、充电策略优化 |
| ⑦ | 热失控 | 热失控类型总结（过充/短路/针刺/热箱等）、热失控机理（链式反应、SEI分解、隔膜崩溃等）、热失控特征（温度、电压、产气、应变等）、热失控模型（电化学-热耦合）、检测方法（温度/压力/气体/声学/应变传感器）、告警手段、预警模型（SOS多参数体系等）、特征识别 |
| ⑧ | 非乘用车场景 | eVTOL/drone 电池BMS、换电技术、储能系统（BESS）、数据中心备用电源、船舶/轨道交通电池、军用特殊场景BMS、无线 BMS、分布式 BMS 等非乘用车场景的电池管理技术 |

### category → direction 映射规则

当某篇论文的 `category` 不在上述8个方向名称中时，按以下规则映射到 `direction`：

```
category → direction 映射表（按优先级）：
  锂金属负极 → 新材料体系
  固态电解质 → 新材料体系
  锂硫电池 → 新材料体系
  硅基负极 → 新材料体系
  正极材料（梯度/单晶/NMC/LRMO等） → 新材料体系
  电池回收 → 新材料体系
  快充技术（硅负极/3D集流体/添加剂等） → 新材料体系
  电池安全（产气/热评估等非热失控专题） → 新材料体系（若无法归入热失控则归入此处）
  -----
  SOH估算 → SOH估算
  -----
  电池模型 / EIS检测 / HPPC / 参数辨识 → 先进电池模型（如无专门EIS方向则归入此）
  -----
  EIS检测 / DEIS / 阻抗测量 / DRT → EIS检测
  -----
  AI/BMS / 迁移学习 / Transformer / CVAE / GNN / 深度学习SOC/SOH → AI/机器学习
  -----
  异常诊断 / 析锂诊断 / 内短路 / 容量跳水 → 电池异常诊断
  -----
  热失控 / 热模型 / 热预警 / SOS / 产气分析 → 热失控
  -----
  储能BMS / 移动储能 / 换电 / eVTOL / 数据中心 → 非乘用车场景
```

---

## 四、内容质量规范

### 4.1 keyPoints（每篇 5 条，每条 40-60 字）
必须包含：**具体数值** + **方法描述** + **创新点**

### 4.2 bmsValue（每篇 3 条，每条 40-60 字）
必须包含：**具体 BMS 应用场景**（如"充电策略优化"） + **实现方式** + **预期效果**

### 4.3 titleCn（中文标题，每篇必填）
准确传达论文核心发现/方法，避免空泛描述。

---

## 五、图片规范（强制执行）

### 5.1 获取优先级（P1 > P2 > P3）

| 优先级 | 来源 | 说明 |
|--------|------|------|
| **P1 必须（首选）** | 论文官网/期刊官方 Figure | Nature/ScienceDirect/Springer 等原始 figure 图片，URL 格式如 `https://media.springernature.com/full/...` |
| **P2 次选** | 学术图片库 | Science/AAAS、ACS、Cell Press、Wiley 等官方图库 |
| **P3 底线** | AI 精准生成 | 当前两者均**完全无法**获取时，使用 `image_synthesize` 生成。必须满足：① prompt 包含论文具体材料名称/结构/机理；②禁止生成通用配图；③同一篇论文的图片不能与其他论文共用 |

### 5.2 图片内容相关性验证

每张图片必须能够回答以下问题之一：
- "这张图是否是这篇论文的核心 Figure？"
- "这张图是否能代表这篇论文的主要创新点或关键数据？"

如果答案是**否**，必须重新获取或生成，不得将就使用。

### 5.3 图片放大功能

所有论文卡片和详情页中的图片必须支持点击放大（modal 全屏查看）。

### 5.4 已知图片问题记录

| 日期 | 论文 | 原图问题 | 处理结果 |
|------|------|---------|---------|
| 2026-03-19 | 锂磺酰亚胺COF隔膜Li-S电池 | 从图片库下载的是ZnPTz MOF图（非论文实际材料） | 已用AI生成精准匹配的COF隔膜机理图替代 |

---

## 六、历史数据记录

| 日期 | 篇数 | 原因 |
|------|------|------|
| 2026-03-12 | 1篇 | 早期保存机制不完整 |
| 2026-03-13 | 1篇 | 同上 |
| 2026-03-14 | 1篇 | 同上 |
| 2026-03-15 | 2篇 | 同上 |
| 2026-03-16 | 2篇 | 同上 |
| 2026-03-17 | 3篇 | 同上 |
| 2026-03-18 | 8篇 | 系统修复后首批完整数据 |
| 2026-03-19 | 8篇 | 修复完成，开始按新8大方向归类 |

> 注：03-12 至 03-17 历史论文已按新方向体系重新归类（`direction` 字段），原始 `category` 保留用于溯源。

---

## 七、前端 App.tsx 规范

### 7.1 方向 Tab（DIRECTIONS 数组）

```typescript
// 必须与 data.json 中 paper.direction 字段完全对应
const DIRECTIONS = [
  { label: "全部",              value: "全部" },
  { label: "①新材料体系",      value: "新材料体系" },
  { label: "②SOH估算",         value: "SOH估算" },
  { label: "③先进电池模型",    value: "先进电池模型" },
  { label: "④EIS检测",        value: "EIS检测" },
  { label: "⑤AI/机器学习",     value: "AI/机器学习" },
  { label: "⑥电池异常诊断",   value: "电池异常诊断" },
  { label: "⑦热失控",          value: "热失控" },
  { label: "⑧非乘用车场景",   value: "非乘用车场景" },
];
```

### 7.2 过滤逻辑

- 主页按 `direction` 过滤（用 Set 统计活跃方向数量）
- 历史面板按 `direction` 过滤
- 搜索关键字同时匹配 `titleCn`、`title`、`summary`、`direction`
- 所有过滤操作**不改变**原始 data（只改变显示列表）

### 7.3 分页规范

- 主页：每页 8 篇，总数 = `filteredAll.length`，正确反映筛选结果
- 历史面板：每页 8 篇，显示"第 X/Y 页（共 Z 篇）"

### 7.4 "覆盖方向"统计

- = `new Set(allPapers.map(p => p.direction)).size`
- 不是 `category` 的数量（历史数据有 16 个旧 category，会导致统计错误）
- 应始终 ≤ 8

### 7.5 历史面板显示规范

- 左侧列表：显示日期 + 该日总篇数 + **各方向篇数统计**（如"新材料体系 3篇 · 热失控 2篇"）
- 点击日期：显示该日所有论文（支持分页）
- 点论文：打开详情弹窗

---

## 八、故障档案

### 2026-03-19（全面修复·第二轮）

| # | 问题描述 | 根因 | 修复方案 |
|---|---------|------|---------|
| 1 | 方向 Tab 名称与 data.json category 不匹配 | 旧 DIRECTIONS 数组使用旧分类名（新材料体系/SOH估算等） | 重建 DIRECTIONS 数组，统一使用8大方向名称 |
| 2 | 历史论文 16 个 category 导致"覆盖方向"显示错误 | 旧分类体系有 16 个 category，新系统只有 8 个 direction | 在 data.json 中增加 `direction` 字段，对历史论文做标准化映射 |
| 3 | 主页只显示 2 页 9 篇（共 26 篇应显示 4 页） | 分页用 `filteredAll` 但 `totalPages` 基于旧 filteredAll | 确认 pagination 使用正确的 `filteredAll.length`，本次修复已验证 |
| 4 | 历史面板点击后篇数不一致 | 未对历史论文做方向过滤，且旧面板用 `category` 而非 `direction` | 重写历史面板过滤逻辑，使用 `direction` 字段 |
| 5 | 新材料体系包含范围不清 | 旧系统将固态/Li-S/硅负极/正极/快充等分散在多个 category | 明确"新材料体系"为最大集合，其余 7 个为独立专题 |
| 6 | 构建过程丢失 docs/data.json 和图片 | 使用 `rm -rf docs` 或 `rsync --delete` | 改为 `mkdir docs/assets docs/images && cp dist/* docs/` |

---

*本手册最后更新：2026-03-19*
*更新人：锂电文献追踪系统*

---

## 九、2026-03-19 完整问题档案（所有问题汇总）

> 这是今天发现的所有问题记录，供日后避免同类错误。

### 问题清单

| # | 问题类型 | 严重程度 | 问题描述 | 根因 | 修复方案 |
|---|---------|---------|---------|------|---------|
| 1 | 内容Bug | 致命 | cron任务只生成了markdown但没有更新data.json并推送GitHub | cron孤立会话执行流程不完整 | 在cron任务中明确写全链路：生成data.json→提交→推送→验证 |
| 2 | 图片Bug | 致命 | 6篇论文共用一张通用ML示意图，图片和论文内容完全不匹配 | 未按手册优先级获取图片，直接用了通用图 | 从Nature/Springer/ACS官网下载真实Figure，重新推送图片 |
| 3 | 内容Bug | 高 | keyPoints仅为4个词，bmsValue仅2-3字，不符合维护手册要求（完整句子+具体数值） | cron任务生成的keyPoints/bmsValue格式不合规 | 全部重写，每条40-60字含具体数值 |
| 4 | 图片Bug | 高 | 8篇currentPapers的图片文件名与GitHub实际文件名不匹配，图片全部404 | `data.json`里写的文件名和`docs/images/`实际文件名不一致 | 修正所有图片路径为GitHub实际文件名 |
| 5 | 内容Bug | 高 | history论文缺少keyPoints/bmsValue/titleCn等字段，detail页打开报错：`Cannot read properties of undefined (reading 'map')` | 早期cron只保存了title/summary/source/category/id，没有保存全部字段 | 用Python脚本补充所有历史论文缺失字段 |
| 6 | 前端Bug | 高 | 方向标签点击无内容（tab名称和data.json的category不匹配） | `DIRECTIONS`数组使用旧分类名，与新data.json的category不匹配 | 重建`DIRECTIONS`为8大统一方向，与data.json的`direction`字段对应 |
| 7 | 前端Bug | 中 | 历史面板点击后篇数不一致 | 历史论文只有6个字段，detail modal对`keyPoints`调用`.map()`报错 | 补全所有历史论文字段 |
| 8 | 内容Bug | 中 | 论文标题没有中文 | `data.json`中没有`titleCn`字段 | 为所有论文补充`titleCn`字段 |
| 9 | 前端Bug | 中 | 历史论文每篇共用一张图 | 早期`imageUrl`全指向同一张图 | 分别为18篇历史论文配专属图片 |
| 10 | 架构Bug | 高 | 构建过程使用`rm -rf docs`或`rsync --delete`覆盖整个docs目录，丢失data.json和图片 | 不了解GitHub Pages部署原理，直接用dist替换docs | 改为`mkdir docs/assets docs/images && cp dist/* docs/`（仅复制同名文件）|
| 11 | 推送Bug | 中 | git push多次重试失败，延迟不够 | 网络超时后延迟不足 | 调整为5次重试，延迟5s→10s→20s→40s→80s，总超时90s |
| 12 | 内容Bug | 高 | 历史论文中同一DOI的论文重复出现（迁移学习SOC估算，DOI相同） | 早期cron每次都在history追加，没有去重 | 增加DOI去重逻辑：追加前检查DOI是否已存在，若存在则合并（保留字段更完整的版本）|
| 13 | 图片Bug | 高 | 4张历史论文图片内容与论文主题不符（图片是其他论文的图） | 下载图片时未验证图片内容是否与论文相关 | 删除错误图片，用AI生成精准匹配的图 |
| 14 | 前端Bug | 高 | 文献过滤条件`parseInt(p.publishDate.split('-')[0]) < 2025`把2024年论文全部隐藏，导致只显示9篇而非25篇 | 开发时错误添加了年份过滤 | 删除年份过滤条件，显示所有文献 |
| 15 | 前端Bug | 中 | 分页只显示"上一页/下一页"，没有页码按钮，无法跳转到指定页 | 实现不完整 | 添加页码按钮（最多7个，显示省略号）|
| 16 | 前端Bug | 低 | 图片无法点击放大查看细节 | 功能未实现 | 添加图片放大镜modal（点击图片全屏查看）|
| 17 | 前端Bug | 中 | "覆盖方向"统计用`category`的数量（显示16），而非`direction`数量（应为8） | `DIRECTIONS`数组重建后，统计没有同步更新 | 改用`direction`字段统计`new Set(allPapers.map(p => p.direction)).size` |

### 今日新增图片（需在维护手册中标注来源）

| 论文 | 图片文件 | 图片内容 | 来源 |
|------|---------|---------|------|
| 锂磺酰亚胺COF隔膜Li-S电池 | `li-s-battery-cof-lithium-sulfonylimide-separator.jpg` | COF隔膜吸附多硫化物机理图 | AI生成（官网原图无法获取）|
| 固态锂金属电池安全性综述 | `solid-state-lithium-metal-battery-safety-review.jpg` | 固态电池失效模式图 | AI生成 |
| LFP vs NCM622热失控产气对比 | `lfp-ncm-thermal-runaway-gas-emissions-comparison.jpg` | 产气量对比柱状图 | AI生成 |
| 富锂层状氧化物氧损失机理 | `lithium-rich-cathode-oxygen-release-mechanism.jpg` | 氧释放机理图 | AI生成 |
| ALE ZeroVolt 400 Wh/kg电池 | `ale-zerovolt-battery-zero-volt-storage.jpg` | 零伏存储技术图 | AI生成 |

### 重复DOI记录（必须避免）

| DOI | 重复论文ID | 处理结果 |
|-----|-----------|---------|
| `s41598-025-32347-6` | currentPapers #107 和 history #701 | 已合并，保留history中keyPoints更完整的版本，删除currentPapers中的重复条目 |

---

## 十、避免同类错误的执行规范

### 每次推送前必须逐项检查

每次生成`data.json`并推送前，必须完成以下**自检清单**（缺一不可）：

```bash
# ① DOI去重检查
python3 -c "
import json
with open('docs/data.json') as f: d=json.load(f)
dois = {}
for p in d.get('currentPapers',[]):
    doi = p.get('doi',''); doi_map.setdefault(doi,[]).append(('cp',p['id']))
for h in d.get('history',[]):
    for p in h['papers']:
        doi = p.get('doi',''); doi_map.setdefault(doi,[]).append(('h',p['id']))
dup = {k:v for k,v in doi_map.items() if len(v)>1}
if dup: print(f'❌ DOI重复: {dup}'); exit(1)
else: print('✅ 无DOI重复')
"

# ② 图片路径存在性检查
python3 -c "
import json,os
with open('docs/data.json') as f: d=json.load(f)
base='docs/images/'
missing=[]
for p in d.get('currentPapers',[]):
    fname=os.path.basename(p['imageUrl'])
    if not os.path.exists(base+fname): missing.append(fname)
for h in d.get('history',[]):
    for p in h['papers']:
        fname=os.path.basename(p['imageUrl'])
        if not os.path.exists(base+fname): missing.append(fname)
if missing: print(f'❌ 图片缺失: {missing}'); exit(1)
else: print('✅ 所有图片路径有效')
"

# ③ 必填字段完整性检查
python3 -c "
import json
with open('docs/data.json') as f: d=json.load(f)
errors=[]
for p in d.get('currentPapers',[]):
    for field in ['titleCn','keyPoints','bmsValue','imageUrl','direction']:
        if field not in p: errors.append(f'currentPapers id={p[\"id\"]} missing {field}')
for h in d.get('history',[]):
    for p in h['papers']:
        for field in ['titleCn','keyPoints','bmsValue','imageUrl']:
            if field not in p: errors.append(f'history {h[\"date\"]} id={p[\"id\"]} missing {field}')
if errors: print(f'❌ 字段缺失:\\n' + '\\n'.join(errors)); exit(1)
else: print('✅ 所有必填字段完整')
"

# ④ 篇数检查
python3 -c "
import json
with open('docs/data.json') as f: d=json.load(f)
cp=len(d.get('currentPapers',[])); hist=sum(len(h['papers']) for h in d.get('history',[]))
print(f'currentPapers: {cp}篇, history: {hist}篇, 总计: {cp+hist}篇')
if cp != 8: print(f'⚠️  currentPapers应有8篇，当前{cp}篇')
"
```

### cron任务最低要求

每次cron执行时，必须完成以下所有步骤，**不得跳过任何一步**：

1. ✅ 执行文献搜索（8个方向）
2. ✅ 生成`data.json`（包含当日8篇 + 历史追加条目）
3. ✅ **运行自检清单**（DOI去重 + 图片存在性 + 字段完整性）
4. ✅ `pnpm build`
5. ✅ `mkdir -p docs/assets docs/images && cp dist/* docs/`
6. ✅ `git add -A && git commit`
7. ✅ `git push`（含5次重试，延迟递增）
8. ✅ 推送后验证GitHub raw URL

### 架构红线（绝对禁止）

- ❌ 禁止使用`rm -rf docs`或`rsync --delete`
- ❌ 禁止将GitHub仓库的`docs/`目录完全替换为本地`dist/`
- ❌ 禁止在`filterPapers`中添加年份过滤条件（publishDate < 2025等）
- ❌ 禁止直接使用期刊/下载站的通用缩略图作为论文配图
- ❌ 禁止在未验证的情况下重用其他论文的图片

---

*本手册最后更新：2026-03-19（全面修复完成）*
