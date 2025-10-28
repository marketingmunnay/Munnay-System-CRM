
import React, { useState, useEffect } from 'react';
import type { Proveedor, TipoProveedor } from '../../types.ts';
import Modal from '../shared/Modal.tsx';
import { TrashIcon } from '../shared/Icons.tsx';

interface ProveedorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (proveedor: Proveedor) => void;
  onDelete?: (proveedorId: number) => void; // Optional for new items
  proveedor: Proveedor | null;
  tiposProveedor: TipoProveedor[];
  requestConfirmation: (message: string, onConfirm: () => void) => void; // Added requestConfirmation
}

const ProveedorFormModal: React.FC<ProveedorFormModalProps> = ({ isOpen, onClose, onSave, onDelete, proveedor, tiposProveedor, requestConfirmation }) => {
  const [formData, setFormData] = useState<Partial<Proveedor>>({});

  useEffect(() => {
    if (isOpen) {
        setFormData(proveedor ? { ...proveedor } : { id: Date.now(), tipo: tiposProveedor[0]?.nombre || '' });
    }
  }, [proveedor, isOpen, tiposProveedor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.razonSocial || !formData.ruc || !formData.tipo || !formData.numeroContacto) {
      alert('Todos los campos son requeridos.');
      return;
    }
    onSave(formData as Proveedor);
  };

  const handleDelete = () => {
    if (proveedor && onDelete) {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar al proveedor "${proveedor.razonSocial}"? Esta acción no se puede deshacer.`,
            () => {
                onDelete(proveedor.id);
                onClose();
            }
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={proveedor ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
      maxWidthClass="max-w-md"
      footer={
        <div className="w-full flex justify-between items-center">
          {proveedor && onDelete ? (
             <button
                type="button"
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                <TrashIcon className="mr-2 h-5 w-5" />
                Eliminar
            </button>
          ) : <div />}
          <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] transition-colors">Guardar Proveedor</button>
          </div>
        </div>
      }
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="razonSocial" className="mb-1 block text-sm font-medium text-gray-700">Razón Social</label>
                <input
                    type="text"
                    id="razonSocial"
                    name="razonSocial"
                    value={formData.razonSocial || ''}
                    onChange={handleChange}
                    required
                    className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                />
            </div>
            <div>
                <label htmlFor="ruc" className="mb-1 block text-sm font-medium text-gray-700">RUC</label>
                <input
                    type="text"
                    id="ruc"
                    name="ruc"
                    value={formData.ruc || ''}
                    onChange={handleChange}
                    required
                    className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                />
            </div>
            <div>
                <label htmlFor="tipo" className="mb-1 block text-sm font-medium text-gray-700">Tipo de Proveedor</label>
                <select 
                    id="tipo" 
                    name="tipo" 
                    value={formData.tipo || ''} 
                    onChange={handleChange} 
                    required 
                    className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
                    {tiposProveedor.map(tipo => (
                        <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="numeroContacto" className="mb-1 block text-sm font-medium text-gray-700">Número de Contacto</label>
                <input
                    type="text"
                    id="numeroContacto"
                    name="numeroContacto"
                    value={formData.numeroContacto || ''}
                    onChange={handleChange}
                    required
                    className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                />
            </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProveedorFormModal;