import React from 'react';
import { InputVariable } from '../../types';

interface VariableCardProps {
  variable: InputVariable;
  onChange: (id: string, field: keyof InputVariable, value: any) => void;
  onRemove: (id: string) => void;
}

const VariableCard: React.FC<VariableCardProps> = ({ variable, onChange, onRemove }) => {
  return (
    <div className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all">
      <div className="flex-1 grid grid-cols-12 gap-3 items-center">

        {/* Name */}
        <div className="col-span-4">
          <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Var Name</label>
          <input
            type="text"
            value={variable.name}
            onChange={(e) => onChange(variable.id, 'name', e.target.value)}
            className="w-full text-sm font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="x1"
          />
        </div>

        {/* Mean */}
        <div className="col-span-3">
          <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Mean (μ)</label>
          <input
            type="number"
            value={variable.mean}
            onChange={(e) => onChange(variable.id, 'mean', parseFloat(e.target.value))}
            className="w-full text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        {/* Std Dev */}
        <div className="col-span-3">
          <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">StdDev (σ)</label>
          <input
            type="number"
            value={variable.stdDev}
            onChange={(e) => onChange(variable.id, 'stdDev', parseFloat(e.target.value))}
            className="w-full text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        {/* Type (Visual only for now) */}
        <div className="col-span-2 flex justify-center items-end h-full pb-1">
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium transition-colors">Normal</span>
        </div>
      </div>

      <button
        onClick={() => onRemove(variable.id)}
        className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2"
        aria-label="Remove variable"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
};

export default VariableCard;