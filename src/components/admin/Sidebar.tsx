import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Library,
    Folders,
    FileText,
    Video,
    Users,
    LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Batches', href: '/admin/batches', icon: BookOpen },
    { name: 'Subjects', href: '/admin/subjects', icon: Library },
    { name: 'Units', href: '/admin/units', icon: Folders },
    { name: 'Materials & Tests', href: '/admin/materials', icon: FileText },
    { name: 'Videos', href: '/admin/videos', icon: Video },
    { name: 'Students', href: '/admin/students', icon: Users },
];

export default function Sidebar() {
    const { signOut, profile } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-full w-64 flex-col bg-[#0F2027] text-white">
            <div className="flex h-16 items-center justify-center border-b border-[#203A43] px-4">
                <BookOpen className="h-8 w-8 text-white mr-2" />
                <span className="text-xl font-bold uppercase tracking-wider">MITS Admin</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            end={item.href === '/admin'}
                            className={({ isActive }) =>
                                cn(
                                    isActive ? 'bg-[#203A43] text-white' : 'text-gray-300 hover:bg-[#203A43] hover:text-white',
                                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors'
                                )
                            }
                        >
                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="border-t border-[#203A43] p-4">
                <div className="flex items-center px-2 mb-4">
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">{profile?.name || 'Admin User'}</p>
                        <p className="text-xs font-medium text-gray-400">{profile?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-red-300 hover:bg-red-900/50 hover:text-red-100 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    Logout
                </button>
            </div>
        </div>
    );
}
