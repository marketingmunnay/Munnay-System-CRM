import React, { useState, useEffect } from 'react';
import type { MetaCampaign } from '../../types.ts';
import Modal from '../shared/Modal.tsx';

interface MetaCampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: MetaCampaign) => void;
  campaign: MetaCampaign | null;
}

const CATEGORY_OPTIONS = ['Evaluación Médica', 'Evaluación Específica', 'Hydrafacial', 'Limpieza Facial', 'Productos'];

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const MetaCampaignFormModal: React.FC<MetaCampaignFormModalProps> = ({ isOpen, onClose, onSave, campaign }) => {
  const [formData, setFormData] = useState<Partial<MetaCampaign>>({});

  useEffect(() => {
    if (isOpen) {
        if (campaign) {
            setFormData(campaign);
        } else {
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                id: Date.now(),
                nombre: '',
                fechaInicio: today,
                fechaFin: today,
                categoria: CATEGORY_OPTIONS[0],
            });
        }
    }
  }, [campaign, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre) {
      alert('El nombre de la campaña es requerido.');
      return;
    }
    onSave(formData as MetaCampaign);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign ? 'Editar Campaña Meta' : 'Registrar Nueva Campaña Meta'}
      footer={
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                Cancelar
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] transition-colors">
                Guardar Campaña
            </button>
        </div>
      }
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="nombre" className="mb-1 text-sm font-medium text-gray-700">Nombre de la Campaña</label>
                    <input type="text" id="nombre" name="nombre" value={formData.nombre || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black" />
                </div>
                <div>
                     <label htmlFor="fechaInicio" className="mb-1 text-sm font-medium text-gray-700">Fecha de Inicio</label>
                    <input type="date" id="fechaInicio" name="fechaInicio" value={formData.fechaInicio || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black" style={{ colorScheme: 'light' }}/>
                </div>
                <div>
                     <label htmlFor="fechaFin" className="mb-1 text-sm font-medium text-gray-700">Fecha de Fin</label>
                    <input type="date" id="fechaFin" name="fechaFin" value={formData.fechaFin || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black" style={{ colorScheme: 'light' }}/>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="categoria" className="mb-1 text-sm font-medium text-gray-700">Categoría</label>
                    <select id="categoria" name="categoria" value={formData.categoria || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black">
                        {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>
        </form>
      </div>
    </Modal>
  );
};

export default MetaCampaignFormModal;