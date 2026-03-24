/**
 * GitHub Feedback Worker
 * 
 * 功能：接收反馈提交 → 自动 commit 到 GitHub 仓库的 docs/feedback_history.json
 * 
 * 部署方法：
 * 1. 登录 https://dash.cloudflare.com → Workers & Pages → 创建 Worker
 * 2. 把本文件内容粘贴到 Worker 编辑器
 * 3. 设置环境变量（Settings → Variables）：
 *    - GITHUB_TOKEN：GitHub Personal Access Token（需要有 repo 写权限）
 *    - GITHUB_OWNER：skylinezone
 *    - GITHUB_REPO：lithium-bms-tracking
 *    - GITHUB_BRANCH：main
 *    - FEEDBACK_PATH：docs/feedback_history.json
 * 4. 点击"部署"
 * 5. Worker URL 即为提交地址（如 https://github-feedback.signalcyber.workers.dev/）
 */

const ALLOWED_ORIGINS = [
  'https://skylinezone.github.io',
  'https://lithium-bms-tracking.pages.dev',
  'http://localhost:5173',  // 本地开发
];

// ── CORS 响应 ────────────────────────────────────────────────
function cors OPTIONS 请求
function handleOptions(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));
  return new Response(null, {
    status: allowed ? 204 : 403,
    headers: {
      ...(allowed ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      } : {}),
    },
  });
}

// ── GitHub API：获取文件 SHA（用于更新）───────────────────────
async function getFileSHA(owner, repo, path, branch, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Feedback-Worker/1.0',
    },
  });
  if (res.status === 404) return null; // 文件不存在，首次创建
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub GET ${url} failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.sha || null;
}

// ── GitHub API：创建或更新文件 ──────────────────────────────
async function upsertFile(owner, repo, path, branch, content, sha, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const body = {
    message: `📒 反馈提交：${content.date} 评分${content.rating} ${content.comment?.slice(0, 30) || ''}...`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
    branch,
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'GitHub-Feedback-Worker/1.0',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} ${text}`);
  }
  return await res.json();
}

// ── 读取当前历史，返回合并后的数组 ─────────────────────────
async function getMergedHistory(owner, repo, path, branch, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Feedback-Worker/1.0',
    },
  });
  if (res.status === 404) return []; // 首次
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
  const json = await res.json();
  const raw = atob(json.content);
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

// ── 主 Handler ─────────────────────────────────────────────
async function handleRequest(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));
  const corsHeaders = allowed ? { 'Access-Control-Allow-Origin': origin } : {};

  // CORS preflight
  if (request.method === 'OPTIONS') return handleOptions(request);

  const { GITHUB_TOKEN, GITHUB_OWNER = 'skylinezone', GITHUB_REPO = 'lithium-bms-tracking', GITHUB_BRANCH = 'main', FEEDBACK_PATH = 'docs/feedback_history.json' } = env;

  if (!GITHUB_TOKEN) {
    return jsonResponse({ error: 'GITHUB_TOKEN not configured' }, { status: 500, headers: corsHeaders });
  }

  // ── GET：返回全部历史反馈 ─────────────────────────────────
  if (request.method === 'GET') {
    try {
      const history = await getMergedHistory(GITHUB_OWNER, GITHUB_REPO, FEEDBACK_PATH, GITHUB_BRANCH, GITHUB_TOKEN);
      return jsonResponse({ success: true, data: history, count: history.length }, { headers: corsHeaders });
    } catch (e) {
      return jsonResponse({ error: e.message }, { status: 500, headers: corsHeaders });
    }
  }

  // ── POST：提交新反馈 ─────────────────────────────────────
  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders });
    }

    const { rating, comment, pageContext } = body;

    // 验证必填字段
    if (!rating || rating < 1 || rating > 10) {
      return jsonResponse({ error: '评分必须在1-10之间' }, { status: 400, headers: corsHeaders });
    }

    // 构建反馈条目
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      rating: Number(rating),
      comment: (comment || '').trim(),
      pageContext: pageContext || '',
      timestamp: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      featured: false,
      ip: request.headers.get('CF-Connecting-IP') || '',  // Cloudflare 真实 IP
    };

    try {
      // 读取现有历史
      const history = await getMergedHistory(GITHUB_OWNER, GITHUB_REPO, FEEDBACK_PATH, GITHUB_BRANCH, GITHUB_TOKEN);

      // 获取文件 SHA（判断是否首次创建）
      const sha = await getFileSHA(GITHUB_OWNER, GITHUB_REPO, FEEDBACK_PATH, GITHUB_BRANCH, GITHUB_TOKEN);

      // 追加新反馈（最新在前）
      const updated = [newItem, ...history];

      // 写回 GitHub
      await upsertFile(GITHUB_OWNER, GITHUB_REPO, FEEDBACK_PATH, GITHUB_BRANCH, updated, sha, GITHUB_TOKEN);

      return jsonResponse({
        success: true,
        data: newItem,
        total: updated.length,
      }, { status: 201, headers: corsHeaders });

    } catch (e) {
      return jsonResponse({ error: `提交失败：${e.message}` }, { status: 500, headers: corsHeaders });
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
}

function jsonResponse(body, opts = {}) {
  return new Response(JSON.stringify(body), {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
}

export default {
  fetch(request, env, ctx) {
    return handleRequest(request, env).catch(e =>
      jsonResponse({ error: `Worker error: ${e.message}` }, { status: 500 })
    );
  },
};
