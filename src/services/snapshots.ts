import { supabase } from './supabase';
import { DoeFactor } from '../types';

export interface Snapshot {
    id: string;
    name: string;
    factors: DoeFactor[];
    createdAt: Date;
    userId: string;
}

export const saveSnapshot = async (name: string, factors: DoeFactor[]) => {
    if (!supabase) throw new Error("Database not connected");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in");

    const { error } = await supabase.from('snapshots').insert({
        name,
        factors,
        created_at: new Date().toISOString(),
        user_id: user.id
    });

    if (error) throw error;
};

export const getSnapshots = async (): Promise<Snapshot[]> => {
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('snapshots')
        .select('*')
        .eq('user_id', user.id);

    if (error) throw error;

    return data.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        factors: doc.factors,
        createdAt: new Date(doc.created_at),
        userId: doc.user_id
    })) as Snapshot[];
};

export const deleteSnapshot = async (id: string) => {
    if (!supabase) throw new Error("Database not connected");
    const { error } = await supabase.from('snapshots').delete().eq('id', id);
    if (error) throw error;
};
