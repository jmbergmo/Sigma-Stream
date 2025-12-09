import React from 'react';

const HistoryTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Revision History</h2>
          <p className="text-sm text-slate-500">Changelog of major version updates.</p>
        </div>
        <div className="p-6">
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
            <div className="relative pl-8">
                <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50"></span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-800">v0.3</h3>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">Current</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0"></span>Improved Demo mode experience.</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0"></span>UI Improvements for Input and Output tabs.</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0"></span>Standardized factor level input formatting.</li>
                </ul>
            </div>
            <div className="relative pl-8">
                <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-slate-400 ring-4 ring-slate-50"></span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-800">v0.2</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0"></span>Added "DEMO" mode for one-click simulation.</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0"></span>Refactored component architecture for better maintainability.</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0"></span>Enhanced Output tab with Pareto Chart and Regression modeling.</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0"></span>Implemented Monte Carlo Optimizer.</li>
                </ul>
            </div>
            <div className="relative pl-8 pb-2">
               <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-200"></span>
               <p className="text-xs text-slate-400 italic">Project Inception</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;