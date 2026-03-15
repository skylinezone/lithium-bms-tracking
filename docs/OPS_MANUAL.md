# 锂电文献追踪系统 - 运维手册

## 📋 问题与解决方案记录

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
