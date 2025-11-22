

import React from 'react';
import { XMarkIcon } from './Icons.tsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  customMaxWidth?: string;
  statusMessage?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidthClass = 'max-w-5xl', customMaxWidth, statusMessage }) => {
  if (!isOpen) return null;

  const modalStyle = customMaxWidth ? { maxWidth: customMaxWidth } : {};

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full ${customMaxWidth ? '' : maxWidthClass} max-h-[90vh] flex flex-col`}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
            <XMarkIcon />
          </button>
        </div>
        {statusMessage && (
          <div className="px-4 mt-2">
            <div className="inline-flex items-center space-x-2 bg-black bg-opacity-5 text-gray-700 text-sm px-3 py-1 rounded-full">
              <svg className="w-4 h-4 animate-spin text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span>{statusMessage}</span>
            </div>
          </div>
        )}
        <div className="p-0 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;