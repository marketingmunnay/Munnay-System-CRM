import React from 'react';
import Modal from './Modal';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: React.ReactNode;
  okLabel?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, title = 'Atención', message, okLabel = 'Aceptar' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidthClass="max-w-md">
      <div className="p-6 bg-[#0f1724] rounded-b-lg text-white">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 9v2" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            {title && <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>}
            <div className="text-sm text-gray-200 whitespace-pre-line">{message}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-yellow-400 text-black font-medium rounded-md hover:opacity-90">{okLabel}</button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertModal;
