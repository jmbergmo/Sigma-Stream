import React, { useState, useCallback } from 'react';
import VariableCard from './VariableCard';
import SimulationResults from './SimulationResults';
import { InputVariable, SimulationConfig, SimulationResult } from '../types';
import { runSimulation } from '../services/mathUtils';
import { analyzeSimulationResults } from '../services/geminiService';

const TabTheoretical: React.FC = () => {
  // --- State ---
  const [variables, setVariables] = useState<InputVariable[]>([
    { id: '1', name: 'width', mean: 10, stdDev: 0.1, type: 'normal' },
    { id: '2', name: 'height', mean: 25, stdDev: 0.2, type: 'normal' },
  ]);

  const [config, setConfig] = useState<SimulationConfig>({
    lsl: 245,
    usl: 255,
    formula: 'width * height',
    iterations: 5000,
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---
  const addVariable = () => {
    const newId = Date.now().toString();
    const count = variables.length + 1;
    setVariables([...variables, { id: newId, name: `x${count}`, mean: 0, stdDev: 1, type: 'normal' }]);
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter(v => v.id !== id));
  };

  const updateVariable = (id: string, field: keyof InputVariable, value: any) => {
    setVariables(variables.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleRunSimulation = useCallback(() => {
    setError(null);
    try {
      const result = runSimulation(variables, config);
      setSimulationResult(result);
      setAiAnalysis(null); // Reset analysis when new data runs
    } catch (err) {
      setError((err as Error).message);
    }
  }, [variables, config]);

  const handleAnalyze = async () => {
    if (!simulationResult) return;
    setIsAnalyzing(true);
    const analysis = await analyzeSimulationResults(variables, config, simulationResult);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
      {/* Left Column: Configuration */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Transfer Function Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">1. Transfer Function</h2>
          </div>
          <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Y = f(X)</label>
                <input 
                  type="text" 
                  value={config.formula}
                  onChange={(e) => setConfig({...config, formula: e.target.value})}
                  className="w-full text-lg font-mono bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                  placeholder="e.g. x1 + 2*x2"
                />
                <p className="text-[10px] text-slate-400 mt-1">Supported: +, -, *, /, sin, cos, sqrt, pow. Use variable names defined below.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">LSL (Lower Limit)</label>
                  <input 
                    type="number"
                    value={config.lsl}
                    onChange={(e) => setConfig({...config, lsl: parseFloat(e.target.value)})} 
                    className="w-full font-mono bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">USL (Upper Limit)</label>
                  <input 
                    type="number" 
                    value={config.usl}
                    onChange={(e) => setConfig({...config, usl: parseFloat(e.target.value)})}
                    className="w-full font-mono bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-400 outline-none"
                  />
                </div>
              </div>
          </div>
        </section>

        {/* Input Variables Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[600px]">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center z-10">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">2. Input Variables (Xs)</h2>
            <button 
              onClick={addVariable}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1"
            >
              <span>+ Add X</span>
            </button>
          </div>
          
          <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-slate-50/50">
            {variables.map(v => (
              <VariableCard 
                key={v.id} 
                variable={v} 
                onChange={updateVariable} 
                onRemove={removeVariable} 
              />
            ))}
            {variables.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm italic">
                No variables defined. Add one to start.
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-white z-10">
            <button 
              onClick={handleRunSimulation}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Run Monte Carlo Simulation
            </button>
            {error && (
              <div className="mt-3 text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
                Error: {error}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Right Column: Results */}
      <div className="lg:col-span-7">
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">3. Analysis & Output</h2>
            </div>
            <div className="p-6 flex-1">
                <SimulationResults 
                  result={simulationResult} 
                  config={config} 
                  analysis={aiAnalysis}
                  isAnalyzing={isAnalyzing}
                  onAnalyze={handleAnalyze}
                />
            </div>
          </section>
      </div>

    </div>
  );
};

export default TabTheoretical;