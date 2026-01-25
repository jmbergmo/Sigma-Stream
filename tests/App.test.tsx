/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';
import { SimulationResult } from '../src/types';

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




// Mock the supabase service
vi.mock('../src/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

// Mock the entire mathUtils module
vi.mock('../src/services/mathUtils', () => ({
  generateFullFactorialDesign: () => [{ id: 1, factors: {}, y: null }], // Return 1 dummy item
  calculateEffects: () => [],
  generateRegressionFormula: () => 'y = 1', // Return a dummy formula to trigger the optimizer
  calculateInteractionEffects: () => [],
  runSimulation: mockRunSimulation, // Use the hoisted mock function
  createHistogramData: () => [],
}));

import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('App Button Test', () => {
  test('clicking demo button switches view and runs simulation', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="results" element={<div>AI Black Belt Insights Mock</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // 1. Find the button (returns array due to responsive duplicates)
    const demoButtons = await screen.findAllByRole('button', { name: /demo/i });
    const demoButton = demoButtons[0];

    // 2. Click the button
    fireEvent.click(demoButton);

    // 3. Verify the "Output" view is now visible
    // (This confirms the click handler fired and updated state)
    // Use findByText which waits for the element to appear
    expect(await screen.findByText(/AI Black Belt Insights Mock/i)).toBeInTheDocument();

    // 4. Verify that the simulation was called
    expect(mockRunSimulation).toHaveBeenCalled();
  });
});
