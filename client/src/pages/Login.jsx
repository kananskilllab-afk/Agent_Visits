import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
    email:    z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        try {
            const result = await login(data.email, data.password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            if (!err.response) {
                setError('Cannot connect to server. Please ensure the backend is running.');
            } else {
                setError(err.response?.data?.message || 'An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">

            {/* Background accent circles */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-navy/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-sky/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-navy rounded-2xl shadow-lg mb-5">
                        <img src="/logo.png" alt="Kanan" className="h-10 w-auto object-contain brightness-0 invert" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agent Visit Portal</h1>
                    <p className="text-slate-500 mt-1.5 text-sm">Sign in to manage your visit reports</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-card-lg border border-slate-100 overflow-hidden">
                    {/* Top color bar */}
                    <div className="h-1.5 bg-brand-gradient" />

                    <div className="p-8">
                        {/* Error */}
                        {error && (
                            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 animate-slide-down">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="label">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        {...register('email')}
                                        type="email"
                                        autoComplete="email"
                                        className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:ring-red-300/30 focus:border-red-400' : ''}`}
                                        placeholder="name@kanan.co"
                                    />
                                </div>
                                {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        {...register('password')}
                                        type={showPass ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        className={`input-field pl-10 pr-11 ${errors.password ? 'border-red-400 focus:ring-red-300/30 focus:border-red-400' : ''}`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-2 h-12 bg-brand-gradient text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 hover:opacity-95 active:scale-[0.99] transition-all shadow-md shadow-brand-blue/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                                    </svg>
                                ) : (
                                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-1">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Authorised Access Only</p>
                            <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} Kanan International. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
