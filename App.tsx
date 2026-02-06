
import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Header from './components/Header';
import TicketCard from './components/TicketCard';
import AdditionalNames from './components/AdditionalNames';
import ConfirmModal from './components/ConfirmModal';
import { TICKETS, TOTAL_EARLY_BIRD_SEATS, USED_EARLY_BIRD_SEATS } from './constants';
import { FormData } from './types';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    ticketId: '',
    additionalNames: [],
    wantsUpdates: true,
    paymentReceipt: null
  });

  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; phone?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [aiQuote, setAiQuote] = useState<string | null>(null);
  const [backendState, setBackendState] = useState<{ usedSeats: number; loading: boolean }>({
    usedSeats: USED_EARLY_BIRD_SEATS,
    loading: true
  });

  useEffect(() => {
    const initApp = async () => {
      try {
        await new Promise(r => setTimeout(r, 800));
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Generate a sophisticated greeting for a high-end private feminine event. One short sentence only. No emojis.",
        });
        
        setAiQuote(response.text?.trim() || "A sanctuary for grace, friendship, and the beauty of shared paths.");
        setBackendState({ 
          usedSeats: USED_EARLY_BIRD_SEATS, 
          loading: false 
        });
        setFormData(prev => ({ ...prev, ticketId: TICKETS[0].id }));
      } catch (e) {
        setBackendState({ usedSeats: USED_EARLY_BIRD_SEATS, loading: false });
      }
    };
    initApp();
  }, []);

  const isEarlyBirdAvailable = useMemo(() => {
    return backendState.usedSeats < TOTAL_EARLY_BIRD_SEATS;
  }, [backendState.usedSeats]);

  const selectedTicket = useMemo(() => {
    return TICKETS.find(t => t.id === formData.ticketId) || TICKETS[1];
  }, [formData.ticketId]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return undefined;
    return re.test(email) ? undefined : 'Please enter a valid email address';
  };

  const validatePhone = (phone: string) => {
    const re = /^[6-9]\d{9}$/; 
    if (!phone) return undefined;
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length > 0 && cleanPhone.length !== 10) return 'Phone number must be 10 digits';
    return re.test(cleanPhone) ? undefined : 'Please enter a valid 10-digit mobile number';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'email') setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    if (name === 'phone') setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleTicketSelect = (id: string) => {
    const ticket = TICKETS.find(t => t.id === id);
    setFormData(prev => ({
      ...prev,
      ticketId: id,
      additionalNames: Array(ticket ? ticket.maxPeople - 1 : 0).fill('')
    }));
  };

  const handleAdditionalNameChange = (index: number, value: string) => {
    setFormData(prev => {
      const newNames = [...prev.additionalNames];
      newNames[index] = value;
      return { ...prev, additionalNames: newNames };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, paymentReceipt: e.target.files![0] }));
    }
  };

  const isFormValid = useMemo(() => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      !errors.email &&
      !errors.phone &&
      formData.paymentReceipt !== null
    );
  }, [formData, errors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setTouched({ email: true, phone: true });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsSubmitting(false);
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (backendState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-black text-gray-400 tracking-[0.4em] uppercase">Initializing</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-soft-gradient">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl text-center border border-pink-50 animate-fade-up">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-serif font-black text-gray-900 mb-4">Request Logged</h2>
          <p className="text-gray-600 text-lg mb-10 leading-relaxed font-medium">
            Your application is being processed. Expect an invitation link via email shortly.
          </p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="w-full py-5 bg-pink-600 text-white rounded-2xl font-black shadow-xl hover:bg-pink-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 bg-soft-gradient">
      <Header />
      
      <ConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalSubmit}
        ticket={selectedTicket}
        fullName={formData.fullName}
      />

      <main id="registration-form" className="max-w-6xl mx-auto px-6 -mt-32 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(190,24,93,0.1)] overflow-hidden border border-white">
          <div className="p-8 md:p-16">
            <div className="mb-20 text-center">
              <span className="bg-pink-100 text-pink-700 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest mb-8 inline-block">Secure Admission</span>
              <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-8 font-black tracking-tight leading-tight">The Registry</h2>
              {aiQuote && (
                <p className="text-gray-600 italic font-elegant text-2xl max-w-2xl mx-auto animate-fade-up leading-relaxed font-medium">
                  "{aiQuote}"
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-24">
              <section>
                <div className="flex items-center gap-4 mb-12 pb-5 border-b border-pink-50">
                  <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Personal Profile</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                    <input
                      required
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Ananya Sharma"
                      className="w-full px-7 py-5 rounded-2xl border-2 border-gray-100 focus:border-pink-500 focus:bg-white outline-none transition-all text-gray-900 bg-gray-50/50 text-lg font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contact Link</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onBlur={handleBlur}
                      onChange={handleInputChange}
                      placeholder="10-digit primary"
                      className={`w-full px-7 py-5 rounded-2xl border-2 outline-none transition-all text-gray-900 bg-gray-50/50 text-lg font-medium
                        ${touched.phone && errors.phone ? 'border-rose-300 bg-rose-50' : 'border-gray-100 focus:border-pink-500 focus:bg-white'}`}
                    />
                    {touched.phone && errors.phone && <p className="text-xs text-rose-500 font-bold ml-2 tracking-wide">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Digital Address</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onBlur={handleBlur}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={`w-full px-7 py-5 rounded-2xl border-2 outline-none transition-all text-gray-900 bg-gray-50/50 text-lg font-medium
                        ${touched.email && errors.email ? 'border-rose-300 bg-rose-50' : 'border-gray-100 focus:border-pink-500 focus:bg-white'}`}
                    />
                    {touched.email && errors.email && <p className="text-xs text-rose-500 font-bold ml-2 tracking-wide">{errors.email}</p>}
                  </div>
                </div>
              </section>

              <section>
                <div className="flex justify-between items-end mb-12 pb-5 border-b border-pink-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Pass Allocation</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
                      {isEarlyBirdAvailable ? 'Limited Offer Active' : 'Regular Admission'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
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
                  onChange={handleAdditionalNameChange}
                />
              </section>

              <section className="bg-gray-50/50 rounded-[3rem] p-10 md:p-16 border border-gray-100">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Investment</h3>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 items-start">
                  <div className="flex-1 space-y-10">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount Due</span>
                      <span className="text-4xl font-serif font-black text-pink-700">₹{selectedTicket.price}</span>
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Steps to finalize:</p>
                      <ul className="space-y-6">
                        <li className="flex items-start gap-5 text-gray-600">
                          <span className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 flex-shrink-0 flex items-center justify-center text-xs font-black">1</span>
                          <span className="text-sm font-medium">Scan QR and complete the transaction.</span>
                        </li>
                        <li className="flex items-start gap-5 text-gray-600">
                          <span className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 flex-shrink-0 flex items-center justify-center text-xs font-black">2</span>
                          <span className="text-sm font-bold text-gray-900">UPI: galentine@upi</span>
                        </li>
                        <li className="flex items-start gap-5 text-gray-600">
                          <span className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 flex-shrink-0 flex items-center justify-center text-xs font-black">3</span>
                          <span className="text-sm font-medium">Upload the confirmation screenshot artifact.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="w-full lg:w-64 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center gap-4 mx-auto">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=galentine@upi&pn=Galentines&am=${selectedTicket.price}&cu=INR`} 
                      alt="Payment QR" 
                      className="w-full aspect-square grayscale-[0.5] hover:grayscale-0 transition-all duration-500"
                    />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Secure Gateway</p>
                  </div>
                </div>

                <div className="mt-16">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-5 ml-1">Artifact Upload</label>
                  <div className="relative group">
                    <input required type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className={`w-full py-14 px-10 border-2 border-dashed rounded-[2.5rem] transition-all duration-300 flex flex-col items-center gap-5 ${formData.paymentReceipt ? 'bg-white border-pink-400' : 'bg-white/70 border-gray-200 group-hover:border-pink-300'}`}>
                      {formData.paymentReceipt ? (
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="text-gray-900 font-bold truncate max-w-sm">{formData.paymentReceipt.name}</span>
                        </div>
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-pink-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-gray-400 font-bold text-lg tracking-tight">Attach Payment Artifact</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-10 text-center space-y-8">
                <button
                  disabled={isSubmitting || !isFormValid}
                  className={`px-24 py-7 rounded-[2rem] font-black text-xl tracking-[0.1em] shadow-2xl transition-all uppercase
                    ${isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : !isFormValid ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200' : 'bg-pink-600 text-white hover:bg-pink-700 hover:scale-[1.02] active:scale-95'}`}
                >
                  {isSubmitting ? 'Processing...' : 'Complete Registry'}
                </button>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.6em]">Invitation Only Experience</p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="mt-40 text-center pb-24">
         <div className="w-24 h-[1px] bg-pink-100 mx-auto mb-10 opacity-60"></div>
         <p className="text-xs text-gray-400 font-black tracking-[0.5em] uppercase">Curated by Ananya & Co.</p>
      </footer>
    </div>
  );
};

export default App;
