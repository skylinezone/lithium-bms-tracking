# 锂电文献追踪系统 - 运维手册

## 📋 问题总结

### 2026-03-14 发生的问题

| 问题 | 原因 | 后果 |
|------|------|------|
| 14日数据丢失 | 每次运行 `pnpm build` 会覆盖 dist/data.json | 用户看不到新论文 |
| GitHub Pages不更新 | 项目使用 **docs 目录**作为源，但我多次只更新了 dist 目录 | 网页显示旧内容 |
| 数据被覆盖 | 误以为写入 dist/data.json 即可，其实 Vite build 会从 public 目录复制覆盖 | 丢失更新 |
| 验证不足 | 每次推送后没有验证 GitHub 上的最终数据 | 问题延迟发现 |

---

## ✅ 正确更新流程

### 关键原则
- **docs/** = GitHub Pages 部署目录 ✅ （唯一正确的目标目录）
- **dist/** = Vite 构建产物（会被覆盖，不要依赖）

### 标准操作步骤

```
步骤1: 搜索论文数据 → 获取新论文列表
步骤2: 直接写入 docs/data.json （不运行build）
步骤3: 提交推送: git add docs/data.json → commit → push
步骤4: 验证 GitHub raw 文件内容
```

### 验证命令
```bash
# 查看GitHub上的updateDate
curl -s "https://raw.githubusercontent.com/skylinezone/lithium-bms-tracking/main/docs/data.json" | head -3
```

### GitHub Pages 地址
```
https://skylinezone.github.io/lithium-bms-tracking/
```

---

## 📊 数据结构

```json
{
  "updateDate": "YYYY-MM-DD",           // 当前更新日期
  "currentPapers": [                     // 今日论文（8篇）
    {
      "id": 1,
      "category": "新材料体系",           // 8个类别之一
      "title": "标题",
      "source": "来源 | 日期",
      "doi": "DOI链接",
      "publishDate": "YYYY-MM-DD",
      "views": 1000,
      "summary": "摘要",
      "keyPoints": ["要点1", "要点2"],
      "bmsValue": ["BMS价值1"],
      "imageUrl": "./images/xxx.jpg"     // 本地图片路径
    }
  ],
  "history": [                           // 历史记录
    {
      "date": "YYYY-MM-DD",
      "papers": [...]                    // 当日论文列表
    }
  ]
}
```

---

## 🖼️ 图片管理

### 图片存放位置
- 本地：`/workspace/lithium-tracking/public/images/`
- GitHub：`docs/images/`

### 更新图片步骤
```bash
# 1. 搜索并下载图片到 imgs/
# 2. 复制到 public/images/
cp /workspace/imgs/*.jpg /workspace/lithium-tracking/public/images/

# 3. 构建（会复制public到dist）
pnpm build

# 4. 复制dist到docs（关键！）
rm -rf docs && cp -r dist docs

# 5. 提交推送
git add -A && git commit -m "Update with images" && git push
```

---

## 🔧 定时任务

- **执行时间**: 每日早上 10:00 (Asia/Shanghai)
- **任务内容**: 锂电文献每日追踪（8个方向）
- **预期结果**: 
  - 8篇新论文（currentPapers）
  - 昨日论文自动进入历史（history）
  - 每日数据完整保存

---

## ⚠️ 注意事项

1. **永远不要依赖 dist 目录** - 它会被 Vite build 覆盖
2. **永远只修改 docs 目录** - 这是 GitHub Pages 的源
3. **每次推送后必验证** - 用 curl 检查 GitHub 上的实际内容
4. **不要运行不必要的 build** - 如果只改 data.json，不需要重新 build

---

## 📞 紧急回滚

如果发布出错且无法快速修复：
```bash
# 查看之前的稳定版本
git log --oneline -10

# 回滚到指定版本
git reset --hard <commit-hash>
git push --force
```
