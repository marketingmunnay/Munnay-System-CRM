import React, { useState } from 'react';
import Modal from '../../shared/Modal';
import { format, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecurringShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    userName: string;
    startDate: Date;
    onSave: (data: any) => Promise<void>;
}

const RecurringShiftModal: React.FC<RecurringShiftModalProps> = ({ isOpen, onClose, userId, userName, startDate, onSave }) => {
    const [weeksToRepeat, setWeeksToRepeat] = useState(4);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await onSave({
                userId,
                sourceDate: format(startDate, 'yyyy-MM-dd'),
                weeksToRepeat
            });
            onClose();
        } catch (error) {
            console.error('Error saving recurring shifts', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Establecer turnos recurrentes de ${userName}`}
        >
            <div className="p-6">
                 <p className="text-sm text-gray-500 mb-6">
                    Se copiará el turno del día <strong>{format(startDate, "EEEE d 'de' MMMM", { locale: es })}</strong> hacia las próximas semanas.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repetir durante (semanas)
                    </label>
                    <select
                        value={weeksToRepeat}
                        onChange={(e) => setWeeksToRepeat(Number(e.target.value))}
                        className="w-full border rounded-lg p-2 text-sm"
                    >
                        <option value={1}>1 semana</option>
                        <option value={2}>2 semanas</option>
                        <option value={4}>4 semanas (1 mes)</option>
                        <option value={8}>8 semanas (2 meses)</option>
                        <option value={12}>12 semanas (3 meses)</option>
                        <option value={24}>24 semanas (6 meses)</option>
                        <option value={52}>52 semanas (1 año)</option>
                    </select>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md mb-6">
                    <p className="text-xs text-blue-700">
                        Los cambios guardados se aplicarán a todos los próximos turnos para el período seleccionado, sobrescribiendo cualquier configuración existente.
                    </p>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default RecurringShiftModal;
