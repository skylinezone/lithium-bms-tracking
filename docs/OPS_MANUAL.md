# OPS_MANUAL.md — 锂电文献追踪系统 维护手册

> 本文件记录系统运行中发现的所有问题、根因和修复方案。
> 每次故障修复后必须更新本文件，防止同类问题重复发生。
> 维护手册也是 cron 任务的检查清单——每日任务应验证本手册中的所有条目。

---

## 一、系统架构（必读）

```
cron触发
  → 执行文献搜索 + 生成 data.json + 编译前端
  → 重建 docs/data.json（含当日8篇 + 历史累积）
  → pnpm build → dist/
  → cp dist/* docs/（注意：不要rm docs/）
  → git add + git commit + git push（含5次重试）
  → GitHub Pages 自动从 docs/ 构建网站
```

**关键原则：docs/ 是 GitHub Pages 部署目录，不得使用 `rm -rf docs` 或 `rsync --delete`！**
**每次 `pnpm build` 后，只能 `cp dist/* docs/`（覆盖同名文件）而非替换整个目录。**

---

## 二、每日推送检查清单

每次 cron 执行完毕，必须逐项确认：

- [ ] `docs/data.json` 的 `updateDate` 为今日日期
- [ ] `currentPapers` 有 8 篇，每篇包含：
  - [ ] `titleCn`（中文标题，非英文字符，必填）
  - [ ] `keyPoints`（每篇 5 条，每条 40-60 字，含具体数值）
  - [ ] `bmsValue`（每篇 3 条，每条 40-60 字，含具体应用场景）
  - [ ] `imageUrl`（指向 `./images/xxx.jpg`，文件必须存在于 `docs/images/`）
- [ ] `history` 今日条目有 8 篇（从 `currentPapers` 移入昨日内容）
- [ ] 历史论文每篇也有 `titleCn`、`keyPoints`、`bmsValue`、`imageUrl`
- [ ] `git push` 成功（验证 GitHub raw URL 可访问）
- [ ] 网页可访问：https://skylinezone.github.io/lithium-bms-tracking/

---

## 三、图片规范（最高优先级）

### 3.1 图片获取优先级

| 优先级 | 来源 | 说明 |
|--------|------|------|
| **P1 必须** | 论文官网/期刊官方 Figure | Nature/ScienceDirect/Springer 等下载原始 figure 图片 |
| P2 参考 | 学术图片库 | Science/AAAS、Pubs ACS、Cell Press 等官方图库 |
| P3 备选 | AI 生成描述性图片 | 仅在前两者均无法获取时使用，且必须与论文内容高度相关 |

### 3.2 图片文件命名规范

图片文件必须与论文主题精准对应：
- `li_metal_anode_xxx.jpg` → 锂金属负极相关
- `solid_electrolyte_xxx.jpg` → 固态电解质相关
- 禁止：不同方向的论文使用同一张通用示意图

### 3.3 常见错误

> **❌ 错误**：将 Nature Communications 上某篇 SOH 估算论文的图用于锂金属负极论文
> **✅ 正确**：每个 research direction 对应一张与论文主题直接相关的图

---

## 四、内容质量规范

### 4.1 keyPoints 要求

- 每篇论文 **5 条**，每条 **40-60 个中文字符**
- 必须包含：**具体数值**（如"库仑效率99.2%"、"循环500次"）+ **方法描述** + **创新点**
- ❌ 禁止：仅写"很好"、"性能提升"等空泛描述

### 4.2 bmsValue 要求

- 每篇论文 **3 条**，每条 **40-60 个中文字符**
- 必须包含：**具体 BMS 应用场景**（如"充电策略"、"SOH估算"、"热管理"） + **实现方式** + **预期效果**
- 不得出现"BMS可以参考"类的废话

### 4.3 标题要求

- 每篇论文必须提供 `titleCn`（中文标题）
- 中文标题应准确传达论文核心发现/方法
- 来源信息（期刊、年份）放在 `source` 字段

---

## 五、历史数据完整性

### 5.1 每天必须保存 8 篇文献

cron 任务执行时：
1. 将 `currentPapers`（当日 8 篇）写入 `history` 的今日条目
2. 然后用新搜索结果替换 `currentPapers`
3. **不得覆盖或清空已有的 `history` 条目**

