import React, { useState, useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, YAxis, Cell } from 'recharts';
import { DoeRun, DoeFactor, InputVariable, SimulationConfig, YSpecs, OptimizationSpecs } from '../types';
import { createHistogramData, calculateEffects, generateRegressionFormula, runSimulation } from '../services/mathUtils';
import SimulationResults from './SimulationResults';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { analyzeSimulationResults } from '../services/geminiService';

export interface TabEmpiricalHandle {
    exportReport: () => void;
}

interface TabEmpiricalProps {
  runs: DoeRun[];
  factors: DoeFactor[];
  onUpdateRuns: (runs: DoeRun[]) => void;
  ySpecs: YSpecs;
  onYSpecsChange: (specs: YSpecs) => void;
  optimizerInputs: OptimizationSpecs;
  onOptimizerInputsChange: (inputs: OptimizationSpecs) => void;
  demoActive: boolean;
  onDemoComplete: () => void;
}

const TabEmpirical = forwardRef<TabEmpiricalHandle, TabEmpiricalProps>(({ 
    runs, 
    factors, 
    onUpdateRuns,
    ySpecs,
    onYSpecsChange,
    optimizerInputs,
    onOptimizerInputsChange,
    demoActive,
    onDemoComplete
}, ref) => {
  const [activeCell, setActiveCell] = useState<{rowId: number} | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [simResult, setSimResult] = useState<any>(null); // State for the optimizer simulation
  
  // AI Analysis State
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleYChange = (id: number, val: string) => {
    const newVal = val === '' ? null : parseFloat(val);
    const updatedRuns = runs.map(r => r.id === id ? { ...r, y: isNaN(newVal as number) ? null : newVal } : r);
    onUpdateRuns(updatedRuns);
  };

  const handlePaste = (e: React.ClipboardEvent, startId: number) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    const values = pasteData.split(/\r?\n/).map(line => line.trim());

    if (values.length === 0) return;

    const startIndex = runs.findIndex(r => r.id === startId);
    if (startIndex === -1) return;

    const newRuns = [...runs];
    values.forEach((val, idx) => {
        const targetIndex = startIndex + idx;
        if (targetIndex < newRuns.length) {
            const numVal = parseFloat(val);
            if (!isNaN(numVal)) {
                newRuns[targetIndex] = { ...newRuns[targetIndex], y: numVal };
            }
        }
    });

    onUpdateRuns(newRuns);
  };

  const exportReport = async () => {
    if (!reportRef.current) return;
    
    // Temporarily hide the button during capture
    const btn = document.getElementById('export-btn');
    if (btn) btn.style.display = 'none';

    try {
        const canvas = await html2canvas(reportRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        // Generate timestamp YYYYMMDDHHmm
        const now = new Date();
        const timestamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0');

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Sigma Stream Report_${timestamp}.pdf`);
    } finally {
        if (btn) btn.style.display = 'flex';
    }
  };

  useImperativeHandle(ref, () => ({
      exportReport
  }));

  // --- Calculations ---
  const validResults = runs.filter(r => r.y !== null).map(r => r.y as number);
  const hasData = validResults.length > 0;
  
  // 1. Stats
  const stats = useMemo(() => {
    if (!hasData) return null;
    const mean = validResults.reduce((a, b) => a + b, 0) / validResults.length;
    const min = Math.min(...validResults);
    const max = Math.max(...validResults);
    const histogram = createHistogramData(validResults, 10);
    return { mean, min, max, histogram, count: validResults.length };
  }, [runs, validResults, hasData]);

  // 2. Pareto Data
  const paretoData = useMemo(() => {
    return calculateEffects(runs, factors);
  }, [runs, factors]);

  // 3. Regression Formula
  const regressionFormula = useMemo(() => {
     return generateRegressionFormula(runs, factors);
  }, [runs, factors]);

  // 4. Optimizer Logic
  const initializeOptimizer = () => {
      const initials: OptimizationSpecs = {};
      factors.forEach(f => {
          // Default target to middle of range
          const mid = (f.levels[0] + f.levels[f.levels.length - 1]) / 2;
          initials[f.name] = { target: mid, tolerance: (mid * 0.1) }; // Default 10% tol
      });
      onOptimizerInputsChange(initials);
  };

  // Initialize optimizer inputs once when formula is ready and inputs empty
  useEffect(() => {
      if (regressionFormula && Object.keys(optimizerInputs).length === 0 && hasData) {
          initializeOptimizer();
      }
  }, [regressionFormula, hasData]);


  const runOptimizerSimulation = () => {
     if (!regressionFormula) return;

     const variables: InputVariable[] = factors.map(f => {
         const settings = optimizerInputs[f.name] || { target: 0, tolerance: 0 };
         const stdDev = settings.tolerance / 3;
         return {
             id: f.id,
             name: f.name,
             mean: settings.target,
             stdDev: stdDev,
             type: 'normal'
         };
     });

     const lslVal = ySpecs.lsl === '' ? -Infinity : parseFloat(ySpecs.lsl);
     const uslVal = ySpecs.usl === '' ? Infinity : parseFloat(ySpecs.usl);

     const config: SimulationConfig = {
         lsl: lslVal,
         usl: uslVal,
         formula: regressionFormula,
         iterations: 5000
     };
     
     const result = runSimulation(variables, config);
     setSimResult(result);
     setAnalysis(null); // Reset analysis on new run
  };

  const handleAnalyze = async () => {
    if (!simResult || !regressionFormula) return;
    
    setIsAnalyzing(true);
    
    const variables: InputVariable[] = factors.map(f => {
         const settings = optimizerInputs[f.name] || { target: 0, tolerance: 0 };
         const stdDev = settings.tolerance / 3;
         return {
             id: f.id,
             name: f.name,
             mean: settings.target,
             stdDev: stdDev,
             type: 'normal'
         };
    });

    const lslVal = ySpecs.lsl === '' ? -Infinity : parseFloat(ySpecs.lsl);
    const uslVal = ySpecs.usl === '' ? Infinity : parseFloat(ySpecs.usl);

    const config: SimulationConfig = {
         lsl: lslVal,
         usl: uslVal,
         formula: regressionFormula,
         iterations: 5000
    };

    try {
        const result = await analyzeSimulationResults(variables, config, simResult);
        setAnalysis(result);
    } catch (e) {
        console.error(e);
        setAnalysis("Unable to generate analysis. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  // Demo Effect Trigger
  useEffect(() => {
      // Ensure inputs are populated before running simulation
      if (demoActive && regressionFormula && Object.keys(optimizerInputs).length > 0) {
          // Wait briefly for state to settle then run
          const timer = setTimeout(() => {
             runOptimizerSimulation();
             // Then finish demo
             setTimeout(() => {
                 onDemoComplete();
             }, 800);
          }, 300);
          return () => clearTimeout(timer);
      }
  }, [demoActive, regressionFormula, optimizerInputs]);


  if (runs.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-300">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <h3 className="text-lg font-semibold text-slate-600">No Design Matrix Found</h3>
              <p className="text-sm">Go to the <span className="font-bold text-slate-600">Input Tab</span> to generate your experiment matrix first.</p>
          </div>
      );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
       
       <div ref={reportRef} className="space-y-8 p-4 bg-slate-50/50"> 
           {/* Section 1: Data Entry & Pareto */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               {/* Data Table */}
               <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">1. Experimental Results</h2>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-slate-200 w-16 text-center">Run</th>
                                        {factors.map(f => (
                                            <th key={f.id} className="px-4 py-3 border-b border-slate-200 font-bold text-slate-600">{f.name}</th>
                                        ))}
                                        <th className="px-4 py-3 border-b border-slate-200 w-32 bg-indigo-50/50 text-indigo-900 border-l border-indigo-100">
                                            Output (Y)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {runs.map((run) => (
                                        <tr key={run.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-center font-mono text-slate-400 text-xs">{run.id}</td>
                                            {factors.map(f => (
                                                <td key={f.id} className="px-4 py-3 font-mono text-xs">
                                                    {run.factors[f.name]}
                                                </td>
                                            ))}
                                            <td className="px-0 py-0 border-l border-slate-100 relative">
                                                <input 
                                                    type="number"
                                                    value={run.y === null ? '' : run.y}
                                                    onChange={(e) => handleYChange(run.id, e.target.value)}
                                                    onPaste={(e) => handlePaste(e, run.id)}
                                                    onFocus={() => setActiveCell({rowId: run.id})}
                                                    onBlur={() => setActiveCell(null)}
                                                    placeholder="-"
                                                    className={`
                                                        w-full h-full px-4 py-3 bg-transparent outline-none font-mono text-sm transition-all
                                                        ${activeCell?.rowId === run.id ? 'bg-indigo-50 text-indigo-700 font-bold ring-2 ring-inset ring-indigo-500' : 'text-slate-800'}
                                                        placeholder:text-slate-300
                                                    `}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
               </div>

               {/* Pareto Chart */}
               <div className="lg:col-span-5 space-y-4">
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[500px] flex flex-col">
                        <div className="mb-4">
                             <h2 className="text-lg font-bold text-slate-800">2. Pareto of Effects</h2>
                             <p className="text-xs text-slate-500">Which factors contribute most to the variation?</p>
                        </div>
                        {hasData && paretoData.length > 0 ? (
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        data={paretoData} 
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#475569'}} />
                                        <Tooltip 
                                            cursor={{fill: '#f1f5f9'}}
                                            contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px'}}
                                            formatter={(value: number) => [value.toFixed(4), 'Effect Size']}
                                        />
                                        <Bar dataKey="effect" radius={[0, 4, 4, 0]}>
                                            {paretoData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : index === 1 ? '#6366f1' : '#cbd5e1'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                                Enter Y data to generate Pareto chart.
                            </div>
                        )}
                   </div>
               </div>
           </div>

           {/* Section 2: Model & Optimizer */}
           {hasData && regressionFormula && (
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">3. Prediction & Optimization</h2>
                            <p className="text-sm text-slate-500 mt-1 font-mono bg-white inline-block px-2 py-1 rounded border border-slate-200 text-indigo-600">
                                Model: Y = {regressionFormula}
                            </p>
                        </div>
                        <button 
                            id="export-btn"
                            onClick={exportReport}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export Report
                        </button>
                   </div>
                   
                   <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                       {/* Inputs */}
                       <div className="lg:col-span-5 space-y-6">
                           
                           {/* Step 3.1 Define Response Specs */}
                           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                               <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">A. Define Y Specs</h3>
                               <div className="grid grid-cols-3 gap-3">
                                   <div>
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">LSL (Lower)</label>
                                       <input 
                                           type="number" 
                                           className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-red-500 outline-none"
                                           placeholder="-inf"
                                           value={ySpecs.lsl}
                                           onChange={(e) => onYSpecsChange({...ySpecs, lsl: e.target.value})}
                                       />
                                   </div>
                                    <div>
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target</label>
                                       <input 
                                           type="number" 
                                           className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                           placeholder="Target"
                                           value={ySpecs.target}
                                           onChange={(e) => onYSpecsChange({...ySpecs, target: e.target.value})}
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">USL (Upper)</label>
                                       <input 
                                           type="number" 
                                           className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-red-500 outline-none"
                                           placeholder="+inf"
                                           value={ySpecs.usl}
                                           onChange={(e) => onYSpecsChange({...ySpecs, usl: e.target.value})}
                                       />
                                   </div>
                               </div>
                           </div>

                           {/* Step 3.2 Define Inputs */}
                           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                               <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">B. Set Input Parameters</h3>
                               <div className="space-y-3">
                                   <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase mb-1">
                                        <div className="col-span-4">Factor</div>
                                        <div className="col-span-4">Target Setting</div>
                                        <div className="col-span-4">Tolerance (+/-)</div>
                                   </div>
                                   {factors.map(f => (
                                       <div key={f.id} className="grid grid-cols-12 gap-2 items-center">
                                           <div className="col-span-4 text-sm font-semibold text-slate-700 truncate" title={f.name}>{f.name}</div>
                                           <div className="col-span-4">
                                               <input 
                                                    type="number" 
                                                    className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={optimizerInputs[f.name]?.target || ''}
                                                    onChange={(e) => onOptimizerInputsChange({
                                                        ...optimizerInputs, 
                                                        [f.name]: { ...optimizerInputs[f.name], target: parseFloat(e.target.value) }
                                                    })}
                                               />
                                           </div>
                                           <div className="col-span-4">
                                                <input 
                                                    type="number" 
                                                    className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={optimizerInputs[f.name]?.tolerance || ''}
                                                    onChange={(e) => onOptimizerInputsChange({
                                                        ...optimizerInputs, 
                                                        [f.name]: { ...optimizerInputs[f.name], tolerance: parseFloat(e.target.value) }
                                                    })}
                                               />
                                           </div>
                                       </div>
                                   ))}
                               </div>
                               
                               <button 
                                   onClick={runOptimizerSimulation}
                                   className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors flex justify-center items-center gap-2"
                               >
                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                   Run Monte Carlo Simulation
                               </button>
                           </div>
                       </div>

                       {/* Simulation Output */}
                       <div className="lg:col-span-7">
                           {simResult ? (
                               <div className="h-full flex flex-col">
                                   <div className="mb-4 grid grid-cols-2 gap-4">
                                       <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                           <div className="text-xs text-emerald-600 font-bold uppercase">Predicted Mean Y</div>
                                           <div className="text-2xl font-bold text-emerald-900">{simResult.mean.toFixed(3)}</div>
                                       </div>
                                       <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                           <div className="text-xs text-blue-600 font-bold uppercase">Predicted StdDev</div>
                                           <div className="text-2xl font-bold text-blue-900">{simResult.stdDev.toFixed(3)}</div>
                                       </div>
                                   </div>
                                   <div className="flex-1 bg-white border border-slate-100 rounded-lg p-4 h-[300px]">
                                        <SimulationResults 
                                            result={simResult}
                                            config={{
                                                ...simResult, 
                                                formula: regressionFormula, 
                                                lsl: ySpecs.lsl === '' ? simResult.mean - 4*simResult.stdDev : parseFloat(ySpecs.lsl), 
                                                usl: ySpecs.usl === '' ? simResult.mean + 4*simResult.stdDev : parseFloat(ySpecs.usl),
                                                iterations: 5000
                                            }}
                                            analysis={analysis}
                                            isAnalyzing={isAnalyzing}
                                            onAnalyze={handleAnalyze} 
                                        />
                                   </div>
                               </div>
                           ) : (
                               <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                   <div className="text-center">
                                       <p>Set targets and tolerances, then click Run Simulation.</p>
                                   </div>
                               </div>
                           )}
                       </div>
                   </div>
               </div>
           )}
       </div>
    </div>
  );
});

TabEmpirical.displayName = 'TabEmpirical';

export default TabEmpirical;