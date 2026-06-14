import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  History,
  Trash2,
  Sparkles,
  AlertOctagon,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Compass
} from 'lucide-react';
import SearchHero from './components/SearchHero';
import ResearchProgress from './components/ResearchProgress';
import AnswerCard from './components/AnswerCard';
import StatsGrid from './components/StatsGrid';
import SourcePanel from './components/SourcePanel';
import ImageGallery from './components/ImageGallery';
import Timeline from './components/Timeline';
import FollowupQuestions from './components/FollowupQuestions';
import EmptyState from './components/EmptyState';

export default function App() {
  const [query, setQuery] = useState('');
  const [activeReport, setActiveReport] = useState(null);
  const [loadingState, setLoadingState] = useState('idle'); // idle | loading | complete | error
  const [currentStage, setCurrentStage] = useState('');
  const [detailMessage, setDetailMessage] = useState('');
  const [logs, setLogs] = useState([]);
  
  // History sidebar state
  const [history, setHistory] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const eventSourceRef = useRef(null);

  // Load history from localstorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('research_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse history:', e);
    }
  }, []);

  const saveToHistory = (report) => {
    if (!report || !report.query) return;
    setHistory(prev => {
      const updated = {
        [report.query]: {
          report,
          timestamp: new Date().toISOString()
        },
        ...prev
      };
      localStorage.setItem('research_history', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteFromHistory = (q, e) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = { ...prev };
      delete updated[q];
      localStorage.setItem('research_history', JSON.stringify(updated));
      return updated;
    });
    // If the active report is deleted, clear it or keep it as is.
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire research history?')) {
      setHistory({});
      localStorage.removeItem('research_history');
    }
  };

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date().toISOString(), message, type }]);
  };

  const handleSearch = (searchQuery) => {
    if (!searchQuery) return;
    
    // Close existing EventSource if active
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setQuery(searchQuery);
    setActiveReport(null);
    setLoadingState('loading');
    setCurrentStage('Understanding query');
    setDetailMessage('Analyzing intent and building search parameters...');
    setLogs([]);
    addLog(`Initiating research query: "${searchQuery}"`);

    // Setup Server-Sent Events source
    const streamUrl = `/api/research/stream?query=${encodeURIComponent(searchQuery)}`;
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data);
        setCurrentStage(data.stage);
        setDetailMessage(data.detail);
        addLog(`${data.stage}: ${data.detail}`);
      } catch (err) {
        console.error('Error parsing progress SSE:', err);
      }
    });

    eventSource.addEventListener('complete', (e) => {
      try {
        const report = JSON.parse(e.data);
        setActiveReport(report);
        setLoadingState('complete');
        addLog('Research synthesis successfully complete.', 'success');
        saveToHistory(report);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      } catch (err) {
        console.error('Error parsing complete SSE:', err);
        setLoadingState('error');
        addLog('Synthesis error: failed to assemble complete dataset.', 'error');
      }
    });

    eventSource.addEventListener('error', (e) => {
      let msg = 'Server connection dropped or query failed.';
      try {
        if (e.data) {
          const data = JSON.parse(e.data);
          msg = data.message || msg;
        }
      } catch (err) {}
      
      setLoadingState('error');
      addLog(`Error occurred during research: ${msg}`, 'error');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    });
  };

  // Export copy
  const handleCopyReport = () => {
    if (!activeReport) return;
    const text = compileMarkdownReport(activeReport);
    navigator.clipboard.writeText(text);
  };

  // Export download
  const handleDownloadMarkdown = () => {
    if (!activeReport) return;
    const text = compileMarkdownReport(activeReport);
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const filename = `${activeReport.query.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_report.md`;
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const compileMarkdownReport = (report) => {
    if (!report) return '';
    let md = `# Context Research Report: ${report.query}\n\n`;
    md += `## Synthesis\n${report.answer}\n\n`;
    md += `*Confidence: ${Math.round(report.confidence * 100)}% | ${report.accuracy_note}*\n\n`;
    
    if (report.key_stats && report.key_stats.length > 0) {
      md += `## Key Statistics\n`;
      md += `| Metric | Value | Source | Year |\n`;
      md += `| --- | --- | --- | --- |\n`;
      report.key_stats.forEach(s => {
        md += `| ${s.label} | ${s.value} | ${s.source} | ${s.year} |\n`;
      });
      md += `\n`;
    }

    if (report.highlights && report.highlights.length > 0) {
      md += `## Important Highlights\n`;
      report.highlights.forEach(h => {
        md += `- ${h}\n`;
      });
      md += `\n`;
    }

    if (report.timeline && report.timeline.length > 0) {
      md += `## Timeline / Milestones\n`;
      report.timeline.forEach(t => {
        md += `- **${t.date}**: ${t.event}\n`;
      });
      md += `\n`;
    }

    if (report.sources && report.sources.length > 0) {
      md += `## Sources & References\n`;
      report.sources.forEach((s, idx) => {
        md += `${idx + 1}. [${s.title}](${s.url}) - *Published by ${s.publisher} (${s.date})*\n`;
        if (s.summary) md += `   > ${s.summary}\n\n`;
      });
      md += `\n`;
    }

    if (report.followups && report.followups.length > 0) {
      md += `## Suggested Follow-up Questions\n`;
      report.followups.forEach(f => {
        md += `- ${f}\n`;
      });
    }

    return md;
  };

  const loadHistoryItem = (historyItem) => {
    if (!historyItem) return;
    setQuery(historyItem.report.query);
    setActiveReport(historyItem.report);
    setLoadingState('complete');
    setLogs([]);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const startNewResearch = () => {
    setQuery('');
    setActiveReport(null);
    setLoadingState('idle');
    setLogs([]);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };

  const historyList = Object.keys(history);

  return (
    <div className="min-h-screen bg-[#050510] text-[#f8fafc] flex relative overflow-hidden">
      
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-950/10 blur-[150px] pointer-events-none animate-pulse-slow"></div>

      {/* LEFT SIDEBAR (HISTORY) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-white/5 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span className="font-extrabold text-sm tracking-wide uppercase text-white">
                Research Studio
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Search CTA */}
          <div className="p-3">
            <button
              onClick={startNewResearch}
              className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              New Research Session
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5 scrollbar-thin">
            <div className="px-2 mb-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Past Sessions ({historyList.length})
            </div>

            {historyList.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-600 italic">
                No past research logs found.
              </div>
            ) : (
              historyList.map((q) => {
                const item = history[q];
                const isActive = activeReport?.query === q;
                return (
                  <div
                    key={q}
                    onClick={() => loadHistoryItem(item)}
                    className={`group w-full text-left p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition ${
                      isActive
                        ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-300'
                        : 'hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-medium truncate text-white">{q}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => deleteFromHistory(q, e)}
                      className="p-1 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded transition opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        {historyList.length > 0 && (
          <div className="p-3 border-t border-white/5">
            <button
              onClick={clearHistory}
              className="w-full py-1.5 text-center text-[10px] uppercase font-mono tracking-wider text-slate-500 hover:text-rose-400 transition"
            >
              Clear Session Cache
            </button>
          </div>
        )}
      </div>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        ></div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Header toolbar */}
        <header className="sticky top-0 z-20 bg-[#050510]/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            
            {activeReport ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs md:text-sm font-bold text-slate-300 truncate max-w-[200px] md:max-w-md">
                  Report: {activeReport.query}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-cyan-400 shrink-0 animate-pulse" />
                <span className="text-xs md:text-sm font-bold text-slate-200">
                  Context Research Studio
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://context.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono border border-slate-700/80 bg-slate-900 px-2.5 py-1 rounded-full text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition uppercase"
            >
              Powered by Context.dev
            </a>
          </div>
        </header>

        {/* Main scrollable body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
          
          {/* SEARCH HERO */}
          <SearchHero onSearch={handleSearch} isLoading={loadingState === 'loading'} />

          {/* DYNAMIC PIPELINE STATES */}
          {loadingState === 'loading' && (
            <ResearchProgress
              currentStage={currentStage}
              detailMessage={detailMessage}
              logs={logs}
            />
          )}

          {/* ERROR BOARD */}
          {loadingState === 'error' && (
            <div className="w-full max-w-2xl mx-auto py-8">
              <div className="glass-card p-6 rounded-2xl border-rose-500/20 flex flex-col items-center text-center">
                <AlertOctagon className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-white mb-2">Research Compilation Interrupted</h3>
                <p className="text-slate-400 text-xs md:text-sm max-w-md mb-6 leading-relaxed">
                  We encountered an error querying the web results or synthesizing source files.
                  Verify that your network connection is online and check your API key settings.
                </p>
                
                {logs.length > 0 && (
                  <div className="w-full bg-slate-950/80 border border-white/5 rounded-xl p-3 font-mono text-[10px] text-red-400 text-left mb-6 h-28 overflow-y-auto">
                    {logs
                      .filter(l => l.type === 'error')
                      .map((l, i) => (
                        <div key={i} className="mb-1">
                          &gt; {l.message}
                        </div>
                      ))}
                  </div>
                )}

                <button
                  onClick={() => handleSearch(query)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs flex items-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Research Session
                </button>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {loadingState === 'idle' && (
            <EmptyState onSelectQuery={handleSearch} />
          )}

          {/* FINAL REPORT VIEW */}
          {loadingState === 'complete' && activeReport && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              {/* Answer summary card */}
              <AnswerCard
                answer={activeReport.answer}
                confidence={activeReport.confidence}
                accuracyNote={activeReport.accuracy_note}
                onCopy={handleCopyReport}
                onDownload={handleDownloadMarkdown}
              />

              {/* Statistics Grid with Chart */}
              <StatsGrid stats={activeReport.key_stats} />

              {/* Citations / Source cards */}
              <SourcePanel sources={activeReport.sources} />

              {/* Media gallery */}
              <ImageGallery images={activeReport.images} />

              {/* Chronological Timeline */}
              <Timeline timeline={activeReport.timeline} />

              {/* Suggested Followups */}
              <FollowupQuestions
                questions={activeReport.followups}
                onSelect={handleSearch}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Simple internal icon helpers
function PlusIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
