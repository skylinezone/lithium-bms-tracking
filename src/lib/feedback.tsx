import { useState, useEffect, useCallback } from 'react';

// ══════════════════════════════════════════════════════════════
// FeedbackItem — 扩展版（支持历史存储、精选、日期）
// ══════════════════════════════════════════════════════════════
export interface FeedbackItem {
  id: string;
  rating: number;           // 1-10
  comment: string;
  timestamp: number;        // Unix ms
  date: string;             // YYYY-MM-DD
  pageContext?: string;     // 当前浏览方向/论文
  featured: boolean;        // 是否为精选建议
  userAgent?: string;
}

const STORAGE_KEY = 'li_feedback_items';

// ── localStorage 读写 ────────────────────────────────────────

export function getAllFeedback(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveFeedbackToLocal(
  item: Omit<FeedbackItem, 'id' | 'timestamp' | 'date' | 'featured' | 'userAgent'>
): FeedbackItem {
  const all = getAllFeedback();
  const newItem: FeedbackItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    featured: false,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : '',
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...all]));
  return newItem;
}

export function updateFeedbackInLocal(id: string, patch: Partial<Pick<FeedbackItem, 'featured'>>): boolean {
  const all = getAllFeedback();
  const idx = all.findIndex(it => it.id === id);
  if (idx === -1) return false;
  all[idx] = { ...all[idx], ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return true;
}

export function deleteFeedbackFromLocal(id: string): boolean {
  const all = getAllFeedback();
  const filtered = all.filter(it => it.id !== id);
  if (filtered.length === all.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function clearAllFeedback(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── 从 GitHub 同步的历史数据（docs/feedback_history.json）─────
// 合并到本地，避免换浏览器后历史丢失

const GITHUB_HISTORY_URL = './feedback_history.json';

export async function fetchGitHubHistory(): Promise<FeedbackItem[]> {
  try {
    const res = await fetch(GITHUB_HISTORY_URL + '?t=' + Date.now(), {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch { return []; }
}

/**
 * 合并 localStorage 和 GitHub 历史数据
 * - localStorage 优先（最新提交）
 * - GitHub 历史补充本地没有的（去重 by id）
 */
export async function fetchMergedFeedback(): Promise<FeedbackItem[]> {
  const [local, remote] = await Promise.all([
    Promise.resolve(getAllFeedback()),
    fetchGitHubHistory(),
  ]);
  const seen = new Set(local.map(it => it.id));
  const remoteNew = remote.filter(it => !seen.has(it.id));
  return [...local, ...remoteNew];
}

// ── 导出功能（扩展字段）────────────────────────────────────

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportFeedbackAs(type: 'json' | 'csv', items: FeedbackItem[]) {
  const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  if (type === 'json') {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    triggerDownload(URL.createObjectURL(blob), `feedback_history_${ts}.json`);
  } else {
    const header = 'ID,日期,评分(1-10),精选,建议内容,提交时间,当前页面';
    const rows = items.map(it => {
      const time = new Date(it.timestamp).toLocaleString('zh-CN');
      const content = `"${(it.comment || '').replace(/"/g, '""')}"`;
      const ctx = `"${(it.pageContext || '').replace(/"/g, '""')}"`;
      return `${it.id},${it.date},${it.rating},${it.featured ? '✅' : '—'},${content},${time},${ctx}`;
    });
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    triggerDownload(URL.createObjectURL(blob), `feedback_history_${ts}.csv`);
  }
}

// ══════════════════════════════════════════════════════════════
// Star Rating Input
// ══════════════════════════════════════════════════════════════
interface StarRatingProps {
  value: number;
  onChange: (v: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1 flex-wrap items-center">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
            value >= n
              ? n >= 8
                ? 'bg-green-500 text-white shadow-sm ring-1 ring-green-400'
                : n >= 5
                ? 'bg-blue-500 text-white shadow-sm ring-1 ring-blue-400'
                : 'bg-orange-400 text-white shadow-sm ring-1 ring-orange-300'
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
          }`}
        >
          {n}
        </button>
      ))}
      <span className="text-xs ml-1.5" style={{ color: value >= 8 ? '#22c55e' : value >= 5 ? '#3b82f6' : '#f97316' }}>
        {value >= 8 ? '⭐ 优秀' : value >= 5 ? '👍 良好' : '💡 待改进'}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Toast notification
// ══════════════════════════════════════════════════════════════
interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-green-50 border-green-300 text-green-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
    error: 'bg-red-50 border-red-300 text-red-800',
  };
  const icons = { success: '✅', info: 'ℹ️', error: '❌' };

  return (
    <div
      className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-xl text-sm font-medium max-w-xs flex items-center gap-2 border ${colors[type]}`}
      style={{ animation: 'slideIn 0.2s ease-out' }}
    >
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
