
import React from 'react';

const AppliedTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Applied</h2>
          <p className="text-sm text-slate-500">How this tool was used in different contexts.</p>
        </div>
        <div className="flex">
          <div className="w-1/4 p-6 border-r border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Applications</h3>
            {/* Placeholder for applications menu */}
          </div>
          <div className="w-3/4 p-6">
            {/* Placeholder for article content */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppliedTab;
