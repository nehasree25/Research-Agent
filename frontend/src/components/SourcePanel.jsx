import React from 'react';
import { Link2, Calendar, ShieldCheck } from 'lucide-react';

export default function SourcePanel({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 text-xs">
          Verified Citations & Sources
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card glass-card-hover p-4 rounded-xl flex flex-col justify-between transition-all duration-300 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/15 font-mono uppercase tracking-wider">
                  {source.publisher}
                </span>
                {source.date && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {source.date}
                  </span>
                )}
              </div>
              
              <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-cyan-300 transition duration-300 flex items-start gap-1.5">
                <span className="line-clamp-2">{source.title}</span>
                <Link2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition duration-300" />
              </h4>
              
              {source.summary && (
                <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-3">
                  {source.summary}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span className="truncate max-w-[220px]">{source.url}</span>
              <span className="text-cyan-400 font-medium group-hover:underline">Visit Page</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
