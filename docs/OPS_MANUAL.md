# 锂电文献追踪系统 - 运维手册

## 📋 问题与解决方案记录

### 2026-03-14 (第1次追踪)

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
- 持续更新中...
