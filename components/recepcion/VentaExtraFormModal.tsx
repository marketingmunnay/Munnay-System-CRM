import React from 'react';
import type { VentaExtra } from '../../types';

interface VentaExtraFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (venta: VentaExtra) => void;
  venta: VentaExtra | null;
}

const VentaExtraFormModal: React.FC<VentaExtraFormModalProps> = ({ isOpen, onClose, onSave, venta }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Venta Extra</h2>
        {/* Aquí va el formulario real para editar/crear venta extra */}
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default VentaExtraFormModal;
