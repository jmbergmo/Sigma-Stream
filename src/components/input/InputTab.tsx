import React, { useState, useEffect } from 'react';
import { DoeFactor } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { saveSnapshot } from '../../services/snapshots';
import SnapshotsModal from '../SnapshotsModal';

interface InputTabProps {
  factors: DoeFactor[];
  onGenerate: (factors: DoeFactor[]) => void;
  onClear: () => void;
}

const InputTab: React.FC<InputTabProps> = ({ factors: initialFactors, onGenerate, onClear }) => {
  const [factors, setFactors] = useState<DoeFactor[]>(initialFactors);
  const [generated, setGenerated] = useState(false);
  const { currentUser } = useAuth();
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);

  // Sync internal state if props change (e.g. loaded from snapshot)
  useEffect(() => {
    setFactors(initialFactors);
  }, [initialFactors]);

  const handleSaveSnapshot = async () => {
    if (!currentUser) return;
    const name = prompt("Enter a name for this snapshot:", `DOE Project ${new Date().toLocaleDateString()}`);
    if (name) {
      try {
        await saveSnapshot(name, factors);
        alert("Snapshot saved successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to save snapshot.");
      }
    }
  };

  const handleLoadSnapshot = (loadedFactors: DoeFactor[]) => {
    // We need to propagate this up because App holds the state
    // However, InputTab receives factors as props, but also maintains local state?
    // Wait, InputTab uses local state 'factors' initialized from props.
    // But App.tsx passes 'doeFactors' and 'handleGenerateDesign'.
    // When we load, we should probably update the parent state or just local?
    // Ideally we update the parent so it persists across tab switches if we generate.
    // But 'onGenerate' updates the parent.
    // Let's just update local state and let user click generate.
    setFactors(loadedFactors);
    setGenerated(false);
  };

  const addFactor = () => {
    const newId = Date.now().toString();
    const count = factors.length + 1;
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
    setFactors(factors.map(f => {
      if (f.id !== id) return f;
      const newLevels = [...f.levels];
      const val = parseFloat(valueStr);
      // Allow empty string to clear the value (will be NaN in state, handled by input)
      if (!isNaN(val) || valueStr === '') {
        newLevels[levelIndex] = val;
      }
      return { ...f, levels: newLevels };
    }));
    setGenerated(false);
  };

  const addLevelToFactor = (id: string) => {
    setFactors(factors.map(f => f.id === id && f.levels.length < 4 ? { ...f, levels: [...f.levels, 0] } : f));
    setGenerated(false);
  };

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
    const cleanFactors = factors.map(f => ({ ...f, levels: f.levels.filter(l => !isNaN(l)) }));
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
            {[
              { title: "Define Factors", desc: "Add input variables in the setup panel on the right." },
              { title: "Set Levels", desc: "Enter Low (L1) and High (L2) values. Add optional L3/L4." },
              { title: "Generate Design", desc: "Click \"Generate Design Matrix\" to create the experiment runs." },
              { title: "Input Results", desc: "Switch to the Output tab and enter measured results (Y)." },
              { title: "Optimize", desc: "Set targets and run the simulation to generate stats and AI insights." }
            ].map((step, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-600">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 shadow-sm">{idx + 1}</span>
                <span><strong className="block text-slate-800">{step.title}</strong>{step.desc}</span>
              </li>
            ))}
          </ol>
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">About DFSS & DOE Optimization</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Unlock the power of data-driven design with Design for Six Sigma (DFSS), a premier methodology for designing and optimizing products and processes to achieve outstanding quality and meet customer expectations. This powerful approach is fundamental to quality engineering and robust design. Our tool simplifies the core of DFSS by providing an intuitive platform for Design of Experiments (DOE).
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              With our AI-powered web application, you can seamlessly create and analyze complex experimental designs. Define your input factors, specify their levels, and automatically generate a full factorial design matrix. Once you collect your results, our advanced statistical analysis and simulation engine helps you understand the relationships between your variables, identify critical factors, and optimize your process or product with unparalleled precision. This platform is an essential tool for engineers, researchers, and quality professionals looking to implement DFSS and DOE principles for process optimization, product development, and achieving Six Sigma level performance. Enhance your decision-making, reduce variability, and accelerate innovation with our easy-to-use, visually appealing DFSS and DOE software.
            </p>
          </div>
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
            {currentUser && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsSnapshotModalOpen(true)}
                  className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Load
                </button>
                <button
                  onClick={handleSaveSnapshot}
                  className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-slate-100/50 rounded-t-lg border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <div className="col-span-3">Factor Name</div>
              <div className="col-span-2">Level 1</div>
              <div className="col-span-2">Level 2</div>
              <div className="col-span-2">Level 3</div>
              <div className="col-span-2">Level 4</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-3">
              {factors.map((factor) => (
                <div key={factor.id} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm transition-all group/row">
                  {/* Name */}
                  <div className="col-span-3">
                    <input type="text" value={factor.name} onChange={(e) => updateFactorName(factor.id, e.target.value)} className="w-full text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none placeholder:font-normal" placeholder="e.g. Temp" />
                  </div>

                  {/* Dynamic Levels Loop (L1 to L4) */}
                  {[0, 1, 2, 3].map(idx => {
                    const isPresent = idx < factor.levels.length;
                    const isNext = idx === factor.levels.length;

                    if (isPresent) {
                      return (
                        <div key={idx} className="col-span-2 relative group/cell">
                          <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold pointer-events-none">L{idx + 1}</span>
                          <input
                            type="number"
                            value={isNaN(factor.levels[idx]) ? '' : factor.levels[idx]}
                            onChange={(e) => updateFactorLevel(factor.id, idx, e.target.value)}
                            className="w-full text-sm bg-slate-50 border border-slate-200 rounded px-2 py-2 pl-7 focus:ring-2 focus:ring-blue-500 outline-none text-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          {/* Remove button only for optional levels (idx >= 2) and if it's the last one */}
                          {idx >= 2 && idx === factor.levels.length - 1 && (
                            <button
                              onClick={() => removeLevelFromFactor(factor.id)}
                              className="absolute right-1 top-1.5 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                              title={`Remove Level ${idx + 1}`}
                              tabIndex={-1}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                          )}
                        </div>
                      );
                    } else if (isNext) {
                      return (
                        <div key={idx} className="col-span-2 relative">
                          <button onClick={() => addLevelToFactor(factor.id)} className="w-full h-[38px] border-2 border-dashed border-slate-200 rounded text-xs font-bold text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            L{idx + 1}
                          </button>
                        </div>
                      );
                    } else {
                      return <div key={idx} className="col-span-2"></div>;
                    }
                  })}

                  {/* Remove Factor */}
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeFactor(factor.id)} className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Factor Button */}
            <button
              onClick={addFactor}
              className="w-full py-3 mt-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Factor Variable
            </button>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-400">{factors.reduce((acc, f) => acc * f.levels.length, 1)} Runs will be generated</div>

            <button
              onClick={onClear}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:text-red-700 bg-slate-50 hover:bg-red-50/50 border border-slate-300 hover:border-red-200 shadow-sm transition-all flex items-center gap-2"
              title="Clear all data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              Clear
            </button>

            <button onClick={handleGenerate} disabled={factors.length === 0} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all ${generated ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'} disabled:opacity-50 disabled:cursor-not-allowed`}>
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
        </div>
      </div>

      <SnapshotsModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        onLoad={handleLoadSnapshot}
      />
    </div>
  );
};

export default InputTab;
