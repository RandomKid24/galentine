import React from 'react';

interface AdditionalNamesProps {
    count: number;
    names: string[];
    primaryName: string;
    onChange: (index: number, value: string) => void;
}

/**
 * AdditionalNames Component
 * Renders input fields for additional guests based on the selected ticket capacity.
 * Displays the primary registrant as the host.
 */
const AdditionalNames: React.FC<AdditionalNamesProps> = ({ count, names, primaryName, onChange }) => {
    if (count <= 1) return null;

    return (
        <div className="mt-8 p-6 md:p-10 bg-rose-50/40 rounded-[2.5rem] border-2 border-white shadow-xl animate-entrance relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-10 -right-10 opacity-[0.05] pointer-events-none">
                <svg width="250" height="250" viewBox="0 0 24 24" fill="currentColor" className="text-rose-950">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </div>

            <div className="flex flex-col items-center gap-1 mb-10 text-center relative z-10">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] mb-2">The Guest List</span>
                <h4 className="text-4xl font-serif text-rose-950 italic">Who's in your circle?</h4>
                <div className="w-12 h-1 bg-rose-200 rounded-full mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* Host Slot */}
                <div className="space-y-3 group">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Registrant 1</label>
                        <span className="text-[10px] font-bold text-rose-400 italic">Hosting</span>
                    </div>
                    <div className="w-full px-6 py-5 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-100/20 text-[16px] font-bold text-rose-950 shadow-inner flex items-center gap-3">
                        <span className="opacity-50 text-rose-400">🌷</span>
                        {primaryName || "Awaiting your name..."}
                    </div>
                </div>

                {/* Guest Slots */}
                {Array.from({ length: count - 1 }).map((_, i) => (
                    <div key={i} className="space-y-3 animate-entrance" style={{ animationDelay: `${0.1 * (i + 1)}s` }}>
                        <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Guest {i + 2}</label>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={names[i] || ''}
                                onChange={(e) => onChange(i, e.target.value)}
                                placeholder={`Her beautiful name...`}
                                className="w-full px-6 py-5 rounded-2xl border-2 border-white bg-white/90 focus:border-rose-400 focus:bg-white focus:ring-8 focus:ring-rose-50/30 outline-none transition-all text-[16px] font-bold text-rose-950 shadow-md placeholder:text-rose-200 placeholder:italic"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl opacity-30">✨</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdditionalNames;
