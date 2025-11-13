import React, { useState, useEffect } from 'react';
import type { User, Role, JobPosition, DocumentType, Address, EmergencyContact } from '../../types.ts';
import Modal from '../shared/Modal.tsx';
import { TrashIcon, PlusIcon } from '../shared/Icons.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface MiembroEquipoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => Promise<void>;
    onDelete?: (userId: number) => void;
    user: User | null;
    roles: Role[];
    jobPositions: JobPosition[];
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const MiembroEquipoFormModal: React.FC<MiembroEquipoFormModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    onDelete, 
    user, 
    roles,
    jobPositions,
    requestConfirmation 
}) => {
    const [activeTab, setActiveTab] = useState<'personal' | 'laboral' | 'salarial' | 'emergencia'>('personal');
    const [formData, setFormData] = useState<Partial<User>>({
        addresses: [],
        emergencyContacts: []
    });

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({ 
                    ...user,
                    addresses: user.addresses || [],
                    emergencyContacts: user.emergencyContacts || []
                });
            } else {
                setFormData({
                    id: Date.now(),
                    nombres: '',
                    apellidos: '',
                    usuario: '',
                    password: '',
                    rolId: roles[0]?.id || 1,
                    avatarUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                    addresses: [],
                    emergencyContacts: [],
                    currency: 'Soles',
                    contractType: 'Indefinido',
                    workday: 'Tiempo Completo',
                    sex: 'M',
                    maritalStatus: 'Soltero(a)',
                    nationality: 'Peruana',
                    paymentMethod: 'Transferencia',
                    laborRegime: 'Privado',
                    accountType: 'Ahorros'
                });
            }
            setActiveTab('personal');
        }
    }, [user, isOpen, roles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    };

    // Address Management
    const handleAddAddress = () => {
        setFormData(prev => ({
            ...prev,
            addresses: [...(prev.addresses || []), { id: Date.now(), direccion: '', distrito: '', ciudad: '', referencia: '' }]
        }));
    };

    const handleAddressChange = (index: number, field: keyof Address, value: string) => {
        const newAddresses = [...(formData.addresses || [])];
        newAddresses[index] = { ...newAddresses[index], [field]: value };
        setFormData(prev => ({ ...prev, addresses: newAddresses }));
    };

    const handleRemoveAddress = (index: number) => {
        setFormData(prev => ({
            ...prev,
            addresses: prev.addresses?.filter((_, i) => i !== index)
        }));
    };

    // Emergency Contact Management
    const handleAddEmergencyContact = () => {
        setFormData(prev => ({
            ...prev,
            emergencyContacts: [...(prev.emergencyContacts || []), { id: Date.now(), nombre: '', parentesco: '', numero: '' }]
        }));
    };

    const handleEmergencyContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
        const newContacts = [...(formData.emergencyContacts || [])];
        newContacts[index] = { ...newContacts[index], [field]: value };
        setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
    };

    const handleRemoveEmergencyContact = (index: number) => {
        setFormData(prev => ({
            ...prev,
            emergencyContacts: prev.emergencyContacts?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        console.log('=== INICIO GUARDADO MIEMBRO ===');
        console.log('1. Datos del formulario:', formData);
        
        if (!formData.nombres || !formData.apellidos || !formData.usuario) {
            console.error('Validación fallida: Faltan campos requeridos');
            alert('Los campos Nombres, Apellidos y Usuario son requeridos.');
            return;
        }
        
        console.log('2. Validación exitosa, llamando a onSave...');
        try {
            await onSave(formData as User);
            console.log('3. onSave completado exitosamente');
            console.log('=== FIN GUARDADO MIEMBRO ===');
            // Don't close here - let parent handle it
        } catch (error) {
            console.error('Error al guardar miembro:', error);
            alert('Error al guardar el miembro. Por favor revisa la consola: ' + error);
        }
    };

    const handleDelete = () => {
        if (user && onDelete) {
            requestConfirmation(
                `¿Estás seguro de que quieres eliminar al miembro "${user.nombres} ${user.apellidos}"? Esta acción no se puede deshacer.`,
                () => {
                    onDelete(user.id);
                    onClose();
                }
            );
        }
    };

    const tabs = [
        { id: 'personal', label: 'Datos Personales', icon: 'person' },
        { id: 'laboral', label: 'Datos Laborales', icon: 'work' },
        { id: 'salarial', label: 'Datos Salariales', icon: 'payments' },
        { id: 'emergencia', label: 'Contactos de Emergencia', icon: 'emergency' }
    ] as const;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? 'Editar Miembro del Equipo' : 'Registrar Nuevo Miembro'}
            maxWidthClass="max-w-4xl"
            footer={
                <div className="w-full flex justify-between items-center">
                    {user && onDelete ? (
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
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] transition-colors">
                            Guardar
                        </button>
                    </div>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="p-6">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-[#aa632d] text-[#aa632d]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <GoogleIcon name={tab.icon} className="mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="max-h-[60vh] overflow-y-auto px-2">
                    {/* Personal Data Tab */}
                    {activeTab === 'personal' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">🧍‍♂️ Información Personal</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                                    <input
                                        type="text"
                                        name="nombres"
                                        value={formData.nombres || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                                    <input
                                        type="text"
                                        name="apellidos"
                                        value={formData.apellidos || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                                    <select
                                        name="documentType"
                                        value={formData.documentType || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="DNI">DNI</option>
                                        <option value="Carnet de Extranjería">Carnet de Extranjería</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento</label>
                                    <input
                                        type="text"
                                        name="documentNumber"
                                        value={formData.documentNumber || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                                    <input
                                        type="text"
                                        name="nationality"
                                        value={formData.nationality || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                                    <select
                                        name="sex"
                                        value={formData.sex || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                                    <select
                                        name="maritalStatus"
                                        value={formData.maritalStatus || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="Soltero(a)">Soltero(a)</option>
                                        <option value="Casado(a)">Casado(a)</option>
                                        <option value="Divorciado(a)">Divorciado(a)</option>
                                        <option value="Viudo(a)">Viudo(a)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / Celular</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico Personal</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-700">Direcciones</label>
                                    <button
                                        type="button"
                                        onClick={handleAddAddress}
                                        className="text-sm text-[#aa632d] hover:text-[#8e5225] flex items-center"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        Agregar Dirección
                                    </button>
                                </div>
                                {formData.addresses?.map((address, index) => (
                                    <div key={address.id} className="bg-gray-50 p-4 rounded-md mb-3 relative">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAddress(index)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
                                                <input
                                                    type="text"
                                                    value={address.direccion}
                                                    onChange={(e) => handleAddressChange(index, 'direccion', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Distrito</label>
                                                <input
                                                    type="text"
                                                    value={address.distrito}
                                                    onChange={(e) => handleAddressChange(index, 'distrito', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Ciudad</label>
                                                <input
                                                    type="text"
                                                    value={address.ciudad}
                                                    onChange={(e) => handleAddressChange(index, 'ciudad', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Referencia</label>
                                                <input
                                                    type="text"
                                                    value={address.referencia || ''}
                                                    onChange={(e) => handleAddressChange(index, 'referencia', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Foto</label>
                                <input
                                    type="text"
                                    name="avatarUrl"
                                    value={formData.avatarUrl || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    placeholder="https://ejemplo.com/foto.jpg"
                                />
                            </div>
                        </div>
                    )}

                    {/* Labor Data Tab */}
                    {activeTab === 'laboral' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">🏢 Datos Laborales</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (para login) *</label>
                                    <input
                                        type="text"
                                        name="usuario"
                                        value={formData.usuario || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                {!user && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password || ''}
                                            onChange={handleChange}
                                            required={!user}
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Puesto</label>
                                    <select
                                        name="position"
                                        value={formData.position || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="">Seleccionar puesto...</option>
                                        {jobPositions.map(position => (
                                            <option key={position.id} value={position.nombre}>{position.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol / Departamento *</label>
                                    <select
                                        name="rolId"
                                        value={formData.rolId || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="">Seleccionar rol...</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
                                    <select
                                        name="contractType"
                                        value={formData.contractType || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="Indefinido">Indefinido</option>
                                        <option value="Plazo Fijo">Plazo Fijo</option>
                                        <option value="Locación de Servicios">Locación de Servicios</option>
                                        <option value="Prácticas">Prácticas</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin (si aplica)</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jornada Laboral</label>
                                    <select
                                        name="workday"
                                        value={formData.workday || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="Tiempo Completo">Tiempo Completo</option>
                                        <option value="Tiempo Parcial">Tiempo Parcial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Horario de Trabajo</label>
                                    <input
                                        type="text"
                                        name="workSchedule"
                                        value={formData.workSchedule || ''}
                                        onChange={handleChange}
                                        placeholder="Ej: 9:00 AM - 6:00 PM"
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jefe Directo</label>
                                    <input
                                        type="text"
                                        name="directBoss"
                                        value={formData.directBoss || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Trabajo</label>
                                    <input
                                        type="text"
                                        name="workCenter"
                                        value={formData.workCenter || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código de Empleado</label>
                                    <input
                                        type="text"
                                        name="employeeCode"
                                        value={formData.employeeCode || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Salary Data Tab */}
                    {activeTab === 'salarial' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Datos Salariales y de Pago</h3>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sueldo Base</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="salary"
                                        value={formData.salary || ''}
                                        onChange={handleNumberChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bonificaciones</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="bonuses"
                                        value={formData.bonuses || ''}
                                        onChange={handleNumberChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                                    <select
                                        name="currency"
                                        value={formData.currency || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="Soles">Soles</option>
                                        <option value="Dólares">Dólares</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuenta</label>
                                    <select
                                        name="accountType"
                                        value={formData.accountType || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="Ahorros">Ahorros</option>
                                        <option value="Corriente">Corriente</option>
                                        <option value="CCI">CCI</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Cuenta</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad de Pago</label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Régimen Laboral</label>
                                    <select
                                        name="laborRegime"
                                        value={formData.laborRegime || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="Privado">Privado</option>
                                        <option value="Público">Público</option>
                                        <option value="Microempresa">Microempresa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de AFP/ONP</label>
                                    <input
                                        type="text"
                                        name="afpType"
                                        value={formData.afpType || ''}
                                        onChange={handleChange}
                                        placeholder="Ej: Prima, Integra, ONP"
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">% de Aporte AFP</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="afpPercentage"
                                        value={formData.afpPercentage || ''}
                                        onChange={handleNumberChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código AFP</label>
                                    <input
                                        type="text"
                                        name="afpCode"
                                        value={formData.afpCode || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">EPS / Seguro de Salud</label>
                                    <input
                                        type="text"
                                        name="healthInsurance"
                                        value={formData.healthInsurance || ''}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Emergency Contacts Tab */}
                    {activeTab === 'emergencia' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">⚠️ Contactos de Emergencia</h3>
                                <button
                                    type="button"
                                    onClick={handleAddEmergencyContact}
                                    className="flex items-center text-sm bg-[#aa632d] text-white px-3 py-2 rounded-md hover:bg-[#8e5225]"
                                >
                                    <PlusIcon className="w-4 h-4 mr-1" />
                                    Agregar Contacto
                                </button>
                            </div>
                            
                            {formData.emergencyContacts && formData.emergencyContacts.length > 0 ? (
                                formData.emergencyContacts.map((contact, index) => (
                                    <div key={contact.id} className="bg-gray-50 p-4 rounded-md relative">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEmergencyContact(index)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre Completo</label>
                                                <input
                                                    type="text"
                                                    value={contact.nombre}
                                                    onChange={(e) => handleEmergencyContactChange(index, 'nombre', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Parentesco</label>
                                                <input
                                                    type="text"
                                                    value={contact.parentesco}
                                                    onChange={(e) => handleEmergencyContactChange(index, 'parentesco', e.target.value)}
                                                    placeholder="Ej: Madre, Hermano, Esposo"
                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                                                <input
                                                    type="text"
                                                    value={contact.numero}
                                                    onChange={(e) => handleEmergencyContactChange(index, 'numero', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-8">
                                    No hay contactos de emergencia registrados.
                                    <br />
                                    Haz clic en "Agregar Contacto" para añadir uno.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default MiembroEquipoFormModal;
