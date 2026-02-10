'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * SMTP Settings Configuration Page
 * Allows admins to configure the email sending settings.
 */
export default function SmtpSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial state
    const [settings, setSettings] = useState({
        host: 'smtp.gmail.com',
        port: 587,
        username: '',
        password: '',
        fromName: 'Galentine 2026 Admin',
        fromEmail: '',
        enableSsl: true,
    });

    // Fetch settings on load
    React.useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from('config')
                .select('value')
                .eq('key', 'smtp_settings')
                .single();

            if (!error && data && data.value) {
                setSettings(prev => ({ ...prev, ...data.value }));
            }
        };
        fetchSettings();
    }, []);

    const [testEmail, setTestEmail] = useState('');
    const [testLoading, setTestLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error } = await supabase
                .from('config')
                .upsert({
                    key: 'smtp_settings',
                    value: settings,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        if (!settings.host || !settings.username || !settings.password) {
            setError('Please fill in Host, Username, and Password to test.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/test-smtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const data = await response.json();
            if (data.success) {
                alert('Connection Successful! ✅');
            } else {
                setError(data.message || 'Connection failed.');
            }
        } catch (err) {
            setError('Network error. Failed to reach server.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!testEmail || !testEmail.includes('@')) {
            alert('Please enter a valid email to send the test.');
            return;
        }
        if (!settings.host || !settings.username || !settings.password) {
            setError('Configure SMTP settings first.');
            return;
        }

        setTestLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/test-smtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...settings, testEmail })
            });
            const data = await response.json();
            if (data.success) {
                alert(`Test Email sent successfully to ${testEmail}! 📧 Check your inbox.`);
                setTestEmail('');
            } else {
                setError(data.message || 'Failed to send test email.');
            }
        } catch (err) {
            setError('Network error. Failed to send email.');
        } finally {
            setTestLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-rose-950">SMTP Configuration</h1>
                    <p className="text-rose-900/60 font-medium text-sm mt-1">Configure email delivery settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Settings Form */}
                <div className="lg:col-span-2 bg-white border border-rose-100 rounded-2xl p-6 shadow-xl shadow-rose-100/10">

                    {success && (
                        <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="font-bold text-xs">Settings saved successfully!</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-2 rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-bold text-xs">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="space-y-2 md:col-span-2">
                            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest border-b border-rose-50 pb-1 mb-2">Server Details</h3>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">SMTP Host</label>
                            <input
                                type="text"
                                name="host"
                                value={settings.host}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border-2 border-rose-50 bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-medium text-rose-950 placeholders-rose-300"
                                placeholder="e.g., smtp.gmail.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">Port</label>
                            <input
                                type="number"
                                name="port"
                                value={settings.port}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border-2 border-rose-50 bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-medium text-rose-950 placeholders-rose-300"
                                placeholder="587"
                            />
                        </div>

                        <div className="flex items-center gap-2 md:col-span-2 py-1">
                            <input
                                type="checkbox"
                                name="enableSsl"
                                id="enableSsl"
                                checked={settings.enableSsl}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-rose-300 text-rose-600 focus:ring-rose-200"
                            />
                            <label htmlFor="enableSsl" className="text-xs font-medium text-rose-900 cursor-pointer select-none">Enable SSL/TLS Security</label>
                        </div>

                        <div className="space-y-2 md:col-span-2 mt-2">
                            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest border-b border-rose-50 pb-1 mb-2">Authentication</h3>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">Username / Email</label>
                            <input
                                type="email"
                                name="username"
                                value={settings.username}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border-2 border-rose-50 bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-medium text-rose-950 placeholders-rose-300"
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">App Password</label>
                            <input
                                type="password"
                                name="password"
                                value={settings.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border-2 border-rose-50 bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-medium text-rose-950 placeholders-rose-300"
                                placeholder="••••••••••••"
                            />
                            <p className="text-[10px] text-rose-400/80 font-medium px-1">Use an App Password if using Gmail/Outlook.</p>
                        </div>

                        <div className="space-y-2 md:col-span-2 mt-2">
                            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest border-b border-rose-50 pb-1 mb-2">Sender Information</h3>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">From Name</label>
                            <input
                                type="text"
                                name="fromName"
                                value={settings.fromName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border-2 border-rose-50 bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-medium text-rose-950 placeholders-rose-300"
                                placeholder="Event Team"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">From Email</label>
                            <input
                                type="email"
                                name="fromEmail"
                                value={settings.fromEmail}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border-2 border-rose-50 bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-medium text-rose-950 placeholders-rose-300"
                                placeholder="noreply@example.com"
                            />
                        </div>

                        <div className="md:col-span-2 pt-4 flex flex-col sm:flex-row gap-3 border-t border-rose-50 mt-2">
                            <button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg border-2 border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Testing...' : 'Test Connection'}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold text-xs shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                            >
                                {loading ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>

                    </form>
                </div>

                {/* Test Email Section */}
                <div className="space-y-4">
                    <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-xl shadow-rose-100/10">
                        <h3 className="text-sm font-serif font-bold text-rose-950 mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Try it out
                        </h3>
                        <p className="text-xs text-rose-900/60 mb-6">Send a test email to make sure everything is working correctly.</p>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">Recipient Email</label>
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    className="w-full px-3 py-3 rounded-xl border-2 border-rose-50 bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-medium text-rose-950 placeholders-rose-300"
                                    placeholder="Enter test email..."
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSendTestEmail}
                                disabled={testLoading || !testEmail}
                                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${testEmail ? 'bg-rose-950 text-white hover:bg-black shadow-rose-100' : 'bg-rose-50 text-rose-300 cursor-not-allowed border border-rose-100'}`}
                            >
                                {testLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Send Test Email</span>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 border-dashed">
                        <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">Need help?</h4>
                        <p className="text-[11px] text-rose-900/60 leading-relaxed">
                            If you're using <span className="font-bold text-rose-900">Gmail</span>, make sure to use an <span className="underline">App Password</span> and set the port to <span className="font-bold text-rose-900">587</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
