import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { DoeFactor } from '../types';

export interface Snapshot {
    id: string;
    name: string;
    factors: DoeFactor[];
    createdAt: Date;
    userId: string;
}

export const saveSnapshot = async (name: string, factors: DoeFactor[]) => {
    if (!auth.currentUser) throw new Error("User must be logged in");

    await addDoc(collection(db, 'snapshots'), {
        name,
        factors,
        createdAt: Timestamp.now(),
        userId: auth.currentUser.uid
    });
};

export const getSnapshots = async (): Promise<Snapshot[]> => {
    if (!auth.currentUser) return [];

    const q = query(collection(db, 'snapshots'), where("userId", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
    })) as Snapshot[];
};

export const deleteSnapshot = async (id: string) => {
    await deleteDoc(doc(db, 'snapshots', id));
};
