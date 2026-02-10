'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TICKETS } from '../../lib/constants';

interface Registration {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    ticketId: string;
    additionalNames: string[];
    payment_receipt_url: string | null;
    created_at: string;
}

export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

    useEffect(() => {
        const fetchRegistrations = async () => {
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setRegistrations(data);
            }
            setLoading(false);
        };

        fetchRegistrations();
    }, []);

    const filteredRegistrations = registrations.filter(reg =>
        reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-rose-950">Registrations</h1>
                    <p className="text-rose-900/60 font-medium text-sm mt-1">View and manage all guest list entries.</p>
                </div>
                <div className="relative w-full md:w-56">
                    <input
                        type="text"
                        placeholder="Search guests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 pl-9 rounded-lg border-2 border-rose-100 bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-medium text-rose-950"
                    />
                    <svg className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-xl shadow-rose-100/10">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-6 h-6 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-rose-900/40 italic text-sm">Loading guest list...</p>
                    </div>
                ) : filteredRegistrations.length === 0 ? (
                    <div className="p-8 text-center text-rose-900/40 italic text-sm">
                        {searchTerm ? 'No guests found matching your search.' : 'No registrations yet.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-rose-900">
                            <thead className="bg-rose-50/50 text-rose-500 uppercase font-bold text-[10px] tracking-wider border-b border-rose-100">
                                <tr>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Guest Info</th>
                                    <th className="px-4 py-3">Ticket Details</th>
                                    <th className="px-4 py-3">Group Size</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Registered At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-50">
                                {filteredRegistrations.map((reg) => {
                                    const ticket = TICKETS.find(t => t.id === reg.ticketId);
                                    return (
                                        <tr key={reg.id} className="hover:bg-rose-50/20 transition-colors group">
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                                                    Confirmed
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-rose-950 text-sm">{reg.fullName}</div>
                                                <div className="text-[11px] text-rose-500">{reg.email}</div>
                                                <div className="text-[11px] text-rose-400">{reg.phone}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-rose-900 flex items-center gap-1.5 text-sm">
                                                    <span>{ticket?.emoji}</span>
                                                    {ticket?.name || reg.ticketId}
                                                </div>
                                                <div className="text-[11px] text-rose-500 font-mono">₹{ticket?.price}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex -space-x-1.5 overflow-hidden">
                                                    <div className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 border border-white text-rose-600 text-[10px] font-bold" title={reg.fullName}>
                                                        {reg.fullName.charAt(0)}
                                                    </div>
                                                    {reg.additionalNames && reg.additionalNames.map((name, i) => (
                                                        <div key={i} className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 border border-white text-rose-400 text-[10px] font-bold" title={name}>
                                                            {name.charAt(0)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {reg.payment_receipt_url ? (
                                                    <button
                                                        onClick={() => setSelectedReceipt(reg.payment_receipt_url)}
                                                        className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors font-medium"
                                                    >
                                                        View Receipt
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-rose-300 italic">No receipt</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-[10px] text-rose-400 font-mono whitespace-nowrap">
                                                {new Date(reg.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Receipt Viewer Modal */}
            {selectedReceipt && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={() => setSelectedReceipt(null)}
                >
                    <div 
                        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-rose-950">Payment Receipt</h3>
                            <button
                                onClick={() => setSelectedReceipt(null)}
                                className="text-rose-400 hover:text-rose-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <img
                                src={selectedReceipt}
                                alt="Payment Receipt"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <a
                                href={selectedReceipt}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-center text-sm font-medium"
                            >
                                Open in New Tab
                            </a>
                            <a
                                href={selectedReceipt}
                                download
                                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-center text-sm font-medium"
                            >
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
