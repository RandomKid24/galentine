'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Pass } from '../../lib/types';

interface Registration {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    ticketId: string;
    additionalNames: string[];
    payment_receipt_url: string | null;
    status?: string;
    created_at: string;
}

export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [passes, setPasses] = useState<Pass[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch registrations
            const { data: regData, error: regError } = await supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch passes to get correct names/prices/emojis
            const { data: passesData, error: passesError } = await supabase
                .from('passes')
                .select('*');

            if (regError) throw regError;
            if (regData) setRegistrations(regData);
            if (passesData) setPasses(passesData);
            
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        setDeleting(true);
        try {
            const response = await fetch(`/api/admin/registrations?id=${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                await fetchData();
                setDeleteConfirm(null);
            } else {
                alert(data.message || 'Failed to delete registration');
            }
        } catch (error) {
            console.error('Error deleting registration:', error);
            alert('An error occurred while deleting the registration');
        } finally {
            setDeleting(false);
        }
    };

    const getTicketInfo = (ticketId: string | number) => {
        if (!ticketId || !passes) return null;
        // Try to find in passes first (dynamic)
        const pass = passes.find(p => p.id.toString() === ticketId.toString());
        if (pass) return pass;
        
        return null;
    };

    const filteredRegistrations = registrations.filter(reg =>
        reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone.includes(searchTerm)
    );

    const handleConfirm = async (id: number) => {
        if (!confirm('Confirm seat and send confirmation email?')) return;
        
        try {
            const response = await fetch('/api/admin/confirm-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationId: id })
            });
            const data = await response.json();
            if (data.success) {
                alert('Seat confirmed and email sent! ✅');
                fetchData();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            alert('Failed to confirm registration');
        }
    };

    const StatusBadge = ({ status }: { status?: string }) => {
        const isConfirmed = status === 'confirmed';
        return (
            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isConfirmed 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
                {isConfirmed ? 'Confirmed' : 'Pending Verification'}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-serif font-extrabold text-[#80183b]">Guest Registrations</h1>
                    <p className="text-rose-900/60 text-sm font-medium">Manage and verify attendees for Galentine's 2026</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={async () => {
                            if (confirm('Recalculate all used seats based on current registrations?')) {
                                const res = await fetch('/api/admin/sync-seats');
                                const data = await res.json();
                                if (data.success) {
                                    alert(`Synced! Early Bird: ${data.counts.early_bird}, General: ${data.counts.general}`);
                                    await fetchData();
                                }
                            }
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all text-xs font-bold flex items-center gap-2 border border-rose-100 shadow-sm"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        RECALCULATE SEATS
                    </button>
                    
                    <div className="relative flex-1 md:w-64 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search names, emails, phones..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-medium text-rose-950 placeholder:text-rose-300"
                        />
                        <svg className="w-4 h-4 text-rose-300 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Registrations List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="bg-white p-20 rounded-2xl border border-dashed border-rose-200 text-center">
                        <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-rose-950/40 font-serif italic">Gathering guest data...</p>
                    </div>
                ) : filteredRegistrations.length === 0 ? (
                    <div className="bg-white p-20 rounded-2xl border border-dashed border-rose-200 text-center">
                        <p className="text-rose-950/40 font-serif italic">
                            {searchTerm ? 'No guests found matching your search.' : 'The guest list is currently empty.'}
                        </p>
                    </div>
                ) : (
                    filteredRegistrations.map((reg) => {
                        const pass = getTicketInfo(reg.ticketId);
                        const allGuests = [reg.fullName, ...(reg.additionalNames || [])];
                        
                        return (
                            <div key={reg.id} className="group bg-white rounded-2xl border border-rose-100 p-5 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100/30 transition-all duration-300">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Primary Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <StatusBadge status={reg.status} />
                                            <span className="text-[10px] text-rose-300 font-mono">
                                                #{reg.id} • {new Date(reg.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-lg font-serif font-bold text-rose-950 truncate">{reg.fullName}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                            <div className="flex items-center gap-1.5 text-xs text-rose-600/70">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                {reg.email}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-rose-600/70">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {reg.phone}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ticket Details */}
                                    <div className="lg:w-64 flex flex-col justify-center border-l-0 lg:border-l border-rose-50 lg:pl-6 px-1 lg:px-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xl">{pass?.emoji || '🎟️'}</span>
                                            <span className="font-bold text-rose-950 text-sm">{pass?.title || 'Unknown Pass'}</span>
                                        </div>
                                        <div className="text-xs font-bold text-rose-500 font-mono">
                                            ₹{pass?.price?.toLocaleString('en-IN') || '---'}
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {allGuests.map((_, i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-rose-600">
                                                        {i + 1}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                                                {allGuests.length} Guest{allGuests.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Additional Names */}
                                    <div className="lg:w-48 flex flex-col justify-center">
                                        <p className="text-[9px] font-black text-rose-300 uppercase tracking-widest mb-1">Guests</p>
                                        <div className="text-[11px] text-rose-950/70 font-medium leading-relaxed">
                                            {reg.additionalNames && reg.additionalNames.length > 0 
                                                ? reg.additionalNames.join(', ')
                                                : <span className="italic">Individual</span>
                                            }
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 lg:w-48 justify-end">
                                        {reg?.status !== 'confirmed' && (
                                            <button
                                                onClick={() => handleConfirm(reg.id)}
                                                className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all text-xs font-bold shadow-lg shadow-rose-100"
                                            >
                                                CONFIRM
                                            </button>
                                        )}
                                        {reg?.payment_receipt_url ? (
                                            <button
                                                onClick={() => setSelectedReceipt(reg.payment_receipt_url)}
                                                className="flex-1 lg:flex-none px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all text-xs font-bold border border-emerald-100"
                                            >
                                                RECEIPT
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-bold text-rose-200 uppercase tracking-widest">No Receipt</span>
                                        )}
                                        
                                        <button
                                            onClick={() => setDeleteConfirm(reg.id)}
                                            className="p-2.5 text-rose-300 hover:text-white hover:bg-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-700"
                                            title="Delete registration"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4c0519]/80 backdrop-blur-md p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedReceipt(null)}
                >
                    <div 
                        className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl scale-in-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-rose-950">Payment Verification</h3>
                                <p className="text-sm text-rose-900/60 font-medium">Uploaded by guest as proof of purchase</p>
                            </div>
                            <button
                                onClick={() => setSelectedReceipt(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 bg-rose-50/50 rounded-2xl overflow-auto p-4 border border-rose-100 flex items-center justify-center">
                            <img
                                src={selectedReceipt}
                                alt="Payment Receipt"
                                className="max-w-full h-auto rounded-lg shadow-lg"
                            />
                        </div>
                        
                        <div className="mt-8 flex gap-3">
                            <a
                                href={selectedReceipt}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-6 py-3 bg-white border-2 border-rose-100 text-rose-950 rounded-2xl hover:bg-rose-50 transition-all text-center text-sm font-bold shadow-sm"
                            >
                                OPEN FULLSIZE
                            </a>
                            <a
                                href={selectedReceipt}
                                download
                                className="flex-1 px-6 py-3 bg-[#80183b] text-white rounded-2xl hover:bg-[#60122c] transition-all text-center text-sm font-bold shadow-lg shadow-rose-200"
                            >
                                DOWNLOAD
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4c0519]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center scale-in-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-rose-950 mb-2">Revoke Registration?</h3>
                        <p className="text-sm text-rose-950/60 font-medium mb-8 leading-relaxed">
                            This will permanently delete the entry and <span className="text-[#80183b] font-bold underline decoration-rose-200">re-add the seats</span> back to the event pool.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-6 py-3 bg-rose-50 text-rose-950 rounded-2xl hover:bg-rose-100 transition-all text-sm font-bold border border-rose-100"
                                disabled={deleting}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                                className="flex-1 px-6 py-3 bg-[#80183b] text-white rounded-2xl hover:bg-rose-950 transition-all text-sm font-bold disabled:opacity-50 shadow-lg shadow-rose-200"
                                disabled={deleting}
                            >
                                {deleting ? 'REVOKING...' : 'DELETE ENTRY'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
