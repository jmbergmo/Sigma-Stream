import React from 'react';
import Navigation from './Navigation';

const Header: React.FC = () => {
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
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

          {/* Top Row on Mobile: Logo + Buttons */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            {/* Logo Group */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-3">
                <img
                  src="/favicon.svg"
                  alt="Sigma Stream Logo"
                  className="w-10 h-10 rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10"
                />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Sigma Stream
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Beta v0.3</p>
                </div>
              </a>
            </div>
          </div>

          {/* Navigation Area */}
          <div className="flex-1 flex flex-row justify-center items-center gap-4 lg:gap-6 w-full lg:w-auto">
            <Navigation />
          </div>

          {/* Placeholder for balance on Desktop */}
          <div className="hidden lg:flex justify-end w-32">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;