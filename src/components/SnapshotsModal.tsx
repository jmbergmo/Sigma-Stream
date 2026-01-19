import React, { useEffect, useState } from 'react';
import { Snapshot, getSnapshots, deleteSnapshot } from '../services/snapshots';
import { DoeFactor } from '../types';

interface SnapshotsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (factors: DoeFactor[]) => void;
}

const SnapshotsModal: React.FC<SnapshotsModalProps> = ({ isOpen, onClose, onLoad }) => {
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(true);

    const loadSnapshots = async () => {
        setLoading(true);
        try {
            const data = await getSnapshots();
            // Sort by date desc
            setSnapshots(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        } catch (error) {
            console.error("Failed to load snapshots", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadSnapshots();
        }
    }, [isOpen]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this snapshot?")) {
            await deleteSnapshot(id);
            loadSnapshots();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800">Saved Snapshots</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Loading...</div>
                    ) : snapshots.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">No saved snapshots found.</div>
                    ) : (
                        snapshots.map(snap => (
                            <div
                                key={snap.id}
                                onClick={() => { onLoad(snap.factors); onClose(); }}
                                className="group p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all flex justify-between items-center"
                            >
                                <div>
                                    <h4 className="font-bold text-slate-700 group-hover:text-blue-700">{snap.name}</h4>
                                    <p className="text-xs text-slate-400 mt-1">{snap.createdAt.toLocaleDateString()} {snap.createdAt.toLocaleTimeString()}</p>
                                    <p className="text-xs text-slate-500 mt-1">{snap.factors.length} Factors</p>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(snap.id, e)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SnapshotsModal;
