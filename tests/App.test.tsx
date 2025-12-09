/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';
import { SimulationResult } from '../types';

// Use vi.hoisted to create a mock function that will be available before vi.mock is hoisted.
const { mockRunSimulation } = vi.hoisted(() => {
    return {
        mockRunSimulation: vi.fn((): SimulationResult => ({
            data: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
            mean: 8,
            stdDev: 1,
            min: 5,
            max: 11,
            cp: 1.1,
            cpk: 1.0,
            cpu: 1.2,
            cpl: 0.9,
            sigmaLevel: 3,
            dpmo: 66807,
            defects: 33403,
            timestamp: Date.now()
        }))
    };
});

// Mock the entire mathUtils module
vi.mock('../services/mathUtils', () => ({
  generateFullFactorialDesign: () => [{ id: 1, factors: {}, y: null }], // Return 1 dummy item
  calculateEffects: () => [],
  generateRegressionFormula: () => 'y = 1', // Return a dummy formula to trigger the optimizer
  calculateInteractionEffects: () => [],
  runSimulation: mockRunSimulation, // Use the hoisted mock function
  createHistogramData: () => [],
}));

describe('App Button Test', () => {
  test('clicking demo button switches view and runs simulation', async () => {
    render(<App />);

    // 1. Find the button
    const demoButton = screen.getByRole('button', { name: /demo/i });

    // 2. Click the button
    fireEvent.click(demoButton);

    // 3. Verify the "Output" view is now visible
    // (This confirms the click handler fired and updated state)
    // Use findByText which waits for the element to appear
    expect(await screen.findByText(/AI Black Belt Insights/i)).toBeInTheDocument();

    // 4. Verify that the simulation was called
    expect(mockRunSimulation).toHaveBeenCalled();
  });
});
