import React, { useState, useEffect } from 'react';
import type { Membership, MembershipService, Service } from '../../types.ts';
import Modal from '../shared/Modal.tsx';
import { TrashIcon, PlusIcon } from '../shared/Icons.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface MembershipFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (membership: Membership) => void;
    membership: Membership | null;
    services: Service[];
}

const MembershipFormModal: React.FC<MembershipFormModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    membership, 
    services 
}) => {
    const [formData, setFormData] = useState<Partial<Membership>>({
        nombre: '',
        descripcion: '',
        servicios: []
    });

    useEffect(() => {
        if (membership) {
            setFormData(membership);
        } else {
            setFormData({
                nombre: '',
                descripcion: '',
                servicios: []
            });
        }
    }, [membership]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddService = () => {
        const newService: MembershipService = {
            id: Date.now(),
            membershipId: formData.id || 0,
            servicioNombre: '',
            precio: 0,
            numeroSesiones: 1
        };
        setFormData(prev => ({
            ...prev,
            servicios: [...(prev.servicios || []), newService]
        }));
    };

    const handleServiceChange = (index: number, field: keyof MembershipService, value: any) => {
        const newServices = [...(formData.servicios || [])];
        newServices[index] = { ...newServices[index], [field]: value };
        setFormData(prev => ({ ...prev, servicios: newServices }));
    };

    const handleRemoveService = (index: number) => {
        setFormData(prev => ({
            ...prev,
            servicios: prev.servicios?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nombre || !formData.descripcion) {
            alert('Los campos Nombre y Descripción son obligatorios.');
            return;
        }

        if (!formData.servicios || formData.servicios.length === 0) {
            alert('Debe agregar al menos un servicio a la membresía.');
            return;
        }

        // Validar que todos los servicios tengan datos completos
        for (let i = 0; i < formData.servicios.length; i++) {
            const servicio = formData.servicios[i];
            if (!servicio.servicioNombre) {
                alert(`El servicio ${i + 1} debe tener un nombre seleccionado.`);
                return;
            }
            if (servicio.precio === null || servicio.precio === undefined) {
                alert(`El servicio ${i + 1} debe tener un precio.`);
                return;
            }
            if (!servicio.numeroSesiones || servicio.numeroSesiones < 1) {
                alert(`El servicio ${i + 1} debe tener al menos 1 sesión.`);
                return;
            }
        }

        // Calcular el precio total de la membresía
        const precioTotal = formData.servicios.reduce((sum, s) => sum + (s.precio || 0), 0);

        onSave({ ...formData, precioTotal } as Membership);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={membership ? 'Editar Membresía' : 'Añadir Membresía'}
            maxWidthClass="max-w-3xl"
            footer={
                <div className="space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] transition-colors">
                        Guardar
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Información básica */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la Membresía <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre || ''}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            placeholder="Ej: Membresía Premium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion || ''}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            placeholder="Describe los beneficios y características de esta membresía"
                        />
                    </div>
                </div>

                {/* Servicios incluidos */}
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-md font-bold text-gray-800">
                            Servicios Incluidos <span className="text-red-500">*</span>
                        </h3>
                        <button
                            type="button"
                            onClick={handleAddService}
                            className="flex items-center text-sm bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
                        >
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Agregar Servicio
                        </button>
                    </div>

                    {formData.servicios && formData.servicios.length > 0 ? (
                        <div className="space-y-3">
                            {formData.servicios.map((servicio, index) => (
                                <div key={servicio.id} className="bg-gray-50 p-4 rounded-md relative border border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveService(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                    
                                    <div className="grid grid-cols-3 gap-3 pr-8">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Servicio <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={servicio.servicioNombre}
                                                onChange={(e) => handleServiceChange(index, 'servicioNombre', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                required
                                            >
                                                <option value="">Seleccionar servicio...</option>
                                                {services.map((s) => (
                                                    <option key={s.id} value={s.nombre}>{s.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Precio <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={servicio.precio}
                                                onChange={(e) => handleServiceChange(index, 'precio', Number(e.target.value))}
                                                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                N° Sesiones <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={servicio.numeroSesiones}
                                                onChange={(e) => handleServiceChange(index, 'numeroSesiones', Number(e.target.value))}
                                                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                placeholder="1"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-md">
                            No hay servicios agregados.
                            <br />
                            Haz clic en "Agregar Servicio" para añadir uno.
                        </p>
                    )}
                </div>

                {/* Resumen de precio total */}
                {formData.servicios && formData.servicios.length > 0 && (
                    <div className="border-t pt-4">
                        <div className="bg-blue-50 p-4 rounded-md">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Precio Total de la Membresía:</span>
                                <span className="text-lg font-bold text-blue-700">
                                    S/ {formData.servicios.reduce((sum, s) => sum + (s.precio || 0), 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {formData.servicios.reduce((sum, s) => sum + (s.numeroSesiones || 0), 0)} sesiones en total
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default MembershipFormModal;
