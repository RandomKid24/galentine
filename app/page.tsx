'use client';

import React, { useState, useMemo, useEffect } from 'react';

import Header from './components/Header';
import TicketCard from './components/TicketCard';
import AdditionalNames from './components/AdditionalNames';
import ConfirmModal from './components/ConfirmModal';
import { supabase } from './lib/supabase';
import { TICKETS, TOTAL_EARLY_BIRD_SEATS, USED_EARLY_BIRD_SEATS } from './lib/constants';
import { FormData } from './lib/types';

/**
 * App (Home Page)
 * Main component handling the Galentine's party registration logic.
 * Manages form state, AI greeting generation, and ticket selection.
 */
export default function Home() {
    // State for form data
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        phone: '',
        email: '',
        ticketId: '',
        additionalNames: [],
        wantsUpdates: true
    });

    // UI States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // AI Greeting content


    // Mock backend state (simulated)
    const [backendState, setBackendState] = useState<{ usedSeats: number; loading: boolean }>({
        usedSeats: 0,
        loading: true
    });

    /**
     * Initialize App
     * Fetches AI content and sets initial ticket selection based on availability.
     */
    /**
     * Initialize App
     * Sets initial ticket selection based on availability.
     */
    useEffect(() => {
        const initApp = async () => {
            try {
                // Fetch actual count from Supabase
                const { count, error } = await supabase
                    .from('registrations')
                    .select('*', { count: 'exact', head: true })
                    .eq('ticketId', 'early-bird');

                const actualUsedSeats = !error ? (count || 0) : USED_EARLY_BIRD_SEATS;
                setBackendState({ usedSeats: actualUsedSeats, loading: false });

                // Initial Ticket Selection
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

    // Check Early Bird Availability
    const isEarlyBirdAvailable = useMemo(() => backendState.usedSeats < TOTAL_EARLY_BIRD_SEATS, [backendState.usedSeats]);

    // Get Selected Ticket Details
    const selectedTicket = useMemo(() => TICKETS.find(t => t.id === formData.ticketId) || TICKETS[1], [formData.ticketId]);

    /**
     * Handle Input Change
     * Updates form data for simple inputs.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Prevent typing non-digits in phone field
        if (name === 'phone') {
            const cleanValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Handle Ticket Selection
     * Updates ticket ID and adjusts additional guest slots.
     */
    const handleTicketSelect = (id: string) => {
        const ticket = TICKETS.find(t => t.id === id);
        if (!ticket) return;
        setFormData(prev => ({
            ...prev,
            ticketId: id,
            additionalNames: Array(ticket.maxPeople - 1).fill('')
        }));
    };

    // Validation states
    const [emailError, setEmailError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);

    // Form Validation helper
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone);

    // Handle Blur (check when user leaves the field)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'email') setEmailError(value.length > 0 && !validateEmail(value));
        if (name === 'phone') setPhoneError(value.length > 0 && !validatePhone(value));
    };

    // Form Validation
    const isFormValid = useMemo(() => (
        formData.fullName.trim() !== '' &&
        validateEmail(formData.email) &&
        validatePhone(formData.phone) &&
        formData.additionalNames.every(name => name.trim() !== '')
    ), [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) setShowConfirmModal(true);
    };

    // Loading Screen
    if (backendState.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-rose-50 border-t-rose-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const inputClasses = "w-full px-5 py-4 md:px-6 md:py-4 rounded-xl border-2 border-rose-100 bg-rose-50/10 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-50/50 outline-none transition-all text-[16px] md:text-[15px] font-medium text-rose-900 placeholder:text-rose-200 shadow-sm appearance-none";

    return (
        <div className="min-h-screen pb-16 md:pb-24 relative">
            <Header />

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
                            body: JSON.stringify({
                                fullName: formData.fullName,
                                email: formData.email,
                                phone: formData.phone,
                                ticketId: formData.ticketId,
                                additionalNames: formData.additionalNames,
                                wantsUpdates: formData.wantsUpdates
                            })
                        });

                        const data = await response.json();
                        if (data.success) {
                            setIsSuccess(true);
                        } else {
                            throw new Error(data.message);
                        }
                    } catch (error: any) {
                        console.error('Submission error:', error);
                        alert(error.message || 'Something went wrong during registration. Please try again.');
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
                ticket={selectedTicket}
                fullName={formData.fullName}
            />

            {isSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass">
                    <div className="max-w-md w-full bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-rose-100 text-center animate-entrance">
                        <div className="w-16 h-16 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-xl shadow-rose-200">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif text-rose-900 mb-4">See you there!</h2>
                        <p className="text-sm md:text-base text-rose-600/70 mb-8 font-medium leading-relaxed">Your registration has been confirmed. An official digital invite will arrive in your inbox shortly.</p>
                        <button onClick={() => window.location.reload()} className="w-full py-4 bg-rose-950 text-white rounded-xl font-bold tracking-widest text-[11px] uppercase hover:bg-black transition-all shadow-xl shadow-rose-100 active:scale-95">Close</button>
                    </div>
                </div>
            )}

            <main id="registration-form" className="max-w-4xl mx-auto px-4 md:px-6 -mt-12 md:-mt-24 relative z-20">
                <div className="bg-white/95 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_60px_-10px_rgba(157,23,77,0.1)] md:shadow-[0_40px_100px_-20px_rgba(157,23,77,0.1)] border border-white overflow-hidden glass">
                    <div className="p-6 md:p-12 relative">
                        <div className="text-center mb-8 md:mb-10">
                            <span className="inline-block px-4 py-1.5 bg-rose-50 text-rose-600 text-[9px] md:text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase rounded-full mb-4 md:mb-6 shadow-sm border border-rose-100">
                                Secure Your Spot
                            </span>
                            <h2 className="text-3xl md:text-5xl font-serif text-rose-950 mb-3 tracking-tighter italic leading-tight">
                                "Velvet Whispers and Gilded Grace"
                            </h2>
                            <p className="text-base md:text-lg font-display font-medium text-rose-900/60 max-w-2xl mx-auto italic leading-relaxed px-2">
                                "An evening of soft indulgence dedicated to the luminous power of enduring friendship."
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10 md:space-y-12">
                            {/* Identity Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 border-b border-rose-50 pb-4">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-rose-950 text-white flex items-center justify-center text-base md:text-lg font-serif italic shadow-lg shadow-rose-100">01</div>
                                    <h3 className="text-xl md:text-2xl font-serif text-rose-950 italic">Identity</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] md:tracking-[0.25em] px-1">Your Name</label>
                                        <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full name" className={inputClasses} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[9px] md:text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] md:tracking-[0.25em]">Mobile Number</label>
                                            {phoneError && <span className="text-[10px] font-bold text-red-500 animate-pulse">Enter 10 digits</span>}
                                        </div>
                                        <input
                                            required
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            placeholder="10-digit number"
                                            className={`${inputClasses} ${phoneError ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-red-50' : ''}`}
                                            maxLength={10}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[9px] md:text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] md:tracking-[0.25em]">Email Address</label>
                                            {emailError && <span className="text-[10px] font-bold text-red-500 animate-pulse">Invalid email address</span>}
                                        </div>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            placeholder="hello@friend.com"
                                            className={`${inputClasses} ${emailError ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-red-50' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Selection Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 border-b border-rose-50 pb-4">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-rose-950 text-white flex items-center justify-center text-base md:text-lg font-serif italic shadow-lg shadow-rose-100">02</div>
                                    <h3 className="text-xl md:text-2xl font-serif text-rose-950 italic">Selection</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="px-1 md:px-2">
                                        <h4 className="text-lg md:text-xl font-display font-bold text-gray-800">Registration Fee</h4>
                                        <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">₹{selectedTicket.price.toLocaleString('en-IN')}.00</p>
                                    </div>

                                    <div className="flex flex-col gap-3">
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

                                    {isEarlyBirdAvailable && (
                                        <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 inline-flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase">
                                                {TOTAL_EARLY_BIRD_SEATS - backendState.usedSeats} early bird spots left
                                            </span>
                                        </div>
                                    )}
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

                            {/* Contribution Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 border-b border-rose-50 pb-4">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-rose-950 text-white flex items-center justify-center text-base md:text-lg font-serif italic shadow-lg shadow-rose-100">03</div>
                                    <h3 className="text-xl md:text-2xl font-serif text-rose-950 italic">Contribution</h3>
                                </div>

                                <div className="bg-rose-50/30 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-white flex flex-col items-center lg:flex-row gap-6 md:gap-8 relative overflow-hidden group/payment">
                                    <div className="flex-1 space-y-4 relative z-10 w-full">
                                        <div className="space-y-2 text-center lg:text-left">
                                            <span className="text-[9px] md:text-[10px] font-bold text-rose-500 uppercase tracking-[0.3em] md:tracking-[0.4em]">UPI ID</span>
                                            <div className="flex items-center justify-center lg:justify-start gap-4 bg-white/50 p-4 rounded-2xl md:bg-transparent md:p-0">
                                                <span className="text-xl md:text-2xl font-bold text-rose-950 truncate max-w-[200px] md:max-w-none">galentine@upi</span>
                                                <button type="button"
                                                    className="p-3 bg-rose-100/50 md:hover:bg-rose-100 rounded-xl transition-colors active:scale-90"
                                                    onClick={() => { navigator.clipboard.writeText('galentine@upi'); alert('UPI ID Copied!'); }}>
                                                    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs md:text-sm text-rose-900/60 font-medium italic text-center lg:text-left">Scan the code or copy the ID above to finalize your registration.</p>
                                    </div>

                                    <div className="w-48 h-48 md:w-40 md:h-40 bg-white p-3 rounded-2xl shadow-sm border border-rose-50 flex items-center justify-center">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=galentine@upi&pn=Galentines&am=${selectedTicket.price}&cu=INR`}
                                            alt="Payment"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="text-center pt-2 md:pt-4">
                                <button
                                    disabled={isSubmitting || !isFormValid}
                                    className={`group relative w-full sm:w-auto px-10 md:px-20 py-5 md:py-6 rounded-full overflow-hidden transition-all duration-700 ${!isFormValid ? 'bg-rose-50 text-rose-200 cursor-not-allowed border border-rose-100' : 'hover:scale-[1.05] active:scale-95 shadow-xl shadow-rose-200'}`}
                                >
                                    {isFormValid && <div className="absolute inset-0 bg-rose-950 group-hover:bg-black transition-all duration-500"></div>}
                                    <span className="relative z-10 text-[10px] md:text-[11px] font-bold tracking-[0.3em] md:tracking-[0.5em] text-white uppercase">
                                        {isSubmitting ? 'Processing...' : 'Join the Celebration'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <footer className="mt-12 md:mt-16 text-center pb-8 md:pb-12 px-4">
                <p className="text-[9px] md:text-[10px] text-rose-400 font-bold tracking-[0.4em] md:tracking-[0.6em] uppercase">Ananya & Co. — Curated with Love — 2026</p>
            </footer>
        </div>
    );
}
