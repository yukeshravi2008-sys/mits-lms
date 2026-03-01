import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Batch {
    id: string;
    name: string;
    created_at: string;
}

export default function Batches() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [batchName, setBatchName] = useState('');

    const fetchBatches = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('batches')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching batches:', error);
        else setBatches(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleSave = async () => {
        if (!batchName.trim()) return;

        if (editingBatch) {
            // Update
            const { error } = await supabase
                .from('batches')
                .update({ name: batchName })
                .eq('id', editingBatch.id);
            if (error) console.error('Error updating:', error);
        } else {
            // Insert
            const { error } = await supabase
                .from('batches')
                .insert([{ name: batchName }]);
            if (error) console.error('Error inserting:', error);
        }

        setBatchName('');
        setEditingBatch(null);
        setShowModal(false);
        fetchBatches();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this batch? This will cascade delete related subjects and units.')) {
            const { error } = await supabase.from('batches').delete().eq('id', id);
            if (error) console.error('Error deleting:', error);
            else fetchBatches();
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Manage Batches</h1>
                <Button onClick={() => { setEditingBatch(null); setBatchName(''); setShowModal(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Batch
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : batches.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No batches found. Create one!</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {batches.map((batch) => (
                                <tr key={batch.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {batch.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(batch.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => { setEditingBatch(batch); setBatchName(batch.name); setShowModal(true); }}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(batch.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    {editingBatch ? 'Edit Batch' : 'Add New Batch'}
                                </h3>
                                <div className="mt-4">
                                    <Input
                                        label="Batch Name"
                                        value={batchName}
                                        onChange={(e) => setBatchName(e.target.value)}
                                        placeholder="e.g. 2026 Batch"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <Button onClick={handleSave} className="w-full sm:col-start-2">
                                    Save
                                </Button>
                                <Button variant="outline" onClick={() => setShowModal(false)} className="mt-3 w-full sm:mt-0 sm:col-start-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
