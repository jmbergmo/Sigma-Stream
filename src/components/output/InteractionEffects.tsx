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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">4. Interaction Effects</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-400">Not enough data to calculate interaction effects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">4. Interaction Effects</h2>
      </div>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <h3 className="font-bold text-slate-700 mb-2">Interaction Strength</h3>
          <div className='h-[300px] overflow-y-auto pr-2'>
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 border-b">Interaction</th>
                  <th className="px-4 py-2 border-b text-right">Effect Size</th>
                </tr>
              </thead>
              <tbody>
                {interactionData.map((d, i) => (
                  // Table Row Changes
                  <tr
                    key={i}
                    onClick={() => setSelectedInteraction(`${d.factor1} * ${d.factor2}`)}
                    className={`border-b cursor-pointer transition-colors ${selectedInteraction === `${d.factor1} * ${d.factor2}`
                      ? 'bg-indigo-50 border-indigo-100'
                      : 'bg-white hover:bg-slate-50'
                      }`}
                  >
                    <td className={`px-4 py-3 font-semibold ${selectedInteraction === `${d.factor1} * ${d.factor2}` ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {`${d.factor1} * ${d.factor2}`}
                    </td>
                    <td className={`px-4 py-3 font-mono text-right ${selectedInteraction === `${d.factor1} * ${d.factor2}` ? 'text-indigo-700' : 'text-slate-600'}`}>
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
            <h3 className="font-bold text-slate-700">Interaction Plot</h3>
            <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {selectedInteraction || 'Select an interaction'}
            </div>
          </div>
          <div className='h-[300px] bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center'>
            {selectedInteractionPlotData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedInteractionPlotData.data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={['auto', 'auto']}
                    label={{ value: selectedInteractionPlotData.factor1Name, position: 'insideBottom', offset: -10 }}
                    ticks={[selectedInteractionPlotData.low1, selectedInteractionPlotData.high1]}
                  />
                  <YAxis
                    domain={['dataMin', 'dataMax']}
                    padding={{ top: 20, bottom: 20 }}
                    label={{ value: 'Mean Response', angle: -90, position: 'insideLeft' }}
                    tickFormatter={formatAxisNumber}
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" />
                  <Line type="monotone" dataKey={`${selectedInteractionPlotData.factor2Name}=${selectedInteractionPlotData.low2}`} stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey={`${selectedInteractionPlotData.factor2Name}=${selectedInteractionPlotData.high2}`} stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-400">
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
