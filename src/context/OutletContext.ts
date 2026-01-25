import { DoeFactor, DoeRun, YSpecs, OptimizationSpecs } from '../types';

export interface AppContextType {
    doeFactors: DoeFactor[];
    doeRuns: DoeRun[];
    setDoeRuns: (runs: DoeRun[]) => void;
    ySpecs: YSpecs;
    setYSpecs: (specs: YSpecs) => void;
    optimizerInputs: OptimizationSpecs;
    setOptimizerInputs: (inputs: OptimizationSpecs) => void;
    demoActive: boolean;
    setDemoActive: (active: boolean) => void;
    handleGenerateDesign: (factors: DoeFactor[]) => void;
}
