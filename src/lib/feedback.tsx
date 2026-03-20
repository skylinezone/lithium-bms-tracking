import { useState, useEffect } from 'react';

export interface FeedbackItem {
  id: string;
  rating: number;           // 1-10
  comment: string;
  timestamp: number;          // Unix ms
  pageContext?: string;       // 当前浏览方向/论文
  userAgent?: string;
}

const STORAGE_KEY = 'li_feedback_items';

export function getAllFeedback(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFeedback(item: Omit<FeedbackItem, 'id' | 'timestamp'>): FeedbackItem {
  const all = getAllFeedback();
  const newItem: FeedbackItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : ''
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...all]));
  return newItem;
}

export function clearAllFeedback() {
  localStorage.removeItem(STORAGE_KEY);
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportFeedbackAs(type: 'json' | 'csv') {
  const items = getAllFeedback();
  const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  if (type === 'json') {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    triggerDownload(URL.createObjectURL(blob), `feedback_${ts}.json`);
  } else {
    const header = 'ID,评分(1-10),建议内容,提交时间,当前页面';
    const rows = items.map(it => {
      const time = new Date(it.timestamp).toLocaleString('zh-CN');
      const content = `"${(it.comment || '').replace(/"/g, '""')}"`;
      const ctx = `"${(it.pageContext || '').replace(/"/g, '""')}"`;
      return `${it.id},${it.rating},${content},${time},${ctx}`;
    });
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    triggerDownload(URL.createObjectURL(blob), `feedback_${ts}.csv`);
  }
}

// ===== Star Rating Input =====
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

// ===== Toast notification =====
interface ToastProps {
  message: string;
  type?: 'success' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-xl text-sm font-medium max-w-xs flex items-center gap-2 ${
        type === 'success'
          ? 'bg-green-50 border border-green-300 text-green-800'
          : 'bg-blue-50 border border-blue-300 text-blue-800'
      }`}
      style={{ animation: 'slideIn 0.2s ease-out' }}
    >
      <span>{type === 'success' ? '✅' : 'ℹ️'}</span>
      <span>{message}</span>
    </div>
  );
}
