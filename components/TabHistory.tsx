import React from 'react';

const HistoryTab: React.FC = () => {
  const history = [
    {
      version: 'v0.2',
      date: 'Current',
      changes: [
        'Added "DEMO" mode to simulate data entry, analysis, optimization, and report generation in one click.',
        'Added "CLEAR" function to reset all application state.',
        'Enhanced Output tab with Pareto Chart for Main Effects analysis.',
        'Implemented Linear Regression modeling and Monte Carlo Optimizer with Prediction Profiling.',
        'Added PDF Report Export functionality with timestamped filenames.',
        'Improved UI layout with independent scrolling and side panel.',
        'Refined Tooltips and Navigation experience.'
      ]
    },
    {
      version: 'v0.1',
      date: 'Beta Launch',
      changes: [
        'Initial beta release of Sigma Stream.',
        'Implemented Monte Carlo Simulation engine with custom Transfer Function support.',
        'Added DOE (Design of Experiments) full factorial generator.',
        'Integrated Gemini AI for statistical interpretation and recommendations.',
        'Created interactive tabular data entry with paste-from-Excel support.'
      ]
    },
    // Future revisions will be logged here
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Revision History</h2>
          <p className="text-sm text-slate-500">Changelog of major version updates.</p>
        </div>
        
        <div className="p-6">
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
            {history.map((item, index) => (
              <div key={index} className="relative pl-8">
                {/* Timeline Dot */}
                <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50"></span>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-800">{item.version}</h3>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.date}
                  </span>
                </div>
                
                <ul className="space-y-2">
                  {item.changes.map((change, cIndex) => (
                    <li key={cIndex} className="text-sm text-slate-600 leading-relaxed flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0"></span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
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