'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // A simple hardcoded check for now - in production use real Auth
        if (password === 'galentine2026') {
            document.cookie = "admin_session=authenticated; path=/; max-age=3600; SameSite=Strict";
            router.push('/admin');
        } else {
            setError(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-rose-50/30">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-rose-100 text-center">
                <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-200">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-serif font-bold text-rose-950 mb-2">Admin Login</h1>
                <p className="text-sm text-rose-900/60 mb-8">Please enter your password to continue.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        className={`w-full px-5 py-4 rounded-xl border-2 transition-all outline-none text-center font-bold tracking-widest ${error ? 'border-rose-500 ring-4 ring-rose-50' : 'border-rose-100 focus:border-rose-500'}`}
                    />
                    {error && <p className="text-xs text-rose-500 font-bold">Wrong password. Try again.</p>}
                    <button
                        type="submit"
                        className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
