import React, { useState, useEffect, useMemo } from 'react';
import type { Campaign, MetaCampaign } from '../../types.ts';
import Modal from '../shared/Modal.tsx';
import { TrashIcon } from '../shared/Icons.tsx';

interface CampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: Campaign) => void;
  onDelete: (campaignId: number) => void;
  campaign: Campaign | null;
  metaCampaigns: MetaCampaign[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const CampaignFormModal: React.FC<CampaignFormModalProps> = ({ isOpen, onClose, onSave, onDelete, campaign, metaCampaigns, requestConfirmation }) => {
  const [formData, setFormData] = useState<Partial<Campaign>>({});

  const metaCampaignOptions = useMemo(() => metaCampaigns.map(mc => mc.nombre), [metaCampaigns]);

  useEffect(() => {
    if (isOpen) {
        if (campaign) {
            setFormData(campaign);
        } else {
            setFormData({
                id: Date.now(),
                nombreAnuncio: '',
                categoria: '',
                alcance: 0,
                resultados: 0,
                costoPorResultado: 0,
                importeGastado: 0,
                fecha: new Date().toISOString().split('T')[0],
            });
        }
    }
  }, [campaign, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreAnuncio) {
      alert('El nombre del anuncio es requerido.');
      return;
    }
    if (!formData.categoria) {
      alert('Debe seleccionar una Campaña Meta.');
      return;
    }
    onSave(formData as Campaign);
  };

  const handleDelete = () => {
    if (campaign && onDelete) {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar la campaña "${campaign.nombreAnuncio}"? Esta acción no se puede deshacer.`,
            () => {
                onDelete(campaign.id);
                onClose();
            }
        );
    }
  };

  const renderFormField = (label: string, name: keyof Campaign, type: string = 'text', options?: string[]) => {
        if (type === 'date') {
        return (
          <div className="flex flex-col">
            <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}</label>
            <input
              type="date"
              id={name}
              name={name}
              value={formatDateForInput(formData[name])}
              onChange={handleChange}
              className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
              style={{ colorScheme: 'light' }}
            />
          </div>
        );
        }
      return (
     <div className="flex flex-col">
        <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}</label>
        {type === 'select' ? (
          <select id={name} name={name} value={formData[name] as string || ''} onChange={handleChange} className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
            <option value="">Seleccionar...</option>
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input type={type} id={name} name={name} step={type === 'number' ? '0.01' : undefined} value={String(formData[name] ?? '')} onChange={handleChange} className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]" />
        )}
      </div>
  );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign ? 'Editar Anuncio' : 'Registrar Nuevo Anuncio'}
      footer={
        <div className="w-full flex justify-between items-center">
            {campaign && onDelete ? (
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
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                    Cancelar
                </button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] transition-colors">
                    Guardar Cambios
                </button>
            </div>
        </div>
      }
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField('Nombre del Anuncio', 'nombreAnuncio')}
                {renderFormField('Fecha', 'fecha', 'date')}
                {renderFormField('Campaña Meta', 'categoria', 'select', metaCampaignOptions)}
                {renderFormField('Alcance', 'alcance', 'number')}
                {renderFormField('Resultados (Leads)', 'resultados', 'number')}
                {renderFormField('Costo por Resultado (S/)', 'costoPorResultado', 'number')}
                <div className="md:col-span-2">
                    {renderFormField('Importe Gastado (S/)', 'importeGastado', 'number')}
                </div>
            </div>
        </form>
      </div>
    </Modal>
  );
};

export default CampaignFormModal;