
import React from 'react';

interface AdditionalNamesProps {
  count: number;
  names: string[];
  onChange: (index: number, value: string) => void;
}

const AdditionalNames: React.FC<AdditionalNamesProps> = ({ count, names, onChange }) => {
  if (count <= 1) return null;

  return (
    <div className="mt-16 p-10 bg-gray-50/80 rounded-[2.5rem] border-2 border-gray-100 animate-in fade-in slide-in-from-top-6 duration-700 shadow-inner">
      <div className="flex items-center gap-5 mb-8">
        <div className="h-0.5 flex-grow bg-gray-200"></div>
        <span className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">Companion Registry</span>
        <div className="h-0.5 flex-grow bg-gray-200"></div>
      </div>
      
      <p className="text-gray-500 font-bold mb-10 text-center text-sm">Please identify the additional participants included in this invitation pass.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: count - 1 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Guest #{i + 2} Full Name</label>
            <input
              type="text"
              required
              value={names[i] || ''}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder={`Identify guest`}
              className="w-full px-6 py-5 rounded-2xl border-2 border-white focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-50/50 outline-none transition-all text-gray-900 bg-white shadow-sm font-medium"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdditionalNames;
