
import React, { useState, useEffect } from 'react';
import type { Egreso, Proveedor, EgresoCategory } from '../../types.ts';
import { TipoComprobante, ModoPagoEgreso } from '../../types.ts';
import Modal from '../shared/Modal.tsx';
import { TrashIcon } from '../shared/Icons.tsx';

interface EgresoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (egreso: Egreso) => void;
  onDelete: (egresoId: number) => void;
  egreso: Egreso | null;
  proveedores: Proveedor[];
  egresoCategories: EgresoCategory[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function EgresoFormModal({ isOpen, onClose, onSave, onDelete, egreso, proveedores, egresoCategories, requestConfirmation }: EgresoFormModalProps) {
  const [formData, setFormData] = useState<Partial<Egreso>>({});

  useEffect(() => {
    if (isOpen) {
        if (egreso) {
            setFormData(egreso);
        } else {
            setFormData({
                id: Date.now(),
                fechaRegistro: new Date().toISOString().split('T')[0],
                fechaPago: new Date().toISOString().split('T')[0],
                categoria: egresoCategories[0]?.nombre || '',
                tipoComprobante: TipoComprobante.SinComprobante,
                montoTotal: 0,
                montoPagado: 0,
                deuda: 0,
                tipoMoneda: 'Soles'
            });
        }
    }
  }, [egreso, isOpen, egresoCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let newFormData = { ...formData, [name]: type === 'number' ? Number(value) : value };

    if (name === 'montoTotal' || name === 'montoPagado') {
        const montoTotal = name === 'montoTotal' ? Number(value) : (newFormData.montoTotal || 0);
        const montoPagado = name === 'montoPagado' ? Number(value) : (newFormData.montoPagado || 0);
        newFormData.deuda = montoTotal - montoPagado;
    }

    setFormData(newFormData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        // In a real app, you would upload the file and get a URL
        const mockUrl = URL.createObjectURL(file); 
        setFormData(prev => ({ ...prev, fotoUrl: mockUrl }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proveedor || !formData.descripcion || !formData.montoTotal || !formData.fechaPago) {
      alert('Proveedor, Descripción, Fecha de Pago y Monto Total son campos requeridos.');
      return;
    }
    onSave(formData as Egreso);
  };

   const handleDelete = () => {
    if (egreso && onDelete) {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar este egreso de ${egreso.proveedor}? Esta acción no se puede deshacer.`,
            () => {
                onDelete(egreso.id);
                onClose();
            }
        );
    }
  };
  
  const renderFormField = (label: string, name: keyof Egreso, type: string = 'text', options?: {value: string, label: string}[], required: boolean = false) => {
      if (type === 'date') {
        return (
            <div className="flex flex-col">
                <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={String(formData[name] ?? '')}
                    onChange={handleChange}
                    required={required}
                    className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                    style={{ colorScheme: 'light' }}
                />
            </div>
        );
    }
    return (
     <div className="flex flex-col">
        <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        {type === 'select' ? (
          <select id={name} name={name} value={formData[name] as string || ''} onChange={handleChange} className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
            {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <input type={type} id={name} name={name} step={type === 'number' ? '0.01' : undefined} value={String(formData[name] ?? '')} onChange={handleChange} required={required} className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]" />
        )}
      </div>
  )};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={egreso ? 'Editar Egreso' : 'Registrar Nuevo Egreso'}
      maxWidthClass="max-w-4xl"
      footer={
        <div className="w-full flex justify-between items-center">
          {egreso && onDelete ? (
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
            <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] transition-colors">Guardar Egreso</button>
          </div>
        </div>
      }
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Información General</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {renderFormField('Fecha de Registro', 'fechaRegistro', 'date', [], true)}
                    {renderFormField('Fecha de Pago', 'fechaPago', 'date', [], true)}
                    
                    <div className="flex flex-col">
                        <label htmlFor="categoria" className="mb-1 text-sm font-medium text-gray-700">Categoría<span className="text-red-500">*</span>}</label>
                        <select id="categoria" name="categoria" value={formData.categoria || ''} onChange={handleChange} className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
                            {egresoCategories.map(cat => <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>)}
                        </select>
                    </div>
                    
                    <div className="flex flex-col">
                        <label htmlFor="proveedor" className="mb-1 text-sm font-medium text-gray-700">Proveedor<span className="text-red-500">*</span>}</label>
                        <select 
                            id="proveedor" 
                            name="proveedor" 
                            value={formData.proveedor || ''} 
                            onChange={handleChange} 
                            required
                            className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        >
                            <option value="">Seleccionar proveedor...</option>
                            {proveedores.map(p => <option key={p.id} value={p.razonSocial}>{p.razonSocial}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="descripcion" className="mb-1 text-sm font-medium text-gray-700">Descripción<span className="text-red-500">*</span>}</label>
                        <textarea id="descripcion" name="descripcion" value={formData.descripcion || ''} onChange={handleChange} required rows={2} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="observaciones" className="mb-1 text-sm font-medium text-gray-700">Observaciones</label>
                        <textarea id="observaciones" name="observaciones" value={formData.observaciones || ''} onChange={handleChange} rows={2} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]" />
                    </div>
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Detalles del Comprobante</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {renderFormField('Tipo de Comprobante', 'tipoComprobante', 'select', Object.values(TipoComprobante).map(v => ({ value: v, label: v})))}
                    {renderFormField('Serie', 'serieComprobante')}
                    {renderFormField('Número', 'nComprobante')}
                 </div>
            </fieldset>

             <fieldset className="border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Información del Pago</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-2 items-end">
                    <div>
                        <label htmlFor="tipoMoneda" className="mb-1 text-sm font-medium text-gray-700">Moneda<span className="text-red-500">*</span>}</label>
                        <select id="tipoMoneda" name="tipoMoneda" value={formData.tipoMoneda || 'Soles'} onChange={handleChange} required className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
                            <option value="Soles">Soles (S/)</option>
                            <option value="Dólares">Dólares ($)</option>
                        </select>
                    </div>
                    {renderFormField('Monto Total', 'montoTotal', 'number', [], true)}
                    {renderFormField('Monto Pagado', 'montoPagado', 'number')}
                    <div>
                        <label htmlFor="deuda" className="mb-1 text-sm font-medium text-gray-700">Deuda</label>
                        <input type="number" id="deuda" name="deuda" value={formData.deuda || 0} readOnly className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 bg-gray-100 font-bold text-red-600"/>
                    </div>
                    {renderFormField('Modo de Pago', 'modoPago', 'select', Object.values(ModoPagoEgreso).map(v=>({value: v, label: v})))}
                 </div>
            </fieldset>
            
            <fieldset className="border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Adjunto</legend>
                 <div className="mt-2">
                     <label htmlFor="fotoUrl" className="mb-1 text-sm font-medium text-gray-700">Cargar Foto del Comprobante</label>
                     <input type="file" id="fotoUrl" name="fotoUrl" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#aa632d] hover:file:bg-orange-100" />
                     {formData.fotoUrl && (
                        <div className="mt-2">
                            <img src={formData.fotoUrl} alt="Vista previa" className="max-h-32 rounded-md" />
                        </div>
                     )}
                 </div>
            </fieldset>

        </form>
      </div>
    </Modal>
  );
}