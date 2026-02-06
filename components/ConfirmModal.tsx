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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-pink-900/30 backdrop-blur-md"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-[0_48px_100px_rgba(236,72,153,0.3)] border border-pink-50 overflow-hidden animate-fade-in-up">
        <div className="p-12">
          <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-serif font-medium text-pink-950 text-center mb-2">Final verification</h3>
          <p className="text-xs text-pink-400 text-center mb-12 font-bold tracking-widest uppercase">Ready to celebrate?</p>
          
          <div className="space-y-6 mb-12 bg-pink-50/30 p-8 rounded-[2rem] border border-pink-100/50">
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">Name</span>
              <span className="text-base font-bold text-pink-900">{fullName || 'A friend'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">Pass</span>
              <span className="text-base font-bold text-pink-900">{ticket.name}</span>
            </div>
            <div className="h-[1px] bg-pink-100 w-full"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">Total contribution</span>
              <span className="text-2xl font-serif font-medium text-pink-600">₹{ticket.price}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={onConfirm}
              className="w-full py-5 bg-pink-600 text-white text-sm font-bold rounded-2xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-200 active:scale-95"
            >
              Confirm and Register
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-xs text-pink-300 font-bold hover:text-pink-500 transition-colors tracking-widest uppercase"
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