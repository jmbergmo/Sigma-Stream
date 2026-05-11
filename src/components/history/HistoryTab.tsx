import React from 'react';

const HistoryTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Revision History</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Changelog of major version updates.</p>
        </div>
        <div className="p-6">
          <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
            {/* v0.4 */}
            <div className="relative pl-8">
              <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 bg-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/30"></span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">v0.4</h3>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Current</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Added new blog section with Espresso and Skin Care articles.</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Refined Demo button placement and experience.</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Fixed Monte Carlo simulation stability.</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Removed legacy Export Report functionality.</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Enabled Markdown support for blog posts.</li>
              </ul>
            </div>

            <div className="relative pl-8">
              <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 bg-slate-400 dark:bg-slate-500 ring-4 ring-slate-50 dark:ring-slate-900/30"></span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">v0.3</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Improved Demo mode experience.</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>UI Improvements for Input and Output tabs.</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Standardized factor level input formatting.</li>
              </ul>
            </div>
            <div className="relative pl-8">
              <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 bg-slate-400 dark:bg-slate-500 ring-4 ring-slate-50 dark:ring-slate-900/30"></span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">v0.2</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Added "DEMO" mode for one-click simulation.</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Refactored component architecture for better maintainability.</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Enhanced Output tab with Pareto Chart and Regression modeling.</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></span>Implemented Monte Carlo Optimizer.</li>
              </ul>
            </div>
            <div className="relative pl-8 pb-2">
              <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700"></span>
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Project Inception</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;