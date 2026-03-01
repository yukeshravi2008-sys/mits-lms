import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Batch {
    id: string;
    name: string;
}

interface Student {
    id: string;
    name: string;
    email: string;
    approved: boolean;
    batch_id: string | null;
    created_at: string;
    batches?: Batch;
}

export default function Students() {
    const [students, setStudents] = useState<Student[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const [studentsRes, batchesRes] = await Promise.all([
            supabase.from('students').select('*, batches(id, name)').eq('role', 'student').order('created_at', { ascending: false }),
            supabase.from('batches').select('*').order('created_at', { ascending: false })
        ]);

        if (studentsRes.error) console.error('Error fetching students:', studentsRes.error);
        else setStudents(studentsRes.data || []);

        if (batchesRes.error) console.error('Error fetching batches:', batchesRes.error);
        else setBatches(batchesRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('students')
            .update({ approved: !currentStatus })
            .eq('id', id);

        if (error) console.error('Error updating approval:', error);
        else fetchData();
    };

    const handleBatchChange = async (studentId: string, newBatchId: string) => {
        const batch_id = newBatchId === '' ? null : newBatchId;
        const { error } = await supabase
            .from('students')
            .update({ batch_id })
            .eq('id', studentId);

        if (error) console.error('Error updating batch:', error);
        else fetchData();
    };

    const handleDelete = async (id: string) => {
        // Note: Due to RLS policies or foreign key constraints (refs auth.users), 
        // it's usually better to just set them as inactive or let Supabase Edge functions handle full auth deletion.
        // For this simple version, we'll try to delete from public.students. (To fully delete from auth.users requires service_role key)
        if (window.confirm('Are you sure you want to remove this student? This only removes their profile access, not their auth account.')) {
            const { error } = await supabase.from('students').delete().eq('id', id);
            if (error) console.error('Error deleting:', error);
            else fetchData();
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Manage Students</h1>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : students.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No students registered yet.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            value={student.batch_id || ''}
                                            onChange={(e) => handleBatchChange(student.id, e.target.value)}
                                            className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-[#0F2027] focus:border-[#0F2027] sm:text-sm rounded-md border"
                                        >
                                            <option value="">No Batch Assigned</option>
                                            {batches.map((b) => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleApprove(student.id, student.approved)}
                                            className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${student.approved ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'
                                                }`}
                                        >
                                            {student.approved ? <CheckCircle className="mr-1 h-4 w-4" /> : <XCircle className="mr-1 h-4 w-4" />}
                                            {student.approved ? 'Approved' : 'Pending'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
