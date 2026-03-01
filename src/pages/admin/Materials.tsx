import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Trash2, Plus, FileText, Upload } from 'lucide-react';

interface Material {
    id: string;
    unit_id: string;
    title: string;
    pdf_url: string;
    type: 'material' | 'mocktest';
    created_at: string;
    units?: {
        title: string;
        subjects?: {
            name: string;
            batches?: { name: string };
        };
    };
}

interface Unit {
    id: string;
    title: string;
    subjects?: { name: string; batches?: { name: string } };
}

export default function Materials() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [type, setType] = useState<'material' | 'mocktest'>('material');
    const [file, setFile] = useState<File | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const [materialsRes, unitsRes] = await Promise.all([
            supabase.from('materials').select('*, units(title, subjects(name, batches(name)))').order('created_at', { ascending: false }),
            supabase.from('units').select('id, title, subjects(name, batches(name))').order('created_at', { ascending: false })
        ]);

        if (materialsRes.error) console.error('Error fetching materials:', materialsRes.error);
        else setMaterials(materialsRes.data || []);

        if (unitsRes.error) console.error('Error fetching units:', unitsRes.error);
        else setUnits(unitsRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !selectedUnitId || !file) return;
        setUploading(true);

        try {
            // Find unit info to construct path
            const unit = units.find(u => u.id === selectedUnitId);
            const batchName = unit?.subjects?.batches?.name || 'unknown-batch';
            const subjectName = unit?.subjects?.name || 'unknown-subject';
            const unitName = unit?.title || 'unknown-unit';

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const folderPath = `${type}s`;

            // Sanitizing names for storage path
            const sanitize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const filePath = `${sanitize(batchName)}/${sanitize(subjectName)}/${sanitize(unitName)}/${folderPath}/${fileName}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('mits-materials')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('mits-materials')
                .getPublicUrl(filePath);

            // Insert record
            const { error: insertError } = await supabase
                .from('materials')
                .insert([{
                    title,
                    unit_id: selectedUnitId,
                    type,
                    pdf_url: publicUrl
                }]);

            if (insertError) throw insertError;

            setTitle('');
            setSelectedUnitId('');
            setFile(null);
            setType('material');
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving material:', error);
            alert('Failed to upload material. Ensure bucket "mits-materials" exists and policies allow uploads.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            // In a real app, you might want to extract the path from URL and delete from storage too.
            // For simplicity here, we're just deleting the database record.
            const { error } = await supabase.from('materials').delete().eq('id', id);
            if (error) console.error('Error deleting:', error);
            else fetchData();
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Materials & Tests</h1>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Upload Material
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : materials.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No materials uploaded yet.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {materials.map((mat) => (
                                <tr key={mat.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                                        <a href={mat.pdf_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600">
                                            {mat.title}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${mat.type === 'mocktest' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                            {mat.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-wrap max-w-xs truncate">
                                        {mat.units?.title} ({mat.units?.subjects?.name})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(mat.id)} className="text-red-600 hover:text-red-900">
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
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title"> Upload New Material </h3>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Unit</label>
                                        <select
                                            value={selectedUnitId}
                                            onChange={(e) => setSelectedUnitId(e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#0F2027] focus:border-[#0F2027] sm:text-sm rounded-md border"
                                        >
                                            <option value="" disabled>Select a unit</option>
                                            {units.map((u) => (
                                                <option key={u.id} value={u.id}>{u.title} ({u.subjects?.batches?.name} - {u.subjects?.name})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value as 'material' | 'mocktest')}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#0F2027] focus:border-[#0F2027] sm:text-sm rounded-md border"
                                        >
                                            <option value="material">PDF Material</option>
                                            <option value="mocktest">Mock Test (PDF)</option>
                                        </select>
                                    </div>
                                    <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 1 Notes" />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF)</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                        <span>{file ? file.name : 'Upload a file'}</span>
                                                        <input id="file-upload" name="file-upload" type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF up to 10MB</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <Button onClick={handleSave} className="w-full sm:col-start-2" disabled={!title.trim() || !selectedUnitId || !file || uploading} isLoading={uploading}>
                                    {uploading ? 'Uploading...' : 'Save'}
                                </Button>
                                <Button variant="outline" onClick={() => setShowModal(false)} className="mt-3 w-full sm:mt-0 sm:col-start-1" disabled={uploading}>
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
