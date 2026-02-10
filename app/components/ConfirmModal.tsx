import React from 'react';
import { TicketType } from '../lib/types';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    ticket: TicketType;
    fullName: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, ticket, fullName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    <h3 className="text-xl font-medium text-gray-800 text-center mb-6">Review your registration</h3>

                    <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Name</span>
                            <span className="text-[15px] font-medium text-gray-800">{fullName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pass</span>
                            <span className="text-[15px] font-medium text-gray-800">{ticket.name}</span>
                        </div>
                        <div className="h-[1px] bg-gray-200 w-full"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
                            <span className="text-xl font-bold text-[#80183b]">₹{ticket.price.toLocaleString('en-IN')}.00</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onConfirm}
                            className="w-full py-4 bg-[#80183b] text-white text-sm font-bold rounded-lg hover:bg-[#60122c] transition-all uppercase tracking-widest"
                        >
                            Submit Application
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
