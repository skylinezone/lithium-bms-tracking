import { useState, useEffect } from 'react';
import { Search, SortAsc, Calendar, Star, MessageCircle } from 'lucide-react';

interface Paper {
  id: number;
  category: string;
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
  papers: Paper[];
}

interface History {
  date: string;
  papers: Paper[];
}

interface Comment {
  id: number;
  date: string;
  text: string;
  quality: number;
}

const categories = [
  "全部",
  "新材料体系",
  "SOH估算",
  "电池模型",
  "EIS检测",
  "AI/BMS",
  "异常诊断",
  "热失控",
  "储能BMS"
];

// 示例历史数据
const sampleHistory: History[] = [
  {
    date: "2026-03-12",
    papers: []
  }
];

// 示例评论
const sampleComments: Comment[] = [];

function App() {
  const [data, setData] = useState<Data | null>(null);
  const [history, setHistory] = useState<History[]>(sampleHistory);
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 搜索和排序状态
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "views">("date");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newQuality, setNewQuality] = useState(5);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetch('./data.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 过滤2025年之前的文献
  const filterAndSortPapers = (papers: Paper[]) => {
    let filtered = papers.filter(p => {
      if (!p.publishDate) return false;
      const year = parseInt(p.publishDate.split('-')[0]);
      return year >= 2025;
    });
    
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(kw) ||
        p.summary.toLowerCase().includes(kw) ||
        p.category.toLowerCase().includes(kw)
      );
    }
    
    if (selectedCategory !== "全部") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // 排序
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    } else if (sortBy === "views") {
      filtered.sort((a, b) => b.views - a.views);
    }
    
    return filtered;
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      text: newComment,
      quality: newQuality
    };
    setComments([comment, ...comments]);
    setNewComment("");
    setShowCommentModal(false);
    alert("感谢您的反馈！您的建议将帮助我们改进推送质量。");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">数据加载失败</div>
      </div>
    );
  }

  const { papers, updateDate } = data;
  const displayPapers = filterAndSortPapers(papers);

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
            <button 
              onClick={() => setShowCommentModal(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <MessageCircle size={18} />
              <span>反馈</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="搜索文献标题、摘要、方向..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* 排序 */}
            <div className="flex items-center gap-2">
              <SortAsc size={20} className="text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "views")}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">按发布时间</option>
                <option value="views">按热度</option>
              </select>
            </div>
            
            {/* 历史按钮 */}
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Calendar size={18} />
              历史推送
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{displayPapers.length}</div>
            <div className="text-sm text-gray-500">当前结果</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{papers.length}</div>
            <div className="text-sm text-gray-500">文献总数</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">8</div>
            <div className="text-sm text-gray-500">覆盖方向</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{updateDate}</div>
            <div className="text-sm text-gray-500">更新日期</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-600">{comments.length}</div>
            <div className="text-sm text-gray-500">用户反馈</div>
          </div>
        </div>

        {/* Paper Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {displayPapers.map(paper => (
            <div 
              key={paper.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              onClick={() => setSelectedPaper(paper)}
            >
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img 
                  src={paper.imageUrl} 
                  alt={paper.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {paper.category}
                  </span>
                  <span className="text-xs text-gray-400">{paper.publishDate}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{paper.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{paper.source}</p>
                <p className="text-sm text-gray-600 line-clamp-3">{paper.summary}</p>
              </div>
            </div>
          ))}
        </div>
        
        {displayPapers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            没有找到匹配的文献，请尝试其他关键词
          </div>
        )}
      </main>

      {/* History Panel */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowHistory(false)}>
          <div className="bg-white max-w-md w-full h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">历史推送</h2>
              <button onClick={() => setShowHistory(false)} className="text-gray-500">✕</button>
            </div>
            <div className="p-4">
              {history.map(h => (
                <div key={h.date} className="py-3 border-b">
                  <div className="font-medium">{h.date}</div>
                  <div className="text-sm text-gray-500">{h.papers.length} 篇文献</div>
                </div>
              ))}
            </div>
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
              <div className="flex gap-2">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button
                    key={n}
                    onClick={() => setNewQuality(n)}
                    className={`w-8 h-8 rounded-full text-sm ${newQuality >= n ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">您的建议</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="请提出您的宝贵建议..."
                className="w-full h-32 p-3 border rounded-lg resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCommentModal(false)}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                onClick={handleSubmitComment}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                提交反馈
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paper Detail Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPaper(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">{selectedPaper.title}</h2>
              <button 
                onClick={() => setSelectedPaper(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <img 
                src={selectedPaper.imageUrl} 
                alt={selectedPaper.title}
                className="w-full rounded-lg mb-6"
              />
              
              <div className="mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {selectedPaper.category}
                </span>
                <span className="ml-2 text-sm text-gray-400">{selectedPaper.publishDate}</span>
                <p className="text-sm text-gray-500 mt-2">{selectedPaper.source}</p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-6">
                <p className="font-medium text-green-800">{selectedPaper.summary}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">工作要点</h3>
                <ul className="space-y-2">
                  {selectedPaper.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-blue-500 mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-3">对BMS算法的借鉴价值</h3>
                <ul className="space-y-2">
                  {selectedPaper.bmsValue.map((value, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-700">
                      <span className="text-blue-500 mt-1">✓</span>
                      {value}
                    </li>
                  ))}
                </ul>
              </div>

              <a 
                href={`https://doi.org/${selectedPaper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                原文链接 →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>🔋 锂电前沿文献追踪 | 每日下午2点更新</p>
          <p className="text-sm mt-2">文献来源：Nature, ScienceDirect, Springer, 汽车工程等</p>
          <p className="text-sm mt-2">只展示2025年及以后的最新文献</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
