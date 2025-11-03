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

const FichaTabContent: React.FC<any> = ({ formData, handleChange, currentLlamada, setCurrentLlamada, handleShowAddLlamadaForm, handleSaveCurrentLlamada, handleRemoveLlamada, metaCampaigns, clientSources, CATEGORY_OPTIONS, SERVICE_CATEGORIES }) => {
    return (
        <div className="space-y-6">
             <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-4 border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Información Básica</legend>
                <div>
                    <label className="text-sm font-medium">Fecha Lead</label>
                    <input type="date" name="fechaLead" value={formData.fechaLead || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2" style={{ colorScheme: 'light' }} />
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
                <legend className="text-md font-bold px-2 text-black">Intereses y Pago</legend>
                <div>
                    <label className="text-sm font-medium">Categoría de Interés</label>
                    <select name="categoria" value={formData.categoria || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                         {CATEGORY_OPTIONS.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm font-medium">Servicios de Interés</label>
                    <select multiple name="servicios" value={formData.servicios || []} onChange={handleChange} className="w-full h-24 border-black bg-[#f9f9fa] text-black rounded-md p-2">
                         {SERVICE_CATEGORIES[formData.categoria]?.map((serv: string) => <option key={serv} value={serv}>{serv}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-sm font-medium">Monto Pagado</label>
                    <input type="number" name="montoPagado" value={formData.montoPagado || 0} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2"/>
                </div>
                <div>
                    <label className="text-sm font-medium">Método de Pago</label>
                    <select name="metodoPago" value={formData.metodoPago || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                        <option value="">Seleccionar...</option>
                        {Object.values(MetodoPago).map(mp => <option key={mp} value={mp}>{mp}</option>)}
                    </select>
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
    // ... logic to handle treatments ...
    return (
         <div className="space-y-6">
             <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-3 border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Gestión de Cita</legend>
                 <div>
                    <label className="text-sm font-medium">N° Historia Clínica</label>
                    <div className="flex items-center">
                        <input type="text" name="nHistoria" value={formData.nHistoria || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-l-md p-2"/>
                        <button type="button" onClick={handleGenerateHistoryNumber} className="bg-gray-200 px-3 py-2 rounded-r-md text-sm">Generar</button>
                    </div>
                </div>
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
                 <div>
                    <label className="text-sm font-medium">Estado en Recepción</label>
                    <select name="estadoRecepcion" value={formData.estadoRecepcion || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2">
                        {Object.values(ReceptionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </fieldset>

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
                     <div>
                        <label className="text-sm font-medium">Motivo de No Cierre</label>
                        <input type="text" name="motivoNoCierre" value={formData.motivoNoCierre || ''} onChange={handleChange} disabled={formData.aceptoTratamiento === 'Si'} className="w-full border-black bg-[#f9f9fa] text-black rounded-md p-2 disabled:bg-gray-100"/>
                    </div>
                </div>
            </fieldset>
             {/* Dynamic Treatments Table will go here */}
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
            const nextHistoryNumber = await api.getNextHistoryNumber();
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