import React from 'react';
import { Award, AlertTriangle, Copy, Check, Download } from 'lucide-react';

export default function AnswerCard({ answer, confidence, accuracyNote, onCopy, onDownload }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG parameters for the confidence circle
  const radius = 35;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (confidence || 0) * circumference;

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 0.6) return 'text-yellow-400 stroke-yellow-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  // Helper function to render text sections with bold parsing
  const formatBoldText = (text) => {
    return text.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  };

  const renderContent = (rawText) => {
    if (!rawText) return null;
    return rawText.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const cleanItem = trimmed.replace(/^[-*]\s+/, '');
        return (
          <li
            key={idx}
            className="text-slate-300 text-sm md:text-base leading-relaxed list-disc ml-5 mb-1.5"
            dangerouslySetInnerHTML={{ __html: formatBoldText(cleanItem) }}
          />
        );
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h4
            key={idx}
            className="text-white font-semibold text-lg mt-4 mb-2"
            dangerouslySetInnerHTML={{ __html: formatBoldText(trimmed.replace('### ', '')) }}
          />
        );
      }

      if (trimmed.startsWith('## ')) {
        return (
          <h3
            key={idx}
            className="text-white font-bold text-xl mt-5 mb-3"
            dangerouslySetInnerHTML={{ __html: formatBoldText(trimmed.replace('## ', '')) }}
          />
        );
      }

      return (
        <p
          key={idx}
          className="text-slate-300 text-sm md:text-base leading-relaxed mb-3"
          dangerouslySetInnerHTML={{ __html: formatBoldText(trimmed) }}
        />
      );
    });
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden mb-6">
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500"></div>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
        {/* Answer section */}
        <div className="flex-1 pr-0 md:pr-4">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 text-xs">
              Synthesized Synthesis
            </h3>
          </div>

          <div className="prose prose-invert max-w-none text-slate-300">
            {renderContent(answer)}
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="shrink-0 flex flex-row md:flex-col items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-xl w-full md:w-44 text-center justify-between md:justify-center">
          <div className="relative flex items-center justify-center shrink-0">
            {/* SVG circle */}
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="rgba(255,255,255,0.05)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                className={`transition-all duration-1000 ease-out ${getConfidenceColor(confidence)}`}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold text-white leading-none">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>

          <div className="text-left md:text-center">
            <div className="text-xs text-slate-400 font-medium">Confidence Score</div>
            <div className={`text-sm font-bold ${getConfidenceColor(confidence).split(' ')[0]}`}>
              {getConfidenceLabel(confidence)} Reliability
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Warning / Info */}
      {accuracyNote && (
        <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-normal">
            <span className="font-semibold text-amber-400 mr-1">Validation Note:</span>
            {accuracyNote}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap justify-between items-center gap-4">
        <span className="text-xs text-slate-500">
          Scraped, synthesized, and verified in real-time.
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs text-slate-300 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied Report
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Report
              </>
            )}
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs text-slate-300 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download Markdown
          </button>
        </div>
      </div>
    </div>
  );
}
