import React, { useState, useRef, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis, Cell } from 'recharts';
import { DoeRun, DoeFactor, InputVariable, SimulationConfig, YSpecs, OptimizationSpecs } from '../../types';
import { calculateEffects, generateRegressionFormula, runSimulation } from '../../services/mathUtils';
import SimulationResults from './SimulationResults';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { analyzeSimulationResults } from '../../services/geminiService';
import InteractionEffects from './InteractionEffects';

interface OutputTabProps {
    runs: DoeRun[];
    factors: DoeFactor[];
    onUpdateRuns: (runs: DoeRun[]) => void;
    ySpecs: YSpecs;
    onYSpecsChange: (specs: YSpecs) => void;
    optimizerInputs: OptimizationSpecs;
    onOptimizerInputsChange: (inputs: OptimizationSpecs) => void;
    demoActive: boolean;
    onDemoComplete: () => void;
    onDemo: () => void;
}

const OutputTab: React.FC<OutputTabProps> = ({
    runs, factors, onUpdateRuns, ySpecs, onYSpecsChange, optimizerInputs,
    onOptimizerInputsChange,
    demoActive,
    onDemoComplete,
    onDemo
}) => {
    const [activeCell, setActiveCell] = useState<{ rowId: number } | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const [simResult, setSimResult] = useState<any>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Computed
    const validResults = runs.filter(r => r.y !== null).map(r => r.y as number);
    const hasData = validResults.length > 0;
    const paretoData = useMemo(() => calculateEffects(runs, factors), [runs, factors]);
    const regressionFormula = useMemo(() => generateRegressionFormula(runs, factors), [runs, factors]);

    // Init Optimizer Defaults
    useEffect(() => {
        if (regressionFormula && Object.keys(optimizerInputs).length === 0 && hasData) {
            const initials: OptimizationSpecs = {};
            factors.forEach(f => {
                const mid = (f.levels[0] + f.levels[f.levels.length - 1]) / 2;
                initials[f.name] = { lowerLimit: Math.round(mid * 0.9), upperLimit: Math.round(mid * 1.1), target: mid };
            });
            onOptimizerInputsChange(initials);
        }
    }, [regressionFormula, hasData]);

    // Demo Trigger
    useEffect(() => {
        if (demoActive && regressionFormula && Object.keys(optimizerInputs).length > 0) {
            const timer = setTimeout(() => {
                runOptimizerSimulation();
                setTimeout(onDemoComplete, 800);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [demoActive, regressionFormula, optimizerInputs]);

    // Handlers
    const handlePaste = (e: React.ClipboardEvent, startId: number) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        // Split by newline and filter out empty strings resulting from trailing newlines
        const values = pasteData.split(/\r?\n/).filter(v => v.trim() !== '');

        if (values.length === 0) return;

        const startIndex = runs.findIndex(r => r.id === startId);
        if (startIndex === -1) return;

        const newRuns = [...runs];
        values.forEach((val, i) => {
            const runIndex = startIndex + i;
            if (runIndex < newRuns.length) {
                const numVal = parseFloat(val.trim());
                if (!isNaN(numVal)) {
                    newRuns[runIndex] = { ...newRuns[runIndex], y: numVal };
                }
            }
        });
        onUpdateRuns(newRuns);
    };

    const handleYChange = (id: number, val: string) => {
        const newVal = val === '' ? null : parseFloat(val);
        onUpdateRuns(runs.map(r => r.id === id ? { ...r, y: isNaN(newVal as number) ? null : newVal } : r));
    };

    const runOptimizerSimulation = () => {
        if (!regressionFormula) return;
        const variables: InputVariable[] = factors.map(f => {
            const lower = optimizerInputs[f.name]?.lowerLimit || 0;
            const upper = optimizerInputs[f.name]?.upperLimit || 0;
            return {
                id: f.id, name: f.name, type: 'normal',
                mean: (lower + upper) / 2,
                stdDev: (upper - lower) / 6
            }
        });
        const config: SimulationConfig = {
            lsl: ySpecs.lsl === '' ? -Infinity : parseFloat(ySpecs.lsl),
            usl: ySpecs.usl === '' ? Infinity : parseFloat(ySpecs.usl),
            formula: regressionFormula, iterations: 5000
        };
        setSimResult(runSimulation(variables, config));
        setAnalysis(null);
    };

    const handleAnalyze = async () => {
        if (!simResult || !regressionFormula) return;
        setIsAnalyzing(true);
        try {
            const variables = factors.map(f => {
                const lower = optimizerInputs[f.name]?.lowerLimit || 0;
                const upper = optimizerInputs[f.name]?.upperLimit || 0;
                return {
                    id: f.id, name: f.name, type: 'normal' as const,
                    mean: (lower + upper) / 2,
                    stdDev: (upper - lower) / 6
                }
            });
            const config = {
                lsl: ySpecs.lsl === '' ? -Infinity : parseFloat(ySpecs.lsl),
                usl: ySpecs.usl === '' ? Infinity : parseFloat(ySpecs.usl),
                formula: regressionFormula, iterations: 5000
            };
            const result = await analyzeSimulationResults(variables, config, simResult);
            setAnalysis(result);
        } catch (e) {
            setAnalysis("Unable to generate analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const exportReport = async () => {
        if (!reportRef.current) return;
        const btn = document.getElementById('export-btn');
        if (btn) btn.style.display = 'none';
        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width);
            pdf.save(`Sigma Stream Report.pdf`);
        } finally {
            if (btn) btn.style.display = 'flex';
        }
    };

    const renderContent = () => {
        if (runs.length === 0) return (
            <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-300 gap-4">
                <p>Go to the <span className="font-bold text-slate-600">Input Tab</span> to generate your experiment matrix first.</p>
                <div className="relative group">
                    <button
                        onClick={onDemo}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded border border-emerald-500 shadow-sm transition-all active:scale-95 whitespace-nowrap flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-14 9V3z"></path></svg>
                        Run Demo Instead
                    </button>
                </div>
            </div>
        );

        return (
            <div ref={reportRef} className="space-y-8 p-4 bg-slate-50/50">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Data Table */}
                    <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
                            <h2 className="text-lg font-bold text-slate-800">1. Experimental Results</h2>
                            <div className="flex flex-col items-end gap-1">
                                <div className="relative group">
                                    <button
                                        onClick={onDemo}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1 px-2.5 rounded border border-emerald-500 shadow-sm transition-all active:scale-95 whitespace-nowrap flex items-center gap-1.5"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-14 9V3z"></path></svg>
                                        DEMO
                                    </button>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl text-center z-50 pointer-events-none ring-1 ring-white/10">
                                        Populate random data (Y=6-10), set specs, and download report.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-400 italic text-right">Recommended to note experimental results offline and paste here</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 border-b w-16 text-center">Run</th>
                                        {factors.map(f => <th key={f.id} className="px-4 py-3 border-b">{f.name}</th>)}
                                        <th className="px-4 py-3 border-b w-32 bg-indigo-50/50 border-l border-indigo-100">Output (Y)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {runs.map((run) => (
                                        <tr key={run.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-4 py-3 text-center font-mono text-xs">{run.id}</td>
                                            {factors.map(f => <td key={f.id} className="px-4 py-3 font-mono text-xs">{run.factors[f.name]}</td>)}
                                            <td className="px-0 py-0 border-l border-slate-100 relative">
                                                <input type="number" value={run.y === null ? '' : run.y} onChange={(e) => handleYChange(run.id, e.target.value)} onPaste={(e) => handlePaste(e, run.id)} onFocus={() => setActiveCell({ rowId: run.id })} onBlur={() => setActiveCell(null)} placeholder="-" className={`w-full h-full px-4 py-3 bg-transparent outline-none font-mono text-sm ${activeCell?.rowId === run.id ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500' : ''}`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pareto Chart */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[500px] flex flex-col">
                        <div className="mb-4"><h2 className="text-lg font-bold text-slate-800">2. Pareto of Effects</h2></div>
                        {hasData && paretoData.length > 0 ? (
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={paretoData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                                        <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(value: number) => [value.toFixed(4), 'Effect Size']} />
                                        <Bar dataKey="effect" radius={[0, 4, 4, 0]}>
                                            {paretoData.map((_, i) => <Cell key={`cell-${i}`} fill={i < 2 ? '#4f46e5' : '#cbd5e1'} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Enter Y data to generate Pareto chart.</div>}
                    </div>
                </div>

                {/* Optimizer */}
                {hasData && regressionFormula && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <div><h2 className="text-lg font-bold text-slate-800">3. Prediction & Optimization</h2><p className="text-xs text-indigo-600 font-mono mt-1">Model: Y = {regressionFormula}</p></div>
                            <button id="export-btn" onClick={exportReport} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">Export Report</button>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5 space-y-6">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">A. Define Y Specs</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['lsl', 'target', 'usl'].map(field => (
                                            <div key={field}>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{field}</label>
                                                <input type="number" className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder={field === 'target' ? 'Target' : field.toUpperCase()} value={(ySpecs as any)[field]} onChange={(e) => onYSpecsChange({ ...ySpecs, [field]: e.target.value })} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">B. Set Input Parameters</h3>
                                    <div className="grid grid-cols-12 gap-2 items-center text-xs font-bold text-slate-400 uppercase mb-2">
                                        <div className="col-span-4">Factor</div>
                                        <div className="col-span-4">Lower Limit</div>
                                        <div className="col-span-4">Upper Limit</div>
                                    </div>
                                    <div className="space-y-3">
                                        {factors.map(f => (
                                            <div key={f.id} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-4 text-sm font-semibold text-slate-700 truncate" title={f.name}>{f.name}</div>
                                                <div className="col-span-4"><input type="number" className="w-full text-sm border border-slate-300 rounded px-2 py-1.5" value={optimizerInputs[f.name]?.lowerLimit || ''} onChange={(e) => onOptimizerInputsChange({ ...optimizerInputs, [f.name]: { ...optimizerInputs[f.name], lowerLimit: parseFloat(e.target.value) } })} /></div>
                                                <div className="col-span-4"><input type="number" className="w-full text-sm border border-slate-300 rounded px-2 py-1.5" value={optimizerInputs[f.name]?.upperLimit || ''} onChange={(e) => onOptimizerInputsChange({ ...optimizerInputs, [f.name]: { ...optimizerInputs[f.name], upperLimit: parseFloat(e.target.value) } })} /></div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={runOptimizerSimulation} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow">Run Monte Carlo Simulation</button>
                                </div>
                            </div>
                            <div className="lg:col-span-7">
                                {simResult ? (
                                    <div className="h-full flex flex-col">
                                        <div className="mb-4 grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg"><div className="text-xs text-emerald-600 font-bold uppercase">Predicted Mean Y</div><div className="text-2xl font-bold text-emerald-900">{simResult.mean.toFixed(3)}</div></div>
                                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg"><div className="text-xs text-blue-600 font-bold uppercase">Predicted StdDev</div><div className="text-2xl font-bold text-blue-900">{simResult.stdDev.toFixed(3)}</div></div>
                                        </div>
                                        <div className="flex-1 bg-white border border-slate-100 rounded-lg p-4 h-[300px]">
                                            <SimulationResults result={simResult} config={{ ...simResult, formula: regressionFormula, lsl: ySpecs.lsl === '' ? -Inf : parseFloat(ySpecs.lsl), usl: ySpecs.usl === '' ? Inf : parseFloat(ySpecs.usl), iterations: 5000 }} analysis={analysis} isAnalyzing={isAnalyzing} onAnalyze={handleAnalyze} />
                                        </div>
                                    </div>
                                ) : <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300"><p>Set targets and click Run.</p></div>}
                            </div>
                        </div>
                    </div>
                )}

                {hasData && regressionFormula && (
                    <InteractionEffects runs={runs} factors={factors} />
                )}
            </div>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">



            {renderContent()}
        </div>
    );
};

const Inf = Infinity; // Helper for terse config above
export default OutputTab;
