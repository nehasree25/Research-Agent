import React from 'react';
import { Loader2, CheckCircle2, Circle, AlertCircle, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  { key: 'Understanding query', label: 'Understanding query' },
  { key: 'Finding relevant sources', label: 'Finding relevant sources' },
  { key: 'Scraping clean content', label: 'Scraping clean content' },
  { key: 'Extracting numbers', label: 'Extracting numbers' },
  { key: 'Verifying across sources', label: 'Verifying across sources' },
  { key: 'Generating report', label: 'Generating report' }
];

export default function ResearchProgress({ currentStage, detailMessage, logs = [] }) {
  // Determine index of current stage to style previous stages as completed
  const currentIdx = STAGES.findIndex(s => s.key.toLowerCase() === currentStage?.toLowerCase());

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          Research Pipeline Active
        </h3>

        {/* Pipeline Steps */}
        <div className="space-y-4 md:space-y-5">
          {STAGES.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isRunning = idx === currentIdx;
            const isIdle = idx > currentIdx;

            return (
              <div
                key={step.key}
                className={`flex items-start gap-4 transition-all duration-300 ${
                  isRunning ? 'opacity-100 scale-[1.01]' : isIdle ? 'opacity-40' : 'opacity-80'
                }`}
              >
                {/* Icon Column */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {isRunning && (
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  )}
                  {isIdle && (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${isRunning ? 'text-cyan-400' : 'text-slate-200'}`}>
                      {step.label}
                    </span>
                    {isRunning && (
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  {isRunning && detailMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-slate-400 mt-1 italic"
                    >
                      {detailMessage}
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Console / Log Terminal */}
        {logs.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 font-mono uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5" />
              Console Logs
            </div>
            <div className="bg-slate-950/80 border border-white/5 rounded-xl p-4 font-mono text-[11px] text-slate-400 h-32 overflow-y-auto space-y-1.5 scrollbar-thin">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={log.type === 'error' ? 'text-red-400' : 'text-slate-300'}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
