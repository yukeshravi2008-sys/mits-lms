import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, ShieldCheck } from 'lucide-react';

export default function StudentProfile() {
    const { profile } = useAuth();

    return (
        <div className="p-4 animate-in fade-in duration-300 space-y-6">
            <h2 className="text-2xl font-bold text-[#0F2027] mb-6">Profile</h2>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{profile?.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Active Student
                        </span>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div className="flex items-center text-sm">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{profile?.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <ShieldCheck className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">MITS Account Verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
