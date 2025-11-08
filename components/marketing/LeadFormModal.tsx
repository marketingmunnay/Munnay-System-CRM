import React, { useState, useEffect, useMemo } from 'react';
import type { Lead, MetaCampaign, Treatment, Procedure, Personal, Medico, Seguimiento, RegistroLlamada, ClientSource, Service, ComprobanteElectronico, Campaign } from '../../types';
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
     return (
        <div className="space-y-6">
            <p>Sección de Procedimientos en construcción.</p>
        </div>
    );
};

const SeguimientoTabContent: React.FC<any> = ({ formData, handleSetFormData }) => {
     return (
        <div className="space-y-6">
            <p>Sección de Seguimiento en construcción.</p>
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
            <div className="flex flex-col h-[calc(90vh-70px)]">
                <div className="border-b border-gray-200">
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
                 <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
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