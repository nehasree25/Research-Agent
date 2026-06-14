import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

export default function FollowupQuestions({ questions = [], onSelect }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 text-xs">
          Suggested Follow-up Questions
        </h3>
      </div>

      <div className="space-y-2.5 max-w-3xl">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            className="w-full glass-card glass-card-hover p-4 rounded-xl flex items-center justify-between text-left group transition duration-300 border-white/5 hover:border-cyan-500/25"
          >
            <span className="text-xs md:text-sm font-medium text-slate-300 group-hover:text-white transition">
              {q}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition shrink-0 ml-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
