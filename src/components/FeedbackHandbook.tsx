import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  clearAllFeedback,
  fetchMergedFeedback,
  updateFeedbackInLocal,
  deleteFeedbackFromLocal,
  exportFeedbackAs,
  isWorkerMode,
  FeedbackItem,
} from '../lib/feedback';

interface Props {
  onBack: () => void;
}

type SortKey = 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc' | 'featured';
type FilterRating = 'all' | 'high' | 'mid' | 'low';

export default function FeedbackHandbook({ onBack }: Props) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('date_desc');
  const [filterRating, setFilterRating] = useState<FilterRating>('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [confirmClear, setConfirmClear] = useState<string | false>(false);
  const [toast, setToast] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── 加载历史数据（localStorage + GitHub 合并）─────────────
  useEffect(() => {
    setLoading(true);
    fetchMergedFeedback()
      .then(data => { setItems(data); })
      .catch(() => setToast('❌ 加载历史反馈失败'))
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  // ── 排序 + 筛选 ──────────────────────────────────────────
  const processed = useMemo(() => {
    let result = [...items];

    // 筛选
    if (filterFeatured) result = result.filter(it => it.featured);
    if (filterDate) result = result.filter(it => it.date === filterDate);
    if (filterRating !== 'all') {
      result = result.filter(it =>
        filterRating === 'high' ? it.rating >= 8 :
        filterRating === 'mid' ? it.rating >= 5 && it.rating < 8 :
        it.rating < 5
      );
    }
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter(it =>
        it.comment.toLowerCase().includes(kw) ||
        (it.pageContext || '').toLowerCase().includes(kw)
      );
    }

    // 排序
    result.sort((a, b) => {
      if (sortKey === 'featured') {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
          b.timestamp - a.timestamp;
      }
      if (sortKey === 'rating_desc') return b.rating - a.rating;
      if (sortKey === 'rating_asc') return a.rating - b.rating;
      if (sortKey === 'date_desc') return b.timestamp - a.timestamp;
      if (sortKey === 'date_asc') return a.timestamp - b.timestamp;
      return 0;
    });

    return result;
  }, [items, sortKey, filterRating, filterDate, filterFeatured, keyword]);

  // ── 统计 ─────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (items.length === 0) return null;
    const avg = items.reduce((s, it) => s + it.rating, 0) / items.length;
    const high = items.filter(it => it.rating >= 8).length;
    const mid = items.filter(it => it.rating >= 5 && it.rating < 8).length;
    const low = items.filter(it => it.rating < 5).length;
    const featured = items.filter(it => it.featured).length;
    const dates = [...new Set(items.map(it => it.date))].sort().reverse();
    return { avg: avg.toFixed(1), high, mid, low, featured, total: items.length, dates };
  }, [items]);

  // ── 精选切换 ─────────────────────────────────────────────
  const handleToggleFeatured = (item: FeedbackItem) => {
    setTogglingId(item.id);
    const ok = updateFeedbackInLocal(item.id, { featured: !item.featured });
    if (ok) {
      setItems(prev => prev.map(it => it.id === item.id ? { ...it, featured: !it.featured } : it));
      showToast(!item.featured ? '✅ 已标记为精选' : '📋 已取消精选');
    } else {
      showToast('❌ 操作失败，请重试');
    }
    setTogglingId(null);
  };

  // ── 删除单条 ─────────────────────────────────────────────
  const handleDelete = (id: string) => {
    setDeletingId(id);
    const ok = deleteFeedbackFromLocal(id);
    if (ok) {
      setItems(prev => prev.filter(it => it.id !== id));
      showToast('🗑 已删除');
    } else {
      showToast('❌ 删除失败，请重试');
    }
    setDeletingId(null);
  };

  // ── 导出 ─────────────────────────────────────────────────
  const handleExport = (type: 'json' | 'csv') => {
    exportFeedbackAs(type, items);
    showToast(type === 'json' ? '📥 JSON 已下载' : '📥 CSV 已下载');
  };

  // ── 样式 ─────────────────────────────────────────────────
  const ratingColor = (r: number) =>
    r >= 8 ? 'bg-green-100 text-green-700' : r >= 5 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700';

  const ratingLabel = (r: number) =>
    r >= 8 ? '⭐ 优秀' : r >= 5 ? '👍 良好' : '💡 待改进';

  // 可选的日期列表（去重排序）
  const dateOptions = stats?.dates || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← 返回
        </button>
        <div className="h-5 w-px bg-gray-300" />
        <h1 className="font-semibold text-gray-800 text-base">📒 反馈建议手册</h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">{items.length} 条记录</span>
          <button onClick={() => handleExport('json')}
            className="text-xs px-2.5 py-1 border rounded hover:bg-gray-50 text-gray-600">📥 JSON</button>
          <button onClick={() => handleExport('csv')}
            className="text-xs px-2.5 py-1 border rounded hover:bg-gray-50 text-gray-600">📥 CSV</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">加载历史数据中...</div>
        )}

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📝</div>
            <h2 className="text-lg font-semibold text-gray-600 mb-1">暂无反馈</h2>
            <p className="text-sm text-gray-400">当有用户提交反馈后，将在此展示</p>
          </div>
        )}

        {/* 同步状态提示 */}
        {!loading && (
          <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm ${
            isWorkerMode()
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            <span>{isWorkerMode() ? '🌐' : '📱'}</span>
            <span>
              {isWorkerMode()
                ? '✅ 反馈已同步至 GitHub，所有用户可见'
                : '⚠️ 仅本地存储（换浏览器/设备后不可见），请联系管理员配置 GitHub 同步'}
            </span>
            <span className="ml-auto text-xs opacity-60">共 {items.length} 条</span>
          </div>
        )}

        {/* Stats cards */}
        {stats && !loading && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <StatCard label="总反馈" value={stats.total} color="bg-gray-100" textColor="text-gray-700" />
            <StatCard label="平均评分" value={stats.avg} suffix="/10" color="bg-blue-50" textColor="text-blue-700" />
            <StatCard label="⭐ 优秀" value={stats.high} color="bg-green-50" textColor="text-green-700" />
            <StatCard label="👍 良好" value={stats.mid} color="bg-blue-50" textColor="text-blue-600" />
            <StatCard label="💡 待改进" value={stats.low} color="bg-orange-50" textColor="text-orange-600" />
            <StatCard label="✨ 精选" value={stats.featured} color="bg-purple-50" textColor="text-purple-700" />
          </div>
        )}

        {/* Controls: Sort + Filter */}
        {items.length > 0 && !loading && (
          <div className="bg-white rounded-lg border p-3 space-y-3">

            {/* 排序 */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 font-medium">排序：</span>
              {([
                ['📅 最新在前', 'date_desc'],
                ['📅 最早在前', 'date_asc'],
                ['⭐ 高分优先', 'rating_desc'],
                ['⭐ 低分优先', 'rating_asc'],
                ['✨ 精选优先', 'featured'],
              ] as [string, SortKey][]).map(([label, val]) => (
                <button key={val} onClick={() => setSortKey(val)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    sortKey === val
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* 筛选 */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 font-medium">筛选：</span>

              {/* 评分筛选 */}
              <div className="flex gap-1">
                {([
                  ['全部', 'all'],
                  ['⭐ ≥8', 'high'],
                  ['👍 5-7', 'mid'],
                  ['💡 <5', 'low'],
                ] as [string, FilterRating][]).map(([label, val]) => (
                  <button key={val} onClick={() => setFilterRating(val)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                      filterRating === val
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-gray-300" />

              {/* 精选筛选 */}
              <button onClick={() => setFilterFeatured(v => !v)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  filterFeatured
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'
                }`}>
                ✨ 仅精选
              </button>

              {/* 日期筛选 */}
              {dateOptions.length > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-300" />
                  <select
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="text-xs px-2 py-1 border rounded text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                    <option value="">全部日期</option>
                    {dateOptions.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </>
              )}

              {/* 关键词搜索 */}
              <div className="flex-1 min-w-[140px]">
                <input
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="搜索关键词..."
                  className="w-full text-xs px-2.5 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* 重置 */}
              {(filterRating !== 'all' || filterDate || filterFeatured || keyword) && (
                <button
                  onClick={() => { setFilterRating('all'); setFilterDate(''); setFilterFeatured(false); setKeyword(''); }}
                  className="text-xs px-2 py-0.5 text-gray-400 hover:text-gray-600 underline">
                  重置
                </button>
              )}
            </div>

            <div className="text-xs text-gray-400 text-right">
              共 <strong>{processed.length}</strong> 条符合条件
              {filterFeatured && <span className="text-purple-500"> · 已选"仅精选"</span>}
            </div>
          </div>
        )}

        {/* Rating distribution bar */}
        {stats && stats.total > 0 && !loading && (
          <RatingBar stats={stats} />
        )}

        {/* Feedback list */}
        {!loading && processed.length > 0 && (
          <div className="space-y-3">
            {processed.map(item => (
              <div key={item.id}
                className={`bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow ${
                  item.featured ? 'border-purple-300 bg-purple-50/30' : ''
                }`}>

                {/* 第一行：标签组 */}
                <div className="flex items-start justify-between gap-3 mb-2.5 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 精选标识 */}
                    {item.featured && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-300">
                        ✨ 精选
                      </span>
                    )}
                    {/* 评分 */}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ratingColor(item.rating)}`}>
                      {item.rating} / 10
                    </span>
                    <span className="text-xs text-gray-400">{ratingLabel(item.rating)}</span>
                    <span className="text-gray-200">|</span>
                    {/* 日期 */}
                    <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                    <span className="text-gray-200">|</span>
                    {/* 时间 */}
                    <span className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleString('zh-CN', {
                        month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* 标记精选 */}
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      disabled={togglingId === item.id}
                      title={item.featured ? '取消精选' : '标记为精选'}
                      className={`text-xs px-2 py-1 rounded border transition-all ${
                        item.featured
                          ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'
                          : 'bg-white text-gray-400 border-gray-200 hover:text-purple-600 hover:border-purple-300'
                      } disabled:opacity-50`}>
                      {togglingId === item.id ? '...' : item.featured ? '✨ 精选' : '☆ 精选'}
                    </button>
                    {/* 删除 */}
                    <button
                      onClick={() => {
                        if (confirmClear === item.id) {
                          handleDelete(item.id);
                          setConfirmClear(false);
                        } else {
                          setConfirmClear(item.id);
                        }
                      }}
                      disabled={deletingId === item.id}
                      title="删除"
                      className={`text-xs px-2 py-1 rounded border transition-all ${
                        confirmClear === item.id
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-400 border-gray-200 hover:text-red-500 hover:border-red-300'
                      } disabled:opacity-50`}>
                      {deletingId === item.id ? '...' : confirmClear === item.id ? '⚠️ 确认' : '🗑'}
                    </button>
                  </div>
                </div>

                {/* 建议内容 */}
                {item.comment && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">{item.comment}</p>
                )}

                {/* 上下文 */}
                {item.pageContext && (
                  <div className="text-xs text-gray-400 bg-gray-50 rounded px-2 py-1 inline-block">
                    📄 {item.pageContext}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 无筛选结果 */}
        {!loading && items.length > 0 && processed.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            筛选结果为空，请调整筛选条件
          </div>
        )}

        {/* 清空全部 */}
        {!loading && items.length > 0 && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50 mt-6">
            <h3 className="text-sm font-semibold text-red-700 mb-1">⚠️ 数据管理</h3>
            <p className="text-xs text-red-500 mb-3">
              共 {items.length} 条历史反馈 · 此操作不可恢复，请先导出备份
            </p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => handleExport('json')}
                className="text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600">
                📥 导出备份
              </button>
              {confirmClear === 'ALL' ? (
                <>
                  <span className="text-xs text-red-600 flex items-center">确认清空全部？</span>
                  <button onClick={() => {
                    clearAllFeedback();
                    setItems([]);
                    setConfirmClear(false);
                    showToast('🗑 全部反馈已清空');
                  }}
                    className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">确认</button>
                  <button onClick={() => setConfirmClear(false)}
                    className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">取消</button>
                </>
              ) : (
                <button onClick={() => setConfirmClear('ALL')}
                  className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-100">
                  🗑 清空全部反馈
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-xl text-sm font-medium bg-green-50 border border-green-300 text-green-800">
          {toast}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, suffix = '', color, textColor }: {
  label: string; value: number | string; suffix?: string;
  color: string; textColor: string;
}) {
  return (
    <div className={`${color} rounded-lg p-3 text-center`}>
      <div className={`text-xl font-bold ${textColor}`}>{value}{suffix}</div>
      <div className="text-xs opacity-70 mt-0.5">{label}</div>
    </div>
  );
}

function RatingBar({ stats }: { stats: { high: number; mid: number; low: number; total: number } }) {
  const pct = (n: number) => `${((n / stats.total) * 100).toFixed(1)}%`;
  return (
    <div className="bg-white rounded-lg border p-3">
      <div className="text-xs text-gray-500 mb-2 font-medium">评分分布</div>
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 gap-0.5">
        <div className="bg-green-500 transition-all" style={{ width: pct(stats.high) }} />
        <div className="bg-blue-500 transition-all" style={{ width: pct(stats.mid) }} />
        <div className="bg-orange-400 transition-all" style={{ width: pct(stats.low) }} />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-gray-400">
        <span>⭐ {stats.high} ({pct(stats.high)})</span>
        <span>👍 {stats.mid} ({pct(stats.mid)})</span>
        <span>💡 {stats.low} ({pct(stats.low)})</span>
      </div>
    </div>
  );
}
