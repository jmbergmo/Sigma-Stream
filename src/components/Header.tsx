import React from 'react';
import Navigation from './Navigation';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onDemo: () => void;
  onClear: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onDemo, onClear }) => {
  return (
    <div className="bg-slate-900 text-white shadow-lg relative z-20 shrink-0">
      {/* Background Graphic Container - Clipped so SVG doesn't spill out, but Tooltips can */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 opacity-10">
             <svg width="300" height="300" viewBox="0 0 100 100">
                 <path d="M0 100 Q 50 0 100 100" fill="none" stroke="white" strokeWidth="1" />
                 <circle cx="80" cy="20" r="10" fill="white" opacity="0.5" />
             </svg>
          </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Sigma Stream
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Beta v0.3</p>
            </div>
          </div>

          {/* Navigation Area */}
          <div className="flex-1 flex flex-col-reverse md:flex-row justify-center items-center gap-4 md:gap-6 w-full md:w-auto">
             
             {/* Action Buttons */}
             <div className="flex items-center justify-center gap-6 w-full md:w-auto">
                 <div className="relative group">
                    <button 
                        onClick={onDemo}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded border border-emerald-500 shadow-sm transition-all active:scale-95"
                    >
                        DEMO
                    </button>
                    {/* Tooltip */}
                    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl text-center z-50 pointer-events-none ring-1 ring-white/10">
                        Populate random data (Y=6-10), set specs, and download report.
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                    </div>
                 </div>

                 <div className="relative group">
                    <button 
                        onClick={onClear}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold py-1.5 px-3 rounded border border-slate-600 shadow-sm transition-all active:scale-95"
                    >
                        CLEAR
                    </button>
                    {/* Tooltip */}
                    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 hidden group-hover:block w-40 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl text-center z-50 pointer-events-none ring-1 ring-white/10">
                        Clear all input variables, design matrix, and results.
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                    </div>
                 </div>
             </div>

             <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block"></div>

             <Navigation activeTab={activeTab} onChange={onTabChange} />
          </div>
          
          {/* Placeholder for balance on Desktop */}
          <div className="hidden md:block w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default Header;