import React from 'react';
import { BarChart, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, BarChart2 } from 'lucide-react';

export default function StatsGrid({ stats = [] }) {
  if (!stats || stats.length === 0) return null;

  // Process stats to see if we can build a chart dataset
  // We sort by year ascending
  const chartData = stats
    .map(s => {
      // Extract numeric value if possible
      const numericString = s.value.replace(/[^\d.]/g, '');
      const numVal = parseFloat(numericString);
      return {
        label: s.label,
        year: s.year || '2026',
        displayValue: s.value,
        value: isNaN(numVal) ? 0 : numVal,
        source: s.source
      };
    })
    .filter(s => s.value > 0)
    .sort((a, b) => a.year.localeCompare(b.year));

  const hasChartData = chartData.length > 1;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 text-xs">
          Key Statistics & Metrics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-mono tracking-wide uppercase">
                  {stat.label}
                </span>
                <h4 className="text-2xl font-black text-white mt-1 mb-1 tracking-tight gradient-text">
                  {stat.value}
                </h4>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5 text-[10px]">
                <span className="text-slate-400 font-mono">{stat.source}</span>
                <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-bold">
                  {stat.year}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Recharts Graph */}
        <div className="glass-card p-4 rounded-xl flex flex-col min-h-[220px] justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              Trend Trajectory Analysis
            </span>
            {hasChartData && (
              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                Active Graph
              </span>
            )}
          </div>

          {hasChartData ? (
            <div className="w-full h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="year"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    fontFamily="monospace"
                    dy={10}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    fontFamily="monospace"
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#09091f',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                    labelStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <TrendingUp className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">
                Insufficient timeline statistics found to render dynamic trajectory chart.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
