import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FileText, Youtube, ArrowLeft, Download, PlayCircle } from 'lucide-react';

interface Material {
    id: string;
    title: string;
    type: string;
    pdf_url: string;
}

interface Video {
    id: string;
    title: string;
    video_url: string;
}

export default function UnitDetail() {
    const { unitId } = useParams();
    const navigate = useNavigate();

    const [materials, setMaterials] = useState<Material[]>([]);
    const [mockTests, setMockTests] = useState<Material[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [unitTitle, setUnitTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            if (!unitId) return;
            setLoading(true);

            const { data: unitData } = await supabase
                .from('units')
                .select('title')
                .eq('id', unitId)
                .single();
            if (unitData) setUnitTitle(unitData.title);

            const [matsRes, vidsRes] = await Promise.all([
                supabase.from('materials').select('*').eq('unit_id', unitId).order('created_at', { ascending: false }),
                supabase.from('videos').select('*').eq('unit_id', unitId).order('created_at', { ascending: false })
            ]);

            if (matsRes.data) {
                setMaterials(matsRes.data.filter(m => m.type === 'material'));
                setMockTests(matsRes.data.filter(m => m.type === 'mocktest'));
            }

            if (vidsRes.data) {
                setVideos(vidsRes.data);
            }

            setLoading(false);
        }

        fetchContent();
    }, [unitId]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading content...</div>;
    }

    const openLink = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="bg-gray-50 min-h-full pb-6">
            <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex items-center shadow-sm">
                <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="h-6 w-6 text-gray-700" />
                </button>
                <h2 className="text-xl font-bold text-[#0F2027] truncate pr-4">{unitTitle}</h2>
            </div>

            <div className="p-4 space-y-8 animate-in fade-in duration-300">

                {/* Videos Section */}
                <section>
                    <div className="flex items-center mb-3">
                        <Youtube className="h-5 w-5 text-red-500 mr-2" />
                        <h3 className="text-lg font-bold tracking-tight text-gray-900">Video Lectures</h3>
                    </div>
                    {videos.length === 0 ? (
                        <p className="text-sm text-gray-500 italic bg-white p-3 rounded-lg border border-gray-100">No videos available.</p>
                    ) : (
                        <div className="space-y-3">
                            {videos.map(v => (
                                <div key={v.id} onClick={() => openLink(v.video_url)} className="bg-white flex items-center p-3 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-red-200 transition-colors active:scale-95">
                                    <div className="bg-red-50 p-2 rounded-lg mr-3 shadow-inner">
                                        <PlayCircle className="h-6 w-6 text-red-500" />
                                    </div>
                                    <p className="font-medium text-gray-800 text-sm flex-1">{v.title}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Study Materials Section */}
                <section>
                    <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                        <h3 className="text-lg font-bold tracking-tight text-gray-900">Study Materials</h3>
                    </div>
                    {materials.length === 0 ? (
                        <p className="text-sm text-gray-500 italic bg-white p-3 rounded-lg border border-gray-100">No materials available.</p>
                    ) : (
                        <div className="space-y-3">
                            {materials.map(m => (
                                <div key={m.id} onClick={() => openLink(m.pdf_url)} className="bg-white flex items-center p-3 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-indigo-200 transition-colors active:scale-95">
                                    <div className="bg-indigo-50 p-2 rounded-lg mr-3 shadow-inner">
                                        <Download className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <p className="font-medium text-gray-800 text-sm flex-1">{m.title}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Mock Tests Section */}
                <section>
                    <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 text-orange-500 mr-2" />
                        <h3 className="text-lg font-bold tracking-tight text-gray-900">Mock Tests</h3>
                    </div>
                    {mockTests.length === 0 ? (
                        <p className="text-sm text-gray-500 italic bg-white p-3 rounded-lg border border-gray-100">No mock tests available.</p>
                    ) : (
                        <div className="space-y-3">
                            {mockTests.map(m => (
                                <div key={m.id} onClick={() => openLink(m.pdf_url)} className="bg-white flex items-center p-3 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-orange-200 transition-colors active:scale-95">
                                    <div className="bg-orange-50 p-2 rounded-lg mr-3 shadow-inner">
                                        <Download className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <p className="font-medium text-gray-800 text-sm flex-1">{m.title}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
