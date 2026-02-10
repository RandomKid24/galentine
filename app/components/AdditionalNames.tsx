import React from 'react';

interface AdditionalNamesProps {
    count: number;
    names: string[];
    primaryName: string;
    onChange: (index: number, value: string) => void;
}

const AdditionalNames: React.FC<AdditionalNamesProps> = ({ count, names, primaryName, onChange }) => {
    if (count <= 1) return null;

    const inputClasses = "w-full px-4 py-2.5 rounded-lg bg-[#f4f4f4] border-none outline-none focus:ring-1 focus:ring-gray-300 transition-all text-[14px] text-gray-800 placeholder:text-gray-400";

    return (
        <div className="mt-8 space-y-8 animate-entrance">
            <div className="h-[1px] bg-gray-100 w-full" />
            
            <div className="space-y-6">
                <h4 className="text-[16px] font-medium text-gray-800">Additional Guest Details</h4>
                
                <div className="space-y-6">
                    {Array.from({ length: count - 1 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <label className="text-[14px] font-medium text-gray-700">Guest {i + 2} Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={names[i] || ''}
                                onChange={(e) => onChange(i, e.target.value)}
                                placeholder="Enter full name"
                                className={inputClasses}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdditionalNames;
