import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, User, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentLayout() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen flex-col bg-gray-50 overflow-hidden">
            {/* Top Header */}
            <header className="bg-[#0F2027] text-white px-4 py-4 flex items-center justify-between shadow-sm">
                <h1 className="text-xl font-bold tracking-wide">MITS Student</h1>
                <button onClick={handleLogout} className="text-red-300 hover:text-red-100 flex items-center">
                    <LogOut className="h-5 w-5 mr-1" />
                    <span className="text-sm hidden sm:inline">Logout</span>
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative pb-20">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
                <div className="flex justify-around items-center h-16">
                    <NavLink
                        to="/student"
                        end
                        className={({ isActive }) =>
                            cn(
                                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                                isActive ? 'text-[#0F2027]' : 'text-gray-400 hover:text-gray-600'
                            )
                        }
                    >
                        <Home className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Home</span>
                    </NavLink>

                    <NavLink
                        to="/student/profile"
                        className={({ isActive }) =>
                            cn(
                                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                                isActive ? 'text-[#0F2027]' : 'text-gray-400 hover:text-gray-600'
                            )
                        }
                    >
                        <User className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Profile</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
}
