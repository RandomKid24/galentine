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
        earlyBird: { total: 11, used: 0, available: 11 },
        general: { total: 19, used: 0, available: 19 }
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

                            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-100">
                                <div className="text-center">
                                    <p className="text-xs text-gray-600 mb-1">Early Bird Seats</p>
                                    <p className="text-lg font-bold text-[#80183b]">
                                        {seatAvailability?.earlyBird?.available ?? 0}/{seatAvailability?.earlyBird?.total ?? 11}
                                    </p>
                                    <p className="text-xs text-gray-500">available</p>
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
                        
                        {/* Social Media Links - Show when Yes is selected */}
                        {formData.wantsUpdates === true && (
                            <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100">
                                <p className="text-sm text-gray-700 mb-3 font-medium">Follow us for updates:</p>
                                <div className="flex gap-4">
                                    <a 
                                        href="https://www.instagram.com/sharedsmilesco?igsh=MWIwdWVoazg3MDBvMQ==" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>
                                        <span className="text-sm font-medium">Instagram</span>
                                    </a>
                                    
                                    <a 
                                        href="https://chat.whatsapp.com/EdrJL4XrBKG9Du2HVVse2J?mode=gi_t" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                        </svg>
                                        <span className="text-sm font-medium">WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        )}
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
            <footer className="w-full py-16 flex flex-col items-center gap-8 bg-gradient-to-b from-transparent to-[#f8c0ca]/30">
                <div className="flex flex-col items-center gap-4">
                    <img 
                        src="/logo1.png" 
                        alt="sharedsmilesco logo" 
                        className="h-40 w-auto hover:scale-105 transition-all duration-300"
                    />
                    <div className="text-center space-y-2">
                        <div className="pt-4 border-t border-pink-200/50 w-full max-w-sm mx-auto">
                            <p className="text-[12px] md:text-[14px] text-gray-400">
                                © 2026 <a href="https://www.beforth.in/" target="_blank" rel="noopener noreferrer" className="hover:text-[#80183b] transition-colors font-medium underline underline-offset-2">Beforth.in</a> X Sharedsmilesco - Go forth with BeForth
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
