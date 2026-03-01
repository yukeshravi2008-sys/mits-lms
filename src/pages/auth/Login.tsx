import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BookOpen } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { refreshProfile } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // Fetch profile to redirect based on role
            if (data.user) {
                await refreshProfile();

                const { data: profileData } = await supabase
                    .from('students')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profileData?.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/student');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-[#0F2027]" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        MITS LMS Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your dashboard
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <Input
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Sign in
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link to="/register" className="font-medium text-[#0F2027] hover:text-[#203A43]">
                            Register here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
