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
    wantsUpdates: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [aiGreeting, setAiGreeting] = useState<{ title: string; subtitle: string } | null>(null);
  const [backendState, setBackendState] = useState<{ usedSeats: number; loading: boolean }>({
    usedSeats: USED_EARLY_BIRD_SEATS,
    loading: true
  });

  useEffect(() => {
    const initApp = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Generate a poetic title and a one-sentence elegant subtitle for a Galentine's party registration page called 'Velvet Whispers and Gilded Grace'. Focus on luxury, friendship, and softness. No emojis. Format as JSON with 'title' and 'subtitle' keys.",
          config: { responseMimeType: "application/json" }
        });
        
        const data = JSON.parse(response.text || '{"title": "Velvet Whispers and Gilded Grace", "subtitle": "An evening of soft indulgence dedicated to the luminous power of enduring friendship."}');
        setAiGreeting(data);
        setBackendState({ usedSeats: USED_EARLY_BIRD_SEATS, loading: false });
        
        const initialTicket = USED_EARLY_BIRD_SEATS >= TOTAL_EARLY_BIRD_SEATS 
          ? TICKETS.find(t => t.id === 'regular-pass')?.id || TICKETS[1].id
          : TICKETS[0].id;
        
        setFormData(prev => ({ ...prev, ticketId: initialTicket }));
      } catch (e) {
        setAiGreeting({ 
          title: "Velvet Whispers and Gilded Grace", 
          subtitle: "An evening of soft indulgence dedicated to the luminous power of enduring friendship." 
        });
        setBackendState({ usedSeats: USED_EARLY_BIRD_SEATS, loading: false });
      }
    };
    initApp();
  }, []);

  const isEarlyBirdAvailable = useMemo(() => backendState.usedSeats < TOTAL_EARLY_BIRD_SEATS, [backendState.usedSeats]);
  const selectedTicket = useMemo(() => TICKETS.find(t => t.id === formData.ticketId) || TICKETS[1], [formData.ticketId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
    formData.email.includes('@') && 
    formData.phone.trim().length === 10 &&
    formData.additionalNames.every(name => name.trim() !== '')
  ), [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) setShowConfirmModal(true);
  };

  if (backendState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-rose-50 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputClasses = "w-full px-6 py-4 rounded-xl border-2 border-rose-100 bg-rose-50/10 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-50/50 outline-none transition-all text-[15px] font-medium text-rose-900 placeholder:text-rose-200 shadow-sm";

  return (
    <div className="min-h-screen pb-24 relative">
      <Header />

      <ConfirmModal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)} 
        onConfirm={async () => {
          setShowConfirmModal(false);
          setIsSubmitting(true);
          await new Promise(r => setTimeout(r, 2000));
          setIsSuccess(true);
          setIsSubmitting(false);
        }} 
        ticket={selectedTicket} 
        fullName={formData.fullName} 
      />

      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 glass">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl border border-rose-100 text-center animate-entrance">
            <div className="w-16 h-16 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-serif text-rose-900 mb-4">See you there!</h2>
            <p className="text-rose-600/70 mb-8 font-medium leading-relaxed">Your registration has been confirmed. An official digital invite will arrive in your inbox shortly.</p>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-rose-950 text-white rounded-xl font-bold tracking-widest text-[11px] uppercase hover:bg-black transition-all shadow-xl shadow-rose-100">Close</button>
          </div>
        </div>
      )}

      <main id="registration-form" className="max-w-4xl mx-auto px-6 -mt-24 relative z-20">
        <div className="bg-white/95 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(157,23,77,0.1)] border border-white overflow-hidden glass">
          <div className="p-8 md:p-12 relative">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-bold tracking-[0.4em] uppercase rounded-full mb-6 shadow-sm border border-rose-100">
                Secure Your Spot
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-rose-950 mb-3 tracking-tighter italic">
                {aiGreeting?.title}
              </h2>
              <p className="text-lg font-display font-medium text-rose-900/60 max-w-2xl mx-auto italic leading-relaxed">
                {aiGreeting?.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Identity Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-5 border-b border-rose-50 pb-4">
                   <div className="w-10 h-10 rounded-2xl bg-rose-950 text-white flex items-center justify-center text-lg font-serif italic shadow-lg shadow-rose-100">01</div>
                   <h3 className="text-2xl font-serif text-rose-950 italic">Identity</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.25em] px-1">Your Name</label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Your name" className={inputClasses} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.25em] px-1">Mobile Number</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className={inputClasses} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.25em] px-1">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Invite destination" className={inputClasses} />
                  </div>
                </div>
              </div>

              {/* Selection Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-5 border-b border-rose-50 pb-4">
                   <div className="w-10 h-10 rounded-2xl bg-rose-950 text-white flex items-center justify-center text-lg font-serif italic shadow-lg shadow-rose-100">02</div>
                   <h3 className="text-2xl font-serif text-rose-950 italic">Selection</h3>
                </div>

                <div className="space-y-6">
                  <div className="px-2">
                    <h4 className="text-xl font-display font-bold text-gray-800">Registration Fee</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{selectedTicket.price.toLocaleString('en-IN')}.00</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
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
                      <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">
                        Only {TOTAL_EARLY_BIRD_SEATS - backendState.usedSeats} early bird spots left
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
                    setFormData({...formData, additionalNames: n});
                  }} 
                />
              </div>

              {/* Contribution Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-5 border-b border-rose-50 pb-4">
                   <div className="w-10 h-10 rounded-2xl bg-rose-950 text-white flex items-center justify-center text-lg font-serif italic shadow-lg shadow-rose-100">03</div>
                   <h3 className="text-2xl font-serif text-rose-950 italic">Contribution</h3>
                </div>
                
                <div className="bg-rose-50/30 rounded-[2.5rem] p-6 md:p-8 border border-white flex flex-col lg:flex-row gap-8 items-center relative overflow-hidden group/payment">
                  <div className="flex-1 space-y-4 relative z-10">
                    <div className="space-y-2 text-center lg:text-left">
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.4em]">UPI ID</span>
                      <div className="flex items-center justify-center lg:justify-start gap-4">
                         <span className="text-2xl font-bold text-rose-950">galentine@upi</span>
                         <button type="button" 
                           className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
                           onClick={() => {navigator.clipboard.writeText('galentine@upi'); alert('UPI ID Copied!');}}>
                           <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                         </button>
                      </div>
                    </div>
                    <p className="text-sm text-rose-900/60 font-medium italic text-center lg:text-left">Scan the code or use the ID to finalize your request.</p>
                  </div>
                  
                  <div className="w-40 aspect-square bg-white p-3 rounded-2xl shadow-sm border border-rose-50">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=galentine@upi&pn=Galentines&am=${selectedTicket.price}&cu=INR`} 
                      alt="Payment" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <button 
                  disabled={isSubmitting || !isFormValid} 
                  className={`group relative px-20 py-6 rounded-full overflow-hidden transition-all duration-700 ${!isFormValid ? 'bg-rose-50 text-rose-200 cursor-not-allowed border border-rose-100' : 'hover:scale-[1.05] active:scale-95 shadow-xl shadow-rose-200'}`}
                >
                  {isFormValid && <div className="absolute inset-0 bg-rose-950 group-hover:bg-black transition-all duration-500"></div>}
                  <span className="relative z-10 text-[11px] font-bold tracking-[0.5em] text-white uppercase">
                    {isSubmitting ? 'Processing...' : 'Join the Celebration'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center pb-12">
         <p className="text-[10px] text-rose-400 font-bold tracking-[0.6em] uppercase">Ananya & Co. — Curated with Love — 2026</p>
      </footer>
    </div>
  );
};

export default App;