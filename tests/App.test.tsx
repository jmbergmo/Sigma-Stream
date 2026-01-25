/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';
import * as ReactRouterDom from 'react-router-dom';
const { MemoryRouter, Routes, Route } = ReactRouterDom;
import { OutputWrapper } from '../src/routes/Wrappers';

// Mock useSearchParams to avoid invalidating MemoryRouter state during test
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock ResizeObserver
// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};

// Polyfill btoa/atob
if (typeof global.btoa === 'undefined') {
  global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof global.atob === 'undefined') {
  global.atob = (b64Encoded) => Buffer.from(b64Encoded, 'base64').toString('binary');
}

// Mock Recharts to avoid rendering issues in JSDOM
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
    BarChart: () => <div data-testid="bar-chart">Bar Chart</div>,
    Bar: () => null,
    LineChart: () => <div data-testid="line-chart">Line Chart</div>,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
    Cell: () => null,
    Legend: () => null,
    ReferenceLine: () => null,
  };
});

// Mock the supabase service (keep this mock as it is an external dependency)
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

describe('App Integration Test', () => {
  test('clicking demo button runs simulation and displays real output results', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="results" element={<OutputWrapper />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // 1. Find and click the demo button
    const demoButtons = await screen.findAllByRole('button', { name: /demo/i });
    const demoButton = demoButtons[0];
    fireEvent.click(demoButton);

    // 2. Verify navigation to the results page by checking for the "Experimental Results" header
    // This confirms OutputTab rendered
    expect(await screen.findByText(/1. Experimental Results/i)).toBeInTheDocument();

    // 3. Verify that the pareto chart section is present
    expect(screen.getByText(/2. Pareto of Effects/i)).toBeInTheDocument();

    // 4. Verify that data was actually generated and calculated (integration test of mathUtils)
    // The "Predictions & Optimization" section appears only when regression is possible (has data)
    expect(await screen.findByText(/3. Prediction & Optimization/i)).toBeInTheDocument();

    // Check for specific calculated values to ensure the math logic ran
    // Since using random numbers in demo, exact values might vary, but we can check elements exist
    expect(await screen.findByText(/Predicted Mean Y/i)).toBeInTheDocument();
  });
});
