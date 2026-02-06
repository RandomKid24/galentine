import React from 'react';
import { TicketType } from '../types';

interface TicketCardProps {
  ticket: TicketType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, isSelected, onSelect, disabled }) => {
  const HeartIcon = ({ className }: { className: string }) => (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );

  return (
    <div 
      onClick={() => !disabled && onSelect(ticket.id)}
      className={`
        group flex items-center gap-4 py-5 px-5 rounded-[1.5rem] transition-all duration-500 border-2 relative
        ${isSelected 
          ? 'bg-rose-50/60 border-rose-400 shadow-[0_10px_30px_-10px_rgba(219,39,119,0.2)]' 
          : 'bg-white border-rose-100/50 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/20'}
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="relative">
        <div className={`
          w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative z-10
          ${isSelected 
            ? 'border-rose-500 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
            : 'border-rose-200 bg-white group-hover:border-rose-300 shadow-inner'}
          ${disabled ? 'bg-gray-100 border-gray-200' : ''}
        `}>
          {isSelected && !disabled && (
            <div className="animate-entrance">
              <HeartIcon className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        {isSelected && !disabled && (
          <div className="absolute top-1/2 left-1/2 pointer-events-none z-0">
            <HeartIcon className="absolute w-5 h-5 text-rose-400 animate-heart-burst-1 opacity-0" />
            <HeartIcon className="absolute w-4 h-4 text-rose-300 animate-heart-burst-2 opacity-0" />
            <HeartIcon className="absolute w-6 h-6 text-rose-500 animate-heart-burst-3 opacity-0" />
          </div>
        )}
      </div>

      <div className={`text-3xl flex-shrink-0 transition-all duration-500 ${disabled ? 'opacity-30' : 'transform group-hover:scale-110'}`}>
        {ticket.emoji}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-grow gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-[15px] font-bold tracking-tight transition-colors duration-500 ${isSelected ? 'text-rose-950' : 'text-gray-700'}`}>
              {ticket.name}
            </span>
            {disabled && (
              <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-[9px] font-black uppercase rounded-full tracking-tighter">
                Sold Out
              </span>
            )}
          </div>
          <span className={`text-[11px] font-medium transition-colors duration-500 ${isSelected ? 'text-rose-600/80' : 'text-gray-400'}`}>
            {ticket.description}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-lg font-black font-display transition-colors duration-500 ${isSelected ? 'text-rose-600' : 'text-gray-900'}`}>
            ₹{ticket.price.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;