import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { id: 'inputs', label: 'Input', path: '/inputs' },
    { id: 'results', label: 'Output', path: '/results' },
    { id: 'history', label: 'History', path: '/history' },
    { id: 'blog', label: 'Blog', path: '/blog' },
    { id: 'account', label: 'Account', path: '/account' },
  ];

  // Map path to index for the slider
  const activeIndex = useMemo(() => {
    // Check key paths or exact match
    if (currentPath === '/' || currentPath === '/inputs') return 0;
    if (currentPath.startsWith('/results')) return 1;
    if (currentPath.startsWith('/history')) return 2;
    if (currentPath.startsWith('/blog')) return 3;
    if (currentPath.startsWith('/account')) return 4;
    return 0; // Default to Input
  }, [currentPath]);

  const getTranslateX = (index: number) => {
    return `calc((100% + var(--nav-gap)) * ${index})`;
  };

  return (
    <div className="flex justify-center w-full md:w-auto">
      {/* Dark mode styled container with gaps for separation */}
      <div
        className="
          bg-slate-800/50 p-1 rounded-full relative border border-slate-700/50
          grid grid-cols-5 w-full max-w-xl
          gap-[var(--nav-gap)]
          min-w-0 sm:min-w-[460px]
        "
      >

        {/* The sliding bean */}
        <div
          className="absolute top-1 bottom-1 left-1 bg-slate-700 rounded-full shadow-sm transition-transform duration-300 ease-spring z-0 border border-slate-600"
          style={{
            // Width = (100% - padding(0.5rem) - 4*gaps) / 5
            width: 'calc((100% - 0.5rem - (4 * var(--nav-gap))) / 5)',
            transform: `translateX(${getTranslateX(activeIndex)})`
          }}
        />

        {tabs.map((tab, index) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`
              relative z-10 h-9 flex items-center justify-center text-xs font-bold transition-colors duration-200 select-none uppercase
              tracking-tight sm:tracking-widest
              ${index === activeIndex ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <style>{`
        :root {
          --nav-gap: 0.5rem; /* gap-2 matches 0.5rem */
        }
        @media (min-width: 640px) {
          :root {
            --nav-gap: 1rem; /* gap-4 matches 1rem */
          }
        }
        .ease-spring {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default Navigation;
