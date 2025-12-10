import React from 'react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onChange }) => {
  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'input', label: 'Input' },
    { id: 'output', label: 'Output' },
    { id: 'applied', label: 'Applied' },
    { id: 'history', label: 'History' },
  ];

  const getTranslateX = (tabId: ActiveTab) => {
    const index = tabs.findIndex(t => t.id === tabId);
    // Move by (100% width of pill + 1rem gap) * index
    // Gap is 1rem (gap-4)
    return `calc((100% + 1rem) * ${index})`;
  };

  return (
    <div className="flex justify-center w-full md:w-auto">
      {/* Dark mode styled container with gaps for separation */}
      <div className="bg-slate-800/50 p-1 rounded-full relative border border-slate-700/50 grid grid-cols-4 gap-4 w-full max-w-xl min-w-[460px]">
        
        {/* The sliding bean */}
        <div 
            className="absolute top-1 bottom-1 left-1 bg-slate-700 rounded-full shadow-sm transition-transform duration-300 ease-spring z-0 border border-slate-600"
            style={{ 
                // Width = (100% - padding(0.5rem) - 3*gaps(1rem)) / 4
                // p-1 is 0.25rem * 2 = 0.5rem total horizontal padding
                // gap-4 is 1rem. 3 gaps = 3rem.
                // Total deduction = 3.5rem
                width: 'calc((100% - 3.5rem) / 4)',
                transform: `translateX(${getTranslateX(activeTab)})` 
            }}
        />

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative z-10 h-9 flex items-center justify-center text-xs font-bold transition-colors duration-200 select-none uppercase tracking-widest
              ${activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <style>{`
        .ease-spring {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default Navigation;
