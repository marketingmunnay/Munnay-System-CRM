import React, { useState, useEffect, useMemo } from 'react';
import type { VentaExtra, Lead, Service, Product, ComprobanteElectronico, Membership } from '../../types';
import { MetodoPago } from '../../types';
import Modal from '../shared/Modal.tsx';
import FacturacionModal from '../finanzas/FacturacionModal.tsx';
import { TrashIcon } from '../shared/Icons.tsx';
import { formatDateForInput } from '../../utils/time.ts';

interface VentaExtraFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (venta: VentaExtra) => void;
  onDelete: (ventaId: number) => void;
  venta: VentaExtra | null;
  pacientes: Lead[];
  services: Service[];
  products: Product[];
  memberships: Membership[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
  onSaveComprobante: (comprobante: ComprobanteElectronico) => Promise<void>;
  comprobantes: ComprobanteElectronico[];
  onSaveLead: (lead: Lead) => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export const VentaExtraFormModal: React.FC<VentaExtraFormModalProps> = ({ isOpen, onClose, onSave, onDelete, venta, pacientes, services, products, memberships, requestConfirmation, onSaveComprobante, comprobantes, onSaveLead }) => {
  const [formData, setFormData] = useState<Partial<VentaExtra>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Lead | null>(null);
  const [saleType, setSaleType] = useState<'Servicio' | 'Productos' | 'Membresía' | ''>('');
  const [isFacturacionModalOpen, setIsFacturacionModalOpen] = useState(false);

  const serviceCategoriesAndItems = useMemo(() => {
    return services.reduce((acc, s) => {
        if (!acc[s.categoria]) acc[s.categoria] = [];
        acc[s.categoria].push(s.nombre);
        return acc;
    }, {} as Record<string, string[]>);
  }, [services]);

  const productCategoriesAndItems = useMemo(() => {
    return products.reduce((acc, p) => {
        if (!acc[p.categoria]) acc[p.categoria] = [];
        acc[p.categoria].push(p.nombre);
        return acc;
    }, {} as Record<string, string[]>);
  }, [products]);

  const membershipCategoriesAndItems = useMemo(() => {
    return memberships.reduce((acc, m) => {
        if (!acc[m.categoria]) acc[m.categoria] = [];
        acc[m.categoria].push(m.nombre);
        return acc;
    }, {} as Record<string, string[]>);
  }, [memberships]);

  const categoryOptions = useMemo(() => {
    if (saleType === 'Servicio') return Object.keys(serviceCategoriesAndItems);
    if (saleType === 'Productos') return Object.keys(productCategoriesAndItems);
    if (saleType === 'Membresía') return Object.keys(membershipCategoriesAndItems);
    return [];
  }, [saleType, serviceCategoriesAndItems, productCategoriesAndItems, membershipCategoriesAndItems]);

  const itemOptions = useMemo(() => {
      if (!formData.categoria) return [];
      if (saleType === 'Servicio') return serviceCategoriesAndItems[formData.categoria] || [];
      if (saleType === 'Productos') return productCategoriesAndItems[formData.categoria] || [];
      if (saleType === 'Membresía') return membershipCategoriesAndItems[formData.categoria] || [];
      return [];
  }, [formData.categoria, saleType, serviceCategoriesAndItems, productCategoriesAndItems, membershipCategoriesAndItems]);


  useEffect(() => {
    if (isOpen) {
        if (venta) {
            const isService = services.some(s => s.categoria === venta.categoria);
            if (isService) {
                setSaleType('Servicio');
            } else {
                const isProduct = products.some(p => p.categoria === venta.categoria);
                if (isProduct) {
                    setSaleType('Productos');
                } else {
                    const isMembership = memberships.some(m => m.categoria === venta.categoria);
                    setSaleType(isMembership ? 'Membresía' : '');
                }
            }
            
            const paciente = pacientes.find(p => p.id === venta.pacienteId);
            setFormData(venta);
            setSearchTerm(venta.nHistoria);
            setPacienteEncontrado(paciente || null);
        } else {
            // Generar código único: VEN-YYYYMMDD-HHMMSS-RAND
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
            const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const codigoUnico = `VEN-${dateStr}-${timeStr}-${randomStr}`;
            
            setFormData({
                id: Date.now(),
                codigoVenta: codigoUnico,
                fechaVenta: new Date().toISOString().split('T')[0],
                precio: 0,
                montoPagado: 0,
                metodoPago: MetodoPago.Efectivo,
                deuda: 0,
            });
            setSaleType('');
            setSearchTerm('');
            setPacienteEncontrado(null);
        }
    }
  }, [venta, pacientes, isOpen, services, products]);

  const handlePatientSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
        alert("Por favor, ingrese un N° de historia.");
        return;
    }
    const foundPatient = pacientes.find(p => 
        (p.nHistoria && p.nHistoria.toLowerCase() === term)
    );
    if (foundPatient) {
        setPacienteEncontrado(foundPatient);
        setFormData(prev => ({
            ...prev,
            pacienteId: foundPatient.id,
            nHistoria: foundPatient.nHistoria,
            nombrePaciente: `${foundPatient.nombres} ${foundPatient.apellidos}`
        }));
    } else {
        alert("Paciente no encontrado. Verifique el N° de historia.");
        setPacienteEncontrado(null);
    }
  };

  const handleResetSearch = () => {
      setPacienteEncontrado(null);
      setSearchTerm('');
      setFormData(prev => ({
          ...prev,
          pacienteId: undefined,
          nHistoria: undefined,
          nombrePaciente: undefined,
      }));
  }
  
  const handleSaleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as 'Servicio' | 'Productos' | 'Membresía' | '';
      setSaleType(newType);
      setFormData(prev => ({
          ...prev,
          categoria: '',
          servicio: '',
          precio: 0,
          montoPagado: 0,
          deuda: 0,
      }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
        const isNumber = type === 'number';
        const updatedValue = isNumber ? Number(value) : value;
        let newState = { ...prev, [name]: updatedValue };

        if (name === 'categoria') {
            newState.servicio = '';
            newState.precio = 0;
        }

        if (name === 'servicio') {
            let selectedItem;
            if (saleType === 'Servicio') {
                selectedItem = services.find(s => s.nombre === value);
            } else if (saleType === 'Productos') {
                selectedItem = products.find(p => p.nombre === value);
            } else if (saleType === 'Membresía') {
                selectedItem = memberships.find(m => m.nombre === value);
            }
            newState.precio = selectedItem ? selectedItem.precio : 0;
        }

        const precio = newState.precio || 0;
        const montoPagado = newState.montoPagado || 0;
        newState.deuda = precio - montoPagado;

        return newState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteEncontrado) {
      alert('Debe buscar y seleccionar un paciente.');
      return;
    }
    if (!formData.codigoVenta?.trim()) {
        alert('Por favor, ingrese el Código de Venta.');
        return;
    }
    if (!formData.servicio) {
        alert('Por favor, seleccione un servicio o producto.');
        return;
    }
    
    // Guardar la venta
    onSave(formData as VentaExtra);
    
    // Si es un servicio, crear un Procedure en el lead
    if (saleType === 'Servicio' && pacienteEncontrado && !venta) {
      // Generar IDs temporales negativos para evitar conflictos con autoincrement
      const tempId = -Math.floor(Math.random() * 1000000);
      const tempTratamientoId = -Math.floor(Math.random() * 1000000);
      
      const newProcedure: any = {
        id: tempId,
        fechaAtencion: formData.fechaVenta || new Date().toISOString().split('T')[0],
        personal: 'Por asignar',
        horaInicio: '09:00',
        horaFin: '10:00',
        tratamientoId: tempTratamientoId,
        nombreTratamiento: formData.servicio || '',
        sesionNumero: 1,
        asistenciaMedica: false,
        observacion: `Venta registrada - Código: ${formData.codigoVenta}`
      };
      
      const updatedLead: Lead = {
        ...pacienteEncontrado,
        procedimientos: [...(pacienteEncontrado.procedimientos || []), newProcedure]
      };
      
      onSaveLead(updatedLead);
    }
  };

  const handleDelete = () => {
    if (venta && onDelete) {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar la venta ${venta.codigoVenta}? Esta acción no se puede deshacer.`,
            () => {
                onDelete(venta.id);
                onClose();
            }
        );
    }
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


  const formIsDisabled = !pacienteEncontrado;

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={venta ? 'Editar Venta Extra' : 'Registrar Nueva Venta'}
      footer={
        <div className="w-full flex justify-between items-center">
          {venta && onDelete ? (
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
            <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] transition-colors">Guardar Venta</button>
          </div>
        </div>
      }
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">1. Buscar Paciente</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="patientSearch" className="mb-1 text-sm font-medium text-gray-700">Buscar Paciente (N° Historia)</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                id="patientSearch"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-grow border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black"
                                disabled={!!pacienteEncontrado}
                                placeholder="Ingrese N° historia"
                            />
                            {!pacienteEncontrado ? (
                                <button type="button" onClick={handlePatientSearch} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Buscar</button>
                            ) : (
                                <button type="button" onClick={handleResetSearch} className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600">Limpiar</button>
                            )}
                        </div>
                    </div>
                    {pacienteEncontrado && (
                        <div>
                             <p className="mb-1 text-sm font-medium text-gray-700">Paciente</p>
                             <p className="border bg-gray-100 border-gray-300 rounded-md shadow-sm text-sm p-2 font-semibold text-gray-900">{pacienteEncontrado.nombres} {pacienteEncontrado.apellidos}</p>
                        </div>
                    )}
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-md disabled:opacity-50" disabled={formIsDisabled}>
                 <legend className="text-md font-bold px-2 text-black">2. Detalles de la Venta</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                        <label htmlFor="codigoVenta" className="mb-1 text-sm font-medium text-gray-700">Código de Venta</label>
                        <input type="text" id="codigoVenta" name="codigoVenta" value={formData.codigoVenta || ''} readOnly className="w-full border-gray-300 bg-gray-100 rounded-md shadow-sm text-sm p-2 text-gray-900 cursor-not-allowed" />
                    </div>
                     <div>
                        <label htmlFor="fechaVenta" className="mb-1 text-sm font-medium text-gray-700">Fecha de Venta</label>
                        <input type="date" id="fechaVenta" name="fechaVenta" value={formatDateForInput(formData.fechaVenta) || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black" style={{ colorScheme: 'light' }}/>
                    </div>
                     <div>
                        <label htmlFor="saleType" className="mb-1 text-sm font-medium text-gray-700">Tipo de Venta</label>
                        <select id="saleType" name="saleType" value={saleType} onChange={handleSaleTypeChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black">
                            <option value="">Seleccionar...</option>
                            <option value="Servicio">Servicio</option>
                            <option value="Productos">Producto</option>
                            <option value="Membresía">Membresía</option>
                        </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label htmlFor="categoria" className="mb-1 text-sm font-medium text-gray-700">Categoría</label>
                        <select id="categoria" name="categoria" value={formData.categoria || ''} onChange={handleChange} disabled={!saleType} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black disabled:bg-gray-100">
                            <option value="">Seleccionar categoría...</option>
                            {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="servicio" className="mb-1 text-sm font-medium text-gray-700">{saleType || 'Item'}</label>
                        <select id="servicio" name="servicio" value={formData.servicio || ''} onChange={handleChange} disabled={!formData.categoria} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black disabled:bg-gray-100">
                             <option value="">Seleccionar {saleType || 'item'}...</option>
                             {itemOptions.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-end">
                     <div>
                        <label htmlFor="precio" className="mb-1 text-sm font-medium text-gray-700">Precio</label>
                        <input type="number" id="precio" name="precio" value={formData.precio || 0} onChange={handleChange} readOnly className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 bg-gray-100 text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="montoPagado" className="mb-1 text-sm font-medium text-gray-700">Monto Pagado</label>
                        <input type="number" id="montoPagado" name="montoPagado" value={formData.montoPagado || 0} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black" />
                    </div>
                     <div>
                        <label htmlFor="metodoPago" className="mb-1 text-sm font-medium text-gray-700">Método de Pago</label>
                        <select id="metodoPago" name="metodoPago" value={formData.metodoPago || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black">
                            {Object.values(MetodoPago).map(mp => <option key={mp} value={mp}>{mp}</option>)}
                        </select>
                    </div>
                 </div>
                 <div className="flex justify-between items-center mt-4 p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm font-semibold text-gray-700">Deuda Pendiente:</p>
                    <p className={`text-lg font-bold ${formData.deuda && formData.deuda > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        S/ { (formData.deuda || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
                    </p>
                 </div>
            </fieldset>
            
            {(formData.montoPagado || 0) > 0 && (
                 <fieldset className="border p-4 rounded-md disabled:opacity-50" disabled={formIsDisabled}>
                     <legend className="text-md font-bold px-2 text-black">3. Facturación</legend>
                     <div className="mt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={handleOpenFacturacionModal}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
                        >
                            <GoogleIcon name="add_to_photos" className="mr-2 text-xl" />
                            Generar Comprobante
                        </button>
                    </div>
                 </fieldset>
            )}

        </form>
      </div>
    </Modal>

    {isFacturacionModalOpen && pacienteEncontrado && formData.id && (
        <FacturacionModal
            isOpen={isFacturacionModalOpen}
            onClose={handleCloseFacturacionModal}
            onSave={handleFacturacionSave}
            paciente={pacienteEncontrado as Lead}
            venta={{
                ...formData as VentaExtra,
                servicio: formData.servicio || 'Venta Extra',
                categoria: formData.categoria || 'General',
                pacienteId: pacienteEncontrado.id,
                nombrePaciente: pacienteEncontrado.nombres + ' ' + pacienteEncontrado.apellidos,
                nHistoria: pacienteEncontrado.nHistoria || '',
            }}
            ventaType="venta_extra"
        />
    )}
    </>
  );
};