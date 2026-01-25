/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App, { serializeState, deserializeState } from '../src/App';
import * as router from 'react-router-dom';

// Polyfill btoa/atob
if (typeof global.btoa === 'undefined') {
    global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof global.atob === 'undefined') {
    global.atob = (b64Encoded) => Buffer.from(b64Encoded, 'base64').toString('binary');
}

vi.mock('recharts', () => {
    return {
        ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
        BarChart: () => null,
        Bar: () => null,
        LineChart: () => null,
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

describe('State Serialization Logic', () => {
    test('serializeState encodes object to base64 JSON', () => {
        const data = { x: 1, y: 'test' };
        const encoded = serializeState(data);
        expect(encoded).toBe(btoa(JSON.stringify(data)));
    });

    test('deserializeState decodes base64 JSON to object', () => {
        const data = { a: [1, 2], b: { c: 3 } };
        const encoded = btoa(JSON.stringify(data));
        const decoded = deserializeState(encoded);
        expect(decoded).toEqual(data);
    });

    test('deserializeState returns null for null/empty', () => {
        expect(deserializeState(null)).toBeNull();
        expect(deserializeState('')).toBeNull();
    });
});

describe('URL State Synchronization Integration', () => {

    // Helper to get Outlet Context via a child route
    const ContextConsumer = () => {
        const { useOutletContext } = require('react-router-dom');
        const ctx = useOutletContext();
        return (
            <div data-testid="context-value">
                {ctx.ySpecs?.target}
            </div>
        );
    };

    test('loads state from URL query param on mount', async () => {
        const customYSpecs = { target: '99', lsl: '90', usl: '110' };
        const initialState = {
            doeFactors: [],
            doeRuns: [],
            ySpecs: customYSpecs,
            optimizerInputs: {}
        };
        const encodedState = serializeState(initialState);
        const initialUrl = `/?state=${encodedState}`;

        render(
            <router.MemoryRouter initialEntries={[initialUrl]}>
                <router.Routes>
                    <router.Route path="/" element={<App />}>
                        <router.Route index element={<ContextConsumer />} />
                    </router.Route>
                </router.Routes>
            </router.MemoryRouter>
        );

        // Verify context has loaded the Y Specs
        await waitFor(() => {
            expect(screen.getByTestId('context-value')).toHaveTextContent('99');
        });
    });

    // Mock useSearchParams for the write test
    test('updates URL when state changes', async () => {

        // Helper component to trigger update
        const Updater = () => {
            const { useOutletContext } = require('react-router-dom');
            const ctx = useOutletContext();
            return (
                <div>
                    <button onClick={() => ctx.setYSpecs({ target: '888', lsl: '1', usl: '2' })}>UPDATER</button>
                    <ContextConsumer />
                </div>
            );
        };

        // We spy on the URL by rendering the App and checking internal router state?
        // No, simpler: check if URL contains expected value using a location spy.

        const LocationSpy = () => {
            const { useLocation } = require('react-router-dom');
            const location = useLocation();
            return <div data-testid="location-search">{location.search}</div>;
        };

        // Start with no state
        render(
            <router.MemoryRouter initialEntries={['/']}>
                <router.Routes>
                    <router.Route path="/" element={<App />}>
                        <router.Route index element={
                            <>
                                <Updater />
                                <LocationSpy />
                            </>
                        } />
                    </router.Route>
                </router.Routes>
            </router.MemoryRouter>
        );

        // Wait for initial sync (defaults)
        await waitFor(() => {
            expect(screen.getByTestId('location-search')).toHaveTextContent('state=');
        });

        // Trigger update
        const btn = await screen.findByText('UPDATER');
        fireEvent.click(btn);

        // Verify update
        await waitFor(() => {
            const search = screen.getByTestId('location-search').textContent;
            expect(search).toContain('state=');
            const params = new URLSearchParams(search || '');
            const state = JSON.parse(atob(params.get('state') || ''));
            expect(state.ySpecs?.target).toBe('888');
        });
    });
});
