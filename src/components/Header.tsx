import React from 'react';
import Navigation from './Navigation';
import { useAuth } from './auth/AuthContext';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onDemo: () => void;
  onClear: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onDemo, onClear }) => {
  const { currentUser, signInWithGoogle, logout } = useAuth();
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
          {/* User Profile / Sign In */}
          <div className="hidden md:flex justify-end w-32">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-white leading-tight">{currentUser.displayName?.split(' ')[0]}</span>
                  <button onClick={logout} className="text-[10px] text-slate-400 hover:text-white transition-colors">Sign Out</button>
                </div>
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-9 h-9 rounded-full border-2 border-slate-700 shadow-sm" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-xs font-bold text-white">
                    {currentUser.displayName?.[0] || 'U'}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold py-2 px-4 rounded-lg shadow-lg shadow-white/10 transition-all active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;