
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-rose-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-pink-100 overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        <div className="p-8 md:p-10">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1:v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-2 font-serif italic">Review Registration</h3>
          <p className="text-sm text-gray-500 text-center mb-8 font-elegant italic">Please double check your details before we finalize your application.</p>
          
          <div className="space-y-4 bg-pink-50/50 p-6 rounded-2xl border border-pink-100 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Applicant</span>
              <span className="text-sm font-bold text-gray-700">{fullName || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Pass Type</span>
              <span className="text-sm font-bold text-gray-700 font-serif italic">{ticket.name}</span>
            </div>
            <div className="h-[1px] bg-pink-100 w-full"></div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Total Investment</span>
              <span className="text-2xl font-serif italic text-pink-600">₹{ticket.price}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              Confirm & Request Invitation
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-white hover:bg-gray-50 text-gray-400 font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px]"
            >
              Wait, let me check again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
