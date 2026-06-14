import React from 'react';
import { Sparkles, TrendingUp, Smartphone, Cpu } from 'lucide-react';

const PRESETS = [
  {
    icon: Sparkles,
    query: "How many AirPods got sold this year?",
    category: "Market Size",
    desc: "Apple AirPods estimated shipment statistics"
  },
  {
    icon: Cpu,
    query: "Which company is leading humanoid robots?",
    category: "Robotics",
    desc: "Deployments, funding, and technology comparison"
  },
  {
    icon: TrendingUp,
    query: "Latest Tesla robotaxi updates",
    category: "Autonomous Vehicles",
    desc: "FSD v12.9+, Cybercab rollouts, and DMV filings"
  },
  {
    icon: Smartphone,
    query: "Top 5 AI coding tools in 2026",
    category: "Software Dev",
    desc: "Market shares, developer satisfaction, and feature lists"
  }
];

export default function EmptyState({ onSelectQuery }) {
  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto py-12 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 opacity-70 blur-xl animate-pulse-slow"></div>
        <div className="relative w-16 h-16 rounded-full bg-slate-950 border border-white/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
        Start Your <span className="gradient-text font-bold">Research Studio</span>
      </h2>
      <p className="text-slate-400 max-w-lg mb-10 text-sm md:text-base">
        Enter any keyword, product, or complex business question. We'll scrape the live web, compile facts, and synthesize an accurate report in real-time.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
        {PRESETS.map((preset, idx) => {
          const Icon = preset.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectQuery(preset.query)}
              className="glass-card glass-card-hover p-5 rounded-xl flex items-start gap-4 transition-all duration-300 text-left focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                  {preset.category}
                </span>
                <h3 className="text-white font-medium text-base mt-1 mb-0.5">
                  {preset.query}
                </h3>
                <p className="text-slate-400 text-xs leading-normal">
                  {preset.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
