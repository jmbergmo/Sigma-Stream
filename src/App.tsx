
import React, { useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import Header from './components/layout/Header';
import { AuthProvider } from './components/auth/AuthContext';
import { DoeFactor, DoeRun, YSpecs, OptimizationSpecs } from './types';
import { generateFullFactorialDesign } from './services/mathUtils';
import { AppContextType } from './context/OutletContext';

// Serialization Helpers
export const serializeState = (state: any) => {
  try {
    return btoa(JSON.stringify(state));
  } catch (e) {
    console.error("Failed to serialize state", e);
    return "";
  }
};

export const deserializeState = (str: string | null) => {
  if (!str) return null;
  try {
    return JSON.parse(atob(str));
  } catch (e) {
    console.error("Failed to deserialize state", e);
    return null;
  }
};

const App: React.FC = () => {
  const navigate = useNavigate();

  // Shared DOE State
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial State Loading
  const loadInitialState = () => {
    const stateStr = searchParams.get('state');
    const savedState = deserializeState(stateStr);

    // Default Factors
    const defaultFactors = [
      { id: '1', name: 'Pressure', levels: [40, 60] },
      { id: '2', name: 'Temp', levels: [200, 250] },
      { id: '3', name: 'Volume', levels: [10, 20] },
      { id: '4', name: 'Speed', levels: [1000, 1200] }
    ];

    if (savedState) {
      return {
        factors: savedState.doeFactors || defaultFactors,
        runs: savedState.doeRuns || [],
        ySpecs: savedState.ySpecs || { target: '', lsl: '', usl: '' },
        optimizerInputs: savedState.optimizerInputs || {}
      };
    }

    return {
      factors: defaultFactors,
      runs: [],
      ySpecs: { target: '', lsl: '', usl: '' },
      optimizerInputs: {}
    };
  };

  const initialState = loadInitialState();

  const [doeFactors, setDoeFactors] = useState<DoeFactor[]>(initialState.factors);
  const [doeRuns, setDoeRuns] = useState<DoeRun[]>(initialState.runs);

  // Shared Output State (Specs & Optimizer)
  const [ySpecs, setYSpecs] = useState<YSpecs>(initialState.ySpecs);
  const [optimizerInputs, setOptimizerInputs] = useState<OptimizationSpecs>(initialState.optimizerInputs);

  // Demo State
  const [demoActive, setDemoActive] = useState(false);

  // Sync State to URL
  React.useEffect(() => {
    // Debounce slightly or just update on every change? 
    // Given the text fields, a small debounce used to be nice, but here local state drives inputs so it's fine.
    // However, updating URL on every keystroke might be heavy if history stack gets huge.
    // We will use replace: true to avoid breaking back button.

    const currentState = {
      doeFactors,
      doeRuns,
      ySpecs,
      optimizerInputs
    };

    const serialized = serializeState(currentState);

    const currentSerialized = searchParams.get('state');
    if (currentSerialized !== serialized) {
      setSearchParams(prev => {
        // Only update if changed to avoid loops?
        // useSearchParams should be stable.
        // We preserve other params if any (React Router handles this via setSearchParams, but we need to pass new object)
        const newParams = new URLSearchParams(prev);
        if (serialized) {
          newParams.set('state', serialized);
        } else {
          newParams.delete('state');
        }
        return newParams;
      }, { replace: true });
    }

  }, [doeFactors, doeRuns, ySpecs, optimizerInputs, setSearchParams, searchParams]);

  // Generator handler
  const handleGenerateDesign = (factors: DoeFactor[]) => {
    setDoeFactors(factors);
    setDoeRuns(generateFullFactorialDesign(factors));
    navigate('/output');
  };

  // Demo Logic
  const handleDemo = () => {
    // 1. Ensure we have runs (if none, generate defaults)
    let currentRuns = doeRuns;
    let currentFactors = doeFactors;

    if (currentRuns.length === 0) {
      currentFactors = [
        { id: '1', name: 'Pressure', levels: [40, 60] },
        { id: '2', name: 'Temp', levels: [200, 250] },
        { id: '3', name: 'Volume', levels: [10, 20] },
        { id: '4', name: 'Speed', levels: [1000, 1200] }
      ];
      setDoeFactors(currentFactors);
      currentRuns = generateFullFactorialDesign(currentFactors);
    }

    // 2. Randomly populate Y values between 6 and 10 with 0.1 resolution
    const demoRuns = currentRuns.map(r => ({
      ...r,
      y: parseFloat((Math.random() * (10 - 6) + 6).toFixed(1))
    }));
    setDoeRuns(demoRuns);

    // 3. Populate Y Specs
    setYSpecs({ target: '8', lsl: '7', usl: '9' });

    // 4. Switch to Output tab
    navigate('/output');

    // 5. Trigger Demo Sequence
    setDemoActive(true);
  };

  const handleClear = () => {
    setDoeFactors([]);
    setDoeRuns([]);
    setYSpecs({ target: '', lsl: '', usl: '' });
    setOptimizerInputs({});
    setDemoActive(false);
    navigate('/inputs');
  };

  const contextValue: AppContextType = {
    doeFactors,
    doeRuns,
    setDoeRuns,
    ySpecs,
    setYSpecs,
    optimizerInputs,
    setOptimizerInputs,
    demoActive,
    setDemoActive,
    handleGenerateDesign,
    handleClear,
    handleDemo
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50/50 h-screen overflow-hidden">
        <Header />

        <div className="flex flex-1 overflow-hidden relative">
          {/* Main Content Area - Scrollable */}
          <main className="flex-1 w-full overflow-y-auto px-4 md:px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <Outlet context={contextValue} />
            </div>
          </main>

          {/* Right Sidebar (Ads) - Fixed/Sticky */}
          <aside className="w-64 bg-slate-100 border-l border-slate-200 hidden lg:flex flex-col overflow-y-auto shrink-0 relative z-10">
            <div className="p-4 space-y-6 sticky top-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase text-center tracking-widest">Sponsored</div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 group hover:shadow-md transition-all cursor-pointer">
                <div className="w-10 h-10 bg-blue-600 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-xl">M</div>
                <h4 className="font-bold text-slate-800">Minitabz Pro Ultra</h4>
                <p className="text-xs text-slate-500 mt-1 mb-3">Why use free online tools when you can pay us $5,000/year?</p>
                <button className="w-full bg-blue-50 text-blue-600 text-xs font-bold py-2 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  Buy License
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 group hover:shadow-md transition-all cursor-pointer">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-xl">J</div>
                <h4 className="font-bold text-slate-800">JMP-Start Plus</h4>
                <p className="text-xs text-slate-500 mt-1 mb-3">Statistical discovery for those who love excessive menus.</p>
                <button className="w-full bg-emerald-50 text-emerald-600 text-xs font-bold py-2 rounded group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  Free Trial ($4500)
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 group hover:shadow-md transition-all cursor-pointer">
                <div className="w-10 h-10 bg-purple-600 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-xl">S</div>
                <h4 className="font-bold text-slate-800">SigmaXL Lite</h4>
                <p className="text-xs text-slate-500 mt-1 mb-3">It's mostly just Excel macros but we charge for it.</p>                      <button className="w-full bg-purple-50 text-purple-600 text-xs font-bold py-2 rounded group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  Get It Now
                </button>
              </div>

              <div className="pt-8 space-y-3">
                <button className="w-full border-2 border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 font-bold py-2 px-4 rounded-lg text-xs transition-colors">
                  Upgrade to Remove Ads
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AuthProvider>
  );
};

export default App;
