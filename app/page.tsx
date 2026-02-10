'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Header';
import Hero from './components/Hero';
import TicketCard from './components/TicketCard';
import AdditionalNames from './components/AdditionalNames';
import ConfirmModal from './components/ConfirmModal';
import { supabase } from './lib/supabase';
import { RegistrationFormData, Pass, TicketType } from './lib/types';
import { Send, Upload } from 'lucide-react';

export default function Home() {
    const [formData, setFormData] = useState<RegistrationFormData>({
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
    const [passes, setPasses] = useState<Pass[]>([]);
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
    const [paymentReceiptPreview, setPaymentReceiptPreview] = useState<string | null>(null);
    const [seatAvailability, setSeatAvailability] = useState<{
        earlyBird: { total: number; used: number; available: number };
        general: { total: number; used: number; available: number };
    }>({
        earlyBird: { total: 15, used: 0, available: 15 },
        general: { total: 15, used: 0, available: 15 }
    });

    useEffect(() => {
        const initApp = async () => {
            try {
                // Fetch seat configuration
                const { data: seatConfigData } = await supabase
                    .from('seat_config')
                    .select('*');

                if (seatConfigData) {
                    const earlyBirdConfig = seatConfigData.find(c => c.config_key === 'early_bird');
                    const generalConfig = seatConfigData.find(c => c.config_key === 'general');

                    setSeatAvailability({
                        earlyBird: {
                            total: earlyBirdConfig?.total_seats || 15,
                            used: earlyBirdConfig?.used_seats || 0,
                            available: (earlyBirdConfig?.total_seats || 15) - (earlyBirdConfig?.used_seats || 0)
                        },
                        general: {
                            total: generalConfig?.total_seats || 15,
                            used: generalConfig?.used_seats || 0,
                            available: (generalConfig?.total_seats || 15) - (generalConfig?.used_seats || 0)
                        }
                    });
                }

                // Fetch passes from database
                const { data: passesData, error: passesError } = await supabase
                    .from('passes')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                // If passes table doesn't exist or is empty, use fallback
                if (passesError || !passesData || passesData.length === 0) {
                    console.warn('Passes table not found or empty. Using fallback tickets.');
                    
                    // Fallback tickets
                    const fallbackTickets: TicketType[] = [
                        {
                            id: '1',
                            name: 'Early Bird Pass',
                            price: 249,
                            description: 'Special early access',
                            category: 'Individual' as any,
                            maxPeople: 1,
                            emoji: '🌸'
                        },
                        {
                            id: '2',
                            name: 'Regular Pass',
                            price: 449,
                            description: 'Standard Entry',
                            category: 'Individual' as any,
                            maxPeople: 1,
                            emoji: '🌷'
                        }
                    ];
                    
                    setTickets(fallbackTickets);
                    setFormData(prev => ({ ...prev, ticketId: fallbackTickets[0].id }));
                    setLoading(false);
                    return;
                }

                setPasses(passesData || []);

                // Convert passes to TicketType format
                const convertedTickets: TicketType[] = (passesData || []).map((pass) => ({
                    id: pass.id.toString(),
                    name: pass.title,
                    price: Number(pass.price),
                    description: pass.description || '',
                    category: pass.max_people === 1 ? 'Individual' as any : 
                              pass.max_people === 2 ? 'Duo' as any :
                              pass.max_people === 3 ? 'Trio' as any : 'Group' as any,
                    capacity: pass.total_seats > 0 ? pass.total_seats : undefined,
                    maxPeople: pass.max_people,
                    emoji: pass.emoji
                }));

                setTickets(convertedTickets);

                // Set initial ticket selection
                if (convertedTickets.length > 0) {
                    setFormData(prev => ({ ...prev, ticketId: convertedTickets[0].id }));
                }
            } catch (e) {
                console.error("Initialization error:", e);
            } finally {
                setLoading(false);
            }
        };
        initApp();
    }, []);

    const selectedTicket = useMemo(() => tickets.find(t => t.id === formData.ticketId) || tickets[0], [formData.ticketId, tickets]);

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
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) return;
        setFormData(prev => ({
            ...prev,
            ticketId: id,
            additionalNames: Array(ticket.maxPeople - 1).fill('')
        }));
    };

    const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (PNG, JPG, etc.)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setPaymentReceipt(file);

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPaymentReceiptPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const isFormValid = useMemo(() => (
        formData.fullName.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.phone.length === 10 &&
        formData.additionalNames.every(name => name.trim() !== '') &&
        paymentReceipt !== null
    ), [formData, paymentReceipt]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) setShowConfirmModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-rose-50 border-t-[#80183b] rounded-full animate-spin"></div>
            </div>
        );
    }

    const inputClasses = "w-full px-4 py-2.5 rounded-lg bg-[#f4f4f4] border-none outline-none focus:ring-1 focus:ring-gray-300 transition-all text-[14px] text-gray-800 placeholder:text-gray-400";

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <Hero />

            <div id="registration-form" className="max-w-3xl mx-auto px-6 py-20 bg-white">
                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Basic Info */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[14px] font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                            <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClasses} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[14px] font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                            <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} maxLength={10} className={inputClasses} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[14px] font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                            <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClasses} />
                        </div>
                    </div>


                    {/* Registration Fee */}
                    {selectedTicket && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[16px] font-medium text-gray-800">Registration Fee</h3>
                                <p className="text-[14px] text-gray-800">₹{selectedTicket.price.toLocaleString('en-IN')}.00</p>
                            </div>

                            {/* Seat Availability Indicator */}
                            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-100">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Early Bird Seats</p>
                                        <p className="text-lg font-bold text-[#80183b]">
                                            {seatAvailability.earlyBird.available}/{seatAvailability.earlyBird.total}
                                        </p>
                                        <p className="text-xs text-gray-500">available</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">General Seats</p>
                                        <p className="text-lg font-bold text-[#80183b]">
                                            {seatAvailability.general.available}/{seatAvailability.general.total}
                                        </p>
                                        <p className="text-xs text-gray-500">available</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                {tickets.map(ticket => {
                                    const pass = passes.find(p => p.id.toString() === ticket.id);
                                    const isEarlyBird = pass?.is_early_bird || false;
                                    const maxPeople = ticket.maxPeople;
                                    
                                    // Check if pass is sold out
                                    const isSoldOut = isEarlyBird 
                                        ? seatAvailability.earlyBird.available < maxPeople
                                        : seatAvailability.general.available < maxPeople;
                                    
                                    return (
                                        <TicketCard
                                            key={ticket.id}
                                            ticket={ticket}
                                            isSelected={formData.ticketId === ticket.id}
                                            onSelect={handleTicketSelect}
                                            disabled={isSoldOut}
                                        />
                                    );
                                })}
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
                    )}

                    {/* Payment Section */}
                    {selectedTicket && (
                        <div className="space-y-6 pt-8 border-t border-gray-100">
                            <div>
                                <h3 className="text-[16px] font-medium text-gray-800 mb-2">Payment Details</h3>
                                <p className="text-[14px] text-gray-600">
                                    Please complete the payment of <span className="font-semibold text-[#80183b]">₹{selectedTicket.price.toLocaleString('en-IN')}.00</span> using the QR code below
                                </p>
                            </div>

                            {/* QR Code Display */}
                            {passes.find(p => p.id.toString() === formData.ticketId)?.qr_code_base64 ? (
                                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <img
                                                src={passes.find(p => p.id.toString() === formData.ticketId)?.qr_code_base64}
                                                alt="Payment QR Code"
                                                className="w-80 h-80 object-contain"
                                            />
                                        </div>
                                        {passes.find(p => p.id.toString() === formData.ticketId)?.upi_id && (
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 mb-1">UPI ID</p>
                                                <p className="text-sm font-mono font-semibold text-gray-800 bg-white px-4 py-2 rounded-lg border border-gray-200">
                                                    {passes.find(p => p.id.toString() === formData.ticketId)?.upi_id}
                                                </p>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 text-center max-w-xs">
                                            Scan this QR code with any UPI app to complete your payment
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Payment QR code will be displayed here once configured by the admin.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Receipt */}
                    <div className="space-y-4">
                        <label className="text-[16px] font-medium text-gray-800">
                            Please attach your payment receipt <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleReceiptUpload}
                                required
                                className="block w-full text-sm text-gray-600
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-medium
                                    file:bg-[#80183b] file:text-white
                                    hover:file:bg-[#60122c]
                                    file:cursor-pointer cursor-pointer
                                    border border-gray-300 rounded-lg p-2"
                            />
                            {paymentReceiptPreview && (
                                <div className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={paymentReceiptPreview}
                                            alt="Payment Receipt Preview"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 mb-1">
                                                {paymentReceipt?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(paymentReceipt?.size! / 1024).toFixed(2)} KB
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPaymentReceipt(null);
                                                    setPaymentReceiptPreview(null);
                                                }}
                                                className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Updates */}
                    <div className="space-y-4">
                        <label className="text-[16px] font-medium text-gray-800 block">Would you like to receive updates about our other events? <span className="text-red-500">*</span></label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="updates" 
                                    checked={formData.wantsUpdates === true}
                                    onChange={() => setFormData({...formData, wantsUpdates: true})}
                                    className="sr-only peer"
                                />
                                <div className="w-4 h-4 rounded-full border border-gray-300 bg-white flex items-center justify-center peer-checked:border-gray-500">
                                    {formData.wantsUpdates === true && <div className="w-2 h-2 rounded-full bg-gray-500" />}
                                </div>
                                <span className="text-[14px] text-gray-800">Yes</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="updates" 
                                    checked={formData.wantsUpdates === false}
                                    onChange={() => setFormData({...formData, wantsUpdates: false})}
                                    className="sr-only peer"
                                />
                                <div className="w-4 h-4 rounded-full border border-gray-300 bg-white flex items-center justify-center peer-checked:border-gray-500">
                                    {formData.wantsUpdates === false && <div className="w-2 h-2 rounded-full bg-gray-500" />}
                                </div>
                                <span className="text-[14px] text-gray-800">No</span>
                            </label>
                        </div>
                    </div>

                    {/* Review and Submit */}
                    <div className="space-y-6 pt-10">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-medium text-gray-800">Review and submit</h2>
                            <p className="text-[14px] text-gray-600">Please review your response before submitting it for processing.</p>
                        </div>

                        <div className="flex justify-start items-center">
                            <button
                                disabled={isSubmitting || !isFormValid}
                                type="submit"
                                className="flex items-center gap-2 px-8 py-3 bg-[#80183b] text-white rounded-lg hover:bg-[#60122c] transition-all disabled:bg-gray-400 font-medium tracking-wide uppercase text-xs"
                            >
                                <Send className="w-4 h-4" />
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
                        // Create FormData for file upload
                        const submitData = new FormData();
                        submitData.append('fullName', formData.fullName);
                        submitData.append('email', formData.email);
                        submitData.append('phone', formData.phone);
                        submitData.append('ticketId', formData.ticketId);
                        submitData.append('additionalNames', JSON.stringify(formData.additionalNames));
                        submitData.append('wantsUpdates', formData.wantsUpdates.toString());
                        
                        if (paymentReceipt) {
                            submitData.append('paymentReceipt', paymentReceipt);
                        }

                        const response = await fetch('/api/register', {
                            method: 'POST',
                            body: submitData
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
