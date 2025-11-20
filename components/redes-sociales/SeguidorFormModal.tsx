
import React, { useState, useEffect } from 'react';
import type { Seguidor } from '../../types.ts';
import { RedSocialPost } from '../../types.ts';
import Modal from '../shared/Modal.tsx';
import { TrashIcon } from '../shared/Icons.tsx';

interface SeguidorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (seg: Seguidor) => void;
  onDelete: (segId: number) => void;
  seguidor: Seguidor | null;
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const CUENTA_OPTIONS = ['Munnay', 'Dra. Marilia'];

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const SeguidorFormModal: React.FC<SeguidorFormModalProps> = ({ isOpen, onClose, onSave, onDelete, seguidor, requestConfirmation }) => {
  const [formData, setFormData] = useState<Partial<Seguidor>>({});

  useEffect(() => {
    if (isOpen) {
        setFormData(seguidor ? { ...seguidor } : {
            id: Date.now(),
            fecha: new Date().toISOString().split('T')[0],
            cuenta: '',
            redSocial: RedSocialPost.Instagram,
            seguidores: 0,
            dejaronDeSeguir: 0,
        });
    }
  }, [seguidor, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cuenta) {
      alert('La cuenta es requerida.');
      return;
    }
    onSave(formData as Seguidor);
  };

  const handleDelete = () => {
    if (seguidor && onDelete) {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar este registro?`,
            () => {
                onDelete(seguidor.id);
                onClose();
            }
        );
    }
  };

    const { formatDateForInput } = require('../../utils/time');
    const renderField = (label: string, name: keyof Seguidor, type: 'text' | 'date' | 'number') => {
    if (type === 'date') {
      return (
        <div>
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
          <input
            type="date"
            id={name}
            name={name}
            value={formatDateForInput(formData[name] ?? '')}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
            style={{ colorScheme: 'light' }}
          />
        </div>
      );
    }
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={String(formData[name] ?? '')}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
        />
      </div>
  )};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={seguidor ? 'Editar Conteo de Seguidores' : 'Registrar Conteo de Seguidores'}
      maxWidthClass="max-w-2xl"
      footer={
        <div className="w-full flex justify-between items-center">
            {seguidor && (
                 <button onClick={handleDelete} className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                    <TrashIcon className="mr-2 h-5 w-5" /> Eliminar
                </button>
            )}
            <div className="space-x-2 ml-auto">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]">Guardar</button>
            </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Fecha', 'fecha', 'date')}
            
            <div>
                <label htmlFor="cuenta" className="block text-sm font-medium text-gray-700">Cuenta</label>
                <select
                    id="cuenta"
                    name="cuenta"
                    value={formData.cuenta || ''}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                >
                    <option value="">Seleccionar cuenta...</option>
                    {CUENTA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            
            <div>
                <label htmlFor="redSocial" className="block text-sm font-medium text-gray-700">Red Social</label>
                <select
                    id="redSocial"
                    name="redSocial"
                    value={formData.redSocial || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                >
                    {Object.values(RedSocialPost).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            {renderField('Seguidores Nuevos', 'seguidores', 'number')}
            {renderField('Dejaron de Seguir', 'dejaronDeSeguir', 'number')}
        </div>
      </form>
    </Modal>
  );
};

export default SeguidorFormModal;