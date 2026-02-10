'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Header';
import Hero from './components/Hero';
import TicketCard from './components/TicketCard';
import AdditionalNames from './components/AdditionalNames';
import ConfirmModal from './components/ConfirmModal';
import { supabase } from './lib/supabase';
import { TICKETS, TOTAL_EARLY_BIRD_SEATS, USED_EARLY_BIRD_SEATS } from './lib/constants';
import { FormData } from './lib/types';
import { Send, Upload } from 'lucide-react';

export default function Home() {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        phone: '',
        email: '',
        ticketId: '',
        additionalNames: [],
        wantsUpdates: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [backendState, setBackendState] = useState<{ usedSeats: number; loading: boolean }>({
        usedSeats: 0,
        loading: true
    });

    useEffect(() => {
        const initApp = async () => {
            try {
                const { count, error } = await supabase
                    .from('registrations')
                    .select('*', { count: 'exact', head: true })
                    .eq('ticketId', 'early-bird');

                const actualUsedSeats = !error ? (count || 0) : USED_EARLY_BIRD_SEATS;
                setBackendState({ usedSeats: actualUsedSeats, loading: false });

                const initialTicket = actualUsedSeats >= TOTAL_EARLY_BIRD_SEATS
                    ? TICKETS.find(t => t.id === 'regular-pass')?.id || TICKETS[1].id
                    : TICKETS[0].id;

                setFormData(prev => ({ ...prev, ticketId: initialTicket }));
            } catch (e) {
                console.error("Initialization error:", e);
                setBackendState({ usedSeats: 0, loading: false });
            }
        };
        initApp();
    }, []);

    const isEarlyBirdAvailable = useMemo(() => backendState.usedSeats < TOTAL_EARLY_BIRD_SEATS, [backendState.usedSeats]);
    const selectedTicket = useMemo(() => TICKETS.find(t => t.id === formData.ticketId) || TICKETS[1], [formData.ticketId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const cleanValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTicketSelect = (id: string) => {
        const ticket = TICKETS.find(t => t.id === id);
        if (!ticket) return;
        setFormData(prev => ({
            ...prev,
            ticketId: id,
            additionalNames: Array(ticket.maxPeople - 1).fill('')
        }));
    };

    const isFormValid = useMemo(() => (
        formData.fullName.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.phone.length === 10 &&
        formData.additionalNames.every(name => name.trim() !== '')
    ), [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) setShowConfirmModal(true);
    };

    if (backendState.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-rose-50 border-t-[#80183b] rounded-full animate-spin"></div>
            </div>
        );
    }

    const inputClasses = "w-full p-4 rounded-lg bg-[#f4f4f4] border-none outline-none focus:ring-1 focus:ring-gray-300 transition-all text-[15px] text-gray-800 placeholder:text-gray-400";

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <Hero />

            <div id="registration-form" className="max-w-3xl mx-auto px-6 py-20 bg-white">
                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Basic Info */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[15px] font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                            <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClasses} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[15px] font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                            <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} maxLength={10} className={inputClasses} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[15px] font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                            <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClasses} />
                        </div>
                    </div>

                    {/* Registration Fee */}
                    <div className="space-y-6">
                        <h3 className="text-[17px] font-medium text-gray-800">Registration Fee</h3>
                        <p className="text-[15px] text-gray-800">₹{selectedTicket.price.toLocaleString('en-IN')}.00</p>
                        
                        <div className="flex flex-col gap-4">
                            {TICKETS.map(ticket => (
                                <TicketCard
                                    key={ticket.id}
                                    ticket={ticket}
                                    isSelected={formData.ticketId === ticket.id}
                                    onSelect={handleTicketSelect}
                                    disabled={ticket.id === 'early-bird' && !isEarlyBirdAvailable}
                                />
                            ))}
                        </div>

                        <AdditionalNames
                            count={selectedTicket.maxPeople}
                            names={formData.additionalNames}
                            primaryName={formData.fullName}
                            onChange={(i, v) => {
                                const n = [...formData.additionalNames];
                                n[i] = v;
                                setFormData({ ...formData, additionalNames: n });
                            }}
                        />
                    </div>

                    {/* Payment Receipt */}
                    <div className="space-y-4">
                        <label className="text-[17px] font-medium text-gray-800">Please attach your payment receipt <span className="text-red-500">*</span></label>
                        <div>
                            <button type="button" className="flex items-center gap-2 px-6 py-2 bg-[#e0e0e0] hover:bg-[#d0d0d0] rounded text-[15px] font-medium text-gray-700 transition-colors">
                                Add file
                            </button>
                        </div>
                    </div>

                    {/* Updates */}
                    <div className="space-y-4">
                        <label className="text-[17px] font-medium text-gray-800 block">Would you like to receive updates about our other events? <span className="text-red-500">*</span></label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="updates" 
                                    checked={formData.wantsUpdates === true}
                                    onChange={() => setFormData({...formData, wantsUpdates: true})}
                                    className="sr-only peer"
                                />
                                <div className="w-5 h-5 rounded-full border border-gray-300 bg-white flex items-center justify-center peer-checked:border-gray-500">
                                    {formData.wantsUpdates === true && <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />}
                                </div>
                                <span className="text-[15px] text-gray-800">Yes</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="updates" 
                                    checked={formData.wantsUpdates === false}
                                    onChange={() => setFormData({...formData, wantsUpdates: false})}
                                    className="sr-only peer"
                                />
                                <div className="w-5 h-5 rounded-full border border-gray-300 bg-white flex items-center justify-center peer-checked:border-gray-500">
                                    {formData.wantsUpdates === false && <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />}
                                </div>
                                <span className="text-[15px] text-gray-800">No</span>
                            </label>
                        </div>
                    </div>

                    {/* Review and Submit */}
                    <div className="space-y-10 pt-10">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-medium text-gray-800">Review and submit</h2>
                            <p className="text-[15px] text-gray-600">Please review your response before submitting it for processing.</p>
                        </div>

                        <div className="flex justify-start items-center">
                            <button
                                disabled={isSubmitting || !isFormValid}
                                type="submit"
                                className="flex items-center gap-3 px-10 py-4 bg-[#80183b] text-white rounded-lg hover:bg-[#60122c] transition-all disabled:bg-gray-400 font-medium tracking-wide uppercase text-sm"
                            >
                                <Send className="w-5 h-5" />
                                {isSubmitting ? 'Processing...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Success Modal (simplified) */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={async () => {
                    setShowConfirmModal(false);
                    setIsSubmitting(true);
                    try {
                        const response = await fetch('/api/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(formData)
                        });
                        const data = await response.json();
                        if (data.success) setIsSuccess(true);
                    } catch (error) {
                        console.error('Submission error:', error);
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
                ticket={selectedTicket}
                fullName={formData.fullName}
            />

            {isSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Send className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitted!</h2>
                        <p className="text-gray-500 mb-8">Your registration has been received.</p>
                        <button onClick={() => window.location.reload()} className="w-full py-3 bg-[#80183b] text-white rounded-lg font-bold">Close</button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="w-full py-12 flex flex-col items-center gap-6 bg-gradient-to-b from-transparent to-[#f8c0ca]/30">
                <div className="text-center space-y-2">
                    <p className="text-[11px] text-gray-400 uppercase tracking-[0.4em] font-bold">🌸 An exclusive gathering — 2026 🌸</p>
                </div>
            </footer>
        </div>
    );
}
