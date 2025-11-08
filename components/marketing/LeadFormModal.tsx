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

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const FichaTabContent: React.FC<any> = ({ formData, handleChange, currentLlamada, setCurrentLlamada, handleShowAddLlamadaForm, handleSaveCurrentLlamada, handleRemoveLlamada, metaCampaigns, clientSources, CATEGORY_OPTIONS, SERVICE_CATEGORIES, services }) => {
    return (
        <div className="space-y-6">
             <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-4 border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Información Básica</legend>
                <div>
                    <label className="text-sm font-medium">Fecha Lead</label>
                    <input type="date" name="fechaLead" value={formData.fechaLead || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2" style={{ colorScheme: 'light' }} required />
                </div>
                <div>
                    <label className="text-sm font-medium">Nombres</label>
                    <input type="text" name="nombres" value={formData.nombres || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2"/>
                </div>
                 <div>
                    <label className="text-sm font-medium">Apellidos</label>
                    <input type="text" name="apellidos" value={formData.apellidos || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2"/>
                </div>
                 <div>
                    <label className="text-sm font-medium">Número de Teléfono</label>
                    <input type="tel" name="numero" value={formData.numero || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2"/>
                </div>
                 <div>
                    <label className="text-sm font-medium">Sexo</label>
                    <select name="sexo" value={formData.sexo || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                        <option value="F">Femenino</option>
                        <option value="M">Masculino</option>
                    </select>
                </div>
            </fieldset>

             <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-4 border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Origen y Seguimiento</legend>
                <div>
                    <label className="text-sm font-medium">Red Social / Origen</label>
                    <select name="redSocial" value={formData.redSocial || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                        {clientSources.map(cs => <option key={cs.id} value={cs.nombre}>{cs.nombre}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-sm font-medium">Campaña / Anuncio</label>
                    <select name="anuncio" value={formData.anuncio || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                        <option value="">Seleccionar campaña...</option>
                        {metaCampaigns.map(mc => <option key={mc.id} value={mc.nombre}>{mc.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Vendedor(a)</label>
                    <select name="vendedor" value={formData.vendedor || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                        {Object.values(Seller).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Estado del Lead</label>
                    <select name="estado" value={formData.estado || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                        {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </fieldset>

             <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-3 border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Agenda y pago</legend>
                <div>
                    <label className="text-sm font-medium">Categoría de Servicio</label>
                    <select name="categoria" value={formData.categoria || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                         {CATEGORY_OPTIONS.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm font-medium">Servicio de Interés</label>
                    <select multiple name="servicios" value={formData.servicios || []} onChange={handleChange} className="w-full h-24 border-black bg-[#f9f9fa] text-black rounded-md p-2">
                         {SERVICE_CATEGORIES[formData.categoria]?.map((serv: string) => <option key={serv} value={serv}>{serv}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Precio Cita (S/.)</label>
                    <input type="number" step="0.01" name="precioCita" value={formData.precioCita || 0} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2"/>
                </div>
                 <div>
                    <label className="text-sm font-medium">Monto Pagado Cita (S/.)</label>
                    <input type="number" step="0.01" name="montoPagado" value={formData.montoPagado || 0} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2"/>
                </div>
                <div>
                    <label className="text-sm font-medium">Método Pago</label>
                    <select name="metodoPago" value={formData.metodoPago || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                        <option value="">Seleccionar...</option>
                        {Object.values(MetodoPago).map(mp => <option key={mp} value={mp}>{mp}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Deuda Cita (S/.)</label>
                    <input type="number" step="0.01" name="deudaCita" value={formData.deudaCita || 0} readOnly className="w-full border-black bg-gray-100 text-black rounded-md p-2"/>
                </div>
            </fieldset>
            
            {formData.estado === LeadStatus.Agendado && (
                <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-2 border p-4 rounded-md">
                    <legend className="text-md font-bold px-2 text-black">Información de Agenda</legend>
                    <div>
                        <label className="text-sm font-medium">Fecha y Hora de Agenda</label>
                        <input type="datetime-local" name="fechaHoraAgenda" value={formData.fechaHoraAgenda?.substring(0,16) || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2" style={{ colorScheme: 'light' }} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Recurso Asignado</label>
                        <select name="recursoId" value={formData.recursoId || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                            <option value="">Seleccionar Recurso...</option>
                            {RESOURCES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </fieldset>
            )}
            
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
                        <input type="time" step="1" value={currentLlamada.duracionLlamada} onChange={(e) => setCurrentLlamada({...currentLlamada, duracionLlamada: e.target.value})} className="border-black bg-white rounded p-2" />
                        <select value={currentLlamada.estadoLlamada} onChange={(e) => setCurrentLlamada({...currentLlamada, estadoLlamada: e.target.value})} className="border-black bg-white rounded p-2">
                            {Object.values(EstadoLlamada).map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <input type="text" placeholder="Observación" value={currentLlamada.observacion || ''} onChange={(e) => setCurrentLlamada({...currentLlamada, observacion: e.target.value})} className="col-span-2 border-black bg-white rounded p-2" />
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
    const [editingPayments, setEditingPayments] = React.useState(false);
    const [tempPayments, setTempPayments] = React.useState<any[]>([]);
    const [newPayment, setNewPayment] = React.useState({ monto: 0, metodoPago: '' });
    
    const [editingTreatments, setEditingTreatments] = React.useState(false);
    const [tempTreatments, setTempTreatments] = React.useState<Treatment[]>([]);
    
    // Calculate payment debt in real time
    const precioCita = formData.precioCita || 0;
    const pagoInicial = formData.montoPagado || 0;
    const pagosRecepcion = formData.pagosRecepcion || [];
    const totalPagosRecepcion = pagosRecepcion.reduce((sum: number, p: any) => sum + (p.monto || 0), 0);
    const deudaCita = precioCita - pagoInicial - totalPagosRecepcion;
    
    // Show payment section only if relevant
    const showPaymentSection = precioCita > 0 || pagosRecepcion.length > 0;
    
    const handleAddPayment = () => {
        if (!newPayment.monto || !newPayment.metodoPago) {
            alert('Por favor complete monto y método de pago');
            return;
        }
        const pagos = [...(formData.pagosRecepcion || []), { id: Date.now(), ...newPayment }];
        handleSetFormData((prev: any) => ({ ...prev, pagosRecepcion: pagos }));
        setNewPayment({ monto: 0, metodoPago: '' });
    };
    
    const handleEditPayments = () => {
        setTempPayments([...(formData.pagosRecepcion || [])]);
        setEditingPayments(true);
    };
    
    const handleSavePayments = () => {
        handleSetFormData((prev: any) => ({ ...prev, pagosRecepcion: tempPayments }));
        setEditingPayments(false);
    };
    
    const handleCancelPayments = () => {
        setTempPayments([]);
        setEditingPayments(false);
    };
    
    const handleAddTreatment = () => {
        const newTreatment: Treatment = {
            id: Date.now(),
            nombre: '',
            cantidadSesiones: 1,
            precio: 0,
            montoPagado: 0,
            deuda: 0
        };
        setTempTreatments([...tempTreatments, newTreatment]);
    };
    
    const handleEditTreatments = () => {
        setTempTreatments([...(formData.tratamientos || [])]);
        setEditingTreatments(true);
    };
    
    const handleSaveTreatments = () => {
        handleSetFormData((prev: any) => ({ ...prev, tratamientos: tempTreatments }));
        setEditingTreatments(false);
    };
    
    const handleCancelTreatments = () => {
        setTempTreatments([]);
        setEditingTreatments(false);
    };
    
    const handleTreatmentChange = (index: number, field: string, value: any) => {
        const updated = [...tempTreatments];
        updated[index] = { ...updated[index], [field]: value };
        
        // Auto-fill price when service is selected
        if (field === 'nombre') {
            const service = services.find((s: any) => s.nombre === value);
            if (service) {
                updated[index].precio = service.precio || 0;
            }
        }
        
        // Calculate debt
        const precio = updated[index].precio || 0;
        const montoPagado = updated[index].montoPagado || 0;
        updated[index].deuda = precio - montoPagado;
        
        setTempTreatments(updated);
    };
    
    const handleRemoveTreatment = (index: number) => {
        setTempTreatments(tempTreatments.filter((_, i) => i !== index));
    };
    
    return (
         <div className="space-y-6">
             <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-2 border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Información General y Estado del Paciente</legend>
                 <div>
                    <label className="text-sm font-medium">N° Historia</label>
                    <div className="flex items-center">
                        <input type="text" name="nHistoria" value={formData.nHistoria || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-l-md p-2" disabled={!!formData.nHistoria}/>
                        <button type="button" onClick={handleGenerateHistoryNumber} className="bg-gray-200 px-3 py-2 rounded-r-md text-sm" disabled={!!formData.nHistoria}>Generar</button>
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-medium">Estado en Recepción</label>
                    <select name="estadoRecepcion" value={formData.estadoRecepcion || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                        <option value="">Seleccionar...</option>
                        {Object.values(ReceptionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </fieldset>

            {showPaymentSection && (
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-md font-bold px-2 text-black">Gestión de Pago de la Cita de Evaluación</legend>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="p-3 bg-blue-50 rounded">
                                <div className="font-medium text-gray-600">Precio Cita</div>
                                <div className="text-lg font-bold">S/. {precioCita.toFixed(2)}</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded">
                                <div className="font-medium text-gray-600">Total Pagado</div>
                                <div className="text-lg font-bold">S/. {(pagoInicial + totalPagosRecepcion).toFixed(2)}</div>
                            </div>
                            <div className={`p-3 rounded ${deudaCita > 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                                <div className="font-medium text-gray-600">Deuda</div>
                                <div className="text-lg font-bold">S/. {deudaCita.toFixed(2)}</div>
                            </div>
                        </div>
                        
                        {pagosRecepcion.length > 0 && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">Pagos en Recepción</h4>
                                    {!editingPayments && (
                                        <button type="button" onClick={handleEditPayments} className="text-sm text-blue-600">
                                            <GoogleIcon name="edit" className="text-sm"/> Editar Pagos
                                        </button>
                                    )}
                                </div>
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 text-left">Monto (S/.)</th>
                                            <th className="p-2 text-left">Método de Pago</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(editingPayments ? tempPayments : pagosRecepcion).map((pago: any, i: number) => (
                                            <tr key={i} className="border-b">
                                                <td className="p-2">
                                                    {editingPayments ? (
                                                        <input type="number" step="0.01" value={pago.monto} onChange={(e) => {
                                                            const updated = [...tempPayments];
                                                            updated[i].monto = Number(e.target.value);
                                                            setTempPayments(updated);
                                                        }} className="w-full border p-1 rounded"/>
                                                    ) : pago.monto.toFixed(2)}
                                                </td>
                                                <td className="p-2">
                                                    {editingPayments ? (
                                                        <select value={pago.metodoPago} onChange={(e) => {
                                                            const updated = [...tempPayments];
                                                            updated[i].metodoPago = e.target.value;
                                                            setTempPayments(updated);
                                                        }} className="w-full border p-1 rounded">
                                                            {Object.values(MetodoPago).map(mp => <option key={mp} value={mp}>{mp}</option>)}
                                                        </select>
                                                    ) : pago.metodoPago}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {editingPayments && (
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <button type="button" onClick={handleCancelPayments} className="px-3 py-1 bg-gray-300 rounded text-sm">Cancelar</button>
                                        <button type="button" onClick={handleSavePayments} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Guardar</button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {deudaCita > 0 && !editingPayments && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                                <h4 className="font-medium mb-2">⚠️ Deuda Pendiente: S/. {deudaCita.toFixed(2)}</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Monto (S/.)</label>
                                        <input type="number" step="0.01" value={newPayment.monto || deudaCita} onChange={(e) => setNewPayment({...newPayment, monto: Number(e.target.value)})} className="w-full border p-2 rounded"/>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Método de Pago</label>
                                        <select value={newPayment.metodoPago} onChange={(e) => setNewPayment({...newPayment, metodoPago: e.target.value})} className="w-full border p-2 rounded">
                                            <option value="">Seleccionar...</option>
                                            {Object.values(MetodoPago).map(mp => <option key={mp} value={mp}>{mp}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button type="button" onClick={handleAddPayment} className="w-full bg-green-500 text-white p-2 rounded">
                                            Registrar Pago
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </fieldset>
            )}

            <fieldset className="border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Evaluación y Cierre</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium">¿Aceptó tratamiento?</label>
                        <select name="aceptoTratamiento" value={formData.aceptoTratamiento || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                            <option value="">Seleccionar...</option>
                            <option value="Si">Sí</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                     {formData.aceptoTratamiento === 'No' && (
                        <div>
                            <label className="text-sm font-medium">Motivo de No Cierre <span className="text-red-500">*</span></label>
                            <input type="text" name="motivoNoCierre" value={formData.motivoNoCierre || ''} onChange={handleChange} required className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2"/>
                        </div>
                    )}
                </div>
            </fieldset>
            
            {formData.aceptoTratamiento === 'Si' && (
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-md font-bold px-2 text-black">Tratamientos Vendidos</legend>
                    
                    <div className="space-y-4">
                        {!editingTreatments && (formData.tratamientos || []).length > 0 && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">Lista de Tratamientos</h4>
                                    <button type="button" onClick={handleEditTreatments} className="text-sm text-blue-600">
                                        <GoogleIcon name="edit" className="text-sm"/> Editar Tratamientos
                                    </button>
                                </div>
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 text-left">Servicio</th>
                                            <th className="p-2 text-left">Sesiones</th>
                                            <th className="p-2 text-left">Precio (S/.)</th>
                                            <th className="p-2 text-left">Pagado (S/.)</th>
                                            <th className="p-2 text-left">Deuda (S/.)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.tratamientos.map((t: Treatment) => (
                                            <tr key={t.id} className="border-b">
                                                <td className="p-2">{t.nombre}</td>
                                                <td className="p-2">{t.cantidadSesiones}</td>
                                                <td className="p-2">{t.precio.toFixed(2)}</td>
                                                <td className="p-2">{t.montoPagado.toFixed(2)}</td>
                                                <td className="p-2">{t.deuda.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-100 font-bold">
                                        <tr>
                                            <td className="p-2" colSpan={2}>Total</td>
                                            <td className="p-2">S/. {totales.precio.toFixed(2)}</td>
                                            <td className="p-2">S/. {totales.pagado.toFixed(2)}</td>
                                            <td className="p-2">S/. {totales.deuda.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                        
                        {editingTreatments && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">Editar Tratamientos</h4>
                                    <button type="button" onClick={handleAddTreatment} className="text-sm text-blue-600">
                                        <GoogleIcon name="add"/> Añadir Tratamiento
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-2 text-left">Servicio</th>
                                                <th className="p-2 text-left">Sesiones</th>
                                                <th className="p-2 text-left">Precio (S/.)</th>
                                                <th className="p-2 text-left">Pagado (S/.)</th>
                                                <th className="p-2 text-left">Deuda (S/.)</th>
                                                <th className="p-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tempTreatments.map((t, i) => (
                                                <tr key={i} className="border-b">
                                                    <td className="p-2">
                                                        <select value={t.nombre} onChange={(e) => handleTreatmentChange(i, 'nombre', e.target.value)} className="w-full border p-1 rounded">
                                                            <option value="">Seleccionar...</option>
                                                            {services.map((s: any) => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" value={t.cantidadSesiones} onChange={(e) => handleTreatmentChange(i, 'cantidadSesiones', Number(e.target.value))} className="w-full border p-1 rounded" min="1"/>
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" step="0.01" value={t.precio} onChange={(e) => handleTreatmentChange(i, 'precio', Number(e.target.value))} className="w-full border p-1 rounded"/>
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" step="0.01" value={t.montoPagado} onChange={(e) => handleTreatmentChange(i, 'montoPagado', Number(e.target.value))} className="w-full border p-1 rounded"/>
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" step="0.01" value={t.deuda} readOnly className="w-full border p-1 rounded bg-gray-100"/>
                                                    </td>
                                                    <td className="p-2">
                                                        <button type="button" onClick={() => handleRemoveTreatment(i)} className="text-red-500">
                                                            <GoogleIcon name="delete"/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-100 font-bold">
                                            <tr>
                                                <td className="p-2" colSpan={2}>Total</td>
                                                <td className="p-2">S/. {tempTreatments.reduce((sum, t) => sum + t.precio, 0).toFixed(2)}</td>
                                                <td className="p-2">S/. {tempTreatments.reduce((sum, t) => sum + t.montoPagado, 0).toFixed(2)}</td>
                                                <td className="p-2">S/. {tempTreatments.reduce((sum, t) => sum + t.deuda, 0).toFixed(2)}</td>
                                                <td className="p-2"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <div className="flex justify-end space-x-2 mt-2">
                                    <button type="button" onClick={handleCancelTreatments} className="px-3 py-1 bg-gray-300 rounded text-sm">Cancelar</button>
                                    <button type="button" onClick={handleSaveTreatments} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Guardar</button>
                                </div>
                            </div>
                        )}
                        
                        {!editingTreatments && (formData.tratamientos || []).length === 0 && (
                            <button type="button" onClick={handleEditTreatments} className="text-sm text-blue-600 flex items-center">
                                <GoogleIcon name="add"/> Añadir Tratamientos
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
        montoPagado: 0,
        servicios: [],
        categoria: CATEGORY_OPTIONS[0] || '',
        registrosLlamada: [],
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
            let newState = { ...prev };
            if (type === 'number') {
                newState = { ...newState, [name]: Number(value) };
            } else if (name === 'servicios') {
                 newState = { ...newState, servicios: Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value) };
            }
            else {
                newState = { ...newState, [name]: value };
            }

            if (name === 'precioCita' || (name === 'montoPagado' && activeTab === 'ficha')) {
                const precio = name === 'precioCita' ? Number(value) : (newState.precioCita || 0);
                const montoPagado = name === 'montoPagado' ? Number(value) : (newState.montoPagado || 0);
                newState.deudaCita = precio - montoPagado;
            }
            
            return newState;
        });
    };
    
    const handleGenerateHistoryNumber = async () => {
        try {
            // Get all leads to find the highest history number
            const allLeads = await api.getLeads();
            
            // Extract the numeric part from history numbers and find the max
            let maxNumber = 99; // Start from 99 so first number will be 100
            allLeads.forEach(lead => {
                if (lead.nHistoria) {
                    // Extract numeric part from format like "H00100"
                    const match = lead.nHistoria.match(/\d+$/);
                    if (match) {
                        const num = parseInt(match[0]);
                        if (num > maxNumber) {
                            maxNumber = num;
                        }
                    }
                }
            });
            
            // Generate new number with format: FirstLetterLastName + "00" + number
            const firstLetter = (formData.apellidos || 'X').charAt(0).toUpperCase();
            const nextNumber = maxNumber + 1;
            const nextHistoryNumber = `${firstLetter}00${nextNumber}`;
            
            setFormData(prev => ({ ...prev, nHistoria: nextHistoryNumber }));
        } catch (error) {
            console.error("Failed to generate history number", error);
            alert("Hubo un error al generar el número de historia.");
        }
    };
    
    const handleSave = () => {
        if (!formData.nombres?.trim() || !formData.apellidos?.trim() || !formData.numero?.trim()) {
            alert('Nombres, apellidos y número son requeridos.');
            return;
        }
        onSave(formData as Lead);
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
                            currentLlamada={currentLlamada}
                            setCurrentLlamada={setCurrentLlamada}
                            handleShowAddLlamadaForm={handleShowAddLlamadaForm}
                            handleSaveCurrentLlamada={handleSaveCurrentLlamada}
                            handleRemoveLlamada={handleRemoveLlamada}
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
                                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
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