
import React from 'react';
import { TicketType, TicketCategory } from '../types';

interface TicketCardProps {
  ticket: TicketType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, isSelected, onSelect, disabled }) => {
  const renderIcon = () => {
    switch (ticket.category) {
      case TicketCategory.INDIVIDUAL:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />;
      case TicketCategory.DUO:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
      case TicketCategory.TRIO:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />;
      case TicketCategory.GROUP:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />;
      default:
        return null;
    }
  };

  return (
    <div 
      onClick={() => !disabled && onSelect(ticket.id)}
      className={`
        relative p-8 rounded-[2rem] border-2 select-none h-full flex flex-col transition-all duration-300
        ${isSelected 
          ? 'border-pink-500 bg-pink-50/40 shadow-xl shadow-pink-100/30' 
          : 'border-gray-100 bg-white hover:border-pink-200 hover:shadow-md'}
        ${disabled ? 'opacity-40 cursor-not-allowed border-gray-100' : 'cursor-pointer'}
      `}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3.5 rounded-2xl transition-all duration-300 ${isSelected ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-600'}`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {renderIcon()}
          </svg>
        </div>
        {isSelected && (
          <div className="bg-pink-600 rounded-full p-1.5 shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <h3 className={`font-black text-2xl mb-1 tracking-tight leading-none ${isSelected ? 'text-pink-900' : 'text-gray-900'}`}>
          {ticket.name}
        </h3>
        <p className={`text-[10px] font-black uppercase tracking-widest mb-8 ${isSelected ? 'text-pink-600' : 'text-gray-400'}`}>
          {ticket.description}
        </p>
      </div>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-end gap-1">
          <span className="text-3xl font-serif font-black text-gray-900">₹{ticket.price}</span>
          <span className="text-[10px] font-black text-gray-400 mb-1 ml-1 uppercase">/ {ticket.maxPeople === 1 ? 'Pass' : 'Guest'}</span>
        </div>
        {ticket.id === 'early-bird' && !disabled && (
          <span className="text-[9px] font-black bg-rose-600 text-white px-3 py-1 rounded-full uppercase">
            Active
          </span>
        )}
      </div>

      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-[2rem]">
          <span className="bg-gray-900 text-white text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest shadow-lg">
            Unavailable
          </span>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