### 5.2 已知数据缺失记录

| 日期 | 实际篇数 | 原因 | 备注 |
|------|----------|------|------|
| 2026-03-12 | 1 篇 | 数据保存机制不完善 | 仅保留 AI/BMS 方向 |
| 2026-03-13 | 1 篇 | 同上 | 仅保留硅基负极 |
| 2026-03-14 | 1 篇 | 同上 | 仅保留正极材料 |
| 2026-03-15 | 2 篇 | 同上 | 仅保留 Li-S 电池、电池安全 |
| 2026-03-16 | 2 篇 | 同上 | 仅保留固态电解质、锂金属负极 |
| 2026-03-17 | 3 篇 | 同上 | 仅保留正极材料、快充技术、电池回收 |
| 2026-03-18 | 8 篇 | 开始修复 | 系统修复后首批完整数据 |
| 2026-03-19+ | 8 篇/天 | 修复完成 | 应保持每日 8 篇 |

> 如需补全历史数据，需回溯原始文献重新补充 `keyPoints`、`bmsValue`、`titleCn`。

---

## 六、前端 App.tsx 规范

### 6.1 方向分类（DIRECTIONS）

App.tsx 中的 `DIRECTIONS` 数组**必须**与 `data.json` 中论文的 `category` 字段完全匹配：

```typescript
const DIRECTIONS = [
  "全部", "锂金属负极", "固态电解质", "锂硫电池",
  "硅基负极", "正极材料", "电池安全", "快充技术", "电池回收",
];
```

> ⚠️ 不得使用 "新材料体系"、"SOH估算"、"AI/BMS" 等旧分类名称——这些是 history 数据中的旧分类，但新数据统一使用上述 8 大方向。

### 6.2 历史面板

- 左侧列表：显示所有历史日期，每条显示日期 + 篇数 + 方向标签
- 点击日期：右侧显示该日所有论文（支持分页，每页 8 篇）
- 点击论文：打开详情弹窗（与主页一致的卡片样式）

### 6.3 论文卡片显示

- 主标题：显示 `titleCn`（中文）
- 副标题：显示 `title`（英文原文，小字灰色）
- 图片：`imageUrl`，使用 onError 回退图防止 404
- 摘要：显示 `summary`（前两行截断）

---

## 七、故障记录

### 2026-03-19（全面修复）

**问题 1：cron 未完整执行推送**
- 根因：cron 孤立会话只生成 markdown 报告，未同步更新 `docs/data.json` 并推送
- 修复：cron 任务文本改为明确的全链路执行指令

**问题 2：图片与论文严重不匹配**
- 根因：未按手册优先级获取图片，多篇论文共用一张通用 ML 示意图
- 修复：从 Nature/Springer/ACS 官网下载真实 Figure 图片，每篇专属匹配

**问题 3：历史论文图片共用一张图**
- 根因：history 数据中的 `imageUrl` 全都指向同一张图片
- 修复：为所有历史论文（共 18 篇）分别搜索并下载对应图片

**问题 4：历史论文缺少 keyPoints/bmsValue/titleCn**
- 根因：早期 cron 任务只保存了 title/summary/soucre/id/category
- 修复：用 Python 脚本补充所有缺失字段

**问题 5：方向标签点击无内容**
- 根因：App.tsx 的 `DIRECTIONS` 数组使用旧分类名称，与 data.json 的 category 不匹配
- 修复：更新 `DIRECTIONS` 为 8 大方向，与 data.json 完全对应

**问题 6：历史面板点击论文报错 Cannot read properties of undefined (reading 'map')**
- 根因：history 论文缺少 `keyPoints`/`bmsValue`/`publishDate` 等字段，detail modal 对其调用 .map() 报错
- 修复：补全所有历史论文的完整字段

**问题 7：构建过程丢失 docs/data.json 和图片**
- 根因：使用 `rm -rf docs && cp -r dist docs` 覆盖整个目录
- 修复：`cp dist/* docs/`（仅覆盖同名文件，不删除 docs 原有内容）

**问题 8：push 多次重试失败**
- 根因：网络超时 + git 繁忙
- 修复：调整重试延迟（5s → 10s → 20s → 40s → 80s），总超时 90s

---

*本手册最后更新：2026-03-19*
*更新人：自动追踪系统*
