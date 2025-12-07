import React, { useState, useEffect } from 'react';
import { DoeFactor } from '../types';

interface TabBackgroundProps {
  factors: DoeFactor[];
  onGenerate: (factors: DoeFactor[]) => void;
}

const TabBackground: React.FC<TabBackgroundProps> = ({ factors: initialFactors, onGenerate }) => {
  // We need local state to handle the input fields before "Generating"
  // Transform DoeFactor for local editing: maintain array of 4 potential levels
  const [factors, setFactors] = useState<DoeFactor[]>(initialFactors);
  const [generated, setGenerated] = useState(false);

  // Sync internal state if prop changes (e.g. reset)
  useEffect(() => {
    setFactors(initialFactors);
  }, [initialFactors]);

  const addFactor = () => {
    const newId = Date.now().toString();
    const count = factors.length + 1;
    // Default to 2 levels
    setFactors([...factors, { id: newId, name: `Factor ${count}`, levels: [0, 10] }]);
    setGenerated(false);
  };

  const removeFactor = (id: string) => {
    setFactors(factors.filter(f => f.id !== id));
    setGenerated(false);
  };

  const updateFactorName = (id: string, name: string) => {
    setFactors(factors.map(f => f.id === id ? { ...f, name } : f));
    setGenerated(false);
  };

  const updateFactorLevel = (id: string, levelIndex: number, valueStr: string) => {
    const val = parseFloat(valueStr);
    
    setFactors(factors.map(f => {
      if (f.id !== id) return f;
      
      const newLevels = [...f.levels];
      
      if (isNaN(val) && valueStr === '') {
         // Removing a level via empty string is handled by specific remove buttons, 
         // but for text input we just let it be updated.
      } else {
         newLevels[levelIndex] = val;
      }
      
      return { ...f, levels: newLevels };
    }));
    setGenerated(false);
  };

  // Helper to add a level to a factor (up to 4)
  const addLevelToFactor = (id: string) => {
      setFactors(factors.map(f => {
          if (f.id === id && f.levels.length < 4) {
              return { ...f, levels: [...f.levels, 0] }; // Default 0 for new level
          }
          return f;
      }));
      setGenerated(false);
  };

  // Helper to remove last level (down to 2)
  const removeLevelFromFactor = (id: string) => {
      setFactors(factors.map(f => {
          if (f.id === id && f.levels.length > 2) {
              const newLevels = [...f.levels];
              newLevels.pop();
              return { ...f, levels: newLevels };
          }
          return f;
      }));
      setGenerated(false);
  };

  const handleGenerate = () => {
    // Validate: Filter out NaNs if any slipped in
    const cleanFactors = factors.map(f => ({
        ...f,
        levels: f.levels.filter(l => !isNaN(l))
    }));
    onGenerate(cleanFactors);
    setGenerated(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Left: Information */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </span>
            How to use
          </h2>
          
          <ol className="space-y-4 mb-8">
            <li className="flex gap-3 text-sm text-slate-600">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 shadow-sm">1</span>
                <span>
                    <strong className="block text-slate-800">Define Factors</strong>
                    Add input variables in the setup panel on the right.
                </span>
            </li>
            <li className="flex gap-3 text-sm text-slate-600">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 shadow-sm">2</span>
                <span>
                    <strong className="block text-slate-800">Set Levels</strong>
                    Enter Low (L1) and High (L2) values. Add optional L3/L4 for higher fidelity.
                </span>
            </li>
            <li className="flex gap-3 text-sm text-slate-600">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 shadow-sm">3</span>
                <span>
                    <strong className="block text-slate-800">Generate Design</strong>
                    Click "Generate Design Matrix" to create the experiment runs.
                </span>
            </li>
            <li className="flex gap-3 text-sm text-slate-600">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 shadow-sm">4</span>
                <span>
                    <strong className="block text-slate-800">Input Results</strong>
                    Switch to the <strong>Output</strong> tab and enter measured results (Y).
                </span>
            </li>
            <li className="flex gap-3 text-sm text-slate-600">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 shadow-sm">5</span>
                <span>
                    <strong className="block text-slate-800">Optimize</strong>
                    Set targets and run the simulation to generate stats and AI insights.
                </span>
            </li>
          </ol>

          <div className="border-t border-slate-100 pt-6 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">About DFSS</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Design for Six Sigma (DFSS) is a methodology used to design products and processes that meet customer expectations at a high quality level.
              </p>
          </div>
          
          <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Resources</h3>
          <ul className="space-y-2">
            <li>
                <a 
                    href="https://en.wikipedia.org/wiki/Design_for_Six_Sigma" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium group"
                >
                    <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    Wikipedia: Design for Six Sigma
                </a>
            </li>
            <li>
                <a 
                    href="https://www.isixsigma.com/tools-templates/design-of-experiments-doe/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium group"
                >
                    <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    iSixSigma Tools & Templates
                </a>
            </li>
            <li>
                <a 
                    href="https://asq.org/quality-resources/design-of-experiments" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium group"
                >
                    <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    ASQ Design of Experiments
                </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Right: DOE Setup */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h2 className="text-xl font-bold text-slate-800">Input Variables</h2>
                <p className="text-sm text-slate-500">Define factors and their experimental levels.</p>
             </div>
             <button 
                onClick={addFactor}
                className="text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Factor
              </button>
          </div>

          <div className="space-y-4 mb-8">
             <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-100/50 rounded-t-lg border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wide">
                 <div className="col-span-4">Factor Name</div>
                 <div className="col-span-2">Level 1</div>
                 <div className="col-span-2">Level 2</div>
                 <div className="col-span-3">Levels 3 & 4 (Optional)</div>
                 <div className="col-span-1"></div>
             </div>
             
             <div className="space-y-3">
                {factors.map((factor) => (
                    <div key={factor.id} className="grid grid-cols-12 gap-4 items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative transition-all">
                        {/* Factor Name */}
                        <div className="col-span-4">
                            <input 
                                type="text" 
                                value={factor.name}
                                onChange={(e) => updateFactorName(factor.id, e.target.value)}
                                className="w-full text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:font-normal"
                                placeholder="e.g. Temperature"
                            />
                        </div>

                        {/* Level 1 (Required) */}
                        <div className="col-span-2">
                             <div className="relative">
                                <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold pointer-events-none">L1</span>
                                <input 
                                    type="number" 
                                    value={factor.levels[0]}
                                    onChange={(e) => updateFactorLevel(factor.id, 0, e.target.value)}
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded px-2 py-2 pl-7 focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                                />
                             </div>
                        </div>

                        {/* Level 2 (Required) */}
                        <div className="col-span-2">
                             <div className="relative">
                                <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold pointer-events-none">L2</span>
                                <input 
                                    type="number" 
                                    value={factor.levels[1]}
                                    onChange={(e) => updateFactorLevel(factor.id, 1, e.target.value)}
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded px-2 py-2 pl-7 focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                                />
                             </div>
                        </div>

                        {/* Additional Levels */}
                        <div className="col-span-3 flex items-center gap-1.5 overflow-x-visible">
                            {factor.levels.slice(2).map((level, idx) => (
                                <div key={idx + 2} className="relative w-16 shrink-0">
                                    <span className="absolute left-1.5 top-2 text-[10px] text-slate-400 font-bold pointer-events-none">L{idx + 3}</span>
                                    <input 
                                        type="number" 
                                        value={level}
                                        onChange={(e) => updateFactorLevel(factor.id, idx + 2, e.target.value)}
                                        className="w-full text-sm bg-white border border-slate-300 rounded px-1.5 py-2 pl-6 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
                                    />
                                </div>
                            ))}
                            
                            <div className="flex gap-1 shrink-0">
                                {factor.levels.length < 4 && (
                                    <button 
                                        onClick={() => addLevelToFactor(factor.id)}
                                        className="h-[36px] w-[30px] flex items-center justify-center rounded border border-dashed border-slate-300 text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                        title="Add Level"
                                    >
                                        +
                                    </button>
                                )}
                                {factor.levels.length > 2 && (
                                    <button 
                                        onClick={() => removeLevelFromFactor(factor.id)}
                                        className="h-[36px] w-[30px] flex items-center justify-center rounded border border-dashed border-slate-300 text-slate-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors"
                                        title="Remove Last Level"
                                    >
                                        -
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Remove Factor */}
                        <div className="col-span-1 flex justify-end">
                            <button onClick={() => removeFactor(factor.id)} className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>
                ))}
             </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
             <div className="text-xs text-slate-400">
                 {factors.reduce((acc, f) => acc * f.levels.length, 1)} Runs will be generated
             </div>
             <button 
                onClick={handleGenerate}
                disabled={factors.length === 0}
                className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all
                    ${generated 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {generated ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Matrix Updated
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                        Generate Design Matrix
                    </>
                )}
              </button>
          </div>
          {generated && (
              <p className="text-right text-[10px] text-emerald-600 mt-2 font-medium animate-pulse">
                  Matrix ready. Go to "Output" to input results.
              </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabBackground;