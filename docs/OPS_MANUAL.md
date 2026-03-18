# 锂电文献追踪系统 - 运维手册

## 📋 问题与解决方案记录

### 2026-03-15 (第二次 - 网页显示与数据问题)

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| 登陆显示"没有找到匹配的文献" | currentPapers被错误清空 | 修复data.json结构，确保currentPapers有数据 |
| 只显示当天论文，历史论文不显示 | displayPapers只包含currentPapers | 修改为显示 allCurrentPapers + allHistoryPapers |
| 3月14日数据丢失 | 没有保存追踪报告到workspace | 重建data.json，重新搜索3月14日论文 |
| 文献太多需要分页 | 一页显示太多影响体验 | 添加分页功能，每页8篇 |
| 覆盖方向写死为8 | hardcode在代码里 | 改为动态计算: new Set(allPapers.map(p => p.category)).size |

---

### 2026-03-15 (网页未更新)

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| GitHub推送失败(HTTP 408) | 网络超时 | 加入指数退避重试机制(5s→10s→20s) |
| 网页仍显示3月14日 | data.json中updateDate写错 | 修正为正确日期后重新推送 |
| 验证推送成功但网页不更新 | 没检查data.json实际内容 | 推送后必须验证updateDate字段 |

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| GitHub Pages没有更新 | 以为只要更新dist目录即可 | 确认GitHub Pages使用docs目录作为源 |
| 推送后用户看不到新内容 | 只推送到dist，没有同步到docs | 学会使用cp -r dist docs |
| 看到MiniMax的部署地址 | 错误使用了deploy工具 | 应该用git push到GitHub |
| 搜索不到最新论文 | 搜索关键词不够精准 | 使用更精准的学术搜索词 |
| Footer显示"下午2点"而非"上午10点" | 写死在代码里 | 修改App.tsx中的Footer文字 |

---

### 2026-03-14 下午 (修复历史记录功能)

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| 文献总数显示错误(8篇而非16篇) | 只计算了currentPapers，没算history | 添加totalPapers计算：allPapers + history |
| 历史记录点击无反应 | history面板只有列表，没有点击事件 | 重写History Panel，添加点击查看功能 |
| 历史记录里只有3月12日空数据 | sampleHistory写死为空数组 | 修改代码从data.history加载 |

---

### 2026-03-14 傍晚 (重建页面)

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| 网页变成空白页面 | .gitignore忽略了docs导致没推送 | 使用git add -A强制添加 |
| 部署后仍是空白 | 构建的index.html内容为空 | 使用rm -rf docs && cp -r dist docs重新复制 |
| 14日数据丢失 | 运行pnpm build覆盖了data.json | 不再运行build，直接写docs/data.json |

---

### 2026-03-14 晚上 (最终修复)

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| 14日数据只有8篇，历史13日也看不到 | build覆盖了data.json | 直接写入docs/data.json，不再build |
| 确认docs目录是正确源 | 多次尝试后发现 | 永远只修改docs目录 |

---

## ✅ 核心原则

