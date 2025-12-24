export interface InputVariable {
  id: string;
  name: string;
  mean: number;
  stdDev: number;
  type: 'normal'; // Future proofing for uniform/triangular
}

export interface SimulationConfig {
  lsl: number; // Lower Spec Limit
  usl: number; // Upper Spec Limit
  formula: string; // The Transfer Function Y = f(X)
  iterations: number;
}

export interface SimulationResult {
  data: number[]; // Raw Y values
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  cp: number;
  cpk: number;
  cpu: number;
  cpl: number;
  sigmaLevel: number;
  dpmo: number;
  defects: number;
  timestamp: number;
}

export interface HistogramBin {
  binStart: number;
  binEnd: number;
  count: number;
}

export type ActiveTab = 'input' | 'output' | 'applied' | 'history' | 'articles';

// New types for DOE
export interface DoeFactor {
  id: string;
  name: string;
  levels: number[]; // Array of levels, e.g. [10, 20] or [1, 2, 3, 4]
}

export interface DoeRun {
  id: number;
  factors: Record<string, number>; // e.g. { "Pressure": 100, "Temp": 50 }
  y: number | null; // The result input by user
}

export interface YSpecs {
  target: string;
  lsl: string;
  usl: string;
}

export interface OptimizerInput {
  target: number;
  lowerLimit: number;
  upperLimit: number;
}

export type OptimizationSpecs = Record<string, OptimizerInput>;
