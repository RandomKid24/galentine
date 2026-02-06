import React from 'react';
import { TicketType } from '../types';

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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-pink-900/30 backdrop-blur-md"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[2rem] md:rounded-[3rem] shadow-[0_48px_100px_rgba(236,72,153,0.3)] border border-pink-50 overflow-hidden animate-fade-in-up">
        <div className="p-8 md:p-12">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-xl md:text-2xl font-serif font-medium text-pink-950 text-center mb-2">Final verification</h3>
          <p className="text-[9px] md:text-xs text-pink-400 text-center mb-8 md:mb-12 font-bold tracking-widest uppercase">Ready to celebrate?</p>
          
          <div className="space-y-4 md:space-y-6 mb-8 md:mb-12 bg-pink-50/30 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-pink-100/50">
            <div className="flex justify-between items-center py-1">
              <span className="text-[9px] md:text-xs font-bold text-pink-300 uppercase tracking-widest">Name</span>
              <span className="text-sm md:text-base font-bold text-pink-900 truncate max-w-[150px]">{fullName || 'A friend'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[9px] md:text-xs font-bold text-pink-300 uppercase tracking-widest">Pass</span>
              <span className="text-sm md:text-base font-bold text-pink-900">{ticket.name}</span>
            </div>
            <div className="h-[1px] bg-pink-100 w-full"></div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[9px] md:text-xs font-bold text-pink-300 uppercase tracking-widest">Total</span>
              <span className="text-xl md:text-2xl font-serif font-medium text-pink-600">₹{ticket.price}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 md:py-5 bg-pink-600 text-white text-sm font-bold rounded-2xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-200 active:scale-95"
            >
              Confirm and Register
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-[10px] md:text-xs text-pink-300 font-bold hover:text-pink-500 transition-colors tracking-widest uppercase"
            >
              Needs a quick edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;