import { useState, useEffect, useCallback } from 'react';
import { Search, SortAsc, Calendar, MessageCircle, X, BookOpen } from 'lucide-react';
import FeedbackHandbook from './components/FeedbackHandbook';
import { getAllFeedback, saveFeedbackToLocal, Toast } from './lib/feedback';

interface Paper {
  id: number;
  category: string;
  direction: string;
  titleCn: string;
  title: string;
  source: string;
  doi: string;
  summary: string;
  keyPoints: string[];
  bmsValue: string[];
  imageUrl: string;
  publishDate: string;
  views: number;
}

interface Data {
  updateDate: string;
  currentPapers?: Paper[];
  papers?: Paper[];
  history?: { date: string; papers: Paper[] }[];
}

const DIRECTIONS = [
  { label: "全部",              value: "全部" },
  { label: "①新材料体系",    value: "新材料体系" },
  { label: "②SOH估算",         value: "SOH估算" },
  { label: "③先进电池模型",   value: "先进电池模型" },
  { label: "④EIS检测",        value: "EIS检测" },
  { label: "⑤AI/机器学习",    value: "AI/机器学习" },
  { label: "⑥电池异常诊断",   value: "电池异常诊断" },
  { label: "⑦热失控",          value: "热失控" },
  { label: "⑧非乘用车场景",   value: "非乘用车场景" },
];

const PAGE_SIZE = 8;
const HIST_PAGE_SIZE = 8;

