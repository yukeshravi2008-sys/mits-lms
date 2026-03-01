import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BookOpen } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const { refreshProfile } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;

            if (authData.user) {
                // 2. Insert into students table
                const { error: insertError } = await supabase
                    .from('students')
                    .insert([
                        {
                            id: authData.user.id,
                            name,
                            email,
                            role: 'student', // default role
                            approved: false, // requires admin approval
                        }
                    ]);

                if (insertError) throw insertError;

                await refreshProfile();
                navigate('/student/pending'); // Navigate to pending page if successful
            }
        } catch (err: any) {
            setError(err.message || 'Failed to register');
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
                        Student Registration
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Create an account to access MITS LMS
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
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
                            minLength={6}
                        />
                    </div>

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Register
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link to="/login" className="font-medium text-[#0F2027] hover:text-[#203A43]">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
