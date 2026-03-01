import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, BookOpen, Library, Folders } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        students: 0,
        batches: 0,
        subjects: 0,
        units: 0,
    });

    useEffect(() => {
        async function fetchStats() {
            // For a real production app, you might want to run a single RPC call to get all counts.
            // Doing it in parallel for simplicity here.
            const [studentsReq, batchesReq, subjectsReq, unitsReq] = await Promise.all([
                supabase.from('students').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('batches').select('*', { count: 'exact', head: true }),
                supabase.from('subjects').select('*', { count: 'exact', head: true }),
                supabase.from('units').select('*', { count: 'exact', head: true }),
            ]);

            setStats({
                students: studentsReq.count || 0,
                batches: batchesReq.count || 0,
                subjects: subjectsReq.count || 0,
                units: unitsReq.count || 0,
            });
        }

        fetchStats();
    }, []);

    const statCards = [
        { name: 'Total Students', stat: stats.students, icon: Users },
        { name: 'Total Batches', stat: stats.batches, icon: BookOpen },
        { name: 'Total Subjects', stat: stats.subjects, icon: Library },
        { name: 'Total Units', stat: stats.units, icon: Folders },
    ];

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((item) => (
                    <div
                        key={item.name}
                        className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6 border border-gray-100"
                    >
                        <dt>
                            <div className="absolute rounded-md bg-[#0F2027] p-3">
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                        </dd>
                    </div>
                ))}
            </div>
        </div>
    );
}