export default function App() {
  const [data, setData] = useState<Data | null>(null);
  const [history, setHistory] = useState<{ date: string; papers: Paper[] }[]>([]);
  const [selectedDirection, setSelectedDirection] = useState("全部");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "views">("relevance");
  const [showComment, setShowComment] = useState(false);
  const [showHandbook, setShowHandbook] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newQuality, setNewQuality] = useState(7);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [toast, setToast] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHist, setSelectedHist] = useState<{ date: string; papers: Paper[] } | null>(null);
  const [page, setPage] = useState(1);
  const [histPage, setHistPage] = useState(1);
  // 图片放大镜
  const [zoomedImg, setZoomedImg] = useState<{ src: string; caption: string } | null>(null);

  useEffect(() => { setPage(1); }, [search, selectedDirection, sortBy]);
  useEffect(() => { setHistPage(1); }, [selectedHist]);

  useEffect(() => {
    fetch('./data.json')
      .then(r => r.json())
      .then(d => {
        setData(d);
        if (d.history) setHistory(d.history);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 同步反馈数量 badge
  useEffect(() => {
    const updateCount = () => setFeedbackCount(getAllFeedback().length);
    updateCount();
    window.addEventListener('feedback:refresh', updateCount);
    return () => window.removeEventListener('feedback:refresh', updateCount);
  }, []);

  const normalize = (p: Paper): Paper => ({
    ...p,
    direction: p.direction || p.category,
  });

  const todayPapers: Paper[] = (data?.currentPapers || data?.papers || []).map(normalize);
  const allPapers: Paper[] = [
    ...todayPapers,
    ...history.flatMap(h => h.papers.map(normalize)),
  ];

  // ---- 模糊搜索评分 ----
  const scorePaper = (p: Paper, kw: string): number => {
    if (!kw) return 1;
    const k = kw.toLowerCase();
    const tokens = k.split(/\s+/).filter(Boolean);

    // 字段权重
    const w: [string, number][] = [
      [p.titleCn.toLowerCase(), 3],
      [p.title.toLowerCase(), 2.5],
      [p.summary.toLowerCase(), 2],
      [(p.keyPoints || []).join(' ').toLowerCase(), 1.5],
      [(p.bmsValue || []).join(' ').toLowerCase(), 1.2],
      [p.direction.toLowerCase(), 1],
      [p.source.toLowerCase(), 0.5],
    ];

    let score = 0;
    for (const [text, weight] of w) {
      for (const tok of tokens) {
        if (text.includes(tok)) {
          score += weight * (tok.length / Math.max(text.length, 1));
          // 完整词组匹配额外加分
          if (text.includes(k)) score += weight * 2;
        }
      }
    }
    return score;
  };

  const filterPapers = useCallback((list: Paper[]): Paper[] => {
    let f = list.filter(p => {
      if (!p.publishDate) return false;
      if (selectedDirection !== "全部" && p.direction !== selectedDirection) return false;
      if (!search.trim()) return true;
      return scorePaper(p, search.trim()) > 0;
    });

    // 排序
    if (search.trim() && sortBy === 'relevance') {
      // 相关度：按搜索评分降序，彻底无关（score=0）在搜索时已过滤
      f.sort((a, b) => scorePaper(b, search.trim()) - scorePaper(a, search.trim()));
    } else if (sortBy === 'date') {
      f.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    } else {
      f.sort((a, b) => b.views - a.views);
    }
    return f;
  }, [search, selectedDirection, sortBy]);

  const filtered = filterPapers(allPapers);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const endIdx = Math.min(startIdx + PAGE_SIZE, filtered.length);

  const histFiltered = selectedHist ? filterPapers(selectedHist.papers.map(normalize)) : [];
  const histTotalPages = Math.max(1, Math.ceil(histFiltered.length / HIST_PAGE_SIZE));
  const histStart = (histPage - 1) * HIST_PAGE_SIZE;
  const histPageItems = histFiltered.slice(histStart, histStart + HIST_PAGE_SIZE);

  const histDirStats = (papers: Paper[]) => {
    const m = new Map<string, number>();
    papers.forEach(p => m.set(p.direction, (m.get(p.direction) || 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  };

  // 分页页码按钮（最多显示7个）
  const pageNumbers = (): number[] => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1); pages.push(totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1); pages.push(-1);
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1); pages.push(-1);
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push(-1); pages.push(totalPages);
    }
    return pages;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl text-gray-500">加载中...</div></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-red-500">数据加载失败</div></div>;

  if (showHandbook) {
    return (
      <FeedbackHandbook
        onBack={() => {
          setShowHandbook(false);
          setFeedbackCount(getAllFeedback().length);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-start gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-1">🔋 锂电前沿文献追踪</h1>
            <p className="text-blue-100 text-sm">BMS算法前瞻研究 · 每日更新</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowHandbook(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors text-sm relative">
              <BookOpen size={15} />手册
              {feedbackCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {feedbackCount > 99 ? '99+' : feedbackCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowComment(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
              <MessageCircle size={16} />反馈
            </button>
          </div>
        </div>
      </header>

      {/* Search + Sort + History */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="输入任意关键词，模糊匹配文献标题、摘要、要点..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <div className="flex border rounded-lg overflow-hidden text-xs">
              {([['relevance','🔥 相关度'],['date','📅 日期'],['views','👁 热度']] as [typeof sortBy, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setSortBy(val)}
                  className={`px-3 py-2 transition-colors ${
                    sortBy === val ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowHistory(h => !h)}
              className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
              <Calendar size={15} />历史
            </button>
          </div>
        </div>
        {search && (
          <div className="max-w-6xl mx-auto px-4 pb-2.5 flex items-center gap-2">
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              🔍 搜索 "<strong>{search}</strong>" 找到 <strong>{filtered.length}</strong> 篇相关文献
              {sortBy === 'relevance' ? ' · 按相关度排序' : sortBy === 'date' ? ' · 按发表日期排序' : ' · 按引用热度排序'}
            </span>
          </div>
        )}
      </div>

      {/* 8方向 Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {DIRECTIONS.map(d_ => {
              const cnt = filtered.filter(p => p.direction === d_.value).length;
              return (
                <button key={d_.value} onClick={() => setSelectedDirection(d_.value)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                    selectedDirection === d_.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {d_.label}
                  {cnt > 0 && (
                    <span className="ml-1 text-xs opacity-80">({cnt})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-lg p-3.5 shadow-sm">
            <div className="text-xl font-bold text-blue-600">{filtered.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">当前筛选</div>
          </div>
          <div className="bg-white rounded-lg p-3.5 shadow-sm">
            <div className="text-xl font-bold text-green-600">{allPapers.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">文献总数</div>
          </div>
          <div className="bg-white rounded-lg p-3.5 shadow-sm">
            <div className="text-xl font-bold text-purple-600">{new Set(allPapers.map(p => p.direction)).size}</div>
            <div className="text-xs text-gray-500 mt-0.5">覆盖方向</div>
          </div>
          <div className="bg-white rounded-lg p-3.5 shadow-sm">
            <div className="text-xl font-bold text-orange-500">{data.updateDate}</div>
            <div className="text-xs text-gray-500 mt-0.5">更新日期</div>
          </div>
        </div>

        {/* Filter label */}
        {selectedDirection !== "全部" && (
          <div className="mb-4 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
            <span>📂</span>
            <span>方向 <strong>{selectedDirection}</strong>，共 <strong>{filtered.length}</strong> 篇</span>
            {filtered.length === 0 && <span>（试试其他方向）</span>}
          </div>
        )}

        {/* Grid */}
        {pageItems.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-5">
            {pageItems.map(paper => (
              <div key={paper.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => setSelectedPaper(paper)}>
                {/* 图片区域（可点击放大） */}
                <div className="relative h-48 bg-gray-100 overflow-hidden group">
                  <img
                    src={paper.imageUrl}
                    alt={paper.titleCn}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23f3f4f6" width="400" height="200"/><text x="200" y="95" text-anchor="middle" fill="%23999" font-size="13">暂无图片</text><text x="200" y="115" text-anchor="middle" fill="%23999" font-size="11">点击查看详情</text></svg>';
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      setZoomedImg({ src: paper.imageUrl, caption: paper.titleCn });
                    }}
                  />
                  {/* 放大图标 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
                      </svg>
                    </div>
                  </div>
                </div>
                {/* 内容 */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">{paper.direction}</span>
                    <span className="text-xs text-gray-400">{paper.publishDate}</span>
                  </div>
                  <h3 className="font-semibold text-sm leading-snug mb-1 text-gray-800 line-clamp-2">
                    {paper.titleCn}
                  </h3>
                  <p className="text-xs text-gray-400 mb-1.5 line-clamp-1">{paper.title}</p>
                  <p className="text-xs text-gray-500 mb-1">{paper.source}</p>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{paper.summary}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 bg-white rounded-xl shadow-sm">
            {selectedDirection !== "全部"
              ? <>该方向暂无文献，试试其他方向</>
              : "未找到匹配的文献"}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-7 flex flex-col items-center gap-2 pb-6">
            <div className="text-sm text-gray-500">
              显示第 <span className="font-medium text-gray-700">{startIdx + 1}–{endIdx}</span> 篇，共 <span className="font-medium">{filtered.length}</span> 篇
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm disabled:opacity-35 disabled:cursor-not-allowed hover:bg-gray-50 bg-white">
                ‹
              </button>
              {pageNumbers().map((p, i) =>
                p === -1 ? (
                  <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors ${
                      page === p
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}>
                    {p}
                  </button>
                )
              )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm disabled:opacity-35 disabled:cursor-not-allowed hover:bg-gray-50 bg-white">
                ›
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========== 图片放大镜 Modal ========== */}
      {zoomedImg && (
        <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4"
          onClick={() => setZoomedImg(null)}>
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setZoomedImg(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 text-sm">
              <X size={16} />关闭
            </button>
            <img
              src={zoomedImg.src}
              alt={zoomedImg.caption}
              className="w-full max-h-[80vh] object-contain rounded-lg"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><rect fill="%23222" width="600" height="300"/><text x="300" y="155" text-anchor="middle" fill="%23999" font-size="16">图片加载失败</text></svg>';
              }}
            />
            {zoomedImg.caption && (
              <div className="mt-2 text-center text-white/70 text-sm">{zoomedImg.caption}</div>
            )}
          </div>
        </div>
      )}

      {/* ========== 历史面板 ========== */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50"
          onClick={e => { if (e.target === e.currentTarget) { setShowHistory(false); setSelectedHist(null); }}}>
          <div className="bg-white max-w-4xl w-full h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-5 py-3.5 flex justify-between items-center z-10">
              <h2 className="font-semibold">
                {selectedHist
                  ? `📅 ${selectedHist.date}（${selectedHist.papers.length}篇）`
                  : `📅 历史推送（${history.length}天）`}
              </h2>
              <button onClick={() => { setShowHistory(false); setSelectedHist(null); }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            {!selectedHist ? (
              <div className="p-5">
                <p className="text-xs text-gray-400 mb-4">每天最多{HIST_PAGE_SIZE}篇 · 共{allPapers.length}篇文献</p>
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">暂无历史记录</div>
                ) : (
                  history.map(h => {
                    const stats = histDirStats(h.papers);
                    return (
                      <div key={h.date}
                        onClick={() => { setSelectedHist(h); setHistPage(1); }}
                        className="py-3.5 border-b cursor-pointer hover:bg-blue-50 rounded px-3 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{h.date}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{h.papers.length} 篇</div>
                          </div>
                          <span className="text-blue-500 text-sm">查看 →</span>
                        </div>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {stats.map(([dir, cnt]) => (
                            <span key={dir}
                              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {dir} {cnt}篇
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="p-5">
                <button onClick={() => setSelectedHist(null)}
                  className="mb-4 text-blue-600 hover:underline text-sm flex items-center gap-1">
                  ← 返回历史列表
                </button>
                {histFiltered.length > 0 ? (
                  <>
                    <div className="text-xs text-gray-400 mb-3">
                      共 {histFiltered.length} 篇 · 第 {histPage}/{histTotalPages} 页
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {histPageItems.map(paper => (
                        <div key={paper.id}
                          className="bg-white border rounded-lg p-3.5 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedPaper(paper)}>
                          <div className="flex gap-3">
                            <div className="w-20 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={paper.imageUrl} alt={paper.titleCn}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  (e.target as HTMLImageElement).src =
                                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 64"><rect fill="%23f3f4f6" width="80" height="64"/><text x="40" y="34" text-anchor="middle" fill="%23999" font-size="10">无图</text></svg>';
                                }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex gap-1.5 mb-1 flex-wrap">
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">{paper.direction}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-800 line-clamp-2">{paper.titleCn}</p>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{paper.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {histTotalPages > 1 && (
                      <div className="flex justify-center gap-1.5 mt-5 flex-wrap">
                        <button onClick={() => setHistPage(p => Math.max(1, p-1))} disabled={histPage === 1}
                          className="w-8 h-8 flex items-center justify-center rounded border text-sm disabled:opacity-35 bg-white">‹</button>
                        {Array.from({ length: histTotalPages }, (_, i) => i + 1).slice(
                          Math.max(0, histPage - 3), Math.min(histTotalPages, histPage + 2)
                        ).map(p => (
                          <button key={p} onClick={() => setHistPage(p)}
                            className={`w-8 h-8 flex items-center justify-center rounded border text-sm ${
                              histPage === p ? "bg-blue-600 text-white border-blue-600" : "bg-white"
                            }`}>{p}</button>
                        ))}
                        <button onClick={() => setHistPage(p => Math.min(histTotalPages, p+1))}
                          disabled={histPage === histTotalPages}
                          className="w-8 h-8 flex items-center justify-center rounded border text-sm disabled:opacity-35 bg-white">›</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400">该日暂无文献</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== 详情 Modal ========== */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPaper(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">{selectedPaper.direction}</span>
                <span className="text-xs text-gray-400">{selectedPaper.publishDate}</span>
              </div>
              <button onClick={() => setSelectedPaper(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="p-5">
              <div className="text-xs text-gray-400 mb-1">原始分类：{selectedPaper.category}</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-0.5">{selectedPaper.titleCn}</h2>
              <p className="text-sm text-gray-500 mb-1">{selectedPaper.title}</p>
              <div className="flex items-center gap-3 mb-4 text-xs text-gray-400">
                <span>{selectedPaper.source}</span>
                <span>👁 {selectedPaper.views.toLocaleString()} views</span>
              </div>

              {/* 详情大图（可点击放大） */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-5 cursor-zoom-in group"
                onClick={e => { e.stopPropagation(); setZoomedImg({ src: selectedPaper.imageUrl, caption: selectedPaper.titleCn }); }}>
                <img src={selectedPaper.imageUrl} alt={selectedPaper.titleCn}
                  className="w-full max-h-72 object-contain"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><rect fill="%23f3f4f6" width="600" height="300"/><text x="300" y="155" text-anchor="middle" fill="%23999" font-size="14">暂无图片</text></svg>';
                  }} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-3.5 rounded-r-lg mb-5">
                <p className="text-sm text-green-800 leading-relaxed">{selectedPaper.summary}</p>
              </div>

              <div className="mb-5">
                <h3 className="font-semibold text-gray-800 mb-2.5 text-sm">📌 工作要点</h3>
                <ul className="space-y-2">
                  {(selectedPaper.keyPoints || []).map((kp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-3.5 mb-5">
                <h3 className="font-semibold text-blue-800 mb-2.5 text-sm">💡 对BMS算法的借鉴价值</h3>
                <ul className="space-y-2">
                  {(selectedPaper.bmsValue || []).map((bv, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-700 leading-relaxed">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>{bv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a href={selectedPaper.doi} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                原文链接 → <span className="text-xs text-gray-400 font-normal">{selectedPaper.doi}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========== 反馈 Modal ========== */}
      {showComment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowComment(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-5" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-3">反馈建议</h2>
            <p className="text-sm text-gray-500 mb-3">您的反馈将帮助我们改进推送质量</p>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1.5">质量评分</label>
              <div className="flex gap-1.5 flex-wrap">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setNewQuality(n)}
                    className={`w-7 h-7 rounded-full text-xs font-medium ${
                      newQuality >= n ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}>{n}</button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1.5">您的建议</label>
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="请提出您的宝贵建议..."
                className="w-full h-28 p-2.5 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowComment(false)}
                className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
              <button
                onClick={() => {
                  if (!newComment.trim() && newQuality < 5) return;
                  const ctx = `今日文献追踪 ${data?.updateDate || ''}`;
                  // 同步写入 localStorage（立即更新 badge）
                  saveFeedbackToLocal({ rating: newQuality, comment: newComment.trim(), pageContext: ctx });
                  setFeedbackCount(getAllFeedback().length);
                  // 备注：反馈已保存到本地存储（localStorage），切换浏览器后需手动导出备份
                  setNewComment('');
                  setNewQuality(7);
                  setShowComment(false);
                  setToast('✅ 感谢您的反馈，已收录！');
                  setTimeout(() => setToast(''), 3500);
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">
                提交反馈
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-7 mt-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">🔋 锂电前沿文献追踪 · 每个工作日自动更新</p>
          <p className="text-xs mt-1.5 opacity-70">
            ①新材料体系 · ②SOH估算 · ③先进电池模型 · ④EIS检测 ·
            ⑤AI/机器学习 · ⑥电池异常诊断 · ⑦热失控 · ⑧非乘用车场景
          </p>
          <p className="text-xs mt-1 opacity-60">
            数据来源：Nature · ScienceDirect · Springer · ACS · Wiley等
          </p>
          <button onClick={() => setShowHandbook(true)}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline">
            📒 反馈建议手册（{feedbackCount} 条）
          </button>
        </div>
      </footer>
    </div>
  );
}
