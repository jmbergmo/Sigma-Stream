import { describe, it, expect, vi } from 'vitest';
import { evaluateFormula, generateNormalRandom, runSimulation } from '../src/services/mathUtils';
import type { SimulationConfig, InputVariable } from '../src/types';

describe('mathUtils', () => {
  describe('evaluateFormula', () => {
    it('should evaluate a simple formula', () => {
      const formula = 'x + y';
      const inputs = { x: 1, y: 2 };
      expect(evaluateFormula(formula, inputs)).toBe(3);
    });

    it('should handle more complex formulas', () => {
      const formula = '(x * y) / z';
      const inputs = { x: 2, y: 3, z: 4 };
      expect(evaluateFormula(formula, inputs)).toBe(1.5);
    });

    it('should handle formulas with exponents', () => {
      const formula = 'x^2';
      const inputs = { x: 3 };
      expect(evaluateFormula(formula, inputs)).toBe(9);
    });

    it('should throw an error if a variable is missing', () => {
      const formula = 'x + y';
      const inputs = { x: 1 };
      expect(() => evaluateFormula(formula, inputs)).toThrow();
    });
  });

  describe('generateNormalRandom', () => {
    it('should generate a number', () => {
      const mean = 10;
      const stdDev = 2;
      const result = generateNormalRandom(mean, stdDev);
      expect(typeof result).toBe('number');
    });

    it('should generate different numbers on subsequent calls', () => {
      const mean = 10;
      const stdDev = 2;
      const result1 = generateNormalRandom(mean, stdDev);
      const result2 = generateNormalRandom(mean, stdDev);
      expect(result1).not.toBe(result2);
    });
  });

  describe('runSimulation', () => {
    it('should run a simulation and return results', () => {
      const config: SimulationConfig = {
        formula: 'x + y',
        iterations: 1000,
        lsl: 0,
        usl: 20,
      };
      const variables: InputVariable[] = [
        { id: '1', name: 'x', mean: 5, stdDev: 1, type: 'normal' },
        { id: '2', name: 'y', mean: 5, stdDev: 1, type: 'normal' },
      ];

      const results = runSimulation(variables, config);

      expect(results.data.length).toBe(1000);
      expect(results.defects).toBeGreaterThanOrEqual(0);
      expect(results.dpmo).toBeGreaterThanOrEqual(0);
      expect(results.mean).toBeCloseTo(10, 0);
      expect(results.stdDev).toBeCloseTo(Math.sqrt(2), 0);
      expect(results.cp).toBeGreaterThan(0);
      expect(results.cpk).toBeGreaterThan(0);
      expect(results.cpu).toBeGreaterThan(0);
      expect(results.cpl).toBeGreaterThan(0);
      expect(results.sigmaLevel).toBeGreaterThan(0);
    });

    it('should handle a simulation with defects', () => {
      const config: SimulationConfig = {
        formula: 'x',
        iterations: 100,
        lsl: 5,
        usl: 15,
      };
      const variables: InputVariable[] = [
        { id: '1', name: 'x', mean: 10, stdDev: 5, type: 'normal' }, // High std dev to generate defects
      ];

      const results = runSimulation(variables, config);

      expect(results.data.length).toBe(100);
      expect(results.defects).toBeGreaterThan(0);
      expect(results.dpmo).toBeGreaterThan(0);
    });
  });
});
