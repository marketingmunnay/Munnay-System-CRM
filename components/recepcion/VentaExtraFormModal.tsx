import React, { useState, useEffect, useMemo } from 'react';
import type { VentaExtra, Lead, Service, Product } from '../../types';
import { MetodoPago } from '../../types';
import Modal from '../shared/Modal.tsx';
import { TrashIcon } from '../shared/Icons.tsx';

interface VentaExtraFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (venta: VentaExtra) => void;
  onDelete: (ventaId: number) => void;
  venta: VentaExtra | null;
  pacientes: Lead[];
  services: Service[];
  products: Product[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const VentaExtraFormModal: React.FC<VentaExtraFormModalProps> = ({ isOpen, onClose, onSave, onDelete, venta, pacientes, services, products, requestConfirmation }) => {
  const [formData, setFormData] = useState<Partial<VentaExtra>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Lead | null>(null);
  const [saleType, setSaleType] = useState<'Servicio' | 'Productos' | ''>('');

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

  const categoryOptions = useMemo(() => {
    if (saleType === 'Servicio') return Object.keys(serviceCategoriesAndItems);
    if (saleType === 'Productos') return Object.keys(productCategoriesAndItems);
    return [];
  }, [saleType, serviceCategoriesAndItems, productCategoriesAndItems]);

  const itemOptions = useMemo(() => {
      if (!formData.categoria) return [];
      if (saleType === 'Servicio') return serviceCategoriesAndItems[formData.categoria] || [];
      if (saleType === 'Productos') return productCategoriesAndItems[formData.categoria] || [];
      return [];
  }, [formData.categoria, saleType, serviceCategoriesAndItems, productCategoriesAndItems]);


  useEffect(() => {
    if (isOpen) {
        if (venta) {
            const isService = services.some(s => s.categoria === venta.categoria);
            if (isService) {
                setSaleType('Servicio');
            } else {
                const isProduct = products.some(p => p.categoria === venta.categoria);
                setSaleType(isProduct ? 'Productos' : '');
            }
            
            const paciente = pacientes.find(p => p.id === venta.pacienteId);
            setFormData(venta);
            setSearchTerm(venta.nHistoria);
            setPacienteEncontrado(paciente || null);
        } else {
            setFormData({
                id: Date.now(),
                codigoVenta: '',
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
        alert("Por favor, ingrese un término de búsqueda (nombre, teléfono o N° de historia).");
        return;
    }
    const foundPatient = pacientes.find(p => 
        (p.nHistoria && p.nHistoria.toLowerCase() === term) ||
        (`${p.nombres} ${p.apellidos}`.toLowerCase().includes(term)) ||
        (p.numero && p.numero.includes(term))
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
        alert("Paciente no encontrado. Verifique los datos ingresados.");
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
      const newType = e.target.value as 'Servicio' | 'Productos' | '';
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
            const selectedItem = saleType === 'Servicio' 
                ? services.find(s => s.nombre === value)
                : products.find(p => p.nombre === value);
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
    onSave(formData as VentaExtra);
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
                        <label htmlFor="patientSearch" className="mb-1 text-sm font-medium text-gray-700">Buscar Paciente (N° Historia, Nombre o Telf.)</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                id="patientSearch"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-grow border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black"
                                disabled={!!pacienteEncontrado}
                                placeholder="Ingrese N° historia, nombre o teléfono"
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
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                    <div>
                        <label htmlFor="saleType" className="mb-1 text-sm font-medium text-gray-700">Tipo de Venta</label>
                        <select id="saleType" name="saleType" value={saleType} onChange={handleSaleTypeChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black">
                            <option value="">Seleccionar...</option>
                            <option value="Servicio">Servicio</option>
                            <option value="Productos">Productos</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="categoria" className="mb-1 text-sm font-medium text-gray-700">Categoría</label>
                        <select id="categoria" name="categoria" value={formData.categoria || ''} onChange={handleChange} disabled={!saleType} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black disabled:bg-gray-100">
                             <option value="">Seleccionar...</option>
                             {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="servicio" className="mb-1 text-sm font-medium text-gray-700">Servicio / Producto</label>
                        <select id="servicio" name="servicio" value={formData.servicio || ''} onChange={handleChange} disabled={!formData.categoria} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black disabled:bg-gray-100">
                             <option value="">Seleccionar...</option>
                             {itemOptions.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                     <div>
                        <label htmlFor="precio" className="mb-1 text-sm font-medium text-gray-700">Precio (S/)</label>
                        <input type="number" id="precio" name="precio" value={formData.precio || ''} readOnly className="w-full border-gray-300 bg-gray-100 rounded-md shadow-sm text-sm p-2 text-black"/>
                    </div>
                    <div>
                        <label htmlFor="montoPagado" className="mb-1 text-sm font-medium text-gray-700">Monto Pagado (S/)</label>
                        <input type="number" id="montoPagado" name="montoPagado" value={formData.montoPagado || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black"/>
                    </div>
                     <div>
                        <label htmlFor="deuda" className="mb-1 text-sm font-medium text-gray-700">Deuda (S/)</label>
                        <input type="number" id="deuda" name="deuda" value={formData.deuda || 0} readOnly className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 bg-gray-100 font-bold text-red-600"/>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                     <div>
                        <label htmlFor="metodoPago" className="mb-1 text-sm font-medium text-gray-700">Método de Pago</label>
                         <select id="metodoPago" name="metodoPago" value={formData.metodoPago || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black">
                             {Object.values(MetodoPago).map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                    </div>
                    <div>
                        <label htmlFor="fechaPagoDeuda" className="mb-1 text-sm font-medium text-gray-700">Fecha Límite Pago Deuda</label>
                        <input type="date" id="fechaPagoDeuda" name="fechaPagoDeuda" value={formData.fechaPagoDeuda || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black" style={{ colorScheme: 'light' }}/>
                    </div>
                     <div>
                        <label htmlFor="codigoVenta" className="mb-1 text-sm font-medium text-gray-700">Código de Venta</label>
                        <input type="text" id="codigoVenta" name="codigoVenta" value={formData.codigoVenta || ''} onChange={handleChange} required className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black"/>
                    </div>
                 </div>
            </fieldset>
        </form>
      </div>
    </Modal>
    </>
  );
};

export default VentaExtraFormModal;