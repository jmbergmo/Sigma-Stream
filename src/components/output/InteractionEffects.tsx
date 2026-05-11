import React, { useMemo, useState, useEffect } from 'react';
import { DoeRun, DoeFactor } from '../../types';
import { calculateInteractionEffects } from '../../services/mathUtils';
import { formatAxisNumber } from '../../services/formatUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

interface InteractionEffectsProps {
  runs: DoeRun[];
  factors: DoeFactor[];
}

const InteractionEffects: React.FC<InteractionEffectsProps> = ({ runs, factors }) => {
  const [selectedInteraction, setSelectedInteraction] = useState<string>('');

  const interactionData = useMemo(() => {
    return calculateInteractionEffects(runs, factors);
  }, [runs, factors]);

  useEffect(() => {
    if (interactionData.length > 0) {
      setSelectedInteraction(`${interactionData[0].factor1} * ${interactionData[0].factor2}`);
    }
  }, [interactionData]);



  const selectedInteractionPlotData = useMemo(() => {
    if (!selectedInteraction) return null;

    const [factor1Name, factor2Name] = selectedInteraction.split(' * ');
    const factor1 = factors.find(f => f.name === factor1Name);
    const factor2 = factors.find(f => f.name === factor2Name);

    if (!factor1 || !factor2) return null;

    const levels1 = factor1.levels.sort((a, b) => a - b);
    const low1 = levels1[0];
    const high1 = levels1[levels1.length - 1];

    const levels2 = factor2.levels.sort((a, b) => a - b);
    const low2 = levels2[0];
    const high2 = levels2[levels2.length - 1];

    const runs_ll = runs.filter(r => r.y !== null && r.factors[factor1.name] === low1 && r.factors[factor2.name] === low2);
    const runs_hl = runs.filter(r => r.y !== null && r.factors[factor1.name] === high1 && r.factors[factor2.name] === low2);
    const runs_lh = runs.filter(r => r.y !== null && r.factors[factor1.name] === low1 && r.factors[factor2.name] === high2);
    const runs_hh = runs.filter(r => r.y !== null && r.factors[factor1.name] === high1 && r.factors[factor2.name] === high2);

    if (runs_ll.length === 0 || runs_hl.length === 0 || runs_lh.length === 0 || runs_hh.length === 0) return null;

    const avg_ll = runs_ll.reduce((sum, r) => sum + r.y!, 0) / runs_ll.length;
    const avg_hl = runs_hl.reduce((sum, r) => sum + r.y!, 0) / runs_hl.length;
    const avg_lh = runs_lh.reduce((sum, r) => sum + r.y!, 0) / runs_lh.length;
    const avg_hh = runs_hh.reduce((sum, r) => sum + r.y!, 0) / runs_hh.length;

    return {
      factor1Name: factor1.name,
      factor2Name: factor2.name,
      low1, high1,
      low2, high2,
      data: [
        { x: low1, [`${factor2.name}=${low2}`]: avg_ll, [`${factor2.name}=${high2}`]: avg_lh },
        { x: high1, [`${factor2.name}=${low2}`]: avg_hl, [`${factor2.name}=${high2}`]: avg_hh },
      ]
    };
  }, [selectedInteraction, runs, factors]);


  if (interactionData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 transition-colors">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">4. Interaction Effects</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-400 dark:text-slate-500">Not enough data to calculate interaction effects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center transition-colors">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">4. Interaction Effects</h2>
      </div>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 transition-colors">
        <div className="lg:col-span-5">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Interaction Strength</h3>
          <div className='h-[300px] overflow-y-auto pr-2'>
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400 transition-colors">
              <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-900 sticky top-0 transition-colors">
                <tr>
                  <th className="px-4 py-2 border-b dark:border-slate-700">Interaction</th>
                  <th className="px-4 py-2 border-b dark:border-slate-700 text-right">Effect Size</th>
                </tr>
              </thead>
              <tbody>
                {interactionData.map((d, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedInteraction(`${d.factor1} * ${d.factor2}`)}
                    className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 cursor-pointer transition-colors ${selectedInteraction === `${d.factor1} * ${d.factor2}`
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                  >
                    <td className={`px-4 py-3 font-semibold ${selectedInteraction === `${d.factor1} * ${d.factor2}` ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {`${d.factor1} * ${d.factor2}`}
                    </td>
                    <td className={`px-4 py-3 font-mono text-right ${selectedInteraction === `${d.factor1} * ${d.factor2}` ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-100'}`}>
                      {d.interaction.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className='flex justify-between items-center mb-2'>
            <h3 className="font-bold text-slate-700 dark:text-slate-300">Interaction Plot</h3>
            <div className="flex items-center gap-3">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {selectedInteraction || 'Select an interaction'}
              </div>
              <select 
                onChange={(e) => setSelectedInteraction(e.target.value)} 
                value={selectedInteraction} 
                className="text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 dark:text-slate-100 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
              >
                {interactionData.map(d => (
                  <option key={`${d.factor1}-${d.factor2}`} value={`${d.factor1} * ${d.factor2}`}>{`${d.factor1} * ${d.factor2}`}</option>
                ))}
              </select>
            </div>
          </div>
          <div className='h-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors'>
            {selectedInteractionPlotData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedInteractionPlotData.data} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={['auto', 'auto']}
                    label={{ value: selectedInteractionPlotData.factor1Name, position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
                    ticks={[selectedInteractionPlotData.low1, selectedInteractionPlotData.high1]}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    domain={['dataMin', 'dataMax']} 
                    padding={{ top: 20, bottom: 20 }} 
                    label={{ value: 'Mean Response', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, dx: -10, fill: '#94a3b8' }} 
                    tick={{ fill: '#94a3b8' }} 
                    tickFormatter={formatAxisNumber}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(value: number) => [formatAxisNumber(value)]} 
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                  <Line type="monotone" dataKey={`${selectedInteractionPlotData.factor2Name}=${selectedInteractionPlotData.low2}`} stroke="#818cf8" strokeWidth={2} />
                  <Line type="monotone" dataKey={`${selectedInteractionPlotData.factor2Name}=${selectedInteractionPlotData.high2}`} stroke="#34d399" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-400 dark:text-slate-500 transition-colors">
                <p>Select an interaction to visualize.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionEffects;
