

import React from 'react';
import { XMarkIcon } from './Icons.tsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidthClass = 'max-w-5xl' }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white rounded-3xl shadow-soft-lg w-full ${maxWidthClass} max-h-[90vh] flex flex-col border border-munnay-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-munnay-200">
          <h2 id="modal-title" className="text-xl font-semibold text-munnay-900">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-munnay-700 transition-all duration-300 rounded-xl p-1 hover:bg-munnay-50" aria-label="Close modal">
            <XMarkIcon />
          </button>
        </div>
        <div className="p-0 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end items-center p-5 border-t border-munnay-200 bg-munnay-50 rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;