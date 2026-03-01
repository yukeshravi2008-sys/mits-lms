import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Batch { id: string; name: string; }
interface Subject { id: string; name: string; batch_id: string; batches?: Batch }
interface Unit {
    id: string;
    subject_id: string;
    title: string;
    created_at: string;
    subjects?: Subject;
}

export default function Units() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    // Form State
    const [unitTitle, setUnitTitle] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [unitsRes, subjectsRes] = await Promise.all([
            supabase.from('units').select('*, subjects(id, name, batches(id, name))').order('created_at', { ascending: false }),
            supabase.from('subjects').select('*, batches(id, name)').order('created_at', { ascending: false })
        ]);

        if (unitsRes.error) console.error('Error fetching units:', unitsRes.error);
        else setUnits(unitsRes.data || []);

        if (subjectsRes.error) console.error('Error fetching subjects:', subjectsRes.error);
        else setSubjects(subjectsRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!unitTitle.trim() || !selectedSubjectId) return;

        if (editingUnit) {
            const { error } = await supabase
                .from('units')
                .update({ title: unitTitle, subject_id: selectedSubjectId })
                .eq('id', editingUnit.id);
            if (error) console.error('Error updating:', error);
        } else {
            const { error } = await supabase
                .from('units')
                .insert([{ title: unitTitle, subject_id: selectedSubjectId }]);
            if (error) console.error('Error inserting:', error);
        }

        setUnitTitle('');
        setSelectedSubjectId('');
        setEditingUnit(null);
        setShowModal(false);
        fetchData();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this unit? This will delete all attached materials and videos.')) {
            const { error } = await supabase.from('units').delete().eq('id', id);
            if (error) console.error('Error deleting:', error);
            else fetchData();
        }
    };

    const openModal = (unit: Unit | null = null) => {
        if (unit) {
            setEditingUnit(unit);
            setUnitTitle(unit.title);
            setSelectedSubjectId(unit.subject_id);
        } else {
            setEditingUnit(null);
            setUnitTitle('');
            setSelectedSubjectId(subjects.length > 0 ? subjects[0].id : '');
        }
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Manage Units</h1>
                <Button onClick={() => openModal()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Unit
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : units.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No units found. Add a subject first if you haven't, then create a unit!</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {units.map((unit) => (
                                <tr key={unit.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.subjects?.name || 'Unknown Subject'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.subjects?.batches?.name || 'Unknown Batch'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModal(unit)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(unit.id)} className="text-red-600 hover:text-red-900">
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
                                    {editingUnit ? 'Edit Unit' : 'Add New Unit'}
                                </h3>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <select
                                            value={selectedSubjectId}
                                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#0F2027] focus:border-[#0F2027] sm:text-sm rounded-md border"
                                        >
                                            <option value="" disabled>Select a subject</option>
                                            {subjects.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.batches?.name})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input
                                        label="Unit Title"
                                        value={unitTitle}
                                        onChange={(e) => setUnitTitle(e.target.value)}
                                        placeholder="e.g. Unit 1: Introduction to Tourism"
                                    />
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <Button onClick={handleSave} className="w-full sm:col-start-2" disabled={!unitTitle.trim() || !selectedSubjectId}>
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
