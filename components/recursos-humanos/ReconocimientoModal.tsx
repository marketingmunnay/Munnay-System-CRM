
import React, { useState } from 'react';
import type { User } from '../../types.ts';
import Modal from '../shared/Modal.tsx';

interface ReconocimientoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (kudo: { toUserId: number; message: string; }) => void;
    recipient: User;
    sender: User;
}

const ReconocimientoModal: React.FC<ReconocimientoModalProps> = ({ isOpen, onClose, onSave, recipient, sender }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (message.trim()) {
            onSave({ toUserId: recipient.id, message });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Reconocer a ${recipient.nombres}`}
            maxWidthClass="max-w-lg"
            footer={
                <div className="space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">Enviar Reconocimiento</button>
                </div>
            }
        >
            <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                    Estás enviando un reconocimiento a <span className="font-bold">{recipient.nombres} {recipient.apellidos}</span>.
                    Este mensaje será visible para el equipo.
                </p>
                <div>
                    <label htmlFor="kudo-message" className="block text-sm font-medium text-gray-700">Mensaje</label>
                    <textarea
                        id="kudo-message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Ej: ¡Gracias por tu increíble ayuda con el paciente X! Eres un/a crack.`}
                        className="mt-1 w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ReconocimientoModal;