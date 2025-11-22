import React, { useState, useEffect, useMemo } from 'react';

// Moved formatFechaHora to top-level scope
                                                    {/* formatFechaHora ahora solo se llama desde JSX, definida en el scope superior */}
import type { Lead, MetaCampaign, Treatment, Procedure, Personal, Medico, Seguimiento, RegistroLlamada, ClientSource, Service, ComprobanteElectronico, Campaign, Membership } from '../../types';
import { LeadStatus, Seller, MetodoPago, ReceptionStatus, EstadoLlamada, DocumentType, TipoComprobanteElectronico, SunatStatus } from '../../types';
import Modal from '../shared/Modal';
import FacturacionModal from '../finanzas/FacturacionModal';
import { RESOURCES } from '../../constants';
import * as api from '../../services/api';
import { formatDateForInput, formatDateForDisplay, formatTimeForInput, parseDate } from '../../utils/time';

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
  memberships?: Membership[];
  users?: User[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
  onSaveComprobante: (comprobante: ComprobanteElectronico) => Promise<void>;
  comprobantes: ComprobanteElectronico[];
    initialTab?: 'ficha' | 'recepcion' | 'procedimientos' | 'seguimiento';
    disableFicha?: boolean;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Constantes para tipos de Medico
const MEDICO_OPTIONS: Medico[] = ['Dra. Marilia', 'Dra. Sofía', 'Dr. Carlos'];

// Puestos permitidos para el campo Profesional
const PUESTOS_PROFESIONAL = ['Tec. Enfermera', 'Médico', 'Lic. en Enfermería'];

// Puestos permitidos para el campo Vendedor
const PUESTOS_VENDEDOR = ['Recepcionista', 'Call Center'];

const FichaTabContent: React.FC<any> = ({ formData, handleChange, setFormData, currentLlamada, setCurrentLlamada, handleShowAddLlamadaForm, handleSaveCurrentLlamada, handleRemoveLlamada, campaigns, metaCampaigns, clientSources, CATEGORY_OPTIONS, SERVICE_CATEGORIES, services, memberships, PERSONAL_OPTIONS, VENDEDOR_OPTIONS }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda: col-span-2 con las 3 primeras secciones */}
            <div className="lg:col-span-2 space-y-4">
             <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-4 border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Información Básica</legend>
                <div>
                    <label className="text-sm font-medium">Fecha Lead <span className="text-red-500">*</span></label>
                        <input 
                            type="date" 
                            name="fechaLead" 
                            value={formData.fechaLead || ''} 
                            onChange={handleChange} 
                            className="w-full bg-[#f9f9fa] p-2" 
                            style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', colorScheme: 'light', borderWidth: '1px' }} 
                            required 
                    />
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
                    <input 
                        type="tel" 
                        name="numero" 
                        value={formData.numero || ''} 
                        onChange={handleChange} 
                        placeholder="970 446 695"
                        className="w-full bg-[#f9f9fa] p-2" 
                        style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} 
                        required 
                    />
                    {!formData.numero?.trim() && <span className="text-red-500 text-xs">Este campo es requerido</span>}
                </div>
                 <div>
                    <label className="text-sm font-medium">Correo Electrónico</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email || ''} 
                        onChange={handleChange} 
                        placeholder="ejemplo@correo.com"
                        className="w-full bg-[#f9f9fa] p-2" 
                        style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} 
                    />
                    {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                        <span className="text-red-500 text-xs">Formato de correo inválido</span>
                    )}
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
                        {campaigns?.filter((c, i, arr) => arr.findIndex(x => x.nombreAnuncio === c.nombreAnuncio) === i).map(c => (
                            <option key={c.id} value={c.nombreAnuncio}>{c.nombreAnuncio}</option>
                        ))}
                    </select>
                    {!formData.anuncio && <span className="text-red-500 text-xs">Este campo es requerido</span>}
                </div>
                <div>
                    <label className="text-sm font-medium">Vendedor(a) <span className="text-red-500">*</span></label>
                    <select name="vendedor" value={formData.vendedor || ''} onChange={handleChange} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} required>
                        <option value="">Seleccionar...</option>
                        {VENDEDOR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
                        <label className="text-sm font-medium">Fecha de Agenda</label>
                        <input 
                            type="date" 
                            name="fechaAgenda" 
                            value={formatDateForInput(formData.fechaHoraAgenda) || formatDateForInput(new Date())} 
                            onChange={(e) => {
                                const fecha = e.target.value;
                                const horaActual = formatTimeForInput(formData.fechaHoraAgenda) || '12:00';
                                handleChange({ 
                                    target: { 
                                        name: 'fechaHoraAgenda', 
                                        value: `${fecha}T${horaActual}` 
                                    } 
                                } as any);
                            }} 
                            className="w-full bg-[#f9f9fa] p-2" 
                            style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Hora de Agenda</label>
                        <select 
                            name="horaAgenda" 
                            value={formatTimeForInput(formData.fechaHoraAgenda) || ''} 
                            onChange={(e) => {
                                const hora = e.target.value;
                                const fechaActual = formatDateForInput(formData.fechaHoraAgenda) || formatDateForInput(new Date());
                                handleChange({ 
                                    target: { 
                                        name: 'fechaHoraAgenda', 
                                        value: `${fechaActual}T${hora}` 
                                    } 
                                } as any);
                            }}
                            className="w-full bg-[#f9f9fa] p-2" 
                            style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                        >
                            <option value="">Seleccionar hora...</option>
                            {Array.from({ length: 48 }, (_, i) => {
                                const hour = Math.floor(i / 4);
                                const minute = (i % 4) * 15;
                                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                return <option key={time} value={time}>{time}</option>;
                            })}
                        </select>
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
                       // Si la categoría es "Membresías", buscar en memberships
                       if (formData.categoria === 'Membresías') {
                           const found = memberships?.find(m => m.nombre === selected);
                           setFormData(prev => {
                               // Usar precioTotal de la membresía
                               const precioCita = found ? found.precioTotal : 0;
                               const montoPagado = prev.montoPagado || 0;
                               return { ...prev, servicios: selected ? [selected] : [], precioCita: precioCita, deudaCita: precioCita - montoPagado };
                           });
                       } else {
                           // Búsqueda normal en services
                           const found = services?.find(s => s.nombre === selected);
                           setFormData(prev => {
                               const precio = found ? found.precio : (prev.precioCita || 0);
                               const montoPagado = prev.montoPagado || 0;
                               return { ...prev, servicios: selected ? [selected] : [], precioCita: precio, deudaCita: precio - montoPagado };
                           });
                       }
                   }} className="w-full bg-[#f9f9fa] p-2" style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}>
                       <option value="">Seleccionar servicio...</option>
                       {formData.categoria === 'Membresías' 
                           ? memberships?.map((memb) => <option key={memb.id} value={memb.nombre}>{memb.nombre}</option>)
                           : SERVICE_CATEGORIES[formData.categoria]?.map((serv: string) => <option key={serv} value={serv}>{serv}</option>)
                       }
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
               <div>
                   <label className="text-sm font-medium">
                       Profesional <span className="text-red-500">*</span>
                   </label>
                   <select 
                       name="profesionalAsignado" 
                       value={formData.profesionalAsignado || ''} 
                       onChange={handleChange} 
                       className="w-full bg-[#f9f9fa] p-2"
                       style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                       required
                   >
                       <option value="">Seleccionar profesional...</option>
                       {PERSONAL_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
               </div>
           </fieldset>
           </div>

            {/* Columna derecha: col-span-1 con Observaciones y Registro de Llamadas */}
            <div className="lg:col-span-1 flex flex-col space-y-4">
             <fieldset className="grid grid-cols-1 gap-6 border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Observaciones Generales</legend>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="text-sm font-medium">Fecha de Volver a Llamar</label>
                         <input
                             type="date"
                             name="fechaVolverLlamar"
                             value={formatDateForInput(formData.fechaVolverLlamar) || ''}
                             onChange={handleChange}
                             className="w-full bg-[#f9f9fa] p-2"
                             style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', colorScheme: 'light', borderWidth: '1px' }}
                         />
                     </div>
                     <div>
                         <label className="text-sm font-medium">Hora de Volver a Llamar</label>
                         <input
                             type="time"
                             name="horaVolverLlamar"
                             value={formatTimeForInput(formData.horaVolverLlamar) || ''}
                             onChange={handleChange}
                             className="w-full bg-[#f9f9fa] p-2"
                             style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                         />
                     </div>
                 </div>
                 <div>
                     <label className="text-sm font-medium">Observaciones</label>
                     <textarea
                         name="observacionesGenerales"
                         value={formData.observacionesGenerales || ''}
                         onChange={handleChange}
                         rows={3}
                         placeholder="Observaciones sobre el paciente o tratamiento..."
                         className="w-full bg-[#f9f9fa] p-2"
                         style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                     />
                 </div>
             </fieldset>
            
             <fieldset className="grid grid-cols-1 gap-6 border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Registro de Llamadas</legend>
                
                {/* Form fields to add a new call log */}
                {currentLlamada ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium block mb-1">Duración</label>
                                <input 
                                    type="time" 
                                    step="1" 
                                    value={formatTimeForInput(currentLlamada.duracionLlamada) || ''} 
                                    onChange={(e) => setCurrentLlamada({...currentLlamada, duracionLlamada: e.target.value})} 
                                    className="w-full bg-white p-2" 
                                    style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} 
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Estado</label>
                                <select 
                                    value={currentLlamada.estadoLlamada} 
                                    onChange={(e) => setCurrentLlamada({...currentLlamada, estadoLlamada: e.target.value})} 
                                    className="w-full bg-white p-2" 
                                    style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                >
                                    {Object.values(EstadoLlamada).map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Observación</label>
                                <input 
                                    type="text" 
                                    placeholder="Observación de la llamada" 
                                    value={currentLlamada.observacion || ''} 
                                    onChange={(e) => setCurrentLlamada({...currentLlamada, observacion: e.target.value})} 
                                    className="w-full bg-white p-2" 
                                    style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }} 
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setCurrentLlamada(null)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md transition">Cancelar</button>
                            <button type="button" onClick={handleSaveCurrentLlamada} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition">
                                <GoogleIcon name="save" className="inline mr-1" /> Guardar Llamada
                            </button>
                        </div>
                    </div>
                ) : (
                    <button type="button" onClick={handleShowAddLlamadaForm} className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition">
                        <GoogleIcon name="add_call"/> <span className="ml-1">Añadir Registro de Llamada</span>
                    </button>
                )}

                {/* Table of saved call logs */}
                {formData.registrosLlamada && formData.registrosLlamada.length > 0 && (
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left">N°</th>
                                    <th className="p-2 text-left">Duración</th>
                                    <th className="p-2 text-left">Estado</th>
                                    <th className="p-2 text-left">Observación</th>
                                    <th className="p-2 text-center w-16">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.registrosLlamada.map((llamada: any) => (
                                    <tr key={llamada.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{llamada.numeroLlamada}</td>
                                        <td className="p-2">{llamada.duracionLlamada}</td>
                                        <td className="p-2">{llamada.estadoLlamada}</td>
                                        <td className="p-2 truncate max-w-xs">{llamada.observacion}</td>
                                        <td className="p-2 text-center">
                                            <button type="button" onClick={() => handleRemoveLlamada(llamada.id)} className="text-red-500 hover:text-red-700 transition" title="Eliminar">
                                                <GoogleIcon name="delete"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </fieldset>
            </div>
            {/* Fin columna derecha */}
        </div>
    );
};

const RecepcionTabContent: React.FC<any> = ({ formData, handleChange, handleGenerateHistoryNumber, handleSetFormData, totales, services, memberships }) => {
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
            tipo: 'Servicio',
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
                
                // Si cambió el nombre (servicio/membresía), buscar precio y sesiones automáticos
                if (field === 'nombre' && value) {
                    if (updated.tipo === 'Membresía') {
                        const membership = memberships?.find((m: Membership) => m.nombre === value);
                        if (membership) {
                            updated.precio = membership.precioTotal || 0;
                            updated.cantidadSesiones = membership.servicios?.reduce((sum: number, s: any) => sum + (s.cantidadSesiones || 0), 0) || 1;
                            updated.deuda = (membership.precioTotal || 0) - (updated.montoPagado || 0);
                        }
                    } else {
                        const service = services?.find((s: Service) => s.nombre === value);
                        if (service) {
                            updated.precio = service.precio;
                            updated.cantidadSesiones = 1;
                            updated.deuda = service.precio - (updated.montoPagado || 0);
                        }
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
                    <legend className="text-md font-bold px-2 text-black">
                        Servicio agendado: {formData.servicios?.length ? formData.servicios.join(', ') : 'Cita de Evaluación'}
                    </legend>
                    
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
                                        <th className="p-2">Tipo</th>
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
                                                        value={treatment.tipo || 'Servicio'}
                                                        onChange={(e) => {
                                                            handleTreatmentChange(treatment.id, 'tipo', e.target.value);
                                                            // Limpiar el nombre cuando cambie el tipo
                                                            handleTreatmentChange(treatment.id, 'nombre', '');
                                                        }}
                                                        className="w-full p-1"
                                                        style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                                    >
                                                        <option value="Servicio">Servicio</option>
                                                        <option value="Membresía">Membresía</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        treatment.tipo === 'Membresía' 
                                                            ? 'bg-purple-100 text-purple-700' 
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {treatment.tipo || 'Servicio'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                {editingTreatments ? (
                                                    <select 
                                                        value={treatment.nombre}
                                                        onChange={(e) => handleTreatmentChange(treatment.id, 'nombre', e.target.value)}
                                                        className="w-full p-1"
                                                        style={{ borderColor: '#6b7280', borderRadius: '8px', color: 'black', borderWidth: '1px' }}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        {treatment.tipo === 'Membresía' 
                                                            ? memberships?.map((m: Membership) => (
                                                                <option key={m.id} value={m.nombre}>{m.nombre}</option>
                                                            ))
                                                            : services?.map((s: Service) => (
                                                                <option key={s.id} value={s.nombre}>{s.nombre}</option>
                                                            ))
                                                        }
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
                                        <td className="p-2" colSpan={3}>TOTALES</td>
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

const ProcedimientosTabContent: React.FC<any> = ({ formData, handleSetFormData, PERSONAL_OPTIONS }) => {
    const [currentProcedure, setCurrentProcedure] = useState<Partial<Procedure> | null>(null);
    const [editingProcedureId, setEditingProcedureId] = useState<number | null>(null);
    const [justSavedProcedureId, setJustSavedProcedureId] = useState<number | null>(null);

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

    // Función para calcular sesiones restantes de un tratamiento
    const getSesionesRestantes = (tratamientoId: number): { usadas: number, total: number, restantes: number } => {
        const tratamiento = formData.tratamientos?.find((t: Treatment) => t.id === tratamientoId);
        if (!tratamiento) {
            console.log('⚠️ Tratamiento no encontrado:', tratamientoId);
            console.log('Tratamientos disponibles:', formData.tratamientos?.map(t => ({ id: t.id, nombre: t.nombre })));
            return { usadas: 0, total: 0, restantes: 0 };
        }
        
        // Log TODOS los procedimientos con sus tratamientoId
        console.log('🔍 TODOS los procedimientos:', (formData.procedimientos || []).map(p => ({
            id: p.id,
            sesion: p.sesionNumero,
            nombreTratamiento: p.nombreTratamiento,
            tratamientoId: p.tratamientoId,
            tratamientoIdTipo: typeof p.tratamientoId
        })));
        
        console.log('🔍 Buscando procedimientos con tratamientoId:', tratamientoId, 'tipo:', typeof tratamientoId);
        
        const procedimientosFiltrados = (formData.procedimientos || []).filter(
            (p: Procedure) => {
                const coincide = p.tratamientoId === tratamientoId;
                console.log(`  - Procedimiento ${p.id}: tratamientoId=${p.tratamientoId} (${typeof p.tratamientoId}) === ${tratamientoId} (${typeof tratamientoId})? ${coincide}`);
                return coincide;
            }
        );
        
        const procedimientosUsados = procedimientosFiltrados.length;
        
        const resultado = {
            usadas: procedimientosUsados,
            total: tratamiento.cantidadSesiones,
            restantes: Math.max(0, tratamiento.cantidadSesiones - procedimientosUsados)
        };
        
        console.log('🔍 getSesionesRestantes RESULTADO:', {
            tratamientoId,
            tratamientoNombre: tratamiento.nombre,
            cantidadSesiones: tratamiento.cantidadSesiones,
            procedimientosTotal: formData.procedimientos?.length || 0,
            procedimientosFiltrados: procedimientosFiltrados.length,
            resultado
        });
        
        return resultado;
    };

    // Función para verificar si se puede agregar una sesión más
    const canAddSession = (tratamientoId: number): boolean => {
        const { restantes } = getSesionesRestantes(tratamientoId);
        return restantes > 0;
    };

    const handleAddProcedure = () => {
        if (!formData.tratamientos || formData.tratamientos.length === 0) {
            console.log('❌ No hay tratamientos disponibles');
            return;
        }
        
        const primerTratamiento = formData.tratamientos[0];
        const { restantes, usadas, total } = getSesionesRestantes(primerTratamiento.id);
        
        console.log('🔍 Intentando agregar procedimiento:', {
            tratamiento: primerTratamiento.nombre,
            usadas,
            total,
            restantes,
            procedimientosActuales: formData.procedimientos?.length || 0
        });
        
        if (restantes === 0) {
            alert(`⚠️ No se puede agregar más sesiones\n\nTratamiento: ${primerTratamiento.nombre}\nSesiones utilizadas: ${usadas}/${total}\nSesiones restantes: 0\n\nPara agregar más sesiones, solicite el pago de sesiones adicionales en Recepción.`);
            return;
        }
        
        const nextSessionNumber = getNextSessionNumber(formData.tratamientos[0].id);
        console.log('📝 Creando nuevo procedimiento con sesión #', nextSessionNumber);
        
        setCurrentProcedure({
            id: Date.now(),
            fechaAtencion: formatDateForInput(new Date()),
            horaInicio: '',
            horaFin: '',
            tratamientoId: formData.tratamientos[0].id,
            nombreTratamiento: formData.tratamientos[0].nombre,
            sesionNumero: nextSessionNumber,
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
        
        // Para edición, mantener el número de sesión original
        // Para nuevo, recalcular con el estado actual
        const finalSessionNumber = editingProcedureId 
            ? currentProcedure.sesionNumero 
            : getNextSessionNumber(currentProcedure.tratamientoId || 0);
        
        const procedureToSave: Procedure = {
            id: currentProcedure.id || Date.now(),
            fechaAtencion: currentProcedure.fechaAtencion || '',
            horaInicio: currentProcedure.horaInicio || '',
            horaFin: currentProcedure.horaFin || '',
            tratamientoId: currentProcedure.tratamientoId || 0,
            nombreTratamiento: currentProcedure.nombreTratamiento || '',
            sesionNumero: finalSessionNumber,
            personal: currentProcedure.personal || 'Vanesa',
            asistenciaMedica: currentProcedure.asistenciaMedica || false,
            medico: currentProcedure.medico,
            observacion: currentProcedure.observacion
        };

        // Validar sesiones disponibles ANTES de guardar (solo para nuevos)
        if (!editingProcedureId) {
            // Calcular cuántos procedimientos del mismo tratamiento ya existen
            const procedimientosActuales = (formData.procedimientos || []).filter(
                (p: Procedure) => p.tratamientoId === procedureToSave.tratamientoId
            ).length;
            
            const tratamiento = formData.tratamientos?.find(t => t.id === procedureToSave.tratamientoId);
            const sesionesTotales = tratamiento?.cantidadSesiones || 0;
            
            console.log('🔍 Validando sesiones antes de guardar:', {
                tratamientoId: procedureToSave.tratamientoId,
                tratamientoNombre: tratamiento?.nombre,
                procedimientosActuales,
                sesionesTotales,
                intentandoAgregar: finalSessionNumber,
                editingProcedureId
            });
            
            // Si ya se usaron todas las sesiones, no permitir guardar
            if (procedimientosActuales >= sesionesTotales) {
                alert(`⚠️ No se puede guardar el procedimiento\n\nTratamiento: ${tratamiento?.nombre || 'Desconocido'}\nSesiones disponibles: ${sesionesTotales}\nSesiones ya registradas: ${procedimientosActuales}\n\nNo quedan sesiones disponibles. Solicite el pago de sesiones adicionales en Recepción.`);
                return;
            }
        }

        console.log('💾 Guardando procedimiento:', {
            procedureToSave,
            editingProcedureId,
            procedimientosActuales: formData.procedimientos?.length || 0
        });

        handleSetFormData((prev: Partial<Lead>) => {
            const procedimientos = prev.procedimientos || [];
            
            if (editingProcedureId !== null) {
                const updated = {
                    ...prev,
                    procedimientos: procedimientos.map((p: Procedure) => 
                        p.id === editingProcedureId ? procedureToSave : p
                    )
                };
                console.log('✏️ Procedimiento editado:', updated.procedimientos?.length);
                return updated;
            } else {
                const updated = {
                    ...prev,
                    procedimientos: [...procedimientos, procedureToSave]
                };
                console.log('➕ Nuevo procedimiento agregado. Total:', updated.procedimientos?.length);
                return updated;
            }
        });

        // Show success feedback
        setJustSavedProcedureId(procedureToSave.id);
        setTimeout(() => {
            setJustSavedProcedureId(null);
        }, 2000);

        setCurrentProcedure(null);
        setEditingProcedureId(null);
    };

    const handleDeleteProcedure = (procedureId: number) => {
        handleSetFormData((prev: Partial<Lead>) => {
            // Verificar si hay seguimientos asociados
            const tieneSeguimientos = (prev.seguimientos || []).some((s: Seguimiento) => s.procedimientoId === procedureId);
            if (tieneSeguimientos) {
                alert('Primero debes eliminar los seguimientos asociados a este procedimiento.');
                return prev;
            }
            return {
                ...prev,
                procedimientos: (prev.procedimientos || []).filter((p: Procedure) => p.id !== procedureId)
            };
        });
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
    const procedimientosExistentes = (formData.procedimientos || []).length > 0;

    // Debug: Monitor procedimientos changes
    useEffect(() => {
        console.log('🔍 ProcedimientosTabContent - formData.procedimientos actualizado:', {
            procedimientos: formData.procedimientos,
            length: (formData.procedimientos || []).length,
            procedimientosExistentes,
            hasTratamientos,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Si hay tratamientos, mostrar el cálculo de sesiones
        if (hasTratamientos && formData.tratamientos?.[0]) {
            const primerTratamiento = formData.tratamientos[0];
            const sesionesInfo = getSesionesRestantes(primerTratamiento.id);
            console.log('📊 Estado actual de sesiones después de cambio:', sesionesInfo);
            
            // Verificar si el botón debería estar deshabilitado
            const deberiaEstarDeshabilitado = sesionesInfo.restantes === 0;
            console.log(`🔘 Botón debería estar ${deberiaEstarDeshabilitado ? 'DESHABILITADO' : 'HABILITADO'}`);
        }
    }, [formData.procedimientos, procedimientosExistentes, hasTratamientos, formData.tratamientos]);

    return (
        <div className="space-y-6">
            {/* Header con botón Añadir y contador de sesiones */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Procedimientos Realizados</h3>
                <div className="flex items-center space-x-3">
                    {/* Contador de sesiones */}
                    {hasTratamientos && formData.tratamientos && formData.tratamientos.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
                            {(() => {
                                const primerTratamiento = formData.tratamientos[0];
                                const { usadas, total, restantes } = getSesionesRestantes(primerTratamiento.id);
                                return (
                                    <div className="flex items-center space-x-2">
                                        <GoogleIcon name="schedule" className="text-blue-600" />
                                        <span className="text-gray-700">
                                            <strong>{primerTratamiento.nombre}:</strong>
                                        </span>
                                        <span className={`font-semibold ${restantes > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {usadas}/{total} sesiones
                                        </span>
                                        <span className="text-gray-500">
                                            ({restantes} restantes)
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                    
                    <button
                        type="button"
                        onClick={handleAddProcedure}
                        disabled={(() => {
                            if (!hasTratamientos) {
                                console.log('🔘 Botón disabled: No hay tratamientos');
                                return true;
                            }
                            const primerTratamiento = formData.tratamientos?.[0];
                            if (!primerTratamiento) {
                                console.log('🔘 Botón disabled: Primer tratamiento no encontrado');
                                return true;
                            }
                            const { restantes, usadas, total } = getSesionesRestantes(primerTratamiento.id);
                            const isDisabled = restantes === 0;
                            console.log('🔘 Estado del botón:', {
                                disabled: isDisabled,
                                restantes,
                                usadas,
                                total,
                                tratamiento: primerTratamiento.nombre
                            });
                            return isDisabled;
                        })()}
                        className={`flex items-center px-4 py-2 rounded-lg text-white text-sm ${
                            (() => {
                                if (!hasTratamientos) return 'bg-gray-300 cursor-not-allowed';
                                const primerTratamiento = formData.tratamientos?.[0];
                                if (!primerTratamiento) return 'bg-gray-300 cursor-not-allowed';
                                const { restantes } = getSesionesRestantes(primerTratamiento.id);
                                return restantes > 0 
                                    ? 'bg-[#aa632d] hover:bg-[#8e5225]' 
                                    : 'bg-gray-400 cursor-not-allowed';
                            })()
                        }`}
                        title={(() => {
                            if (!hasTratamientos) return 'Debe agregar tratamientos en la pestaña Recepción primero';
                            const primerTratamiento = formData.tratamientos?.[0];
                            if (!primerTratamiento) return 'No hay tratamientos disponibles';
                            const { restantes } = getSesionesRestantes(primerTratamiento.id);
                            return restantes === 0 
                                ? 'No quedan sesiones disponibles. Solicite pago de sesiones adicionales en Recepción.' 
                                : `${restantes} sesión(es) disponible(s)`;
                        })()}
                    >
                        <GoogleIcon name="add" className="mr-1" />
                        Añadir Procedimiento
                        {hasTratamientos && formData.tratamientos?.[0] && (
                            <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                                {getSesionesRestantes(formData.tratamientos[0].id).restantes}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {!hasTratamientos && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <GoogleIcon name="info" className="text-yellow-600 text-2xl mb-2" />
                    <p className="text-lg font-medium">No hay tratamientos registrados</p>
                    <p className="text-sm">Agregue tratamientos en la pestaña "Recepción" para poder registrar procedimientos.</p>
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
                                readOnly
                                className="w-full bg-gray-100 p-2 cursor-not-allowed"
                                style={{ borderColor: '#6b7280', borderRadius: '8px', color: '#4b5563', borderWidth: '1px' }}
                                title="El número de sesión se calcula automáticamente"
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
                                value={formatTimeForInput(currentProcedure.horaInicio) || ''}
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
                                value={formatTimeForInput(currentProcedure.horaFin) || ''}
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



            {/* Lista Simple de Procedimientos */}
            {procedimientosExistentes && (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <GoogleIcon name="history_edu" className="mr-2" />
                        Historial de Procedimientos
                    </h4>
                    
                    {(formData.procedimientos || [])
                        .sort((a: Procedure, b: Procedure) => (parseDate(b.fechaAtencion as any, true)?.getTime() || 0) - (parseDate(a.fechaAtencion as any, true)?.getTime() || 0))
                        .map((proc: Procedure, index: number) => (
                            <div 
                                key={proc.id || index} 
                                className={`border border-gray-200 rounded-lg p-4 transition-all duration-500 ${
                                    justSavedProcedureId === proc.id 
                                        ? 'bg-green-50 border-green-400' 
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className={`font-semibold ${
                                                justSavedProcedureId === proc.id 
                                                    ? 'text-green-700' 
                                                    : 'text-purple-700'
                                            }`}>
                                                {proc.nombreTratamiento} - Sesión #{proc.sesionNumero}
                                                {justSavedProcedureId === proc.id && (
                                                    <span className="ml-2 text-green-600 text-xs">
                                                        ✓ Guardado
                                                    </span>
                                                )}
                                            </span>
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
                                                handleDeleteProcedure(proc.id);
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
                        ))
                    }
                </div>
            )}



            {hasTratamientos && !procedimientosExistentes && !currentProcedure && (
                <div className="text-center py-12 text-gray-500">
                    <GoogleIcon name="event_note" className="text-6xl mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay procedimientos registrados</p>
                    <p className="text-sm">Haga clic en "Añadir Procedimiento" para comenzar el historial clínico.</p>
                </div>
            )}


        </div>
    );
};

const SeguimientoTabContent: React.FC<any> = ({ formData, handleSetFormData, PERSONAL_OPTIONS }) => {
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
            fechaSeguimiento: formatDateForInput(new Date()),
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

    // Debug: Monitor seguimientos changes
    useEffect(() => {
        console.log('🔍 SeguimientoTabContent - formData.seguimientos:', {
            seguimientos: formData.seguimientos,
            length: seguimientos.length
        });
    }, [formData.seguimientos, seguimientos.length]);

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
                                value={formatDateForInput(currentSeguimiento.fechaSeguimiento) || ''}
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
                                    (parseDate(b.fechaSeguimiento as any, true)?.getTime() || 0) - (parseDate(a.fechaSeguimiento as any, true)?.getTime() || 0)
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
                                                        <p className="text-gray-800 font-medium">{formatFechaHora(seg.fechaSeguimiento)}</p>
                                                    // Formatea fecha ISO a DD/MM/AAAA y hora 12h AM/PM
                                                    {/* formatFechaHora is now called from top-level scope */}
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
  memberships = [],
  users = [],
  requestConfirmation,
  onSaveComprobante,
  comprobantes
    , initialTab, disableFicha
}) => {
    const [formData, setFormData] = useState<Partial<Lead>>({});
        const [activeTab, setActiveTab] = useState('ficha');
        const prevIsOpenRef = React.useRef<boolean>(false);
    const [isFacturacionModalOpen, setIsFacturacionModalOpen] = useState(false);
    const [showSaveMessage, setShowSaveMessage] = useState(false);
    const [currentLlamada, setCurrentLlamada] = useState<Partial<RegistroLlamada> | null>(null);

    // Filtrar profesionales por puesto
    const PERSONAL_OPTIONS = useMemo(() => {
        return users
            .filter((user: any) => user.position && PUESTOS_PROFESIONAL.includes(user.position))
            .map((user: any) => `${user.nombres} ${user.apellidos}`);
    }, [users]);

    // Filtrar vendedores por puesto y mapear a { value: SellerToken, label: FullName }
    const VENDEDOR_OPTIONS = useMemo(() => {
        const list: { value: string, label: string }[] = [];
        if (users && Array.isArray(users)) {
            users
                .filter((user: any) => user.position && PUESTOS_VENDEDOR.includes(user.position))
                .forEach((user: any) => {
                    const fullName = `${user.nombres} ${user.apellidos}`;
                    // Determine token value by simple first-name matching
                    const first = (user.nombres || '').toLowerCase();
                    let token = 'Vanesa';
                    if (first.includes('vanesa') || first.includes('vanessa')) token = 'Vanesa';
                    else if (first.includes('liz') || first.includes('liza')) token = 'Liz';
                    else if (first.includes('elvira')) token = 'Elvira';
                    list.push({ value: token, label: fullName });
                });
        }
        // Ensure default tokens exist even if users not provided
        const defaultTokens = ['Vanesa', 'Liz', 'Elvira'];
        for (const t of defaultTokens) {
            if (!list.find(l => l.value === t)) {
                list.push({ value: t, label: t });
            }
        }
        return list;
    }, [users]);

    // Helper function to format date fields for input[type="date"]
    // Delegate to shared utils to keep behavior consistent across the app
    const formatDateForInputField = (dateValue: any): string => {
        try {
            return formatDateForInput(dateValue) || '';
        } catch (e) {
            return '';
        }
    };

    // Normalizer: some backend responses use DD/MM/YYYY strings (e.g. '19/11/2025').
    // HTML date inputs expect YYYY-MM-DD. Convert common DD/MM/YYYY format to
    // YYYY-MM-DD before passing to input value. Otherwise fall back to
    // `formatDateForInput` which handles ISO/Date objects and YYYY-MM-DD.
    const normalizeDateStringForInput = (dateValue: any): string => {
        if (!dateValue) return '';

        // If it's already a Date instance, return YYYY-MM-DD
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
            return dateValue.toISOString().split('T')[0];
        }

        // If it's a string in DD/MM/YYYY format, convert to YYYY-MM-DD
        if (typeof dateValue === 'string') {
            const ddmmyyyy = dateValue.match(/^\s*(\d{2})\/(\d{2})\/(\d{4})\s*$/);
            if (ddmmyyyy) {
                const day = ddmmyyyy[1];
                const month = ddmmyyyy[2];
                const year = ddmmyyyy[3];
                return `${year}-${month}-${day}`;
            }

            // Try parsing robustly using shared helper (handles ISO and date-only)
            try {
                const parsed = parseDate(dateValue);
                if (parsed) {
                    return parsed.toISOString().split('T')[0];
                }
            } catch (e) {
                // fallthrough to formatDateForInputField
            }
        }

        // Fallback to the shared helper which already handles Date/ISO/strings
        return formatDateForInputField(dateValue);
    };

    // Recursively normalize any property names that include 'fecha' or 'date'
    // This will handle nested arrays/objects like `seguimientos`, `procedimientos`,
    // `registrosLlamada`, etc. It returns a new copy and does not mutate the input.
    const normalizeDatesInObject = (obj: any): any => {
        if (obj == null) return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => normalizeDatesInObject(item));
        }

        if (typeof obj !== 'object') return obj;

        const copy: any = {};
        for (const key of Object.keys(obj)) {
            const val = obj[key];

            if (val == null) {
                copy[key] = val;
                continue;
            }

            // If key looks like a date field, normalize it
            const k = String(key).toLowerCase();
            if (k.includes('fecha') || k.includes('date')) {
                copy[key] = normalizeDateStringForInput(val);
                continue;
            }

            // Recurse into arrays and objects
            if (Array.isArray(val)) {
                copy[key] = val.map((item: any) => normalizeDatesInObject(item));
                continue;
            }

            if (typeof val === 'object') {
                copy[key] = normalizeDatesInObject(val);
                continue;
            }

            copy[key] = val;
        }

        return copy;
    };

    // Frontend mapping helper: normalize any incoming vendedor string to Seller token
    const mapSellerFront = (value: any): string => {
        if (!value) return 'Vanesa';
        const s = String(value).toLowerCase();
        if (s.includes('vanesa') || s.includes('vanessa')) return 'Vanesa';
        if (s.includes('liz') || s.includes('liza')) return 'Liz';
        if (s.includes('elvira')) return 'Elvira';
        // If already a token-like value, capitalize first letter
        const capitalized = String(value).charAt(0).toUpperCase() + String(value).slice(1);
        if (['Vanesa','Liz','Elvira'].includes(capitalized)) return capitalized;
        return 'Vanesa';
    };

    // Map backend ReceptionStatus tokens (e.g. 'PorAtender', 'Agendado') to frontend display values
    const mapReceptionFront = (value: any): string | undefined => {
        if (value === null || value === undefined) return undefined;
        const s = String(value).trim();
        const map: Record<string, string> = {
            'Agendado': 'Agendado',
            'AgendadoPorLlegar': 'Agendado por llegar',
            'PorAtender': 'Por Atender',
            'Atendido': 'Atendido',
            'Reprogramado': 'Reprogramado',
            'Cancelado': 'Cancelado',
            'NoAsistio': 'No Asistió'
        };
        // If it's already a display value (contains space or lowercase), try to return it
        if (Object.values(map).includes(s)) return s;
        return map[s] ?? undefined;
    };

    const SERVICE_CATEGORIES = useMemo(() => {
        const categories = services.reduce((acc, service) => {
            if (!acc[service.categoria]) {
                acc[service.categoria] = [];
            }
            acc[service.categoria].push(service.nombre);
            return acc;
        }, {} as Record<string, string[]>);
        
        // Agregar categoría "Membresías" si hay membresías disponibles
        if (memberships.length > 0) {
            categories['Membresías'] = memberships.map(m => m.nombre);
        }
        
        return categories;
    }, [services, memberships]);

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
        profesionalAsignado: '',
        observacionesGenerales: '',
        registrosLlamada: [],
        pagosRecepcion: [],
        tratamientos: [],
        procedimientos: [],
        seguimientos: [],
    }), [CATEGORY_OPTIONS]);


    useEffect(() => {
        // Only run when modal transitions from closed -> open
        if (!prevIsOpenRef.current && isOpen) {
                if (lead) {
                // Build base mapped lead and recursively normalize all date-like fields
                const baseLead = {
                    ...lead,
                    vendedor: mapSellerFront(lead.vendedor),
                    estadoRecepcion: mapReceptionFront(lead.estadoRecepcion),
                } as any;

                const normalized = normalizeDatesInObject(baseLead);

                // DEBUG: inspect date-like fields (original vs normalized)
                try {
                    const dateKeys = Object.keys(baseLead).filter(k => /fecha|date/i.test(k));
                    const debugObj: Record<string, any> = {};
                    dateKeys.forEach(k => {
                        debugObj[k] = { original: baseLead[k], normalized: normalized[k], typeOriginal: typeof baseLead[k] };
                    });
                    console.debug('🧭 LeadFormModal open normalization:', debugObj);
                } catch (e) {
                    console.debug('🧭 LeadFormModal normalization debug error', e);
                }

                // Preserve fechaHoraAgenda (may include time) and ensure fechaLead default
                if (lead.fechaHoraAgenda) normalized.fechaHoraAgenda = lead.fechaHoraAgenda;
                if (!normalized.fechaLead) normalized.fechaLead = formatDateForInput(new Date());

                setFormData(normalized);
            } else {
                // Nuevo lead: fuerza fechaLead a formato YYYY-MM-DD
                setFormData({
                    ...initialFormData,
                    fechaLead: formatDateForInput(new Date()),
                });
            }
            setActiveTab(initialTab || 'ficha');
            console.debug('LeadFormModal opened', { lead, isOpen, initialFormData, initialTab, disableFicha });
        }
        prevIsOpenRef.current = isOpen;
    }, [lead, isOpen, initialFormData, initialTab, disableFicha]);

    // Force refresh formData when lead changes (e.g., after save)
    useEffect(() => {
        if (lead && isOpen) {
            const baseLead = {
                ...lead,
                vendedor: mapSellerFront(lead.vendedor),
                estadoRecepcion: mapReceptionFront(lead.estadoRecepcion),
            } as any;

            const normalized = normalizeDatesInObject(baseLead);
            // DEBUG: inspect date-like fields when lead changes
            try {
                const dateKeys = Object.keys(baseLead).filter(k => /fecha|date/i.test(k));
                const debugObj: Record<string, any> = {};
                dateKeys.forEach(k => {
                    debugObj[k] = { original: baseLead[k], normalized: normalized[k], typeOriginal: typeof baseLead[k] };
                });
                console.debug('🧭 LeadFormModal change normalization:', debugObj);
            } catch (e) {
                console.debug('🧭 LeadFormModal normalization debug error', e);
            }

            if (lead.fechaHoraAgenda) normalized.fechaHoraAgenda = lead.fechaHoraAgenda;

            setFormData(normalized as any);
        }
    }, [lead]);

    // Format phone number as 970 446 695 (9 digits with spaces)
    const formatPhoneNumber = (phone: string): string => {
        // Remove all non-numeric characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Limit to 9 digits
        const limitedPhone = cleanPhone.slice(0, 9);
        
        // Format as 3-3-3 pattern
        if (limitedPhone.length <= 3) {
            return limitedPhone;
        } else if (limitedPhone.length <= 6) {
            return `${limitedPhone.slice(0, 3)} ${limitedPhone.slice(3)}`;
        } else {
            return `${limitedPhone.slice(0, 3)} ${limitedPhone.slice(3, 6)} ${limitedPhone.slice(6)}`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => {
            const newState = { ...prev } as any;
            
            if (type === 'number') {
                newState[name] = value === '' ? undefined : Number(value);
            } else if (type === 'datetime-local') {
                // Convert to ISO format for datetime-local using parseDate to avoid
                // inconsistent timezone interpretation across environments.
                // parseDate returns a Date or null.
                const parsed = parseDate(value as any);
                newState[name] = parsed ? parsed.toISOString() : '';
            } else if (name === 'numero') {
                // Format phone number
                newState[name] = formatPhoneNumber(value);
            } else {
                newState[name] = value;
            }

            // Recalculate deudaCita when montoPagado changes
            if (name === 'montoPagado') {
                const precio = newState.precioCita || 0;
                const montoPagado = newState.montoPagado || 0;
                newState.deudaCita = precio - montoPagado;
            }
            
            // Automatically set estadoRecepcion to "Agendado por llegar" when estado changes to "Agendado"
            if (name === 'estado' && value === 'Agendado') {
                newState.estadoRecepcion = 'Agendado por llegar';
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
    
    const handleSave = async () => {
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
            if (!formData.profesionalAsignado?.trim()) {
                errors.push('Profesional (requerido cuando está Agendado)');
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
        
        console.log('🔍 FRONTEND: About to save lead:', {
            isNewLead,
            leadId: formData.id,
            dataToSave: {
                id: dataToSave.id,
                nombres: dataToSave.nombres,
                apellidos: dataToSave.apellidos,
                estado: dataToSave.estado,
                tratamientos: dataToSave.tratamientos?.length || 0,
                procedimientos: dataToSave.procedimientos?.length || 0,
                seguimientos: dataToSave.seguimientos?.length || 0
            }
        });
        
        try {
            await onSave(dataToSave as Lead);
            
            // Mostrar mensaje de éxito
            setShowSaveMessage(true);
            setTimeout(() => {
                setShowSaveMessage(false);
            }, 3000);
            
            // NO cerrar el modal - mantener abierto después de guardar

        } catch (error) {
            console.error('❌ FRONTEND: Error saving lead:', error);
            alert('Error al guardar. Por favor, inténtalo de nuevo.');
        }
    };

    const handleDeleteClick = () => {
        if (lead) {
            requestConfirmation(`¿Estás seguro de que quieres eliminar al lead "${lead.nombres} ${lead.apellidos}"?`, async () => {
                try {
                    await onDelete(lead.id);
                    
                    // Mostrar mensaje de éxito
                    setShowSaveMessage(true);
                    setTimeout(() => {
                        setShowSaveMessage(false);
                        // Cerrar el modal después de eliminar
                        onClose();
                    }, 2000);
                } catch (error) {
                    console.error('Error deleting lead:', error);
                    alert('Error al eliminar. Por favor, inténtalo de nuevo.');
                }
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


    const isNewLead = !lead || (lead && ((lead as any).id === undefined || (lead as any).id === null));
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
                            memberships={memberships}
                            PERSONAL_OPTIONS={PERSONAL_OPTIONS}
                            VENDEDOR_OPTIONS={VENDEDOR_OPTIONS}
                        />;
            case 'recepcion':
                return <RecepcionTabContent 
                            formData={formData} 
                            handleChange={handleChange} 
                            handleGenerateHistoryNumber={handleGenerateHistoryNumber}
                            handleSetFormData={setFormData}
                            totales={totalesTratamientos}
                            services={services}
                            memberships={memberships}
                        />;
            case 'procedimientos':
                return <ProcedimientosTabContent 
                    formData={formData} 
                    handleSetFormData={setFormData}
                    PERSONAL_OPTIONS={PERSONAL_OPTIONS}
                />;
            case 'seguimiento':
                return <SeguimientoTabContent formData={formData} handleSetFormData={setFormData} PERSONAL_OPTIONS={PERSONAL_OPTIONS} />;
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
            customMaxWidth="95rem"
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
                        
                        {showSaveMessage && (
                            <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-300">
                                <GoogleIcon name="check_circle" className="mr-2 text-green-600" />
                                ¡Se guardó correctamente!
                            </div>
                        )}
                        
                        <button
                            type="button"
                            onClick={handleSave}
                            className="bg-[#aa632d] text-white px-6 py-2 rounded-lg shadow hover:bg-[#8e5225] flex items-center"
                        >
                            <GoogleIcon name="save" className="mr-2" />
                            {isNewLead ? 'Crear Lead' : 'Guardar Cambios'}
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
                                disabled={
                                    (disableFicha && tab.id === 'ficha') || (isNewLead && tab.id !== 'ficha')
                                }
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
                    fechaVenta: formatDateForInput(formData.fechaHoraAgenda) || formatDateForInput(new Date()),
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