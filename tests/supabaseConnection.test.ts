import { describe, it, expect } from 'vitest';
import { supabase } from '../src/services/supabase';

describe('Supabase Client Connection', () => {
    it('should be initialized', () => {
        expect(supabase).toBeDefined();
    });

    it('should be able to communicate with Supabase Auth', async () => {
        // Attempt to get the current session. reliable way to ping the auth service
        // regardless of login state.
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error("Supabase Auth Error:", error);
        }

        expect(error).toBeNull();
        // Verification of connection is successful if we get a response (even if session is null)
        expect(data).toHaveProperty('session');
    });
});
