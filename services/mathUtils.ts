import { InputVariable, SimulationConfig, SimulationResult, HistogramBin, DoeFactor, DoeRun } from '../types';

// Box-Muller transform to generate normally distributed random numbers
export const generateNormalRandom = (mean: number, stdDev: number): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
};

// Safe formula evaluator
export const evaluateFormula = (formula: string, variables: Record<string, number>): number => {
  // Normalize variable names to lowercase to ensure they match the lowercased formula
  const keys = Object.keys(variables).map(k => k.toLowerCase());
  const values = Object.values(variables);
  
  // Replace standard math functions with Math.func
  let safeFormula = formula.toLowerCase();
  safeFormula = safeFormula.replace(/\^/g, '**');
  ['sin', 'cos', 'tan', 'sqrt', 'log', 'exp', 'pow', 'abs'].forEach(func => {
     safeFormula = safeFormula.replace(new RegExp(`\\b${func}\\b`, 'g'), `Math.${func}`);
  });

  try {
    const f = new Function(...keys, `return ${safeFormula};`);
    return f(...values);
  } catch (e) {
    throw new Error(`Invalid Transfer Function: ${(e as Error).message}`);
  }
};

export const runSimulation = (
  variables: InputVariable[],
  config: SimulationConfig
): SimulationResult => {
  const data: number[] = [];
  let defects = 0;

  for (let i = 0; i < config.iterations; i++) {
    const iterationInputs: Record<string, number> = {};
    
    variables.forEach(v => {
      iterationInputs[v.name] = generateNormalRandom(v.mean, v.stdDev);
    });

    const y = evaluateFormula(config.formula, iterationInputs);
    data.push(y);

    if (y < config.lsl || y > config.usl) {
      defects++;
    }
  }

  // Calculate Stats
  const n = data.length;
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);

  // Process Capability
  const cp = (config.usl - config.lsl) / (6 * stdDev);
  const cpu = (config.usl - mean) / (3 * stdDev);
  const cpl = (mean - config.lsl) / (3 * stdDev);
  const cpk = Math.min(cpu, cpl);
  
  const sigmaLevel = 3 * cpk; 
  const dpmo = (defects / config.iterations) * 1_000_000;

  return {
    data,
    mean,
    stdDev,
    min: Math.min(...data),
    max: Math.max(...data),
    cp,
    cpk,
    cpu,
    cpl,
    sigmaLevel,
    dpmo,
    defects,
    timestamp: Date.now()
  };
};

export const createHistogramData = (data: number[], bins: number = 20): HistogramBin[] => {
    if (data.length === 0) return [];
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const binSize = range / bins || 1; // Prevent divide by zero
    
    const histogram: HistogramBin[] = [];
    
    for (let i = 0; i < bins; i++) {
        histogram.push({
            binStart: min + (i * binSize),
            binEnd: min + ((i + 1) * binSize),
            count: 0
        });
    }
    
    data.forEach(val => {
        let binIndex = Math.floor((val - min) / binSize);
        if (binIndex >= bins) binIndex = bins - 1; 
        if (binIndex < 0) binIndex = 0;
        histogram[binIndex].count++;
    });
    
    return histogram;
};

// Helper to generate Cartesian product of arrays
const cartesian = (args: number[][]): number[][] => {
    const r: number[][] = [];
    const max = args.length - 1;
    function helper(arr: number[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
            const a = arr.slice(0); // clone arr
            a.push(args[i][j]);
            if (i === max)
                r.push(a);
            else
                helper(a, i + 1);
        }
    }
    helper([], 0);
    return r;
};

// Generates a Full Factorial Design for mixed levels
export const generateFullFactorialDesign = (factors: DoeFactor[]): DoeRun[] => {
  if (factors.length === 0) return [];

  // Extract levels for each factor
  const allLevels = factors.map(f => f.levels);
  
  // Generate all combinations
  const combinations = cartesian(allLevels);

  const runs: DoeRun[] = combinations.map((combo, index) => {
    const factorSettings: Record<string, number> = {};
    factors.forEach((factor, fIndex) => {
      factorSettings[factor.name] = combo[fIndex];
    });

    return {
      id: index + 1,
      factors: factorSettings,
      y: null
    };
  });

  return runs;
};

// Calculate Main Effects for Pareto Chart and Regression
export interface MainEffect {
  name: string;
  effect: number; // Absolute effect size
  slope: number;  // Directional change per unit
}

export const calculateEffects = (runs: DoeRun[], factors: DoeFactor[]): MainEffect[] => {
    const validRuns = runs.filter(r => r.y !== null);
    if (validRuns.length === 0) return [];

    const effects: MainEffect[] = [];

    factors.forEach(factor => {
        // Simple Main Effect: Avg(High) - Avg(Low)
        // Note: This logic assumes 2 levels mostly. For >2 levels, we take Max - Min averages or linear slope.
        // We will calculate slope based on (Avg_Max - Avg_Min) / (Max_Level - Min_Level)
        
        const levels = factor.levels.sort((a,b) => a - b);
        const minLvl = levels[0];
        const maxLvl = levels[levels.length - 1];

        const minRuns = validRuns.filter(r => r.factors[factor.name] === minLvl);
        const maxRuns = validRuns.filter(r => r.factors[factor.name] === maxLvl);

        if (minRuns.length > 0 && maxRuns.length > 0) {
            const avgMin = minRuns.reduce((sum, r) => sum + (r.y || 0), 0) / minRuns.length;
            const avgMax = maxRuns.reduce((sum, r) => sum + (r.y || 0), 0) / maxRuns.length;
            
            const diff = avgMax - avgMin;
            const slope = diff / (maxLvl - minLvl || 1);

            effects.push({
                name: factor.name,
                effect: Math.abs(diff),
                slope: slope
            });
        }
    });

    return effects.sort((a, b) => b.effect - a.effect);
};

export const generateRegressionFormula = (runs: DoeRun[], factors: DoeFactor[]): string => {
    const validRuns = runs.filter(r => r.y !== null);
    if (validRuns.length === 0) return '';
    
    // 1. Calculate Slopes (Coefficients)
    const effects = calculateEffects(validRuns, factors);
    
    // 2. Calculate Intercept
    // Y = b0 + b1*x1 + b2*x2 ...
    // b0 = Mean(Y) - (b1*Mean(x1) + b2*Mean(x2)...)
    
    const meanY = validRuns.reduce((s, r) => s + (r.y || 0), 0) / validRuns.length;
    
    let sumSlopeTimesMeanX = 0;
    const parts: string[] = [];

    factors.forEach(f => {
        const effect = effects.find(e => e.name === f.name);
        if (effect) {
             const meanX = validRuns.reduce((s, r) => s + r.factors[f.name], 0) / validRuns.length;
             sumSlopeTimesMeanX += effect.slope * meanX;
             parts.push(`(${effect.slope.toFixed(4)} * ${f.name})`);
        }
    });

    const intercept = meanY - sumSlopeTimesMeanX;
    
    return `${intercept.toFixed(4)} + ${parts.join(' + ')}`;
};