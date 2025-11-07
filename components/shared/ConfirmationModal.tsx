import React from 'react';
import Modal from './Modal.tsx';
import { ExclamationTriangleIcon } from './Icons.tsx';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      maxWidthClass="max-w-md"
      footer={
        <div className="w-full flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-soft px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm transition-all duration-300"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-xl border border-munnay-300 shadow-soft px-4 py-2 bg-white text-base font-medium text-munnay-800 hover:bg-munnay-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-munnay-500 sm:w-auto sm:text-sm transition-all duration-300"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      }
    >
      <div className="p-6">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-0 sm:ml-4 text-left">
            <p className="text-sm text-munnay-800">{message}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;