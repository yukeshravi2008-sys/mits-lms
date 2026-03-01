import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, ChevronRight } from 'lucide-react';

interface Subject {
    id: string;
    name: string;
}

export default function StudentDashboard() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [batchName, setBatchName] = useState('');

    useEffect(() => {
        async function fetchDashboardData() {
            if (!profile?.batch_id) {
                setLoading(false);
                return;
            }

            setLoading(true);

            // Fetch batch info
            const { data: batchData } = await supabase
                .from('batches')
                .select('name')
                .eq('id', profile.batch_id)
                .single();

            if (batchData) setBatchName(batchData.name);

            // Fetch subjects for this batch
            const { data: subjectsData, error } = await supabase
                .from('subjects')
                .select('*')
                .eq('batch_id', profile.batch_id)
                .order('created_at', { ascending: false });

            if (error) console.error('Error fetching subjects:', error);
            else setSubjects(subjectsData || []);

            setLoading(false);
        }

        fetchDashboardData();
    }, [profile]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading courses...</div>;
    }

    if (!profile?.batch_id) {
        return (
            <div className="p-8 text-center bg-yellow-50 mt-4 mx-4 rounded-xl border border-yellow-200">
                <h2 className="text-yellow-800 font-semibold mb-2">No Batch Assigned</h2>
                <p className="text-yellow-700 text-sm">Please contact the administrator to assign you to a batch so you can start learning.</p>
            </div>
        );
    }

    return (
        <div className="p-4 animate-in fade-in duration-300">
            <div className="mb-6">
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">{batchName}</p>
                <h2 className="text-2xl font-bold text-[#0F2027]">My Subjects</h2>
            </div>

            <div className="space-y-4">
                {subjects.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl text-center border border-gray-100 shadow-sm">
                        <p className="text-gray-500">No subjects available for this batch yet.</p>
                    </div>
                ) : (
                    subjects.map((subject) => (
                        <div
                            key={subject.id}
                            onClick={() => navigate(`/student/subject/${subject.id}`)}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-[#203A43]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Tap to view units & materials</p>
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
