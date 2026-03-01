import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    allowedRole?: 'admin' | 'student';
}

export const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If a role is required and profile is loaded but doesn't match
    if (allowedRole && profile && profile.role !== allowedRole) {
        if (profile.role === 'admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/student" replace />;
    }

    return <Outlet />;
};
