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
    units?: {
        title: string;
        subjects?: {
            name: string;
            batches?: { name: string }[];
        }[];
    };
}

interface Unit {
    id: string;
    title: string;
    subjects?: {
        name: string;
        batches?: { name: string }[];
    }[];
}

export default function Videos() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');

    const fetchData = async () => {
        setLoading(true);

        const [videosRes, unitsRes] = await Promise.all([
            supabase
                .from('videos')
                .select('*, units(title, subjects(name, batches(name)))')
                .order('created_at', { ascending: false }),

            supabase
                .from('units')
                .select('id, title, subjects(name, batches(name))')
                .order('created_at', { ascending: false })
        ]);

        if (!videosRes.error) setVideos(videosRes.data || []);
        if (!unitsRes.error) setUnits(unitsRes.data || []);

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
            if (!error) fetchData();
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Unit
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {videos.map((vid) => (
                                <tr key={vid.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                        <Youtube className="h-5 w-5 mr-2 text-red-500" />
                                        <a
                                            href={vid.video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline text-indigo-600"
                                        >
                                            {vid.title}
                                        </a>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {vid.units?.title} (
                                        {vid.units?.subjects?.[0]?.name})
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(vid.id)}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4">
                        <h3 className="text-lg font-medium">Add New Video</h3>

                        <select
                            value={selectedUnitId}
                            onChange={(e) => setSelectedUnitId(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="" disabled>Select a unit</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.title} ({u.subjects?.[0]?.name})
                                </option>
                            ))}
                        </select>

                        <Input
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <Input
                            label="Video URL"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                        />

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSave}
                                disabled={!title.trim() || !selectedUnitId || !videoUrl.trim() || saving}
                                isLoading={saving}
                            >
                                Save
                            </Button>

                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}