import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Batch {
    id: string;
    name: string;
}

interface Subject {
    id: string;
    batch_id: string;
    name: string;
    created_at: string;
    batches?: Batch;
}

export default function Subjects() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    // Form State
    const [subjectName, setSubjectName] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [subjectsRes, batchesRes] = await Promise.all([
            supabase.from('subjects').select('*, batches(id, name)').order('created_at', { ascending: false }),
            supabase.from('batches').select('*').order('created_at', { ascending: false })
        ]);

        if (subjectsRes.error) console.error('Error fetching subjects:', subjectsRes.error);
        else setSubjects(subjectsRes.data || []);

        if (batchesRes.error) console.error('Error fetching batches:', batchesRes.error);
        else setBatches(batchesRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!subjectName.trim() || !selectedBatchId) return;

        if (editingSubject) {
            const { error } = await supabase
                .from('subjects')
                .update({ name: subjectName, batch_id: selectedBatchId })
                .eq('id', editingSubject.id);
            if (error) console.error('Error updating:', error);
        } else {
            const { error } = await supabase
                .from('subjects')
                .insert([{ name: subjectName, batch_id: selectedBatchId }]);
            if (error) console.error('Error inserting:', error);
        }

        setSubjectName('');
        setSelectedBatchId('');
        setEditingSubject(null);
        setShowModal(false);
        fetchData();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this subject? This cascadingly deletes related units and materials.')) {
            const { error } = await supabase.from('subjects').delete().eq('id', id);
            if (error) console.error('Error deleting:', error);
            else fetchData();
        }
    };

    const openModal = (subject: Subject | null = null) => {
        if (subject) {
            setEditingSubject(subject);
            setSubjectName(subject.name);
            setSelectedBatchId(subject.batch_id);
        } else {
            setEditingSubject(null);
            setSubjectName('');
            setSelectedBatchId(batches.length > 0 ? batches[0].id : '');
        }
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Manage Subjects</h1>
                <Button onClick={() => openModal()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Subject
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : subjects.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No subjects found. Add a batch first if you haven't, then create a subject!</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subjects.map((subject) => (
                                <tr key={subject.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.batches?.name || 'Unknown Batch'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(subject.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModal(subject)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-900">
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
                                    {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                                </h3>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                                        <select
                                            value={selectedBatchId}
                                            onChange={(e) => setSelectedBatchId(e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#0F2027] focus:border-[#0F2027] sm:text-sm rounded-md border"
                                        >
                                            <option value="" disabled>Select a batch</option>
                                            {batches.map((b) => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input
                                        label="Subject Name"
                                        value={subjectName}
                                        onChange={(e) => setSubjectName(e.target.value)}
                                        placeholder="e.g. Tourism Geography"
                                    />
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <Button onClick={handleSave} className="w-full sm:col-start-2" disabled={!subjectName.trim() || !selectedBatchId}>
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
