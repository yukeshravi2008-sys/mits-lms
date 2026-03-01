import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Trash2, Plus, Youtube } from 'lucide-react';

interface Video {
    id: string;
    unit_id: string;
    title: string;
    video_url: string;
    created_at: string;
    units?: { title: string; subjects?: { name: string; batches?: { name: string } } };
}

interface Unit {
    id: string;
    title: string;
    subjects?: { name: string; batches?: { name: string } };
}

export default function Videos() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [videosRes, unitsRes] = await Promise.all([
            supabase.from('videos').select('*, units(title, subjects(name, batches(name)))').order('created_at', { ascending: false }),
            supabase.from('units').select('id, title, subjects(name, batches(name))').order('created_at', { ascending: false })
        ]);

        if (videosRes.error) console.error('Error fetching vids:', videosRes.error);
        else setVideos(videosRes.data || []);

        if (unitsRes.error) console.error('Error fetching units:', unitsRes.error);
        else setUnits(unitsRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!title.trim() || !selectedUnitId || !videoUrl.trim()) return;
        setSaving(true);

        const { error } = await supabase
            .from('videos')
            .insert([{ title, unit_id: selectedUnitId, video_url: videoUrl }]);

        if (error) console.error('Error saving video:', error);

        setTitle('');
        setVideoUrl('');
        setSelectedUnitId('');
        setShowModal(false);
        setSaving(false);
        fetchData();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this video link?')) {
            const { error } = await supabase.from('videos').delete().eq('id', id);
            if (error) console.error('Error deleting:', error);
            else fetchData();
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Manage Videos</h1>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Video Link
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : videos.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No videos added yet.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {videos.map((vid) => (
                                <tr key={vid.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                        <Youtube className="h-5 w-5 mr-2 text-red-500" />
                                        <a href={vid.video_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600">
                                            {vid.title}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {vid.units?.title} ({vid.units?.subjects?.name})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(vid.id)} className="text-red-600 hover:text-red-900">
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
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title"> Add New Video </h3>
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
                                    <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 1 Explained" />
                                    <Input label="Video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="e.g. https://youtube.com/watch?v=..." />
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <Button onClick={handleSave} className="w-full sm:col-start-2" disabled={!title.trim() || !selectedUnitId || !videoUrl.trim() || saving} isLoading={saving}>
                                    Save
                                </Button>
                                <Button variant="outline" onClick={() => setShowModal(false)} className="mt-3 w-full sm:mt-0 sm:col-start-1" disabled={saving}>
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
