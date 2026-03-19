import { useState, useEffect } from 'react';
import { Search, SortAsc, Calendar, MessageCircle } from 'lucide-react';

interface Paper {
  id: number;
  category: string;
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

// 8大方向（与data.json的category字段完全对应）
const DIRECTIONS = [
  "全部", "锂金属负极", "固态电解质", "锂硫电池",
  "硅基负极", "正极材料", "电池安全", "快充技术", "电池回收",
];

function App() {
  const [data, setData] = useState<Data | null>(null);
  const [history, setHistory] = useState<{ date: string; papers: Paper[] }[]>([]);
  const [selectedDirection, setSelectedDirection] = useState("全部");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "views">("date");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newQuality, setNewQuality] = useState(5);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<{ date: string; papers: Paper[] } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [histPage, setHistPage] = useState(1);
  const PAPERS_PER_PAGE = 8;
  const HIST_PER_PAGE = 8;

  useEffect(() => { setCurrentPage(1); }, [searchKeyword, selectedDirection, sortBy]);
  useEffect(() => { setHistPage(1); }, [selectedHistory]);

  useEffect(() => {
    fetch('./data.json')
      .then(res => res.json())
      .then(d => {
        setData(d);
        if (d.history) setHistory(d.history);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-500">加载中...</div></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-red-500">数据加载失败</div></div>;

  const { currentPapers, papers, updateDate } = data;
  const todayPapers: Paper[] = currentPapers || papers || [];
  const allPapers: Paper[] = [...todayPapers, ...history.flatMap(h => h.papers)];

  const filterPapers = (list: Paper[]): Paper[] => {
    let f = list.filter(p => {
      if (!p.publishDate) return false;
      const year = parseInt(p.publishDate.split('-')[0]);
      if (year < 2025) return false;
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        if (!p.titleCn.toLowerCase().includes(kw) && !p.title.toLowerCase().includes(kw) &&
            !p.summary.toLowerCase().includes(kw) && !p.category.toLowerCase().includes(kw)) return false;
      }
      if (selectedDirection !== "全部" && p.category !== selectedDirection) return false;
      return true;
    });
    f.sort((a, b) => sortBy === "date"
      ? new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      : b.views - a.views);
    return f;
  };

  const filteredAll = filterPapers(allPapers);
  const totalPages = Math.max(1, Math.ceil(filteredAll.length / PAPERS_PER_PAGE));
  const paginated = filteredAll.slice((currentPage - 1) * PAPERS_PER_PAGE, currentPage * PAPERS_PER_PAGE);
  const totalCount = allPapers.length;

  const histFiltered = selectedHistory ? filterPapers(selectedHistory.papers) : [];
  const histTotalPages = Math.max(1, Math.ceil(histFiltered.length / HIST_PER_PAGE));
  const histPaginated = histFiltered.slice((histPage - 1) * HIST_PER_PAGE, histPage * HIST_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">🔋 锂电前沿文献追踪</h1>
              <p className="text-blue-100">BMS算法前瞻研究 | 每日更新</p>
            </div>
            <button onClick={() => setShowCommentModal(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
              <MessageCircle size={18} /><span>反馈</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="搜索文献标题、摘要、方向..." value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <SortAsc size={20} className="text-gray-500" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value as "date" | "views")}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="date">按发布时间</option>
                <option value="views">按热度</option>
              </select>
            </div>
            <button onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Calendar size={18} />历史推送
            </button>
          </div>
        </div>
      </div>

      {/* Direction Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {DIRECTIONS.map(dir => (
              <button key={dir} onClick={() => setSelectedDirection(dir)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedDirection === dir ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {dir}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{filteredAll.length}</div>
            <div className="text-sm text-gray-500">当前结果</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{totalCount}</div>
            <div className="text-sm text-gray-500">文献总数</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{new Set(allPapers.map(p => p.category)).size}</div>
            <div className="text-sm text-gray-500">覆盖方向</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{updateDate}</div>
            <div className="text-sm text-gray-500">更新日期</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-600">{history.length}</div>
            <div className="text-sm text-gray-500">历史天数</div>
          </div>
        </div>

        {/* Direction context label */}
        {selectedDirection !== "全部" && (
          <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            方向筛选：<strong>{selectedDirection}</strong>，共 {filteredAll.length} 篇文献
            {filteredAll.length === 0 && " （该方向今日暂无更新）"}
          </div>
        )}

        {/* Paper Grid */}
        {paginated.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {paginated.map(paper => (
              <div key={paper.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => setSelectedPaper(paper)}>
                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img src={paper.imageUrl} alt={paper.titleCn}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23f0f0f0" width="400" height="200"/><text x="200" y="100" text-anchor="middle" fill="%23999" font-size="14">暂无图片</text></svg>'; }} />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">{paper.category}</span>
                    <span className="text-xs text-gray-400">{paper.publishDate}</span>
                  </div>
                  <h3 className="font-semibold text-base mb-1 line-clamp-2 text-gray-800">{paper.titleCn}</h3>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{paper.title}</p>
                  <p className="text-sm text-gray-500 mb-1">{paper.source}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{paper.summary}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-sm">
            {selectedDirection !== "全部"
              ? `方向「${selectedDirection}」暂无文献，请尝试其他方向`
              : "没有找到匹配的文献，请尝试其他关键词"}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pb-8">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-sm">
              上一页
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">第 {currentPage} / {totalPages} 页 <span className="text-gray-400">（{filteredAll.length}篇）</span></span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-sm">
              下一页
            </button>
          </div>
        )}
      </main>

      {/* History Panel */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={e => { if (e.target === e.currentTarget) { setShowHistory(false); setSelectedHistory(null); }}}>
          <div className="bg-white max-w-4xl w-full h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-lg">
                {selectedHistory ? `📅 ${selectedHistory.date}（${selectedHistory.papers.length}篇）` : '📅 历史推送'}
              </h2>
              <button onClick={() => { setShowHistory(false); setSelectedHistory(null); }} className="text-gray-500 hover:text-gray-700 text-xl leading-none">✕</button>
            </div>

            {!selectedHistory ? (
              <div className="p-4">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">暂无历史记录</div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-4">共 {history.length} 天历史 · 每天最多8篇</p>
                    {history.map(h => (
                      <div key={h.date} onClick={() => { setSelectedHistory(h); setHistPage(1); }}
                        className="py-4 border-b cursor-pointer hover:bg-blue-50 rounded px-3 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{h.date}</div>
                            <div className="text-sm text-gray-500">{h.papers.length} 篇文献</div>
                          </div>
                          <span className="text-blue-500 text-sm">查看 →</span>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {h.papers.slice(0, 5).map(p => (
                            <span key={p.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{p.category}</span>
                          ))}
                          {h.papers.length > 5 && <span className="text-xs text-gray-400">+{h.papers.length - 5}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <button onClick={() => setSelectedHistory(null)} className="mb-4 text-blue-600 hover:underline text-sm">← 返回历史列表</button>
                {histFiltered.length > 0 ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      {histPaginated.map(paper => (
                        <div key={paper.id} className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md border"
                          onClick={() => setSelectedPaper(paper)}>
                          <div className="flex gap-3">
                            <div className="w-20 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={paper.imageUrl} alt={paper.titleCn} className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 64"><rect fill="%23f0f0f0" width="80" height="64"/><text x="40" y="35" text-anchor="middle" fill="%23999" font-size="10">无图</text></svg>'; }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">{paper.category}</span>
                                <span className="text-xs text-gray-400">{paper.publishDate}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-800 line-clamp-2">{paper.titleCn}</p>
                              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{paper.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {histTotalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6">
                        <button onClick={() => setHistPage(p => Math.max(1, p-1))} disabled={histPage === 1}
                          className="px-4 py-2 bg-white border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm">上一页</button>
                        <span className="text-sm text-gray-600">第 {histPage} / {histTotalPages} 页</span>
                        <button onClick={() => setHistPage(p => Math.min(histTotalPages, p+1))} disabled={histPage === histTotalPages}
                          className="px-4 py-2 bg-white border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm">下一页</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">该日暂无文献记录</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCommentModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">反馈建议</h2>
            <p className="text-sm text-gray-500 mb-4">您的反馈将帮助我们改进推送质量</p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">内容质量评分</label>
              <div className="flex gap-2 flex-wrap">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setNewQuality(n)}
                    className={`w-8 h-8 rounded-full text-sm ${newQuality >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">您的建议</label>
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="请提出您的宝贵建议..." className="w-full h-32 p-3 border rounded-lg resize-none text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCommentModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-sm">取消</button>
              <button onClick={() => { if (!newComment.trim()) return; setShowCommentModal(false); alert('感谢您的反馈！'); }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">提交反馈</button>
            </div>
          </div>
        </div>
      )}

      {/* Paper Detail Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPaper(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">{selectedPaper.category}</span>
                <span className="text-sm text-gray-400">{selectedPaper.publishDate}</span>
              </div>
              <button onClick={() => setSelectedPaper(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{selectedPaper.titleCn}</h2>
              <p className="text-sm text-gray-500 mb-1">{selectedPaper.title}</p>
              <div className="flex items-center gap-3 mb-4 text-xs text-gray-400">
                <span>{selectedPaper.source}</span>
                <span>👁 {selectedPaper.views.toLocaleString()} views</span>
              </div>
              <img src={selectedPaper.imageUrl} alt={selectedPaper.titleCn}
                className="w-full rounded-lg mb-6 max-h-72 object-contain bg-gray-100"
                onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><rect fill="%23f0f0f0" width="600" height="300"/><text x="300" y="155" text-anchor="middle" fill="%23999" font-size="16">暂无图片</text></svg>'; }} />
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-6">
                <p className="font-medium text-green-800 text-sm leading-relaxed">{selectedPaper.summary}</p>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 text-base">📌 工作要点</h3>
                <ul className="space-y-2">
                  {(selectedPaper.keyPoints || []).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-3 text-base">💡 对BMS算法的借鉴价值</h3>
                <ul className="space-y-2">
                  {(selectedPaper.bmsValue || []).map((value, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-blue-700 leading-relaxed">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>{value}</span>
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

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>🔋 锂电前沿文献追踪 | 每个工作日早上10点自动更新</p>
          <p className="text-sm mt-2">覆盖：锂金属负极 · 固态电解质 · 锂硫电池 · 硅基负极 · 正极材料 · 电池安全 · 快充技术 · 电池回收</p>
          <p className="text-sm mt-1">数据来源：Nature · ScienceDirect · Springer · ACS · Wiley等 | 仅展示2025年及以后的最新文献</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
