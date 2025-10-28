import React, { useState, useEffect, useMemo } from 'react';
import type { Lead, MetaCampaign, Treatment, Procedure, Personal, Medico, Seguimiento, RegistroLlamada, ClientSource, Service, ComprobanteElectronico } from '../../types';
import { LeadStatus, Seller, MetodoPago, ReceptionStatus, EstadoLlamada, DocumentType, TipoComprobanteElectronico, SunatStatus } from '../../types';
import Modal from '../shared/Modal';
import FacturacionModal from '../finanzas/FacturacionModal';
import { RESOURCES } from '../../constants';
import * as api from '../../services/api';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  onDelete: (leadId: number) => void;
  lead: Lead | null;
  metaCampaigns: MetaCampaign[];
  clientSources: ClientSource[];
  services: Service[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
  onSaveComprobante: (comprobante: ComprobanteElectronico) => Promise<void>;
  comprobantes: ComprobanteElectronico[];
}

const PERSONAL_OPTIONS: Personal[] = ['Vanesa', 'Elvira', 'Janela', 'Liz', 'Keila', 'Luz', 'Dra. Marilia', 'Dra. Sofía', 'Dr. Carlos'];
const MEDICO_OPTIONS: Medico[] = ['Dra. Marilia', 'Dra. Sofía', 'Dr. Carlos'];

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) {
        return 'S/ 0.00';
    }
    return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString?: string) => {
      if (!dateString) return 'No especificada';
      return new Date(dateString).toLocaleString('es-PE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
      });
  }

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const formatPhoneNumber = (value: string | undefined): string => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})$/);
    if (match) {
        return [match[1], match[2], match[3]].filter(Boolean).join(' ');
    }
    return value;
};

