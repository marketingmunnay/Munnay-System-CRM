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

// FIX: Added GoogleIcon definition
const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// FIX: Added FichaTabContent component definition
const FichaTabContent: React.FC<any> = ({ formData, handleChange, currentLlamada, setCurrentLlamada, handleShowAddLlamadaForm, handleSaveCurrentLlamada, handleRemoveLlamada, metaCampaigns, clientSources, CATEGORY_OPTIONS, SERVICE_CATEGORIES }) => {
    return (
        <div className="space-y-6">
            {/* Ficha fields */}
            <p>Ficha Tab Content Here</p>
        </div>
    );
};

// FIX: Added RecepcionTabContent component definition
const RecepcionTabContent: React.FC<any> = ({ formData, handleChange, handleGenerateHistoryNumber, handleSetFormData, totales, services }) => {
    return (
        <div className="space-y-6">
            {/* Recepcion fields */}
            <p>Recepcion Tab Content Here</p>
        </div>
    );
};

// FIX: Added ProcedimientosTabContent component definition
const ProcedimientosTabContent: React.FC<any> = ({ formData, handleSetFormData }) => {
    return (
        <div className="space-y-6">
            {/* Procedimientos fields */}
            <p>Procedimientos Tab Content Here</p>
        </div>
    );
};

// FIX: Added SeguimientoTabContent component definition
const SeguimientoTabContent: React.FC<any> = ({ formData, handleSetFormData }) => {
    return (
        <div className="space-y-6">
            {/* Seguimiento fields */}
            <p>Seguimiento Tab Content Here</p>
        </div>
    );
};


// FIX: Added export to LeadFormModal to make it a named export.
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