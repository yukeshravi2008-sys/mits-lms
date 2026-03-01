import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FolderOpen, ArrowLeft, ChevronRight } from 'lucide-react';

interface Unit {
    id: string;
    title: string;
}

export default function SubjectDetail() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [units, setUnits] = useState<Unit[]>([]);
    const [subjectName, setSubjectName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUnits() {
            if (!subjectId) return;
            setLoading(true);

            const { data: subjectData } = await supabase
                .from('subjects')
                .select('name')
                .eq('id', subjectId)
                .single();

            if (subjectData) setSubjectName(subjectData.name);

            const { data: unitsData, error } = await supabase
                .from('units')
                .select('*')
                .eq('subject_id', subjectId)
                .order('created_at', { ascending: true });

            if (error) console.error('Error fetching units:', error);
            else setUnits(unitsData || []);

            setLoading(false);
        }

        fetchUnits();
    }, [subjectId]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading units...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-full">
            <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex items-center shadow-sm">
                <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="h-6 w-6 text-gray-700" />
                </button>
                <h2 className="text-xl font-bold text-[#0F2027] truncate pr-4">{subjectName}</h2>
            </div>

            <div className="p-4 space-y-4 animate-in fade-in duration-300">
                {units.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl text-center border border-gray-100 shadow-sm mt-4">
                        <p className="text-gray-500">No units added to this subject yet.</p>
                    </div>
                ) : (
                    units.map((unit, index) => (
                        <div
                            key={unit.id}
                            onClick={() => navigate(`/student/unit/${unit.id}`)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 leading-tight">{unit.title}</h3>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
