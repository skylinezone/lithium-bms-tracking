// Feedback API Server — 锂电文献追踪
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = path.join(__dirname, 'feedback_history.json');
const PORT = 3001;

// ── 历史记录文件读写 ──────────────────────────────────────────
function readHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

function writeHistory(items) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

// ── App ──────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// 静态文件（serve built React app）
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// ── API 路由（精确匹配，避免与 SPA 路由冲突）─────────────────

app.get('/api/feedback', (req, res) => {
  const items = readHistory();
  res.json({ success: true, data: items });
});

app.post('/api/feedback', (req, res) => {
  const { rating, comment, pageContext } = req.body;
  if (!rating || rating < 1 || rating > 10) {
    return res.status(400).json({ success: false, error: '评分必须在1-10之间' });
  }
  const items = readHistory();
  const newItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    rating: Number(rating),
    comment: (comment || '').trim(),
    pageContext: pageContext || '',
    timestamp: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    featured: false,
    userAgent: req.headers['user-agent']?.slice(0, 120) || '',
  };
  items.unshift(newItem);
  writeHistory(items);
  res.json({ success: true, data: newItem });
});

app.patch('/api/feedback/:id', (req, res) => {
  const { id } = req.params;
  const { featured } = req.body;
  const items = readHistory();
  const idx = items.findIndex(it => it.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: '未找到该反馈' });
  if (typeof featured === 'boolean') items[idx].featured = featured;
  writeHistory(items);
  res.json({ success: true, data: items[idx] });
});

app.delete('/api/feedback/:id', (req, res) => {
  const { id } = req.params;
  const items = readHistory();
  const filtered = items.filter(it => it.id !== id);
  if (filtered.length === items.length) {
    return res.status(404).json({ success: false, error: '未找到该反馈' });
  }
  writeHistory(filtered);
  res.json({ success: true });
});

// SPA fallback：只有当 dist/index.html 存在时才拦截
if (fs.existsSync(indexPath)) {
  // 精确列出前端路由，避免 API 被误拦截
  const FRONTEND_ROUTES = ['/', '/index.html'];
  app.get(FRONTEND_ROUTES, (req, res) => res.sendFile(indexPath));
  // 其余全部返回 index.html（由 React Router 处理）
  app.get('/{*rest}', (req, res) => res.sendFile(indexPath));
} else {
  app.get('/', (req, res) => res.status(503).send('Build required: cd /workspace/lithium-tracking && pnpm build'));
}

app.listen(PORT, () => {
  console.log(`✅ Feedback server running at http://localhost:${PORT}`);
  console.log(`📒 Feedback history: ${HISTORY_FILE}`);
  console.log(`📁 Serving dist: ${fs.existsSync(distPath) ? 'YES' : 'NO'}`);
});
