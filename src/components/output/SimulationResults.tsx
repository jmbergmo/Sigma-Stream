import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { SimulationResult, SimulationConfig, HistogramBin } from '../../types';
import { createHistogramData } from '../../services/mathUtils';

interface ResultsProps {
  result: SimulationResult | null;
  config: SimulationConfig;
  analysis: string | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const SimulationResults: React.FC<ResultsProps> = ({ result, config, analysis, isAnalyzing, onAnalyze }) => {
  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 min-h-[400px] transition-colors">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <p>Run simulation to see results</p>
        </div>
      </div>
    );
  }

  const histogramData: HistogramBin[] = createHistogramData(result.data, 30);

  return (
    <div className="space-y-6 transition-colors">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cpk</div>
          <div className={`text-2xl font-bold ${result.cpk > 1.33 ? 'text-emerald-600 dark:text-emerald-400' : result.cpk > 1.0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
            {result.cpk.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Target: {'>'} 1.33</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sigma Level</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {result.sigmaLevel.toFixed(2)}σ
          </div>
           <div className="text-[10px] text-slate-400 dark:text-slate-500">Short Term</div>
        </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">DPMO</div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            {result.dpmo.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
           <div className="text-[10px] text-slate-400 dark:text-slate-500">Defects Per Million</div>
        </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mean Shift</div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            {(Math.abs(result.mean - ((config.usl + config.lsl)/2))).toFixed(2)}
          </div>
           <div className="text-[10px] text-slate-400 dark:text-slate-500">From Center</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex justify-between items-center">
            <span>Forecast Distribution</span>
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Y = {config.formula}</span>
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} barCategoryGap={1}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
              <XAxis 
                dataKey="binStart" 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
                tickFormatter={(val) => val.toFixed(1)}
                interval={4}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#334155', opacity: 0.4}}
                contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px'}}
                labelFormatter={(label) => `Value: ${Number(label).toFixed(2)}`}
              />
              <ReferenceLine x={config.lsl} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'LSL', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine x={config.usl} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'USL', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine x={result.mean} stroke="#3b82f6" label={{ value: 'μ', fill: '#3b82f6', fontSize: 10, position: 'insideTop' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/50 transition-colors">
          <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">AI Black Belt Insights</h3>
              </div>
              <button 
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="text-xs font-medium bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-md border border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                  {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
              </button>
          </div>
          
          <div className="prose prose-sm max-w-none text-indigo-900/80 dark:text-indigo-100/80 bg-white/60 dark:bg-slate-900/40 p-4 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30 min-h-[100px] transition-colors">
              {analysis ? (
                  <div className="markdown-body text-sm leading-relaxed whitespace-pre-line">
                      {analysis}
                  </div>
              ) : (
                  <p className="italic text-indigo-300 dark:text-indigo-400">
                      Click "Generate Analysis" to get expert insights on your simulation results using Gemini.
                  </p>
              )}
          </div>
      </div>
    </div>
  );
};

export default SimulationResults;