const RecepcionTabContent: React.FC<{
  formData: Partial<Lead>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleGenerateHistoryNumber: () => void;
  handleSetFormData: React.Dispatch<React.SetStateAction<Partial<Lead>>>;
  totales: { precio: number; pagado: number; deuda: number };
  services: Service[];
}> = ({
  formData,
  handleChange,
  handleGenerateHistoryNumber,
  handleSetFormData,
  totales,
  services
}) => {
  const [currentTreatment, setCurrentTreatment] = useState<Partial<Treatment> | null>(null);
  const [currentTreatmentCategory, setCurrentTreatmentCategory] = useState('');
  
  // States for editing main appointment payment
  const [isEditingCitaPayment, setIsEditingCitaPayment] = useState(false);
  const [editedMontoPagado, setEditedMontoPagado, ] = useState(formData.montoPagado || 0);
  const [editedMetodoPago, setEditedMetodoPago] = useState<MetodoPago | undefined>(formData.metodoPago);

  const isCitaPagada = !formData.deudaCita || formData.deudaCita <= 0;
  // States for paying off debt
  const [pagoDeuda, setPagoDeuda] = useState(formData.deudaCita || 0);
  const [metodoPagoDeuda, setMetodoPagoDeuda] = useState<MetodoPago | undefined>();

  useEffect(() => {
    setPagoDeuda(formData.deudaCita || 0);
  }, [formData.deudaCita]);
  
  useEffect(() => {
    if (isEditingCitaPayment) {
        setEditedMontoPagado(formData.montoPagado || 0);
        setEditedMetodoPago(formData.metodoPago);
    }
  }, [isEditingCitaPayment, formData.montoPagado, formData.metodoPago]);

  const handleCompletarPago = () => {
    if (!metodoPagoDeuda) {
        alert('Por favor, seleccione un método de pago.');
        return;
    }
    handleSetFormData(prev => {
        const montoPagadoActual = prev.montoPagado || 0;
        const nuevoMontoPagado = montoPagadoActual + pagoDeuda;
        return {
            ...prev,
            montoPagado: nuevoMontoPagado,
            deudaCita: (prev.precioCita || 0) - nuevoMontoPagado,
            metodoPagoDeuda: metodoPagoDeuda,
        }
    });
  };
  
  const handleUpdateCitaPayment = () => {
    handleSetFormData(prev => ({
        ...prev,
        montoPagado: editedMontoPagado,
        metodoPago: editedMetodoPago,
    }));
    setIsEditingCitaPayment(false);
  };

  const SERVICE_CATEGORIES = useMemo(() => {
    return services.reduce((acc, service) => {
      (acc[service.categoria] = acc[service.categoria] || []).push(service.nombre);
      return acc;
    }, {} as Record<string, string[]>);
  }, [services]);

  const CATEGORY_OPTIONS = useMemo(() => Object.keys(SERVICE_CATEGORIES), [SERVICE_CATEGORIES]);

  if (!formData.montoPagado || formData.montoPagado <= 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-8 text-center">
            <GoogleIcon name="warning" className="text-5xl text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Acción Reqerida</h3>
            <p className="text-gray-600 mt-2 max-w-md">Para gestionar la recepción del paciente, primero debe registrar el monto del pago inicial en la pestaña de "Ficha de Paciente".</p>
        </div>
    );
  }

  const handleShowAddTreatmentForm = () => {
    setCurrentTreatmentCategory('');
    setCurrentTreatment({
        id: Date.now(),
        nombre: '',
        cantidadSesiones: 1,
        precio: 0,
        montoPagado: 0,
        metodoPago: undefined,
        deuda: 0
    });
  };

  const handleStartEditTreatment = (treatmentToEdit: Treatment) => {
    const service = services.find(s => s.nombre === treatmentToEdit.nombre);
    setCurrentTreatmentCategory(service?.categoria || '');
    setCurrentTreatment({ ...treatmentToEdit });
  };

  const handleCurrentTreatmentChange = (field: keyof Omit<Treatment, 'id' | 'deuda'>, value: string | number) => {
      if (!currentTreatment) return;
      setCurrentTreatment(prev => ({...prev, [field]: value}));
  };

  const handleSaveCurrentTreatment = () => {
    if (!currentTreatment || !currentTreatment.nombre?.trim()) {
        alert("Por favor, seleccione una categoría y un servicio.");
        return;
    }
    const finalTreatment: Treatment = {
      id: currentTreatment.id || Date.now(),
      nombre: currentTreatment.nombre,
      cantidadSesiones: Number(currentTreatment.cantidadSesiones) || 0,
      precio: Number(currentTreatment.precio) || 0,
      montoPagado: Number(currentTreatment.montoPagado) || 0,
      metodoPago: currentTreatment.metodoPago,
      deuda: (Number(currentTreatment.precio) || 0) - (Number(currentTreatment.montoPagado) || 0),
    };

    handleSetFormData(prev => {
        const existingTreatments = prev.tratamientos || [];
        const isEditing = existingTreatments.some(t => t.id === finalTreatment.id);
        
        let updatedTreatments;
        if (isEditing) {
            updatedTreatments = existingTreatments.map(t => t.id === finalTreatment.id ? finalTreatment : t);
        } else {
            updatedTreatments = [...existingTreatments, finalTreatment];
        }
        
        return { ...prev, tratamientos: updatedTreatments };
    });
    setCurrentTreatment(null);
    setCurrentTreatmentCategory('');
  };

  const handleRemoveTreatment = (idToRemove: number) => {
      handleSetFormData(prev => ({
          ...prev,
          tratamientos: (prev.tratamientos || []).filter(t => t.id !== idToRemove)
      }));
  };
  
  const isEditingTreatment = useMemo(() => {
    if (!currentTreatment || !formData.tratamientos) return false;
    return formData.tratamientos.some(t => t.id === currentTreatment.id);
  }, [currentTreatment, formData.tratamientos]);

  const treatmentAccepted = formData.aceptoTratamiento === 'Si';

  return (
    <div className="space-y-6">
        <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-bold px-2 text-black flex items-center">
                <GoogleIcon name="receipt_long" className="text-xl mr-2 text-[#aa632d]" />
                Detalles de la Cita
            </legend>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 mt-4 text-sm">
                <div>
                    <p className="text-xs font-medium text-gray-500">Categoría</p>
                    <p className="font-semibold text-gray-800">{formData.categoria || 'No especificada'}</p>
                </div>
                <div>
                    <p className className="text-xs font-medium text-gray-500">Servicio</p>
                    <p className="font-semibold text-gray-800">{formData.servicios?.join(', ') || 'No especificado'}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500">Monto Pagado (Cita)</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(formData.montoPagado)}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500">Fecha y Hora de Cita</p>
                    <p className="font-semibold text-gray-800">{formatDate(formData.fechaHoraAgenda)}</p>
                </div>
            </div>
        </fieldset>

        {isCitaPagada && !isEditingCitaPayment ? (
            <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200 flex items-center justify-between">
                <div className="flex items-center">
                    <GoogleIcon name="check_circle" className="mr-3 text-xl"/>
                    <p className="font-semibold">Pago de Cita Completo</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsEditingCitaPayment(true)}
                    className="flex items-center text-xs bg-white text-green-800 border border-green-300 px-2 py-1 rounded-md hover:bg-green-100"
                >
                    <GoogleIcon name="edit" className="mr-1 text-sm"/>
                    Editar Pago
                </button>
            </div>
        ) : isCitaPagada && isEditingCitaPayment ? (
            <fieldset className="border p-4 rounded-md border-blue-300 bg-blue-50">
                <legend className="text-lg font-bold px-2 text-blue-800 flex items-center">
                    <GoogleIcon name="edit_note" className="text-xl mr-2"/>
                    Editar Pago de Cita
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mt-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Monto Pagado (S/)</label>
                        <input
                            type="number"
                            value={editedMontoPagado}
                            onChange={e => setEditedMontoPagado(Number(e.target.value))}
                            className="w-full border-black bg-white rounded-md text-sm p-2 text-black"
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-gray-600 mb-1">Método de Pago</label>
                         <select
                            value={editedMetodoPago || ''}
                            onChange={e => setEditedMetodoPago(e.target.value as MetodoPago)}
                            className="w-full border-black bg-white rounded-md text-sm p-2 text-black"
                         >
                            <option value="">Seleccionar...</option>
                            {Object.values(MetodoPago).map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={() => setIsEditingCitaPayment(false)}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleUpdateCitaPayment}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </fieldset>
        ) : (
            <fieldset className="border p-4 rounded-md border-orange-300 bg-orange-50">
                <legend className="text-lg font-bold px-2 text-orange-800 flex items-center">
                    <GoogleIcon name="credit_card" className="text-xl mr-2"/>
                    Completar Pago de Cita
                </legend>
                <div className="grid grid-cols-4 gap-4 items-center text-sm mt-4">
                    <div>
                        <p className="text-xs font-medium text-gray-500">Precio Total</p>
                        <p className="font-semibold text-gray-800">{formatCurrency(formData.precioCita)}</p>
                    </div>
                     <div>
                        <p className="text-xs font-medium text-gray-500">Monto Pagado</p>
                        <p className="font-semibold text-green-700">{formatCurrency(formData.montoPagado)}</p>
                    </div>
                     <div>
                        <p className="text-xs font-medium text-gray-500">Deuda Pendiente</p>
                        <p className="font-bold text-red-700">{formatCurrency(formData.deudaCita)}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-4 border-t pt-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Monto a Pagar (S/)</label>
                        <input type="number" value={pagoDeuda} onChange={e => setPagoDeuda(Number(e.target.value))} className="w-full border-black bg-white rounded-md text-sm p-2 text-black"/>
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-gray-600 mb-1">Método de Pago</label>
                         <select value={metodoPagoDeuda || ''} onChange={e => setMetodoPagoDeuda(e.target.value as MetodoPago)} className="w-full border-black bg-white rounded-md text-sm p-2 text-black">
                            <option value="">Seleccionar...</option>
                            {Object.values(MetodoPago).map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                    </div>
                     <div>
                        <button type="button" onClick={handleCompletarPago} className="w-full bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">
                            Registrar Pago
                        </button>
                    </div>
                </div>
            </fieldset>
        )}

        <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-bold px-2 text-black">Datos del Paciente</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 items-end">
                <div className="md:col-span-1 flex flex-col">
                    <label htmlFor="nHistoria" className="mb-1 text-sm font-medium text-gray-700">N° de Historia</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            id="nHistoria"
                            name="nHistoria"
                            value={formData.nHistoria || ''}
                            onChange={handleChange}
                            className="flex-grow border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        />
                        <button
                            type="button"
                            onClick={handleGenerateHistoryNumber}
                            disabled={!!formData.nHistoria}
                            className="flex items-center bg-[#aa632d] text-white px-3 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <GoogleIcon name="auto_awesome" className="mr-1" />
                            Generar
                        </button>
                    </div>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="estadoRecepcion" className="mb-1 text-sm font-medium text-gray-700">Estado de Cita</label>
                    <select id="estadoRecepcion" name="estadoRecepcion" value={formData.estadoRecepcion || ReceptionStatus.Agendado} onChange={handleChange} className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
                        {Object.values(ReceptionStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="aceptoTratamiento" className="mb-1 text-sm font-medium text-gray-700">¿Aceptó Trat.?</label>
                    <select id="aceptoTratamiento" name="aceptoTratamiento" value={formData.aceptoTratamiento || 'No'} onChange={handleChange} className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                    </select>
                </div>
            </div>
        </fieldset>

        {treatmentAccepted ? (
            <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-bold px-2 text-black">Tratamientos</legend>

                {/* TABLE OF ADDED TREATMENTS */}
                <div className="mt-4 overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-2">Tratamiento</th>
                                <th className="px-4 py-2">Sesiones</th>
                                <th className="px-4 py-2">Precio</th>
                                <th className="px-4 py-2">Pagado</th>
                                <th className="px-4 py-2">Método Pago</th>
                                <th className="px-4 py-2">Deuda</th>
                                <th className="px-4 py-2 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(formData.tratamientos || []).map(trat => (
                                <tr key={trat.id} className="bg-white border-b">
                                    <td className="px-4 py-2 font-medium text-gray-900">{trat.nombre}</td>
                                    <td className="px-4 py-2">{trat.cantidadSesiones}</td>
                                    <td className="px-4 py-2">{formatCurrency(trat.precio)}</td>
                                    <td className="px-4 py-2 text-green-600 font-semibold">{formatCurrency(trat.montoPagado)}</td>
                                    <td className="px-4 py-2">{trat.metodoPago || 'N/A'}</td>
                                    <td className="px-4 py-2 text-red-600 font-semibold">{formatCurrency(trat.deuda)}</td>
                                    <td className="px-4 py-2 text-center">
                                         <div className="flex items-center justify-center space-x-2">
                                            <button type="button" onClick={() => handleStartEditTreatment(trat)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                                                <GoogleIcon name="edit" className="text-lg" />
                                            </button>
                                            <button type="button" onClick={() => handleRemoveTreatment(trat.id)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar">
                                                <GoogleIcon name="delete" className="text-lg" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                              {(!formData.tratamientos || formData.tratamientos.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-gray-500">Aún no se han agregado tratamientos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FORM TO ADD/EDIT TREATMENT */}
                {currentTreatment && (
                    <div className="mt-6 p-4 rounded-md border space-y-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Categoría de Servicio</label>
                                <select 
                                    value={currentTreatmentCategory} 
                                    onChange={e => {
                                        setCurrentTreatmentCategory(e.target.value);
                                        handleCurrentTreatmentChange('nombre', ''); // Reset service
                                    }} 
                                    className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2 shadow-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                                >
                                    <option value="">Seleccionar...</option>
                                    {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                             <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Servicio de Interés</label>
                                <select 
                                    value={currentTreatment.nombre || ''} 
                                    onChange={e => handleCurrentTreatmentChange('nombre', e.target.value)} 
                                    disabled={!currentTreatmentCategory}
                                    className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2 shadow-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d] disabled:bg-gray-200"
                                >
                                    <option value="">Seleccionar...</option>
                                    {(SERVICE_CATEGORIES[currentTreatmentCategory] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Sesiones</label>
                                <input type="number" placeholder="N°" value={currentTreatment.cantidadSesiones || ''} onChange={e => handleCurrentTreatmentChange('cantidadSesiones', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2 shadow-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Precio (S/)</label>
                                <input type="number" placeholder="0.00" value={currentTreatment.precio || ''} onChange={e => handleCurrentTreatmentChange('precio', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2 shadow-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"/>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Monto Pagado (S/)</label>
                                <input type="number" placeholder="0.00" value={currentTreatment.montoPagado || ''} onChange={e => handleCurrentTreatmentChange('montoPagado', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2 shadow-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"/>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Método Pago</label>
                                <select value={currentTreatment.metodoPago || ''} onChange={e => handleCurrentTreatmentChange('metodoPago', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2 shadow-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
                                    <option value="">Seleccionar...</option>
                                    {Object.values(MetodoPago).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setCurrentTreatment(null)} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button type="button" onClick={handleSaveCurrentTreatment} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">{isEditingTreatment ? 'Actualizar' : 'Añadir'} Tratamiento</button>
                        </div>
                    </div>
                )}

                {/* BUTTON TO ADD NEW TREATMENT */}
                {!currentTreatment && (
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={handleShowAddTreatmentForm}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
                        >
                            <GoogleIcon name="add" className="mr-2 text-xl" />
                            Añadir Tratamiento
                        </button>
                    </div>
                )}
                
                 {/* TOTALS FOOTER */}
                 <div className="mt-6 pt-4 border-t-2 border-dashed flex justify-end">
                    <div className="w-full md:w-1/3 space-y-2 text-sm">
                        <div className="flex justify-between font-medium">
                            <span>Subtotal Tratamientos:</span>
                            <span className="text-gray-800">{formatCurrency(totales.precio)}</span>
                        </div>
                         <div className="flex justify-between font-medium">
                            <span>Total Pagado:</span>
                            <span className="text-green-600">{formatCurrency(totales.pagado)}</span>
                        </div>
                         <div className="flex justify-between font-bold text-base">
                            <span>Deuda Total:</span>
                            <span className="text-red-600">{formatCurrency(totales.deuda)}</span>
                        </div>
                    </div>
                </div>

            </fieldset>
        ) : (
            <fieldset className="border p-4 rounded-md">
                 <legend className="text-lg font-bold px-2 text-black">Motivo de No Cierre</legend>
                 <div className="mt-4">
                     <label htmlFor="motivoNoCierre" className="mb-1 text-sm font-medium text-gray-700">Explique por qué el paciente no aceptó el tratamiento</label>
                     <textarea
                        id="motivoNoCierre"
                        name="motivoNoCierre"
                        value={formData.motivoNoCierre || ''}
                        onChange={handleChange}
                        rows={4}
                        className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        placeholder="Ej: Precio elevado, falta de tiempo, prefiere otro tratamiento, etc."
                    />
                 </div>
            </fieldset>
        )}
    </div>
  );
};

const ProcedimientosTabContent: React.FC<{
  formData: Partial<Lead>;
  handleSetFormData: React.Dispatch<React.SetStateAction<Partial<Lead>>>;
}> = ({ formData, handleSetFormData }) => {
    const [currentProcedure, setCurrentProcedure] = useState<Partial<Procedure> | null>(null);

    if (!formData.aceptoTratamiento || formData.aceptoTratamiento !== 'Si' || !formData.tratamientos || formData.tratamientos.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-8 text-center">
                <GoogleIcon name="warning" className="text-5xl text-yellow-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">Sin Tratamientos Activos</h3>
                <p className="text-gray-600 mt-2 max-w-md">El paciente debe aceptar al menos un tratamiento en la pestaña de "Recepción" para poder registrar procedimientos.</p>
            </div>
        );
    }
    
    const handleShowAddProcedureForm = () => {
        setCurrentProcedure({
            id: Date.now(),
            fechaAtencion: new Date().toISOString().split('T')[0],
            horaInicio: '09:00',
            horaFin: '10:00',
            asistenciaMedica: false
        });
    };

    const handleCurrentProcedureChange = (field: keyof Omit<Procedure, 'id' | 'nombreTratamiento' | 'sesionNumero'>, value: string | number | boolean) => {
        if (!currentProcedure) return;
        setCurrentProcedure(prev => ({...prev, [field]: value}));
    };

    const handleSaveCurrentProcedure = () => {
        if (!currentProcedure || !currentProcedure.tratamientoId || !currentProcedure.personal) {
            alert("Por favor, complete todos los campos requeridos.");
            return;
        }
        
        const tratamiento = formData.tratamientos?.find(t => t.id === Number(currentProcedure.tratamientoId));
        if (!tratamiento) {
            alert("Tratamiento seleccionado no válido.");
            return;
        }

        const sesionesRealizadas = (formData.procedimientos || []).filter(p => p.tratamientoId === tratamiento.id).length;
        if (sesionesRealizadas >= tratamiento.cantidadSesiones) {
            alert(`Ya se han completado todas las sesiones para "${tratamiento.nombre}".`);
            return;
        }
        
        const finalProcedure: Procedure = {
            id: currentProcedure.id || Date.now(),
            fechaAtencion: currentProcedure.fechaAtencion!,
            personal: currentProcedure.personal!,
            horaInicio: currentProcedure.horaInicio!,
            horaFin: currentProcedure.horaFin!,
            tratamientoId: Number(currentProcedure.tratamientoId),
            nombreTratamiento: tratamiento.nombre,
            sesionNumero: sesionesRealizadas + 1,
            asistenciaMedica: !!currentProcedure.asistenciaMedica,
            medico: currentProcedure.asistenciaMedica ? currentProcedure.medico : undefined,
            observacion: currentProcedure.observacion,
        };
        
        handleSetFormData(prev => ({
            ...prev,
            procedimientos: [...(prev.procedimientos || []), finalProcedure]
        }));
        setCurrentProcedure(null);
    };
    
    const handleRemoveProcedure = (idToRemove: number) => {
      handleSetFormData(prev => ({
          ...prev,
          procedimientos: (prev.procedimientos || []).filter(p => p.id !== idToRemove)
      }));
    };

    return (
        <div className="space-y-6">
            <fieldset className="border p-4 rounded-md">
                 <legend className="text-lg font-bold px-2 text-black">Procedimientos Realizados</legend>
                 <div className="mt-4 overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                             <tr>
                                <th className="px-4 py-2">Fecha</th>
                                <th className="px-4 py-2">Hora</th>
                                <th className="px-4 py-2">Tratamiento</th>
                                <th className="px-4 py-2">Personal</th>
                                <th className="px-4 py-2">Médico</th>
                                <th className="px-4 py-2">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(formData.procedimientos || []).map(proc => (
                                <tr key={proc.id} className="bg-white border-b">
                                    <td className="px-4 py-2">{new Date(proc.fechaAtencion + 'T00:00:00').toLocaleDateString('es-PE')}</td>
                                    <td className="px-4 py-2">{proc.horaInicio} - {proc.horaFin}</td>
                                    <td className="px-4 py-2 font-medium text-gray-900">{proc.nombreTratamiento} (Sesión {proc.sesionNumero})</td>
                                    <td className="px-4 py-2">{proc.personal}</td>
                                    <td className="px-4 py-2">{proc.asistenciaMedica ? proc.medico : 'N/A'}</td>
                                    <td className="px-4 py-2">
                                        <button type="button" onClick={() => handleRemoveProcedure(proc.id)} className="text-red-500 hover:text-red-700 p-1"><GoogleIcon name="delete" className="text-lg" /></button>
                                    </td>
                                </tr>
                            ))}
                             {(!formData.procedimientos || formData.procedimientos.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-gray-500">Aún no se han registrado procedimientos.</td>
                                </tr>
                            )}
                        </tbody>
                     </table>
                 </div>
                 {currentProcedure && (
                     <div className="mt-6 p-4 rounded-md border space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                             <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tratamiento</label>
                                <select value={currentProcedure.tratamientoId || ''} onChange={e => handleCurrentProcedureChange('tratamientoId', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2">
                                    <option value="">Seleccionar...</option>
                                    {formData.tratamientos?.map(t => <option key={t.id} value={String(t.id)}>{t.nombre}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Personal</label>
                                <select value={currentProcedure.personal || ''} onChange={e => handleCurrentProcedureChange('personal', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2">
                                    <option value="">Seleccionar...</option>
                                    {PERSONAL_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                                <input type="date" value={currentProcedure.fechaAtencion || ''} onChange={e => handleCurrentProcedureChange('fechaAtencion', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2" style={{ colorScheme: 'light' }}/>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Hora Inicio</label>
                                <input type="time" value={currentProcedure.horaInicio || ''} onChange={e => handleCurrentProcedureChange('horaInicio', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2" style={{ colorScheme: 'light' }}/>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Hora Fin</label>
                                <input type="time" value={currentProcedure.horaFin || ''} onChange={e => handleCurrentProcedureChange('horaFin', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2" style={{ colorScheme: 'light' }}/>
                            </div>
                             <div className="flex items-center pt-6">
                                <input type="checkbox" id="asistenciaMedica" checked={!!currentProcedure.asistenciaMedica} onChange={e => handleCurrentProcedureChange('asistenciaMedica', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#aa632d] focus:ring-[#aa632d]"/>
                                <label htmlFor="asistenciaMedica" className="ml-2 block text-sm text-gray-900">¿Asistencia Médica?</label>
                            </div>
                        </div>
                        {currentProcedure.asistenciaMedica && (
                             <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Médico</label>
                                <select value={currentProcedure.medico || ''} onChange={e => handleCurrentProcedureChange('medico', e.target.value)} className="w-full md:w-1/3 border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2">
                                    <option value="">Seleccionar...</option>
                                    {MEDICO_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                             <label className="block text-xs font-medium text-gray-600 mb-1">Observación</label>
                             <textarea value={currentProcedure.observacion || ''} onChange={e => handleCurrentProcedureChange('observacion', e.target.value)} rows={3} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2" />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setCurrentProcedure(null)} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button type="button" onClick={handleSaveCurrentProcedure} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">Añadir Procedimiento</button>
                        </div>
                     </div>
                 )}
                  {!currentProcedure && (
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={handleShowAddProcedureForm}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
                        >
                            <GoogleIcon name="add" className="mr-2 text-xl" />
                            Registrar Procedimiento
                        </button>
                    </div>
                )}
            </fieldset>
        </div>
    );
};

const SeguimientoTabContent: React.FC<{
  formData: Partial<Lead>;
  handleSetFormData: React.Dispatch<React.SetStateAction<Partial<Lead>>>;
}> = ({ formData, handleSetFormData }) => {
    const [currentSeguimiento, setCurrentSeguimiento] = useState<Partial<Seguimiento> | null>(null);
    const [summary, setSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);


    const handleGenerateSummary = async () => {
        if (!formData.seguimientos || formData.seguimientos.length === 0) {
            alert('No hay seguimientos registrados para generar un resumen.');
            return;
        }
        setIsGeneratingSummary(true);
        setSummary('');

        const followUpHistory = formData.seguimientos.map(s => {
            const sintomas = [
                s.inflamacion && 'Inflamación', s.ampollas && 'Ampollas', s.alergias && 'Alergias',
                s.malestarGeneral && 'Malestar General', s.brote && 'Brote', s.dolorDeCabeza && 'Dolor de Cabeza',
                s.moretones && 'Moretones'
            ].filter(Boolean).join(', ') || 'Ninguno';

            return `
                - Fecha: ${new Date(s.fechaSeguimiento + 'T00:00:00').toLocaleDateString('es-PE')}
                - Procedimiento: ${s.nombreProcedimiento}
                - Personal: ${s.personal}
                - Síntomas: ${sintomas}
                - Observación: ${s.observacion || 'Sin observaciones.'}
            `;
        }).join('\n');

        const prompt = `
            Actúa como un asistente médico profesional. Tu tarea es analizar y resumir el siguiente historial de seguimiento de un paciente de una clínica estética para que un profesional de la salud pueda entender rápidamente su evolución.

            Nombre del Paciente: ${formData.nombres} ${formData.apellidos}

            Historial de Seguimientos:
            ${followUpHistory}

            Instrucciones:
            1.  Genera un resumen conciso en español.
            2.  Destaca la evolución general del paciente a lo largo de los procedimientos.
            3.  Menciona cualquier síntoma recurrente o preocupante.
            4.  Subraya observaciones clave hechas por el personal.
            5.  El resumen debe ser estructurado y fácil de leer, utilizando viñetas si es necesario.
            6.  Concluye con una breve evaluación del estado general del paciente basado en los datos proporcionados.
        `;

        try {
            // FIX: Corrected API call to use ai.models.generateContent with contents.parts structure
            const generatedText = await api.generateAiContent(prompt);
            setSummary(generatedText);
        } catch (error) {
            console.error("Error generating summary:", error);
            setSummary("Hubo un error al generar el resumen. Por favor, inténtalo de nuevo.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    if (!formData.aceptoTratamiento || formData.aceptoTratamiento !== 'Si' || !formData.tratamientos || formData.tratamientos.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-8 text-center">
                <GoogleIcon name="warning" className="text-5xl text-yellow-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">Sin Tratamientos Activos</h3>
                <p className="text-gray-600 mt-2 max-w-md">El paciente debe aceptar al menos un tratamiento en la pestaña de "Recepción" para poder registrar procedimientos.</p>
            </div>
        );
    }

     if (!formData.procedimientos || formData.procedimientos.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-8 text-center">
                <GoogleIcon name="warning" className="text-5xl text-yellow-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">Sin Procedimientos</h3>
                <p className="text-gray-600 mt-2 max-w-md">Se debe registrar al menos un procedimiento para poder hacerle seguimiento.</p>
            </div>
        );
    }
    
    const handleShowAddSeguimientoForm = () => {
        setCurrentSeguimiento({
            id: Date.now(),
            fechaSeguimiento: new Date().toISOString().split('T')[0],
            inflamacion: false,
            ampollas: false,
            alergias: false,
            malestarGeneral: false,
            brote: false,
            dolorDeCabeza: false,
            moretones: false,
        });
    };
    
    const handleCurrentSeguimientoChange = (field: keyof Omit<Seguimiento, 'id' | 'procedimientoId' | 'nombreProcedimiento'>, value: string | boolean) => {
        if (!currentSeguimiento) return;
        setCurrentSeguimiento(prev => ({ ...prev, [field]: value }));
    };

    const handleCurrentSeguimientoSelectChange = (field: 'procedimientoId' | 'personal', value: string) => {
        if (!currentSeguimiento) return;
        const finalValue = field === 'procedimientoId' ? Number(value) : value;
        setCurrentSeguimiento(prev => ({...prev, [field]: finalValue}));
    };

    const handleSaveCurrentSeguimiento = () => {
        if (!currentSeguimiento || !currentSeguimiento.procedimientoId || !currentSeguimiento.personal) {
            alert("Por favor, complete todos los campos requeridos.");
            return;
        }

        const procedimiento = formData.procedimientos?.find(p => p.id === Number(currentSeguimiento.procedimientoId));
        if (!procedimiento) {
            alert("Procedimiento seleccionado no válido.");
            return;
        }

        const finalSeguimiento: Seguimiento = {
            id: currentSeguimiento.id || Date.now(),
            procedimientoId: Number(currentSeguimiento.procedimientoId),
            nombreProcedimiento: `${procedimiento.nombreTratamiento} (Sesión ${procedimiento.sesionNumero})`,
            fechaSeguimiento: currentSeguimiento.fechaSeguimiento!,
            personal: currentSeguimiento.personal!,
            inflamacion: !!currentSeguimiento.inflamacion,
            ampollas: !!currentSeguimiento.ampollas,
            alergias: !!currentSeguimiento.alergias,
            malestarGeneral: !!currentSeguimiento.malestarGeneral,
            brote: !!currentSeguimiento.brote,
            dolorDeCabeza: !!currentSeguimiento.dolorDeCabeza,
            moretones: !!currentSeguimiento.moretones,
            observacion: currentSeguimiento.observacion,
        };

        handleSetFormData(prev => ({
            ...prev,
            seguimientos: [...(prev.seguimientos || []), finalSeguimiento]
        }));
        setCurrentSeguimiento(null);
    };

    const handleRemoveSeguimiento = (idToRemove: number) => {
      handleSetFormData(prev => ({
          ...prev,
          seguimientos: (prev.seguimientos || []).filter(s => s.id !== idToRemove)
      }));
    };

    return (
        <div className="space-y-6">
             <fieldset className="border p-4 rounded-md">
                 <legend className="text-lg font-bold px-2 text-black">Historial de Seguimientos</legend>
                 <div className="mt-4 overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                             <tr>
                                <th className="px-4 py-2">Fecha</th>
                                <th className="px-4 py-2">Procedimiento</th>
                                <th className="px-4 py-2">Personal</th>
                                <th className="px-4 py-2">Síntomas</th>
                                <th className="px-4 py-2">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                             {(formData.seguimientos || []).map(seg => {
                                 const sintomas = [
                                     seg.inflamacion && 'Inflamación',
                                     seg.ampollas && 'Ampollas',
                                     seg.alergias && 'Alergias',
                                     seg.malestarGeneral && 'Malestar',
                                     seg.brote && 'Brote',
                                     seg.dolorDeCabeza && 'Dolor Cabeza',
                                     seg.moretones && 'Moretones'
                                 ].filter(Boolean).join(', ');
                                 return (
                                    <tr key={seg.id} className="bg-white border-b">
                                        <td className="px-4 py-2">{new Date(seg.fechaSeguimiento + 'T00:00:00').toLocaleDateString('es-PE')}</td>
                                        <td className="px-4 py-2 font-medium text-gray-900">{seg.nombreProcedimiento}</td>
                                        <td className="px-4 py-2">{seg.personal}</td>
                                        <td className="px-4 py-2">{sintomas || 'Ninguno'}</td>
                                        <td className="px-4 py-2">
                                            <button type="button" onClick={() => handleRemoveSeguimiento(seg.id)} className="text-red-500 hover:text-red-700 p-1"><GoogleIcon name="delete" className="text-lg" /></button>
                                        </td>
                                    </tr>
                                );
                             })}
                            {(!formData.seguimientos || formData.seguimientos.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500">Aún no se han registrado seguimientos.</td>
                                </tr>
                            )}
                        </tbody>
                     </table>
                 </div>
                 {currentSeguimiento && (
                     <div className="mt-6 p-4 rounded-md border space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Procedimiento</label>
                                <select value={currentSeguimiento.procedimientoId || ''} onChange={e => handleCurrentSeguimientoSelectChange('procedimientoId', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2">
                                    <option value="">Seleccionar...</option>
                                    {formData.procedimientos?.map(p => <option key={p.id} value={String(p.id)}>{p.nombreTratamiento} (Sesión {p.sesionNumero})</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Personal</label>
                                <select value={currentSeguimiento.personal || ''} onChange={e => handleCurrentSeguimientoSelectChange('personal', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2">
                                    <option value="">Seleccionar...</option>
                                    {PERSONAL_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de Seguimiento</label>
                                <input type="date" value={currentSeguimiento.fechaSeguimiento || ''} onChange={e => handleCurrentSeguimientoChange('fechaSeguimiento', e.target.value)} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2" style={{ colorScheme: 'light' }}/>
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Síntomas Presentados</label>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                                 {(['inflamacion', 'ampollas', 'alergias', 'malestarGeneral', 'brote', 'dolorDeCabeza', 'moretones'] as const).map(key => (
                                     <div key={key} className="flex items-center">
                                         <input type="checkbox" id={key} checked={!!currentSeguimiento[key]} onChange={e => handleCurrentSeguimientoChange(key, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#aa632d] focus:ring-[#aa632d]" />
                                         <label htmlFor={key} className="ml-2 block text-sm text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                     </div>
                                 ))}
                             </div>
                        </div>
                         <div>
                             <label className="block text-xs font-medium text-gray-600 mb-1">Observación Adicional</label>
                             <textarea value={currentSeguimiento.observacion || ''} onChange={e => handleCurrentSeguimientoChange('observacion', e.target.value)} rows={3} className="w-full border-black bg-[#f9f9fa] text-black rounded-md text-sm p-2" />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setCurrentSeguimiento(null)} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button type="button" onClick={handleSaveCurrentSeguimiento} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">Añadir Seguimiento</button>
                        </div>
                     </div>
                 )}
                 {!currentSeguimiento && (
                     <div className="mt-6 flex justify-end">
                         <button
                            type="button"
                            onClick={handleShowAddSeguimientoForm}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
                        >
                            <GoogleIcon name="add" className="mr-2 text-xl" />
                            Registrar Seguimiento
                        </button>
                     </div>
                 )}
            </fieldset>

             <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-bold px-2 text-black flex items-center">
                    <GoogleIcon name="auto_awesome" className="mr-2 text-indigo-500" />
                    Resumen IA del Historial
                </legend>
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">
                        Genera un resumen automático de todas las observaciones y síntomas registrados en el historial de seguimiento del paciente para obtener una vista rápida de su evolución.
                    </p>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleGenerateSummary}
                            disabled={isGeneratingSummary || !formData.seguimientos || formData.seguimientos.length === 0}
                            className="flex items-center bg-indigo-600 text-white px-3