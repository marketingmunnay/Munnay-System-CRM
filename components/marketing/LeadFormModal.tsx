import React, { useState, useEffect, useMemo } from 'react';
import type { Lead, MetaCampaign, Treatment, Procedure, Personal, Medico, Seguimiento, RegistroLlamada, ClientSource, Service, ComprobanteElectronico, Campaign } from '../../types';
import { LeadStatus, Seller, MetodoPago, ReceptionStatus, EstadoLlamada, DocumentType, TipoComprobanteElectronico, SunatStatus } from '../../types';
import Modal from '../shared/Modal';
import FacturacionModal from '../finanzas/FacturacionModal';
import { RESOURCES } from '../../constants';
import * as api from '../../services/api';
import { formatDateForInput, formatDateForDisplay } from '../../utils/time';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  onDelete: (leadId: number) => void;
  lead: Lead | null;
  metaCampaigns: MetaCampaign[];
    campaigns?: Campaign[];
  clientSources: ClientSource[];
  services: Service[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
  onSaveComprobante: (comprobante: ComprobanteElectronico) => Promise<void>;
  comprobantes: ComprobanteElectronico[];
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Constantes para tipos de Personal y Medico
const PERSONAL_OPTIONS: Personal[] = ['Vanesa', 'Elvira', 'Janela', 'Liz', 'Keila', 'Luz', 'Dra. Marilia', 'Dra. Sofía', 'Dr. Carlos'];
const MEDICO_OPTIONS: Medico[] = ['Dra. Marilia', 'Dra. Sofía', 'Dr. Carlos'];

const FichaTabContent: React.FC<any> = ({ formData, handleChange, setFormData, currentLlamada, setCurrentLlamada, handleShowAddLlamadaForm, handleSaveCurrentLlamada, handleRemoveLlamada, campaigns, metaCampaigns, clientSources, CATEGORY_OPTIONS, SERVICE_CATEGORIES, services }) => {
    return (
        <div className="space-y-6">
             <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-4 border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Información Básica</legend>
                <div>
                    <label className="text-sm font-medium">Fecha Lead <span className="text-red-500">*</span></label>
                    <input type="date" name="fechaLead" value={formData.fechaLead || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', colorScheme: 'light', borderWidth: '1px' }} required />
                </div>
                <div>
                    <label className="text-sm font-medium">Tipo Documento</label>
                    <select name="documentType" value={formData.documentType || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}>
                        <option value="">Seleccionar...</option>
                        {Object.values(DocumentType).map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Número Documento</label>
                    <input type="text" name="documentNumber" value={formData.documentNumber || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}/>
                </div>
                <div>
                    <label className="text-sm font-medium">Nombres <span className="text-red-500">*</span></label>
                    <input type="text" name="nombres" value={formData.nombres || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} required />
                    {!formData.nombres?.trim() && <span className="text-red-500 text-xs">Este campo es requerido</span>}
                </div>
                 <div>
                    <label className="text-sm font-medium">Apellidos <span className="text-red-500">*</span></label>
                    <input type="text" name="apellidos" value={formData.apellidos || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} required />
                    {!formData.apellidos?.trim() && <span className="text-red-500 text-xs">Este campo es requerido</span>}
                </div>
                 <div>
                    <label className="text-sm font-medium">Número de Teléfono <span className="text-red-500">*</span></label>
                    <input type="tel" name="numero" value={formData.numero || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} required />
                    {!formData.numero?.trim() && <span className="text-red-500 text-xs">Este campo es requerido</span>}
                </div>
                 <div>
                    <label className="text-sm font-medium">Sexo</label>
                    <select name="sexo" value={formData.sexo || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}>
                        <option value="F">Femenino</option>
                        <option value="M">Masculino</option>
                    </select>
                </div>
            </fieldset>

                 <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-4 border p-4 rounded-md">
                     <legend className="text-md font-bold px-2 text-black">Origen y Seguimiento</legend>
                <div>
                    <label className="text-sm font-medium">Red Social / Origen <span className="text-red-500">*</span></label>
                    <select name="redSocial" value={formData.redSocial || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} required>
                        {clientSources.map(cs => <option key={cs.id} value={cs.nombre}>{cs.nombre}</option>)}
                    </select>
                    {!formData.redSocial && <span className="text-red-500 text-xs">Este campo es requerido</span>}
                </div>
                 <div>
                    <label className="text-sm font-medium">Campaña / Anuncio <span className="text-red-500">*</span></label>
                    <select name="anuncio" value={formData.anuncio || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} required>
                        <option value="">Seleccionar anuncio...</option>
                        {campaigns?.map(c => <option key={c.id} value={c.nombreAnuncio}>{c.nombreAnuncio}</option>)}
                    </select>
                    {!formData.anuncio && <span className="text-red-500 text-xs">Este campo es requerido</span>}
                </div>
                <div>
                    <label className="text-sm font-medium">Vendedor(a) <span className="text-red-500">*</span></label>
                    <select name="vendedor" value={formData.vendedor || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} required>
                        <option value="">Seleccionar...</option>
                        {Object.values(Seller).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {!formData.vendedor && <span className="text-red-500 text-xs">Este campo es requerido</span>}
                </div>
                <div>
                    <label className="text-sm font-medium">Estado del Lead <span className="text-red-500">*</span></label>
                    <select name="estado" value={formData.estado || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} required>
                        <option value="">Seleccionar...</option>
                        {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {!formData.estado && <span className="text-red-500 text-xs">Este campo es requerido</span>}
                </div>
            </fieldset>

            {/* When lead is Agendado show agenda fields (Fecha/Hora y Recurso) */}
            {formData.estado === LeadStatus.Agendado && (
                <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-3 border p-4 rounded-md">
                    <legend className="text-md font-bold px-2 text-black">Agenda</legend>
                    <div>
                        <label className="text-sm font-medium">Fecha y Hora de Agenda</label>
                        <input type="datetime-local" name="fechaHoraAgenda" value={formData.fechaHoraAgenda?.substring(0,16) || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', colorScheme: 'light', borderWidth: '1px' }} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Recurso Asignado</label>
                        <select name="recursoId" value={formData.recursoId || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}>
                            <option value="">Seleccionar Recurso...</option>
                            {RESOURCES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </fieldset>
            )}

            <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-3 border p-4 rounded-md">
               <legend className="text-md font-bold px-2 text-black">Agenda y pago</legend>
               <div>
                   <label className="text-sm font-medium">Categoría de Servicio</label>
                   <select name="categoria" value={formData.categoria || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}>
                        {CATEGORY_OPTIONS.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
               </div>
               <div>
                   <label className="text-sm font-medium">Servicio de Interés</label>
                   <select name="servicioInteres" value={formData.servicios?.[0] || ''} onChange={(e) => {
                       const selected = e.target.value;
                       const found = services?.find(s => s.nombre === selected);
                       setFormData(prev => {
                           const precio = found ? found.precio : (prev.precioCita || 0);
                           const montoPagado = prev.montoPagado || 0;
                           return { ...prev, servicios: selected ? [selected] : [], precioCita: precio, deudaCita: precio - montoPagado };
                       });
                   }} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}>
                       <option value="">Seleccionar servicio...</option>
                       {SERVICE_CATEGORIES[formData.categoria]?.map((serv: string) => <option key={serv} value={serv}>{serv}</option>)}
                   </select>
               </div>
               <div>
                   <label className="text-sm font-medium">Precio Cita</label>
                   <div className="w-full border border-black bg-gray-100 text-black rounded-md p-2 font-medium">
                       S/ {(formData.precioCita || 0).toFixed(2)}
                   </div>
               </div>
               <div>
                   <label className="text-sm font-medium">
                       Monto Pagado Cita 
                       {formData.estado === LeadStatus.Agendado && <span className="text-red-500">*</span>}
                   </label>
                   <input 
                       type="number" 
                       step="0.01" 
                       name="montoPagado" 
                       value={formData.montoPagado ?? ''} 
                       onChange={(e) => {
                           const value = e.target.value === '' ? undefined : Number(e.target.value);
                           const precio = formData.precioCita || 0;
                           setFormData(prev => ({ 
                               ...prev, 
                               montoPagado: value,
                               deudaCita: precio - (value || 0)
                           }));
                       }}
                       placeholder="0.00"
                       className="w-full bg-[#f9f9fa] p-2"
                       style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                       required={formData.estado === LeadStatus.Agendado}
                   />
                   {formData.estado === LeadStatus.Agendado && formData.montoPagado === undefined && (
                       <span className="text-red-500 text-xs">Este campo es requerido</span>
                   )}
               </div>
               <div>
                   <label className="text-sm font-medium">
                       Método Pago 
                       {formData.estado === LeadStatus.Agendado && <span className="text-red-500">*</span>}
                   </label>
                   <select 
                       name="metodoPago" 
                       value={formData.metodoPago || ''} 
                       onChange={handleChange} 
                       className="w-full bg-[#f9f9fa] p-2"
                       style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                       required={formData.estado === LeadStatus.Agendado}
                   >
                       <option value="">Seleccionar...</option>
                       {Object.values(MetodoPago).map(mp => <option key={mp} value={mp}>{mp}</option>)}
                   </select>
                   {formData.estado === LeadStatus.Agendado && !formData.metodoPago && (
                       <span className="text-red-500 text-xs">Este campo es requerido</span>
                   )}
               </div>
               <div>
                   <label className="text-sm font-medium">Deuda Cita</label>
                   <div className="w-full border border-black bg-gray-100 text-black rounded-md p-2 font-medium">
                       S/ {(formData.deudaCita || 0).toFixed(2)}
                   </div>
               </div>
           </fieldset>
            
             <fieldset className="grid grid-cols-1 gap-6 border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Registro de Llamadas</legend>
                {/* Call log table */}
                <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2">N°</th>
                                <th className="p-2">Duración</th>
                                <th className="p-2">Estado</th>
                                <th className="p-2">Observación</th>
                                <th className="p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.registrosLlamada?.map((llamada: any) => (
                                <tr key={llamada.id} className="border-b">
                                    <td className="p-2">{llamada.numeroLlamada}</td>
                                    <td className="p-2">{llamada.duracionLlamada}</td>
                                    <td className="p-2">{llamada.estadoLlamada}</td>
                                    <td className="p-2 truncate max-w-xs">{llamada.observacion}</td>
                                    <td className="p-2"><button type="button" onClick={() => handleRemoveLlamada(llamada.id)} className="text-red-500"><GoogleIcon name="delete"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Form to add a new call log */}
                {currentLlamada ? (
                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 rounded-md">
                        <input type="time" step="1" value={currentLlamada.duracionLlamada} onChange={(e) => setCurrentLlamada({...currentLlamada, duracionLlamada: e.target.value})} className="bg-white p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} />
                        <select value={currentLlamada.estadoLlamada} onChange={(e) => setCurrentLlamada({...currentLlamada, estadoLlamada: e.target.value})} className="bg-white p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}>
                            {Object.values(EstadoLlamada).map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <input type="text" placeholder="Observación" value={currentLlamada.observacion || ''} onChange={(e) => setCurrentLlamada({...currentLlamada, observacion: e.target.value})} className="col-span-2 bg-white p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} />
                        <div className="col-span-4 flex justify-end space-x-2">
                            <button type="button" onClick={() => setCurrentLlamada(null)} className="px-3 py-1 bg-gray-300 rounded">Cancelar</button>
                            <button type="button" onClick={handleSaveCurrentLlamada} className="px-3 py-1 bg-green-500 text-white rounded">Guardar Llamada</button>
                        </div>
                    </div>
                ) : (
                    <button type="button" onClick={handleShowAddLlamadaForm} className="text-sm text-blue-600 flex items-center"><GoogleIcon name="add_call"/> Añadir Registro de Llamada</button>
                )}
            </fieldset>

        </div>
    );
};

const RecepcionTabContent: React.FC<any> = ({ formData, handleChange, handleGenerateHistoryNumber, handleSetFormData, totales, services }) => {
    const [editingPayments, setEditingPayments] = useState(false);
    const [tempPagosRecepcion, setTempPagosRecepcion] = useState<any[]>([]);
    const [newPago, setNewPago] = useState<any>(null);
    
    const [editingTreatments, setEditingTreatments] = useState(false);
    const [tempTreatments, setTempTreatments] = useState<Treatment[]>([]);

    // Calcular deuda de la cita
    const precioCita = formData.precioCita || 0;
    const pagoInicial = formData.montoPagado || 0;
    const pagosRecepcion = formData.pagosRecepcion || [];
    const totalPagosRecepcion = pagosRecepcion.reduce((sum: number, p: any) => sum + (p.monto || 0), 0);
    const deudaCita = precioCita - pagoInicial - totalPagosRecepcion;

    // Mostrar sección de pagos solo si hay precio o pagos
    const mostrarSeccionPagos = precioCita > 0 || pagosRecepcion.length > 0;

    // Calcular totales de tratamientos
    const tratamientos = formData.tratamientos || [];
    const totalesTratamientos = tratamientos.reduce((acc: any, t: Treatment) => {
        acc.precio += t.precio || 0;
        acc.pagado += t.montoPagado || 0;
        acc.deuda += t.deuda || 0;
        return acc;
    }, { precio: 0, pagado: 0, deuda: 0 });

    const handleStartEditPayments = () => {
        setTempPagosRecepcion([...(formData.pagosRecepcion || [])]);
        setEditingPayments(true);
    };

    const handleSavePayments = () => {
        handleSetFormData({ ...formData, pagosRecepcion: tempPagosRecepcion });
        setEditingPayments(false);
    };

    const handleCancelPayments = () => {
        setTempPagosRecepcion([]);
        setEditingPayments(false);
    };

    const handleAddPago = () => {
        if (newPago && newPago.monto > 0 && newPago.metodoPago) {
            const updatedPagos = [...(formData.pagosRecepcion || []), { ...newPago, id: Date.now() }];
            handleSetFormData({ ...formData, pagosRecepcion: updatedPagos });
            setNewPago(null);
        }
    };

    const handleStartEditTreatments = () => {
        setTempTreatments([...(formData.tratamientos || [])]);
        setEditingTreatments(true);
    };

    const handleAddTreatment = () => {
        const newTreatment: Treatment = {
            id: Date.now(),
            nombre: '',
            cantidadSesiones: 1,
            precio: 0,
            montoPagado: 0,
            deuda: 0,
        };
        setTempTreatments([...tempTreatments, newTreatment]);
    };

    const handleTreatmentChange = (id: number, field: string, value: any) => {
        setTempTreatments(prev => prev.map(t => {
            if (t.id === id) {
                const updated = { ...t, [field]: value };
                
                // Si cambió el nombre (servicio), buscar precio automático
                if (field === 'nombre') {
                    const service = services?.find((s: Service) => s.nombre === value);
                    if (service) {
                        updated.precio = service.precio;
                        updated.deuda = service.precio - (updated.montoPagado || 0);
                    }
                }
                
                // Recalcular deuda si cambió precio o montoPagado
                if (field === 'precio' || field === 'montoPagado') {
                    updated.deuda = (updated.precio || 0) - (updated.montoPagado || 0);
                }
                
                return updated;
            }
            return t;
        }));
    };

    const handleRemoveTreatment = (id: number) => {
        setTempTreatments(prev => prev.filter(t => t.id !== id));
    };

    const handleSaveTreatments = () => {
        handleSetFormData({ ...formData, tratamientos: tempTreatments });
        setEditingTreatments(false);
    };

    const handleCancelTreatments = () => {
        setTempTreatments([]);
        setEditingTreatments(false);
    };

    return (
         <div className="space-y-6">
            {/* Información General y Estado del Paciente */}
            <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-3 border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Información General y Estado del Paciente</legend>
                <div>
                    <label className="text-sm font-medium">N° Historia Clínica</label>
                    <div className="flex items-center">
                        <input 
                            type="text" 
                            name="nHistoria" 
                            value={formData.nHistoria || ''} 
                            onChange={handleChange} 
                            disabled={!!formData.nHistoria}
                            className="w-full bg-[#f9f9fa] rounded-l-md p-2 disabled:bg-gray-100"
                            style={{ borderColor: '#6b7280', borderRadius: '8px 0 0 8px', color: 'black', borderWidth: '1px' }}
                        />
                        <button 
                            type="button" 
                            onClick={handleGenerateHistoryNumber} 
                            disabled={!!formData.nHistoria}
                            className="bg-[#aa632d] hover:bg-[#8e5225] text-white px-3 py-2 rounded-r-md text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Generar
                        </button>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium">Estado en Recepción</label>
                    <select name="estadoRecepcion" value={formData.estadoRecepcion || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}>
                        <option value="">Seleccionar...</option>
                        {Object.values(ReceptionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">¿Aceptó tratamiento?</label>
                    <select name="aceptoTratamiento" value={formData.aceptoTratamiento || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}>
                        <option value="">Seleccionar...</option>
                        <option value="Si">Sí</option>
                        <option value="No">No</option>
                    </select>
                </div>
                {formData.aceptoTratamiento === 'No' && (
                    <div className="md:col-span-3">
                        <label className="text-sm font-medium">Motivo de No Cierre <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            name="motivoNoCierre" 
                            value={formData.motivoNoCierre || ''} 
                            onChange={handleChange} 
                            required
                            className="w-full bg-[#f9f9fa] p-2"
                            style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                            placeholder="Indique el motivo por el cual no se concretó la venta"
                        />
                    </div>
                )}
            </fieldset>

            {/* Gestión de Pago de la Cita de Evaluación */}
            {mostrarSeccionPagos && (
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-md font-bold px-2 text-black">Gestión de Pago de la Cita de Evaluación</legend>
                    
                    <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 p-3 rounded">
                            <div className="text-gray-600">Precio Cita</div>
                            <div className="text-lg font-bold text-blue-700">S/ {precioCita.toFixed(2)}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                            <div className="text-gray-600">Total Pagado</div>
                            <div className="text-lg font-bold text-green-700">S/ {(pagoInicial + totalPagosRecepcion).toFixed(2)}</div>
                        </div>
                        <div className={`p-3 rounded ${deudaCita > 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                            <div className="text-gray-600">Deuda Cita</div>
                            <div className={`text-lg font-bold ${deudaCita > 0 ? 'text-yellow-700' : 'text-gray-700'}`}>
                                S/ {deudaCita.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Alerta de deuda pendiente */}
                    {deudaCita > 0 && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
                            <div className="flex items-start">
                                <GoogleIcon name="warning" className="text-yellow-600 mr-2" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-yellow-800">Deuda Pendiente: S/ {deudaCita.toFixed(2)}</h4>
                                    <p className="text-sm text-yellow-700 mb-3">Complete el pago de la cita de evaluación</p>
                                    
                                    {/* Formulario para completar pago */}
                                    {!newPago && (
                                        <button 
                                            type="button"
                                            onClick={() => setNewPago({ monto: deudaCita, metodoPago: '' })}
                                            className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                                        >
                                            Completar Pago
                                        </button>
                                    )}
                                    
                                    {newPago && (
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            <input 
                                                type="number"
                                                step="0.01"
                                                value={newPago.monto}
                                                onChange={(e) => setNewPago({...newPago, monto: Number(e.target.value)})}
                                                className="bg-white p-2"
                                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                                placeholder="Monto"
                                            />
                                            <select 
                                                value={newPago.metodoPago}
                                                onChange={(e) => setNewPago({...newPago, metodoPago: e.target.value})}
                                                className="bg-white p-2"
                                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                            >
                                                <option value="">Método de pago...</option>
                                                {Object.values(MetodoPago).map(mp => <option key={mp} value={mp}>{mp}</option>)}
                                            </select>
                                            <div className="flex gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={handleAddPago}
                                                    className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                                                >
                                                    Registrar
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setNewPago(null)}
                                                    className="flex-1 bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 text-sm"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lista de pagos en recepción */}
                    {pagosRecepcion.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Pagos Registrados en Recepción</h4>
                                {!editingPayments && (
                                    <button 
                                        type="button"
                                        onClick={handleStartEditPayments}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        <GoogleIcon name="edit" className="text-base" /> Editar Pagos
                                    </button>
                                )}
                            </div>
                            
                            <table className="w-full text-sm border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-left">Monto</th>
                                        <th className="p-2 text-left">Método de Pago</th>
                                        {editingPayments && <th className="p-2">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(editingPayments ? tempPagosRecepcion : pagosRecepcion).map((pago: any, index: number) => (
                                        <tr key={pago.id || index} className="border-b">
                                            <td className="p-2">
                                                {editingPayments ? (
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        value={pago.monto}
                                                        onChange={(e) => {
                                                            const updated = [...tempPagosRecepcion];
                                                            updated[index].monto = Number(e.target.value);
                                                            setTempPagosRecepcion(updated);
                                                        }}
                                                        className="w-full p-1"
                                                        style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                                    />
                                                ) : (
                                                    `S/ ${pago.monto.toFixed(2)}`
                                                )}
                                            </td>
                                            <td className="p-2">
                                                {editingPayments ? (
                                                    <select 
                                                        value={pago.metodoPago}
                                                        onChange={(e) => {
                                                            const updated = [...tempPagosRecepcion];
                                                            updated[index].metodoPago = e.target.value;
                                                            setTempPagosRecepcion(updated);
                                                        }}
                                                        className="w-full p-1"
                                                        style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                                    >
                                                        {Object.values(MetodoPago).map(mp => <option key={mp} value={mp}>{mp}</option>)}
                                                    </select>
                                                ) : (
                                                    pago.metodoPago
                                                )}
                                            </td>
                                            {editingPayments && (
                                                <td className="p-2 text-center">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setTempPagosRecepcion(tempPagosRecepcion.filter((_, i) => i !== index))}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <GoogleIcon name="delete" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {editingPayments && (
                                <div className="flex justify-end gap-2 mt-2">
                                    <button 
                                        type="button"
                                        onClick={handleCancelPayments}
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleSavePayments}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </fieldset>
            )}

            {/* Tratamientos Vendidos - Solo si aceptó tratamiento */}
            {formData.aceptoTratamiento === 'Si' && (
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-md font-bold px-2 text-black">Tratamientos Vendidos</legend>
                    
                    {!editingTreatments && tratamientos.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                            <p>No hay tratamientos registrados</p>
                        </div>
                    )}
                    
                    {(editingTreatments ? tempTreatments : tratamientos).length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2">Servicio</th>
                                        <th className="p-2">Sesiones</th>
                                        <th className="p-2">Precio</th>
                                        <th className="p-2">Monto Pagado</th>
                                        <th className="p-2">Deuda</th>
                                        {editingTreatments && <th className="p-2">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(editingTreatments ? tempTreatments : tratamientos).map((treatment: Treatment) => (
                                        <tr key={treatment.id} className="border-b">
                                            <td className="p-2">
                                                {editingTreatments ? (
                                                    <select 
                                                        value={treatment.nombre}
                                                        onChange={(e) => handleTreatmentChange(treatment.id, 'nombre', e.target.value)}
                                                        className="w-full p-1"
                                                        style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        {services?.map((s: Service) => (
                                                            <option key={s.id} value={s.nombre}>{s.nombre}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    treatment.nombre
                                                )}
                                            </td>
                                            <td className="p-2">
                                                {editingTreatments ? (
                                                    <input 
                                                        type="number"
                                                        value={treatment.cantidadSesiones || 1}
                                                        onChange={(e) => handleTreatmentChange(treatment.id, 'cantidadSesiones', Number(e.target.value))}
                                                        className="w-20 p-1"
                                                        style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                                    />
                                                ) : (
                                                    treatment.cantidadSesiones || 1
                                                )}
                                            </td>
                                            <td className="p-2">
                                                {editingTreatments ? (
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        value={treatment.precio}
                                                        onChange={(e) => handleTreatmentChange(treatment.id, 'precio', Number(e.target.value))}
                                                        className="w-24 p-1"
                                                        style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                                    />
                                                ) : (
                                                    `S/ ${treatment.precio.toFixed(2)}`
                                                )}
                                            </td>
                                            <td className="p-2">
                                                {editingTreatments ? (
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        value={treatment.montoPagado}
                                                        onChange={(e) => handleTreatmentChange(treatment.id, 'montoPagado', Number(e.target.value))}
                                                        className="w-24 p-1"
                                                        style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                                    />
                                                ) : (
                                                    `S/ ${treatment.montoPagado.toFixed(2)}`
                                                )}
                                            </td>
                                            <td className="p-2 font-medium">
                                                S/ {treatment.deuda.toFixed(2)}
                                            </td>
                                            {editingTreatments && (
                                                <td className="p-2 text-center">
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleRemoveTreatment(treatment.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <GoogleIcon name="delete" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold">
                                        <td className="p-2" colSpan={2}>TOTALES</td>
                                        <td className="p-2">S/ {(editingTreatments ? tempTreatments : tratamientos).reduce((sum: number, t: Treatment) => sum + (t.precio || 0), 0).toFixed(2)}</td>
                                        <td className="p-2">S/ {(editingTreatments ? tempTreatments : tratamientos).reduce((sum: number, t: Treatment) => sum + (t.montoPagado || 0), 0).toFixed(2)}</td>
                                        <td className="p-2">S/ {(editingTreatments ? tempTreatments : tratamientos).reduce((sum: number, t: Treatment) => sum + (t.deuda || 0), 0).toFixed(2)}</td>
                                        {editingTreatments && <td></td>}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    <div className="flex justify-between mt-4">
                        {editingTreatments ? (
                            <>
                                <button 
                                    type="button"
                                    onClick={handleAddTreatment}
                                    className="text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center"
                                >
                                    <GoogleIcon name="add" className="mr-1" /> Añadir Tratamiento
                                </button>
                                <div className="flex gap-2">
                                    <button 
                                        type="button"
                                        onClick={handleCancelTreatments}
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleSaveTreatments}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Guardar Tratamientos
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button 
                                type="button"
                                onClick={handleStartEditTreatments}
                                className="text-sm bg-[#aa632d] text-white px-4 py-2 rounded hover:bg-[#8e5225] flex items-center"
                            >
                                <GoogleIcon name="edit" className="mr-1" /> Gestionar Tratamientos
                            </button>
                        )}
                    </div>
                </fieldset>
            )}
        </div>
    );
};

const ProcedimientosTabContent: React.FC<any> = ({ formData, handleSetFormData }) => {
    const [currentProcedure, setCurrentProcedure] = useState<Partial<Procedure> | null>(null);
    const [editingProcedureId, setEditingProcedureId] = useState<number | null>(null);

    // Función para obtener el siguiente número de sesión para un tratamiento
    const getNextSessionNumber = (tratamientoId: number): number => {
        if (!formData.procedimientos || formData.procedimientos.length === 0) return 1;
        
        const procedimientosDelTratamiento = formData.procedimientos.filter(
            (p: Procedure) => p.tratamientoId === tratamientoId
        );
        
        if (procedimientosDelTratamiento.length === 0) return 1;
        
        const maxSession = Math.max(...procedimientosDelTratamiento.map((p: Procedure) => p.sesionNumero));
        return maxSession + 1;
    };

    // Agrupar procedimientos por tratamiento
    const procedimientosPorTratamiento = useMemo(() => {
        if (!formData.procedimientos) return {};
        
        const grupos: Record<number, Procedure[]> = {};
        formData.procedimientos.forEach((proc: Procedure) => {
            if (!grupos[proc.tratamientoId]) {
                grupos[proc.tratamientoId] = [];
            }
            grupos[proc.tratamientoId].push(proc);
        });
        
        return grupos;
    }, [formData.procedimientos]);

    const handleAddProcedure = () => {
        if (!formData.tratamientos || formData.tratamientos.length === 0) return;
        
        setCurrentProcedure({
            id: Date.now(),
            fechaAtencion: new Date().toISOString().split('T')[0],
            horaInicio: '',
            horaFin: '',
            tratamientoId: formData.tratamientos[0].id,
            nombreTratamiento: formData.tratamientos[0].nombre,
            sesionNumero: getNextSessionNumber(formData.tratamientos[0].id),
            personal: 'Vanesa',
            asistenciaMedica: false,
            observacion: ''
        });
        setEditingProcedureId(null);
    };

    const handleEditProcedure = (procedure: Procedure) => {
        setCurrentProcedure({ ...procedure });
        setEditingProcedureId(procedure.id);
    };

    const handleSaveProcedure = () => {
        if (!currentProcedure) return;
        
        const procedureToSave: Procedure = {
            id: currentProcedure.id || Date.now(),
            fechaAtencion: currentProcedure.fechaAtencion || '',
            horaInicio: currentProcedure.horaInicio || '',
            horaFin: currentProcedure.horaFin || '',
            tratamientoId: currentProcedure.tratamientoId || 0,
            nombreTratamiento: currentProcedure.nombreTratamiento || '',
            sesionNumero: currentProcedure.sesionNumero || 1,
            personal: currentProcedure.personal || 'Vanesa',
            asistenciaMedica: currentProcedure.asistenciaMedica || false,
            medico: currentProcedure.medico,
            observacion: currentProcedure.observacion
        };

        handleSetFormData((prev: Partial<Lead>) => {
            const procedimientos = prev.procedimientos || [];
            
            if (editingProcedureId !== null) {
                return {
                    ...prev,
                    procedimientos: procedimientos.map((p: Procedure) => 
                        p.id === editingProcedureId ? procedureToSave : p
                    )
                };
            } else {
                return {
                    ...prev,
                    procedimientos: [...procedimientos, procedureToSave]
                };
            }
        });

        setCurrentProcedure(null);
        setEditingProcedureId(null);
    };

    const handleDeleteProcedure = (procedureId: number) => {
        handleSetFormData((prev: Partial<Lead>) => ({
            ...prev,
            procedimientos: (prev.procedimientos || []).filter((p: Procedure) => p.id !== procedureId),
            // Eliminar todos los seguimientos asociados a este procedimiento
            seguimientos: (prev.seguimientos || []).filter((s: Seguimiento) => s.procedimientoId !== procedureId)
        }));
    };

    const handleProcedureFieldChange = (field: string, value: any) => {
        setCurrentProcedure(prev => {
            if (!prev) return null;
            
            const updated = { ...prev, [field]: value };
            
            // Si cambia el tratamiento, actualizar el nombre y el número de sesión
            if (field === 'tratamientoId') {
                const tratamiento = formData.tratamientos?.find((t: Treatment) => t.id === Number(value));
                if (tratamiento) {
                    updated.nombreTratamiento = tratamiento.nombre;
                    updated.sesionNumero = getNextSessionNumber(Number(value));
                }
            }
            
            return updated;
        });
    };

    const tratamientosDisponibles = formData.tratamientos || [];
    const hasTratamientos = tratamientosDisponibles.length > 0;

    return (
        <div className="space-y-6">
            {/* Header con botón Añadir */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Procedimientos Realizados</h3>
                <button
                    type="button"
                    onClick={handleAddProcedure}
                    disabled={!hasTratamientos}
                    className={`flex items-center px-4 py-2 rounded-lg text-white text-sm ${
                        hasTratamientos 
                            ? 'bg-[#aa632d] hover:bg-[#8e5225]' 
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    title={!hasTratamientos ? 'Debe agregar tratamientos en la pestaña Recepción primero' : ''}
                >
                    <GoogleIcon name="add" className="mr-1" />
                    Añadir Procedimiento
                </button>
            </div>

            {!hasTratamientos && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <GoogleIcon name="info" className="text-yellow-600 text-2xl mb-2" />
                    <p className="text-yellow-800 font-medium">No hay tratamientos registrados</p>
                    <p className="text-yellow-600 text-sm">Agregue tratamientos en la pestaña "Recepción" para poder registrar procedimientos.</p>
                </div>
            )}

            {/* Formulario de Añadir/Editar Procedimiento */}
            {currentProcedure && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-blue-900 flex items-center">
                        <GoogleIcon name="medical_services" className="mr-2" />
                        {editingProcedureId ? 'Editar Procedimiento' : 'Nuevo Procedimiento'}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Tratamiento *</label>
                            <select
                                value={currentProcedure.tratamientoId || ''}
                                onChange={(e) => handleProcedureFieldChange('tratamientoId', e.target.value)}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                required
                            >
                                {tratamientosDisponibles.map((t: Treatment) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombre} ({t.cantidadSesiones} sesiones)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">N° de Sesión *</label>
                            <input
                                type="number"
                                min="1"
                                value={currentProcedure.sesionNumero || ''}
                                onChange={(e) => handleProcedureFieldChange('sesionNumero', Number(e.target.value))}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Fecha de Atención *</label>
                            <input
                                type="date"
                                value={formatDateForInput(currentProcedure.fechaAtencion)}
                                onChange={(e) => handleProcedureFieldChange('fechaAtencion', e.target.value)}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', colorScheme: 'light', borderWidth: '1px' }}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Personal *</label>
                            <select
                                value={currentProcedure.personal || ''}
                                onChange={(e) => handleProcedureFieldChange('personal', e.target.value)}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                required
                            >
                                {PERSONAL_OPTIONS.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Hora Inicio *</label>
                            <input
                                type="time"
                                value={currentProcedure.horaInicio || ''}
                                onChange={(e) => handleProcedureFieldChange('horaInicio', e.target.value)}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Hora Fin *</label>
                            <input
                                type="time"
                                value={currentProcedure.horaFin || ''}
                                onChange={(e) => handleProcedureFieldChange('horaFin', e.target.value)}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={currentProcedure.asistenciaMedica || false}
                                    onChange={(e) => handleProcedureFieldChange('asistenciaMedica', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Asistencia Médica</span>
                            </label>
                        </div>

                        {currentProcedure.asistenciaMedica && (
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-gray-700">Médico *</label>
                                <select
                                    value={currentProcedure.medico || ''}
                                    onChange={(e) => handleProcedureFieldChange('medico', e.target.value)}
                                    className="w-full bg-white p-2"
                                    style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                    required
                                >
                                    <option value="">Seleccionar médico...</option>
                                    {MEDICO_OPTIONS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Observación</label>
                            <textarea
                                value={currentProcedure.observacion || ''}
                                onChange={(e) => handleProcedureFieldChange('observacion', e.target.value)}
                                rows={3}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                placeholder="Notas sobre el procedimiento..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentProcedure(null);
                                setEditingProcedureId(null);
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveProcedure}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Guardar Procedimiento
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de Procedimientos Agrupados por Tratamiento */}
            {hasTratamientos && Object.keys(procedimientosPorTratamiento).length > 0 && (
                <div className="space-y-4">
                    {tratamientosDisponibles.map((tratamiento: Treatment) => {
                        const procedimientos = procedimientosPorTratamiento[tratamiento.id] || [];
                        const sesionesCompletadas = procedimientos.length;
                        const totalSesiones = tratamiento.cantidadSesiones;
                        const progreso = totalSesiones > 0 ? (sesionesCompletadas / totalSesiones) * 100 : 0;
                        
                        if (sesionesCompletadas === 0) return null;

                        return (
                            <div key={tratamiento.id} className="border border-gray-300 rounded-lg overflow-hidden">
                                {/* Header del Tratamiento */}
                                <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-gray-800 flex items-center">
                                            <GoogleIcon name="spa" className="mr-2 text-purple-600" />
                                            {tratamiento.nombre}
                                        </h4>
                                        <span className="text-sm font-semibold text-purple-700 bg-white px-3 py-1 rounded-full">
                                            {sesionesCompletadas} / {totalSesiones} sesiones
                                        </span>
                                    </div>
                                    
                                    {/* Barra de Progreso */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(progreso, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Lista de Procedimientos */}
                                <div className="divide-y divide-gray-200">
                                    {procedimientos
                                        .sort((a: Procedure, b: Procedure) => b.sesionNumero - a.sesionNumero)
                                        .map((proc: Procedure) => (
                                            <div key={proc.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="font-semibold text-purple-700">Sesión #{proc.sesionNumero}</span>
                                                            <p className="text-gray-600 text-xs mt-1">{formatDateForDisplay(proc.fechaAtencion)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Horario:</span>
                                                            <p className="text-gray-800 font-medium">{proc.horaInicio} - {proc.horaFin}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Personal:</span>
                                                            <p className="text-gray-800 font-medium">{proc.personal}</p>
                                                        </div>
                                                        <div>
                                                            {proc.asistenciaMedica && (
                                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                                    <GoogleIcon name="local_hospital" className="mr-1 text-xs" />
                                                                    {proc.medico || 'Médico'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex space-x-2 ml-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditProcedure(proc)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Editar procedimiento"
                                                        >
                                                            <GoogleIcon name="edit" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (window.confirm('¿Está seguro de eliminar este procedimiento? También se eliminarán todos los seguimientos asociados.')) {
                                                                    handleDeleteProcedure(proc.id);
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Eliminar procedimiento"
                                                        >
                                                            <GoogleIcon name="delete" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {proc.observacion && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                                                        <span className="text-gray-500 font-medium">Observación: </span>
                                                        <span className="text-gray-700">{proc.observacion}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {hasTratamientos && Object.keys(procedimientosPorTratamiento).length === 0 && !currentProcedure && (
                <div className="text-center py-12 text-gray-500">
                    <GoogleIcon name="event_note" className="text-6xl mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay procedimientos registrados</p>
                    <p className="text-sm">Haga clic en "Añadir Procedimiento" para comenzar el historial clínico.</p>
                </div>
            )}
        </div>
    );
};

const SeguimientoTabContent: React.FC<any> = ({ formData, handleSetFormData }) => {
    const [currentSeguimiento, setCurrentSeguimiento] = useState<Partial<Seguimiento> | null>(null);
    const [editingSeguimientoId, setEditingSeguimientoId] = useState<number | null>(null);

    const procedimientosDisponibles = formData.procedimientos || [];
    const hasProcedimientos = procedimientosDisponibles.length > 0;

    // Generar texto descriptivo para cada procedimiento
    const getProcedimientoLabel = (proc: Procedure): string => {
        return `${proc.nombreTratamiento} - Sesión ${proc.sesionNumero} (${proc.fechaAtencion})`;
    };

    const handleAddSeguimiento = () => {
        if (!hasProcedimientos) return;
        
        const primerProcedimiento = procedimientosDisponibles[0];
        
        setCurrentSeguimiento({
            id: Date.now(),
            procedimientoId: primerProcedimiento.id,
            nombreProcedimiento: getProcedimientoLabel(primerProcedimiento),
            fechaSeguimiento: new Date().toISOString().split('T')[0],
            personal: 'Vanesa',
            inflamacion: false,
            ampollas: false,
            alergias: false,
            malestarGeneral: false,
            brote: false,
            dolorDeCabeza: false,
            moretones: false,
            observacion: ''
        });
        setEditingSeguimientoId(null);
    };

    const handleEditSeguimiento = (seguimiento: Seguimiento) => {
        setCurrentSeguimiento({ ...seguimiento });
        setEditingSeguimientoId(seguimiento.id);
    };

    const handleSaveSeguimiento = () => {
        if (!currentSeguimiento) return;
        
        const seguimientoToSave: Seguimiento = {
            id: currentSeguimiento.id || Date.now(),
            procedimientoId: currentSeguimiento.procedimientoId || 0,
            nombreProcedimiento: currentSeguimiento.nombreProcedimiento || '',
            fechaSeguimiento: currentSeguimiento.fechaSeguimiento || '',
            personal: currentSeguimiento.personal || 'Vanesa',
            inflamacion: currentSeguimiento.inflamacion || false,
            ampollas: currentSeguimiento.ampollas || false,
            alergias: currentSeguimiento.alergias || false,
            malestarGeneral: currentSeguimiento.malestarGeneral || false,
            brote: currentSeguimiento.brote || false,
            dolorDeCabeza: currentSeguimiento.dolorDeCabeza || false,
            moretones: currentSeguimiento.moretones || false,
            observacion: currentSeguimiento.observacion
        };

        handleSetFormData((prev: Partial<Lead>) => {
            const seguimientos = prev.seguimientos || [];
            
            if (editingSeguimientoId !== null) {
                return {
                    ...prev,
                    seguimientos: seguimientos.map((s: Seguimiento) => 
                        s.id === editingSeguimientoId ? seguimientoToSave : s
                    )
                };
            } else {
                return {
                    ...prev,
                    seguimientos: [...seguimientos, seguimientoToSave]
                };
            }
        });

        setCurrentSeguimiento(null);
        setEditingSeguimientoId(null);
    };

    const handleDeleteSeguimiento = (seguimientoId: number) => {
        handleSetFormData((prev: Partial<Lead>) => ({
            ...prev,
            seguimientos: (prev.seguimientos || []).filter((s: Seguimiento) => s.id !== seguimientoId)
        }));
    };

    const handleSeguimientoFieldChange = (field: string, value: any) => {
        setCurrentSeguimiento(prev => {
            if (!prev) return null;
            
            const updated = { ...prev, [field]: value };
            
            // Si cambia el procedimiento, actualizar el nombre descriptivo
            if (field === 'procedimientoId') {
                const procedimiento = procedimientosDisponibles.find((p: Procedure) => p.id === Number(value));
                if (procedimiento) {
                    updated.nombreProcedimiento = getProcedimientoLabel(procedimiento);
                }
            }
            
            return updated;
        });
    };

    // Contar síntomas reportados
    const contarSintomas = (seg: Seguimiento): number => {
        let count = 0;
        if (seg.inflamacion) count++;
        if (seg.ampollas) count++;
        if (seg.alergias) count++;
        if (seg.malestarGeneral) count++;
        if (seg.brote) count++;
        if (seg.dolorDeCabeza) count++;
        if (seg.moretones) count++;
        return count;
    };

    const seguimientos = formData.seguimientos || [];

    return (
        <div className="space-y-6">
            {/* Header con botón Añadir */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Seguimientos Post-Tratamiento</h3>
                <button
                    type="button"
                    onClick={handleAddSeguimiento}
                    disabled={!hasProcedimientos}
                    className={`flex items-center px-4 py-2 rounded-lg text-white text-sm ${
                        hasProcedimientos 
                            ? 'bg-[#aa632d] hover:bg-[#8e5225]' 
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    title={!hasProcedimientos ? 'Debe registrar procedimientos primero' : ''}
                >
                    <GoogleIcon name="add" className="mr-1" />
                    Añadir Seguimiento
                </button>
            </div>

            {!hasProcedimientos && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <GoogleIcon name="info" className="text-yellow-600 text-2xl mb-2" />
                    <p className="text-yellow-800 font-medium">No hay procedimientos registrados</p>
                    <p className="text-yellow-600 text-sm">Registre procedimientos en la pestaña "Procedimientos" para poder hacer seguimiento.</p>
                </div>
            )}

            {/* Formulario de Añadir/Editar Seguimiento */}
            {currentSeguimiento && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-green-900 flex items-center">
                        <GoogleIcon name="monitor_heart" className="mr-2" />
                        {editingSeguimientoId ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Procedimiento a Seguir *</label>
                            <select
                                value={currentSeguimiento.procedimientoId || ''}
                                onChange={(e) => handleSeguimientoFieldChange('procedimientoId', e.target.value)}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                required
                            >
                                {procedimientosDisponibles.map((proc: Procedure) => (
                                    <option key={proc.id} value={proc.id}>
                                        {getProcedimientoLabel(proc)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Fecha de Seguimiento *</label>
                            <input
                                type="date"
                                value={currentSeguimiento.fechaSeguimiento || ''}
                                onChange={(e) => handleSeguimientoFieldChange('fechaSeguimiento', e.target.value)}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', colorScheme: 'light', borderWidth: '1px' }}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Personal *</label>
                            <select
                                value={currentSeguimiento.personal || ''}
                                onChange={(e) => handleSeguimientoFieldChange('personal', e.target.value)}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                required
                            >
                                {PERSONAL_OPTIONS.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700 mb-3 block">Síntomas / Reacciones Reportadas</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentSeguimiento.inflamacion || false}
                                        onChange={(e) => handleSeguimientoFieldChange('inflamacion', e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Inflamación</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentSeguimiento.ampollas || false}
                                        onChange={(e) => handleSeguimientoFieldChange('ampollas', e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Ampollas</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentSeguimiento.alergias || false}
                                        onChange={(e) => handleSeguimientoFieldChange('alergias', e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Alergias</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentSeguimiento.malestarGeneral || false}
                                        onChange={(e) => handleSeguimientoFieldChange('malestarGeneral', e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Malestar General</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentSeguimiento.brote || false}
                                        onChange={(e) => handleSeguimientoFieldChange('brote', e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Brote</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentSeguimiento.dolorDeCabeza || false}
                                        onChange={(e) => handleSeguimientoFieldChange('dolorDeCabeza', e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Dolor de Cabeza</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentSeguimiento.moretones || false}
                                        onChange={(e) => handleSeguimientoFieldChange('moretones', e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Moretones</span>
                                </label>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Observación</label>
                            <textarea
                                value={currentSeguimiento.observacion || ''}
                                onChange={(e) => handleSeguimientoFieldChange('observacion', e.target.value)}
                                rows={3}
                                className="w-full bg-white p-2"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                placeholder="Notas detalladas sobre la conversación con el paciente..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentSeguimiento(null);
                                setEditingSeguimientoId(null);
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveSeguimiento}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Guardar Seguimiento
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de Seguimientos */}
            {seguimientos.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 flex items-center">
                        <GoogleIcon name="history" className="mr-2" />
                        Historial de Seguimientos ({seguimientos.length})
                    </h4>
                    
                    <div className="space-y-3">
                        {seguimientos
                            .sort((a: Seguimiento, b: Seguimiento) => 
                                new Date(b.fechaSeguimiento).getTime() - new Date(a.fechaSeguimiento).getTime()
                            )
                            .map((seg: Seguimiento) => {
                                const numSintomas = contarSintomas(seg);
                                const tieneSintomas = numSintomas > 0;
                                
                                return (
                                    <div 
                                        key={seg.id} 
                                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                                            tieneSintomas ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <GoogleIcon 
                                                        name={tieneSintomas ? "warning" : "check_circle"} 
                                                        className={`${tieneSintomas ? 'text-red-600' : 'text-green-600'}`} 
                                                    />
                                                    <h5 className="font-semibold text-gray-800">
                                                        {seg.nombreProcedimiento}
                                                    </h5>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Fecha:</span>
                                                        <p className="text-gray-800 font-medium">{seg.fechaSeguimiento}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Personal:</span>
                                                        <p className="text-gray-800 font-medium">{seg.personal}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Síntomas:</span>
                                                        <p className={`font-bold ${tieneSintomas ? 'text-red-600' : 'text-green-600'}`}>
                                                            {tieneSintomas ? `${numSintomas} reportado(s)` : 'Sin síntomas'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex space-x-2 ml-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditSeguimiento(seg)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Editar seguimiento"
                                                >
                                                    <GoogleIcon name="edit" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (window.confirm('¿Está seguro de eliminar este seguimiento?')) {
                                                            handleDeleteSeguimiento(seg.id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Eliminar seguimiento"
                                                >
                                                    <GoogleIcon name="delete" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Síntomas reportados */}
                                        {tieneSintomas && (
                                            <div className="mt-3 p-3 bg-white rounded border border-red-200">
                                                <p className="text-xs font-semibold text-red-700 mb-2 uppercase">Síntomas Reportados:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {seg.inflamacion && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                            <GoogleIcon name="healing" className="mr-1 text-xs" /> Inflamación
                                                        </span>
                                                    )}
                                                    {seg.ampollas && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                            <GoogleIcon name="water_drop" className="mr-1 text-xs" /> Ampollas
                                                        </span>
                                                    )}
                                                    {seg.alergias && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                            <GoogleIcon name="sentiment_very_dissatisfied" className="mr-1 text-xs" /> Alergias
                                                        </span>
                                                    )}
                                                    {seg.malestarGeneral && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                            <GoogleIcon name="sick" className="mr-1 text-xs" /> Malestar General
                                                        </span>
                                                    )}
                                                    {seg.brote && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                            <GoogleIcon name="auto_fix_high" className="mr-1 text-xs" /> Brote
                                                        </span>
                                                    )}
                                                    {seg.dolorDeCabeza && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                            <GoogleIcon name="sentiment_stressed" className="mr-1 text-xs" /> Dolor de Cabeza
                                                        </span>
                                                    )}
                                                    {seg.moretones && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                            <GoogleIcon name="colorize" className="mr-1 text-xs" /> Moretones
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Observación */}
                                        {seg.observacion && (
                                            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                                                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">Observación:</p>
                                                <p className="text-sm text-gray-700">{seg.observacion}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {hasProcedimientos && seguimientos.length === 0 && !currentSeguimiento && (
                <div className="text-center py-12 text-gray-500">
                    <GoogleIcon name="medical_information" className="text-6xl mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay seguimientos registrados</p>
                    <p className="text-sm">Haga clic en "Añadir Seguimiento" para documentar el estado post-tratamiento del paciente.</p>
                </div>
            )}
        </div>
    );
};


export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  lead,
  campaigns,
  metaCampaigns,
  clientSources,
  services,
  requestConfirmation,
  onSaveComprobante,
  comprobantes
}) => {
    const [formData, setFormData] = useState<Partial<Lead>>({});
    const [activeTab, setActiveTab] = useState('ficha');
    const [isFacturacionModalOpen, setIsFacturacionModalOpen] = useState(false);

    const [currentLlamada, setCurrentLlamada] = useState<Partial<RegistroLlamada> | null>(null);

    const SERVICE_CATEGORIES = useMemo(() => {
        return services.reduce((acc, service) => {
            if (!acc[service.categoria]) {
                acc[service.categoria] = [];
            }
            acc[service.categoria].push(service.nombre);
            return acc;
        }, {} as Record<string, string[]>);
    }, [services]);

    const CATEGORY_OPTIONS = useMemo(() => Object.keys(SERVICE_CATEGORIES), [SERVICE_CATEGORIES]);
    
    const initialFormData = useMemo(() => ({
        id: Date.now(),
        fechaLead: new Date().toISOString().split('T')[0],
        nombres: '',
        apellidos: '',
        numero: '',
        sexo: 'F' as 'F' | 'M',
        redSocial: 'Instagram',
        anuncio: '',
        vendedor: Seller.Vanesa,
        estado: LeadStatus.Nuevo,
        montoPagado: undefined,
        servicios: [],
        categoria: CATEGORY_OPTIONS[0] || '',
        registrosLlamada: [],
        pagosRecepcion: [],
        tratamientos: [],
        procedimientos: [],
        seguimientos: [],
    }), [CATEGORY_OPTIONS]);


    useEffect(() => {
        if (isOpen) {
            setFormData(lead ? { ...lead } : initialFormData);
            setActiveTab('ficha');
        }
    }, [lead, isOpen, initialFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => {
            const newState = { ...prev } as any;
            
            if (type === 'number') {
                newState[name] = value === '' ? undefined : Number(value);
            } else if (type === 'datetime-local') {
                // Convert to ISO format for datetime-local
                newState[name] = value ? new Date(value).toISOString() : '';
            } else {
                newState[name] = value;
            }

            // Recalculate deudaCita when montoPagado changes
            if (name === 'montoPagado') {
                const precio = newState.precioCita || 0;
                const montoPagado = newState.montoPagado || 0;
                newState.deudaCita = precio - montoPagado;
            }
            
            return newState;
        });
    };
    
    const handleGenerateHistoryNumber = async () => {
        try {
            // Validar que haya apellido antes de generar
            if (!formData.apellidos?.trim()) {
                alert('Por favor ingrese el apellido del paciente antes de generar el número de historia.');
                return;
            }
            
            // Obtener primera letra del apellido en mayúscula
            const primeraLetra = formData.apellidos.trim()[0].toUpperCase();
            
            // Obtener el siguiente número correlativo desde el backend
            const nextHistoryNumber = await api.getNextHistoryNumber();
            
            // Formato: LetraApellido + 00 + número correlativo (ej: H00100)
            const numeroHistoria = `${primeraLetra}00${nextHistoryNumber}`;
            
            setFormData(prev => ({ ...prev, nHistoria: numeroHistoria }));
        } catch (error) {
            console.error("Failed to generate history number", error);
            alert("Hubo un error al generar el número de historia.");
        }
    };
    
    const handleSave = () => {
        // Validar campos requeridos
        const errors: string[] = [];
        
        // Campos siempre requeridos
        if (!formData.nombres?.trim()) errors.push('Nombres');
        if (!formData.apellidos?.trim()) errors.push('Apellidos');
        if (!formData.numero?.trim()) errors.push('Número de Teléfono');
        if (!formData.redSocial) errors.push('Red Social / Origen');
        if (!formData.anuncio) errors.push('Campaña / Anuncio');
        if (!formData.vendedor) errors.push('Vendedor(a)');
        if (!formData.estado) errors.push('Estado del Lead');
        
        // Campos requeridos solo si el estado es "Agendado"
        if (formData.estado === LeadStatus.Agendado) {
            if (formData.montoPagado === undefined || formData.montoPagado === null) {
                errors.push('Monto Pagado Cita (requerido cuando está Agendado)');
            }
            if (!formData.metodoPago) {
                errors.push('Método Pago (requerido cuando está Agendado)');
            }
        }
        
        if (errors.length > 0) {
            alert(`Los siguientes campos son requeridos:\n- ${errors.join('\n- ')}`);
            return;
        }
        
        // Asegurar que montoPagado sea 0 si está vacío y no es Agendado
        const dataToSave = {
            ...formData,
            montoPagado: formData.montoPagado ?? 0,
        };
        
        onSave(dataToSave as Lead);
    };

    const handleDeleteClick = () => {
        if (lead) {
            requestConfirmation(`¿Estás seguro de que quieres eliminar al lead "${lead.nombres} ${lead.apellidos}"?`, () => {
                onDelete(lead.id);
                onClose();
            });
        }
    };

    const totalesTratamientos = useMemo(() => {
        if (!formData.tratamientos) return { precio: 0, pagado: 0, deuda: 0 };
        return formData.tratamientos.reduce((acc, t) => {
            acc.precio += t.precio;
            acc.pagado += t.montoPagado;
            acc.deuda += t.deuda;
            return acc;
        }, { precio: 0, pagado: 0, deuda: 0 });
    }, [formData.tratamientos]);
    
    const handleShowAddLlamadaForm = () => {
        setCurrentLlamada({
            id: Date.now(),
            numeroLlamada: (formData.registrosLlamada?.length || 0) + 1,
            duracionLlamada: '00:00:00',
            estadoLlamada: EstadoLlamada.Contesto,
        });
    };
    
    const handleSaveCurrentLlamada = () => {
        if (!currentLlamada) return;
        setFormData(prev => ({
            ...prev,
            registrosLlamada: [...(prev.registrosLlamada || []), currentLlamada as RegistroLlamada]
        }));
        setCurrentLlamada(null);
    };
    
    const handleRemoveLlamada = (idToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            registrosLlamada: (prev.registrosLlamada || []).filter(l => l.id !== idToRemove)
        }));
    };
    
    const handleOpenFacturacionModal = () => {
        setIsFacturacionModalOpen(true);
    };

    const handleCloseFacturacionModal = () => {
        setIsFacturacionModalOpen(false);
    };

    const handleFacturacionSave = async (comprobante: ComprobanteElectronico) => {
        await onSaveComprobante(comprobante);
        handleCloseFacturacionModal();
    };


    const isNewLead = !lead;
    const tabs = [
        { id: 'ficha', label: 'Ficha de Paciente' },
        { id: 'recepcion', label: 'Recepción' },
        { id: 'procedimientos', label: 'Procedimientos' },
        { id: 'seguimiento', label: 'Seguimiento' },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'ficha':
                return <FichaTabContent 
                            formData={formData} 
                            handleChange={handleChange}
                            setFormData={setFormData}
                            currentLlamada={currentLlamada}
                            setCurrentLlamada={setCurrentLlamada}
                            handleShowAddLlamadaForm={handleShowAddLlamadaForm}
                            handleSaveCurrentLlamada={handleSaveCurrentLlamada}
                            handleRemoveLlamada={handleRemoveLlamada}
                            campaigns={campaigns}
                            metaCampaigns={metaCampaigns}
                            clientSources={clientSources}
                            CATEGORY_OPTIONS={CATEGORY_OPTIONS}
                            SERVICE_CATEGORIES={SERVICE_CATEGORIES}
                            services={services}
                        />;
            case 'recepcion':
                return <RecepcionTabContent 
                            formData={formData} 
                            handleChange={handleChange} 
                            handleGenerateHistoryNumber={handleGenerateHistoryNumber}
                            handleSetFormData={setFormData}
                            totales={totalesTratamientos}
                            services={services}
                        />;
            case 'procedimientos':
                return <ProcedimientosTabContent formData={formData} handleSetFormData={setFormData} />;
            case 'seguimiento':
                return <SeguimientoTabContent formData={formData} handleSetFormData={setFormData} />;
            default:
                return null;
        }
    };

  return (
      <>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isNewLead ? 'Registrar Nuevo Lead' : `Ficha de Paciente: ${formData.nombres} ${formData.apellidos}`}
            maxWidthClass="max-w-7xl"
            footer={
                <div className="w-full flex justify-between items-center">
                    <div>
                        {!isNewLead && (
                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                className="flex items-center text-red-600 hover:text-red-800 bg-red-50 px-3 py-2 rounded-lg"
                            >
                                <GoogleIcon name="delete" className="mr-2" /> Eliminar Lead
                            </button>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {(formData.montoPagado || 0) > 0 && (
                            <button
                                type="button"
                                onClick={handleOpenFacturacionModal}
                                disabled={true}
                                className="flex items-center bg-gray-400 text-white px-4 py-2 rounded-lg shadow cursor-not-allowed opacity-60"
                            >
                                <GoogleIcon name="add_to_photos" className="mr-2 text-xl" />
                                Generar Comprobante
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            className="bg-[#aa632d] text-white px-6 py-2 rounded-lg shadow hover:bg-[#8e5225]"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col max-h-[calc(90vh-70px)]">
                <div className="border-b border-gray-200 flex-shrink-0">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                disabled={isNewLead && tab.id !== 'ficha'}
                                className={`${
                                    activeTab === tab.id
                                    ? 'border-[#aa632d] text-[#aa632d]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm disabled:text-gray-300 disabled:cursor-not-allowed`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                 <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    {renderContent()}
                </div>
            </div>
        </Modal>
        {isFacturacionModalOpen && formData.id && (
            <FacturacionModal
                isOpen={isFacturacionModalOpen}
                onClose={handleCloseFacturacionModal}
                onSave={handleFacturacionSave}
                paciente={formData as Lead} // Patient data from the form
                venta={{ // Create a VentaExtra-like object from lead data for the modal
                    id: formData.id,
                    codigoVenta: `CITA-${formData.id}`,
                    fechaVenta: formData.fechaHoraAgenda?.split('T')[0] || new Date().toISOString().split('T')[0],
                    pacienteId: formData.id,
                    nHistoria: formData.nHistoria || '',
                    nombrePaciente: `${formData.nombres} ${formData.apellidos}`,
                    servicio: formData.servicios?.join(', ') || 'Cita de Evaluación',
                    categoria: formData.categoria || '',
                    precio: formData.precioCita || formData.montoPagado || 0,
                    montoPagado: formData.montoPagado || 0,
                    metodoPago: formData.metodoPago || MetodoPago.Efectivo,
                    deuda: formData.deudaCita || 0,
                }}
                ventaType="lead"
            />
        )}
      </>
  );
};