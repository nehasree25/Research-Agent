import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

export default function SearchHero({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-10 pb-6">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Animated Glow Border */}
        <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-600 opacity-60 blur-xl group-focus-within:opacity-100 transition duration-700 group-hover:duration-200"></div>

        {/* Input Card */}
        <div className="relative flex items-center bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3.5 shadow-2xl">
          <Search className="w-6 h-6 text-slate-400 shrink-0 mr-3" />
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything (e.g., 'How many AirPods got sold this year?', 'Tesla robotaxi updates')..."
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-base md:text-lg resize-none pr-12 min-h-[28px] max-h-[120px] align-middle"
            style={{ height: 'auto' }}
          />

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 ${
              query.trim() && !isLoading
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-105 active:scale-95 shadow-md shadow-cyan-500/20'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 justify-center mt-4 text-xs text-slate-400">
        <span className="py-1">Examples:</span>
        <button
          type="button"
          onClick={() => { setQuery('How many AirPods got sold this year?'); }}
          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-slate-300"
        >
          AirPods Sales
        </button>
        <button
          type="button"
          onClick={() => { setQuery('Latest Tesla robotaxi updates'); }}
          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-slate-300"
        >
          Tesla Robotaxi
        </button>
        <button
          type="button"
          onClick={() => { setQuery('Which company is leading humanoid robots?'); }}
          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-slate-300"
        >
          Humanoid Leaders
        </button>
      </div>
    </div>
  );
}
