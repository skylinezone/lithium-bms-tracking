import { useState, useMemo } from 'react';
import { getAllFeedback, clearAllFeedback, exportFeedbackAs, FeedbackItem } from '../lib/feedback';

interface Props {
  onBack: () => void;
}

type FilterRating = 'all' | 'high' | 'mid' | 'low';

export default function FeedbackHandbook({ onBack }: Props) {
  const [items, setItems] = useState<FeedbackItem[]>(getAllFeedback);
  const [filterRating, setFilterRating] = useState<FilterRating>('all');
  const [keyword, setKeyword] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => {
    return items.filter(it => {
      const matchRating =
        filterRating === 'all' ? true :
        filterRating === 'high' ? it.rating >= 8 :
        filterRating === 'mid' ? it.rating >= 5 && it.rating < 8 :
        it.rating < 5;
      const matchKw = !keyword || it.comment.includes(keyword) || (it.pageContext || '').includes(keyword);
      return matchRating && matchKw;
    });
  }, [items, filterRating, keyword]);

  const stats = useMemo(() => {
    if (items.length === 0) return null;
    const avg = items.reduce((s, it) => s + it.rating, 0) / items.length;
    const high = items.filter(it => it.rating >= 8).length;
    const mid = items.filter(it => it.rating >= 5 && it.rating < 8).length;
    const low = items.filter(it => it.rating < 5).length;
    return { avg: avg.toFixed(1), high, mid, low, total: items.length };
  }, [items]);

  const handleExportJson = () => {
    exportFeedbackAs('json');
    setToast('JSON 已下载');
    setTimeout(() => setToast(''), 3000);
  };

  const handleExportCsv = () => {
    exportFeedbackAs('csv');
    setToast('CSV 已下载');
    setTimeout(() => setToast(''), 3000);
  };

  const handleClear = () => {
    clearAllFeedback();
    setItems([]);
    setConfirmClear(false);
    setToast('所有反馈已清空');
    setTimeout(() => setToast(''), 3000);
  };

  const ratingColor = (r: number) =>
    r >= 8 ? 'bg-green-100 text-green-700' : r >= 5 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700';

  const ratingLabel = (r: number) =>
    r >= 8 ? '⭐ 优秀' : r >= 5 ? '👍 良好' : '💡 待改进';

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
          <button onClick={handleExportJson}
            className="text-xs px-2.5 py-1 border rounded hover:bg-gray-50 text-gray-600">📥 JSON</button>
          <button onClick={handleExportCsv}
            className="text-xs px-2.5 py-1 border rounded hover:bg-gray-50 text-gray-600">📥 CSV</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-4">

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📝</div>
            <h2 className="text-lg font-semibold text-gray-600 mb-1">暂无反馈</h2>
            <p className="text-sm text-gray-400">当有用户提交反馈后，将在此展示</p>
          </div>
        )}

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCard label="总反馈" value={stats.total} color="bg-gray-100" textColor="text-gray-700" />
            <StatCard label="平均评分" value={stats.avg} suffix="/10" color="bg-blue-50" textColor="text-blue-700" />
            <StatCard label="⭐ 优秀" value={stats.high} color="bg-green-50" textColor="text-green-700" />
            <StatCard label="👍 良好" value={stats.mid} color="bg-blue-50" textColor="text-blue-600" />
            <StatCard label="💡 待改进" value={stats.low} color="bg-orange-50" textColor="text-orange-600" />
          </div>
        )}

        {/* Filters */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg border p-3 flex flex-wrap gap-3 items-center">
            <span className="text-sm text-gray-500 font-medium">筛选：</span>
            <div className="flex gap-1.5 flex-wrap">
              {([
                ['全部', 'all'],
                ['⭐ 优秀(≥8)', 'high'],
                ['👍 良好(5-7)', 'mid'],
                ['💡 待改进(<5)', 'low'],
              ] as [string, FilterRating][]).map(([label, val]) => (
                <button key={val} onClick={() => setFilterRating(val)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    filterRating === val
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="搜索关键词..."
              className="flex-1 min-w-[160px] text-sm px-2.5 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-xs text-gray-400 whitespace-nowrap">符合 {filtered.length} 条</span>
          </div>
        )}

        {/* Rating distribution bar */}
        {stats && stats.total > 0 && (
          <RatingBar stats={stats} />
        )}

        {/* Feedback list */}
        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id} className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ratingColor(item.rating)}`}>
                      {item.rating} / 10
                    </span>
                    <span className="text-xs text-gray-400">{ratingLabel(item.rating)}</span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>

                {item.comment && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">{item.comment}</p>
                )}

                {item.pageContext && (
                  <div className="text-xs text-gray-400 bg-gray-50 rounded px-2 py-1 inline-block">
                    📄 {item.pageContext}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            筛选结果为空，请调整筛选条件
          </div>
        )}

        {/* Danger zone */}
        {items.length > 0 && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50 mt-6">
            <h3 className="text-sm font-semibold text-red-700 mb-1">⚠️ 数据管理</h3>
            <p className="text-xs text-red-500 mb-3">此操作不可恢复，请先导出备份</p>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">确认清空所有反馈？</span>
                <button onClick={handleClear}
                  className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">确认清空</button>
                <button onClick={() => setConfirmClear(false)}
                  className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">取消</button>
              </div>
            ) : (
              <button onClick={() => setConfirmClear(true)}
                className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-100">
                🗑 清空所有反馈
              </button>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-xl text-sm font-medium bg-green-50 border border-green-300 text-green-800">
          ✅ {toast}
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
