import React from 'react';
import { CalendarRange } from 'lucide-react';

export default function Timeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) return null;

  // Sort timeline events chronologically by date/year
  const sortedTimeline = [...timeline].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarRange className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 text-xs">
          Chronological Timeline & Milestones
        </h3>
      </div>

      <div className="relative border-l border-white/10 ml-3 md:ml-4 pl-6 md:pl-8 space-y-6 py-2">
        {sortedTimeline.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Joint Node */}
            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center transition group-hover:scale-125 group-hover:bg-cyan-400 group-hover:shadow-[0_0_10px_#22d3ee]"></div>

            {/* Content card */}
            <div className="glass-card p-4 rounded-xl max-w-2xl transition duration-300 hover:border-white/20">
              <span className="text-xs font-black text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
                {item.date}
              </span>
              <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
                {item.event}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