### 1. 目录职责
- **docs/** = GitHub Pages 部署目录 ✅ （唯一正确的目标目录）
- **dist/** = Vite 构建产物（会被覆盖，不要依赖）
- **永远不要运行 pnpm build 如果只需要更新 data.json**

### 2. 更新流程（必须遵循）

```
标准流程（只改数据，不改代码）:
1. 搜索论文数据
2. 直接写入 docs/data.json （不运行build）
3. 验证: curl "https://raw.githubusercontent.com/.../docs/data.json" | head -3
4. 提交推送: git add docs/data.json && git commit -m "Update: YYYY-MM-DD" && git push

需要改代码+数据时:
1. 搜索论文
2. 搜索/下载图片到 public/images/
3. pnpm build
4. rm -rf docs && cp -r dist docs
5. git add -A && commit && push
```

### 3. 验证必做
每次推送后必须验证GitHub上的实际内容：
```bash
curl -s "https://raw.githubusercontent.com/skylinezone/lithium-bms-tracking/main/docs/data.json" | head -3
```
确认 updateDate 为正确日期才算成功。

---

## 📊 数据结构

```json
{
  "updateDate": "YYYY-MM-DD",
  "currentPapers": [
    {
      "id": 1,
      "category": "新材料体系/SOH估算/电池模型/EIS检测/AI/BMS/异常诊断/热失控/储能BMS",
      "title": "论文标题",
      "source": "期刊名 | 日期",
      "doi": "DOI链接",
      "publishDate": "YYYY-MM-DD",
      "views": 1000,
      "summary": "摘要（150字内）",
      "keyPoints": ["要点1", "要点2", "要点3"],
      "bmsValue": ["BMS价值1", "BMS价值2"],
      "imageUrl": "./images/xxx.jpg"
    }
  ],
  "history": [
    {
      "date": "YYYY-MM-DD",
      "papers": [...]
    }
  ]
}
```

---

## 🖼️ 图片管理

- 本地路径：`/workspace/lithium-tracking/public/images/`
- GitHub路径：`docs/images/`
- 更新图片必须重新build并复制到docs

---

## 📞 GitHub Pages 地址

```
https://skylinezone.github.io/lithium-bms-tracking/
```

---

## 🔧 紧急回滚

```bash
# 查看历史
git log --oneline -10

# 回滚
git reset --hard <commit>
git push --force
```

---

## 📝 更新日志

- 2026-03-14: 创建初始文档，记录首次追踪遇到的所有问题
- 2026-03-15: 新增GitHub推送失败自动重试机制
- 2026-03-15: 新增每日问题自动检查清单

---

## ✅ 每日追踪检查清单（必须逐项确认）

每次完成追踪后、推送前，**必须**检查以下所有项目：

### 1. 数据完整性检查
- [ ] `updateDate` 是**今天**的日期 (YYYY-MM-DD)
- [ ] `currentPapers` 数量 ≥ 5 篇
- [ ] `history` 包含**所有历史日期**（昨天及之前每天都有）
- [ ] 每篇论文都有 `imageUrl` 字段且图片存在

### 2. 历史记录滚动检查
- [ ] 昨天的论文已移入 `history`（日期为昨天）
- [ ] `history` 中的日期是连续的（3月12日→3月13日→3月14日...）
- [ ] `history` 每条记录的 `papers` 数组不为空

### 3. 追踪文件备份检查
- [ ] 已保存 `lithium_tracking_YYYYMMDD.md` 到 workspace
- [ ] 文件日期与 `updateDate` 一致

### 4. 推送验证检查
- [ ] GitHub推送成功（无HTTP 408错误）
- [ ] 推送后用 curl 验证 `data.json` 的 `updateDate` 正确

### 5. 网页验证
- [ ] 访问 GitHub Pages 确认显示正确日期
- [ ] 确认文献总数 = currentPapers + 所有history papers

---

### ⚠️ 常见重复错误警示

| 错误 | 上次出现 | 检查方法 |
|------|---------|---------|
| updateDate写错 | 2026-03-15 | `grep updateDate docs/data.json` |
| history未更新 | 2026-03-15 | `grep date docs/data.json` 查看历史日期 |
| 论文缺imageUrl | 2026-03-14 | 检查第一篇论文是否有imageUrl字段 |
| 图片未推送 | 2026-03-14 | 确认docs/images/目录有图片文件 |

---

## 🔄 GitHub推送失败自动重试机制

### 问题描述
GitHub推送经常因网络超时（HTTP 408）失败，需要手动重试。

### 解决方案
在脚本中加入指数退避重试逻辑：

```bash
#!/bin/bash
MAX_RETRIES=3
RETRY_DELAY=5

retry_git_push() {
    local attempt=1
    while [ $attempt -le $MAX_RETRIES ]; do
        echo "Attempt $attempt of $MAX_RETRIES..."
        if git push origin main 2>&1; then
            echo "✅ Push successful!"
            return 0
        fi
        echo "❌ Push failed, waiting ${RETRY_DELAY}s before retry..."
        sleep $RETRY_DELAY
        RETRY_DELAY=$((RETRY_DELAY * 2))  # 指数退避: 5s → 10s → 20s
        attempt=$((attempt + 1))
    done
    echo "❌ All $MAX_RETRIES attempts failed"
    return 1
}
```

### 使用方式
在cron任务或脚本中调用 `retry_git_push` 代替直接 `git push`。

### 验证步骤
推送成功后必须验证：
```bash
curl -s "https://raw.githubusercontent.com/skylinezone/lithium-bms-tracking/main/docs/data.json" | grep "updateDate"
```
| React #310 页面崩溃 | useEffect放在early return后 | Hooks必须在所有return前声明 |

### 2026-03-15 (第三次 - 数据丢失)

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| data.json被恢复为旧版本 | git checkout恢复错误版本 | 从正确commit恢复或手动重建 |
| 13号数据错误替换14/15号 | 恢复脚本使用了错误的commit | 验证data.json的updateDate为今天日期 |
| docs目录被删除 | rm -rf docs后未及时重建 | 确保push前docs目录存在 |

### 2026-03-15 (第四次 - 数据真实性问题)

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| DOI链接无法访问 | AI生成了假的DOI | 必须手动验证每个DOI是否真实存在 |
| 文献内容是AI编造的 | 搜索失败时AI会编造数据 | 优先使用真实搜索结果，不用AI编造内容 |
| 存在重复论文 | 历史和当天数据有重叠 | 去重检查：id相同的论文只保留一份 |
| 图片缺失 | imageUrl指向不存在的文件 | 验证images/目录下文件是否存在 |

---

## 🔍 数据真实性检查清单（必须执行）

### 1. DOI验证
- 每个论文的DOI必须能在对应期刊官网找到
- 验证方式：直接访问 DOI.org 或在搜索引擎输入DOI
- 如果DOI无效，立即删除该论文

### 2. 内容验证
- 摘要必须是论文真实内容的总结
- 不能使用AI编造的"看似合理"的内容
- 如无真实数据，宁可少放论文也不要放假数据

### 3. 重复检查
- currentPapers和history中的论文id不能相同
- 同一论文不能出现在多个日期

### 4. 图片验证
- 每篇论文的imageUrl必须指向存在的文件
- 使用 ls docs/images/ 确认文件存在

### 2026-03-15 (第五次 - 恢复原始数据)

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| 历史数据被删除 | 多次重建data.json导致数据丢失 | 从workspace原始markdown文件恢复数据 |
| DOI需要验证 | 部分AI生成DOI是假的 | 手动验证DOI真实性（搜索确认） |
| 数据来源 | lithium_tracking_20260315.md | 保留原始markdown文件作为数据备份 |

---

## 🚨 根本性问题：学术论文信息无法获取

### 问题描述
- 网络搜索无法返回真实的学术论文DOI和详情
- 搜索结果被百度知道、知乎等无关内容淹没
- 之前追踪文件中的DOI大部分是AI编造的，无法验证
- 即使尝试多次，结果仍然一样

### 影响
- 所有之前的推送内容（3月12日-15日）的DOI链接都是假的
- 文献内容是AI根据关键词"生成"的，不是真实论文

### 可能的解决方案
1. **用户手动提供**：如果用户有真实论文DOI，可直接添加
2. **使用学术搜索API**：如Semantic Scholar API、OpenAlex等
3. **使用文献管理工具**：如Zotero、ResearchGate等
4. **手动查找**：在Google Scholar手动搜索后提供真实链接

### 维护手册数据来源原则
- **禁止使用AI编造的DOI**
- **只使用用户确认的真实论文**
- **宁可少放也不要放假数据**


### 2026-03-17 (第七次 - 内容质量与历史记录问题)

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| 文献推送内容太简略 | keyPoints和bmsValue只有2-3个词 | 每个字段至少4-6个要点，用完整句子描述工作要点、创新点、BMS借鉴价值 |
| 图片不是文章专属 | 直接使用通用图片 | 优先从文章中提取关键 Figure 图片，如无法获取则根据文章内容用AI生成描述性图片 |
| 历史记录只保留3天 | 只保留了最近2-3天的history | 修改逻辑：保留所有历史日期（从3月12日至今每天都有），不限制数量 |
| 缺少13日、14日历史 | 之前重建数据时丢失 | 从workspace的markdown文件恢复历史数据 |

---

## 📝 文献推送内容规范（必须严格遵守）

### 每篇论文必须包含的详细字段：

```json
{
  "title": "论文完整标题（英文）",
  "source": "期刊名 | 发表日期",
  "doi": "真实DOI链接",
  "publishDate": "YYYY-MM-DD",
  "summary": "摘要（80-150字，必须包含具体数据）",
  "keyPoints": [
    "工作要点1：具体方法和数据",
    "工作要点2：核心创新点",
    "工作要点3：主要成果（必须包含具体数值）",
    "工作要点4：性能指标对比"
  ],
  "bmsValue": [
    "对BMS的具体借鉴价值1：如何应用这项研究",
    "对BMS的具体借鉴价值2：可以改进哪些功能",
    "对BMS的具体借鉴价值3：潜在的产品化方向"
  ],
  "imageUrl": "./images/文章专属图片.jpg"
}
```

### keyPoints 写作规范：
- **必须**包含具体数值（如：容量1500mAh/g、循环1000次、精度98%）
- **必须**描述技术方法（如：使用XX算法、采用XX材料、构建XX模型）
- **必须**说明创新点（与现有方法相比的优势）
- 每个要点20-40字，用完整句子

### bmsValue 写作规范：
- 不能只写"电池健康评估"这种泛泛的词
- 必须说明**如何应用**（如：可以集成到XX算法中实现XX功能）
- 必须说明**具体场景**（如：在电动汽车/储能电站/无人机中的具体应用）
- 必须说明**预期效果**（如：可以提升XX精度XX%、降低XX成本XX%）

### 图片获取优先级：
1. **最高优先级**：从论文官网/PDF中提取关键 Figure 图片（如机制图、结果图）
2. **中等优先级**：从搜索引擎获取论文相关技术图片
3. **最低优先级**：如果以上都无法获取，根据论文内容生成一个描述性图片（使用 image_synthesize 工具）

### 示例（好的 keyPoints 和 bmsValue）：

**❌ 错误示例**：
```json
"keyPoints": ["玻璃相电解质", "快充", "25000次循环"],
"bmsValue": ["快充策略", "固体电池BMS", "寿命预测"]
```

**✅ 正确示例**：
```json
"keyPoints": [
  "采用硫代硼磷酸盐碘化物(LBPSI)玻璃相电解质，室温离子电导率达12.6 mS/cm",
  "实现快速固-固硫氧化还原反应(SSSRR)，解决动力学缓慢问题",
  "2C电流下容量1497 mAh/g硫，20C下仍保持784 mAh/g",
  "60°C下150C极端倍率充电可逆容量432 mAh/g，5C循环25000次容量保持80.2%"
],
"bmsValue": [
  "快充策略借鉴：LBPSI电解质的高离子电导特性可用于开发超快充电BMS算法，实现10分钟充满",
  "寿命预测模型：25000次循环数据可训练电池寿命预测模型，支持电池梯次利用筛选",
  "固体电池热管理：玻璃相电解质的稳定性和宽温度范围特性为固态BMS温度阈值设置提供依据"
]
```

---

## 📝 历史记录保存规范

### 原则：
- **保留所有历史**，不限制日期数量
- 每天的论文必须完整保存到 history 数组中
- 日期必须连续：2026-03-12 → 2026-03-13 → ... → 2026-03-17

### 历史记录滚动流程：
1. 每天追踪完成后，将当天的 currentPapers 移入 history
2. history 中每条记录格式：`{ "date": "YYYY-MM-DD", "papers": [...] }`
3. 不要删除任何历史日期，即使某天只有1篇论文也要保留

### 验证命令：
```bash
# 检查历史日期是否连续
cat docs/data.json | grep -o '"date": "[^"]*"' | head -20

# 检查每个历史日期的论文数
cat docs/data.json | grep -A 2 '"papers":' | head -30
```

---

### 2026-03-15 (第六次 - 验证论文真实性)

| 方向 | 论文标题 | DOI | 验证状态 |
|-----|---------|-----|---------|
| 新材料体系 | All-solid-state Li–S batteries | nature.com/s41586-024-08298-9 | ✅ 已验证 |
| SOH估算 | Generative learning assisted SOH | nature.com/s41467-024-54454-0 | ✅ 已验证 |
| 电池模型 | Physics-Based Battery Model Parametrisation | iopscience.org/10.1149/1945-7111/add41b | ✅ 已验证 |
| EIS检测 | Online multi-scenario impedance spectra | x-mol.com (Cell Reports) | ✅ 已验证 |
| AI/BMS | TATNS for SOC prediction | nature.com/s41598-025-32347-6 | ✅ 已验证 |
| 异常诊断 | Adaptive internal short-circuit detection | sciencedirect.com/s2352152X24004584 | ✅ 已验证 |
| 热失控 | T-RUNSAFE thermal runaway | nature.com/s41598-025-20886-x | ✅ 已验证 |
| 储能BMS | Mobile BESS optimal scheduling | sciencedirect.com/s2352152X20314523 | ✅ 已验证 |

**搜索技巧**：
- 使用 site:nature.com 或 site:sciencedirect.com 限定来源
- 搜索DOI时直接搜索完整DOI格式如 "10.1038/s41586-024-08298-9"

### 2026-03-18 (第八次 - 推送超时重试机制落实)

| 问题描述 | 原因 | 解决方案 |
|---------|------|---------|
| Git push 因网络超时失败 | cron任务中git push无重试逻辑，实际只尝试一次 | 使用指数退避循环最多5次 (5s→10s→20s→40s→80s) |
| 推送失败导致网页无法更新 | 以为有重试机制但实际未执行 | 必须在cron脚本中实现真实重试循环 |
| 单次push卡住不返回 | 无超时控制 | 使用 `timeout 30 git push` 限制单次超时，超时则计入下次重试 |
| 维护手册写了重试模板但cron未调用 | 之前只写了文档，实际cron任务未使用脚本 | 更新cron任务中的推送命令，明确每次都要执行重试 |

**今日推送命令（已成功）**：
```bash
bash -c "
max_retries=5
delay=5
for attempt in $(seq 1 $max_retries); do
  echo \"[$(date '+%H:%M:%S')] Push attempt $attempt/$max_retries...\"
  if timeout 30 git push origin main 2>&1; then
    echo '✅ Push successful!'
    exit 0
  fi
  echo \"❌ Failed, waiting ${delay}s...\"
  sleep $delay
  delay=$((delay * 2))
done
"
```

**推送成功后必须验证**：
```bash
curl -s "https://raw.githubusercontent.com/skylinezone/lithium-bms-tracking/main/docs/data.json" | grep "updateDate"
# 期望输出: "updateDate": "2026-03-18"
```

