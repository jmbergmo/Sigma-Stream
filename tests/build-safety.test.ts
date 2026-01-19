import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Build Safety', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.unstubAllEnvs();
    });

    it('should be able to import supabase service without crashing when env vars are missing', async () => {
        // Mock missing env vars
        vi.stubEnv('VITE_SUPABASE_URL', '');
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

        // Dynamic import to catch load-time errors
        try {
            const module = await import('../src/services/supabase');
            expect(module.supabase).toBeNull();
        } catch (error) {
            expect.fail(`Importing supabase service crashed: ${error}`);
        }
    });

    it('should be able to import App component without crashing when env vars are missing', async () => {
        // Mock missing env vars
        vi.stubEnv('VITE_SUPABASE_URL', '');
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

        try {
            // We mainly care that this doesn't throw
            await import('../src/App');
        } catch (error) {
            expect.fail(`Importing App crashed: ${error}`);
        }
    });
});
