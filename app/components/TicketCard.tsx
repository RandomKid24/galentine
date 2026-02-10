import React from 'react';
import { TicketType } from '../lib/types';

interface TicketCardProps {
    ticket: TicketType;
    isSelected: boolean;
    onSelect: (id: string) => void;
    disabled?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, isSelected, onSelect, disabled }) => {
    return (
        <label
            className={`flex items-center gap-3 cursor-pointer group transition-all ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
        >
            <div className="relative flex items-center justify-center">
                <input
                    type="radio"
                    name="ticket"
                    checked={isSelected}
                    onChange={() => !disabled && onSelect(ticket.id)}
                    disabled={disabled}
                    className="peer sr-only"
                />
                <div className="w-4 h-4 rounded-full border border-gray-300 bg-white flex items-center justify-center transition-all peer-checked:border-gray-500">
                    {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 text-[14px] font-medium text-gray-800">
                <span className="text-xl">{ticket.emoji}</span>
                <span>{ticket.name}</span>
                <span className="text-gray-500 font-normal">₹{ticket.price.toLocaleString('en-IN')}.00</span>
            </div>
        </label>
    );
};

export default TicketCard;
