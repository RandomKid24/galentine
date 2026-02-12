'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { TicketType } from '../lib/types'; // Assuming this imports TicketType interface
import { TICKETS } from '../lib/constants'; // Assuming this imports the TICKETS array

interface Registration {
    id: number;
    fullName: string;
    email: string;
    ticketId: string;
    created_at: string;
}

/**
 * Admin Dashboard Page
 * A simple placeholder for administrative tasks.
 * Currently allows navigation back to the main site.
 */
export default function AdminPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [seatAvailability, setSeatAvailability] = useState<{
        earlyBird: { total: number; used: number; available: number };
        general: { total: number; used: number; available: number };
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch registrations
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setRegistrations(data);
            }

            // Fetch seat availability
            const { data: seatData, error: seatError } = await supabase
                .from('seat_config')
                .select('*');

            if (!seatError && seatData) {
                const earlyBirdConfig = seatData.find(s => s.config_key === 'early_bird');
                const generalConfig = seatData.find(s => s.config_key === 'general');

                setSeatAvailability({
                    earlyBird: {
                        total: earlyBirdConfig?.total_seats || 11,
                        used: earlyBirdConfig?.used_seats || 0,
                        available: (earlyBirdConfig?.total_seats || 11) - (earlyBirdConfig?.used_seats || 0)
                    },
                    general: {
                        total: generalConfig?.total_seats || 19,
                        used: generalConfig?.used_seats || 0,
                        available: (generalConfig?.total_seats || 19) - (generalConfig?.used_seats || 0)
                    }
                });
            }

            setLoading(false);
        };

        fetchData();

        // Real-time subscription
        const channel = supabase
            .channel('realtime registrations')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'registrations' }, (payload) => {
                setRegistrations((prev) => [payload.new as Registration, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const totalRegistrations = registrations.length;
    // Calculate total tickets sold (could be more if multi-person tickets are counted differently, 
    // but simplified to 1 registration = 1 sale for this dashboard view or map by ticket type cap)
    // If ticketId represents a group, we might want to sum up people. 
    // For now, let's just count rows as "orders".

    return (
        <div className="space-y-4">

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-rose-950">Dashboard Overview</h1>
                    <p className="text-rose-900/60 font-medium text-sm mt-1">Real-time event insights</p>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Stat Card 1 - Total Registrations */}
                <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
                            <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-rose-900/60 font-bold text-xs uppercase tracking-wider mb-1">Total Registrations</h3>
                    <p className="text-4xl font-serif font-bold text-rose-950">
                        {loading ? '...' : totalRegistrations}
                    </p>
                </div>

                {/* Stat Card 2 - Early Bird Seats */}
                <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-rose-900/60 font-bold text-xs uppercase tracking-wider mb-1">Early Bird Seats</h3>
                    <p className="text-4xl font-serif font-bold text-rose-950">
                        {loading ? '...' : `${seatAvailability?.earlyBird.available}/${seatAvailability?.earlyBird.total}`}
                    </p>
                    <p className="text-xs text-rose-400 mt-1">{seatAvailability?.earlyBird.used || 0} used</p>
                </div>

                {/* Stat Card 3 - General Seats */}
                <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-rose-900/60 font-bold text-xs uppercase tracking-wider mb-1">General Seats</h3>
                    <p className="text-4xl font-serif font-bold text-rose-950">
                        {loading ? '...' : `${seatAvailability?.general.available}/${seatAvailability?.general.total}`}
                    </p>
                    <p className="text-xs text-rose-400 mt-1">{seatAvailability?.general.used || 0} used</p>
                </div>

            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-rose-50 flex justify-between items-center">
                    <h3 className="font-serif text-lg font-bold text-rose-950">Latest Registrations</h3>
                    <Link href="/admin/registrations" className="text-[10px] font-bold text-rose-500 uppercase tracking-wider hover:text-rose-700">View All</Link>
                </div>

                {loading ? (
                    <div className="p-6 text-center text-rose-900/40 italic text-sm">Loading data...</div>
                ) : registrations.length === 0 ? (
                    <div className="p-6 text-center text-rose-900/40 italic text-sm">No registrations found yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-rose-900">
                            <thead className="bg-rose-50/50 text-rose-500 uppercase font-bold text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Ticket</th>
                                    <th className="px-4 py-3">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-50">
                                {registrations.slice(0, 5).map((reg) => {
                                    const ticketName = TICKETS.find(t => t.id === reg.ticketId)?.name || reg.ticketId;
                                    return (
                                        <tr key={reg.id} className="hover:bg-rose-50/20 transition-colors">
                                            <td className="px-4 py-3 font-bold text-sm">{reg.fullName}</td>
                                            <td className="px-4 py-3 text-rose-800/70 text-xs">{reg.email}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-1.5 py-0.5 bg-white border border-rose-100 rounded text-[10px] font-medium text-rose-600 shadow-sm">
                                                    {ticketName}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-rose-400 font-mono text-[10px]">
                                                {new Date(reg.created_at).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}
