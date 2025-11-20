import React, { useState, useEffect, useRef } from 'react';
import type { User, Role, Address, EmergencyContact, JobPosition } from '../../types.ts';
import { DocumentType } from '../../types.ts';
import Modal from '../shared/Modal.tsx';
import { TrashIcon, PlusIcon, EyeIcon, EyeSlashIcon } from '../shared/Icons.tsx';
import { formatDateForInput } from '../../utils/time';

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  onDelete: (userId: number) => void;
  user: User | null;
  roles: Role[];
  jobPositions: JobPosition[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const UsuarioFormModal: React.FC<UsuarioFormModalProps> = ({ isOpen, onClose, onSave, onDelete, user, roles, jobPositions, requestConfirmation }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(user
          ? { 
              ...user, 
              password: '', 
              addresses: user.addresses || [], 
              emergencyContacts: user.emergencyContacts || [],
              // Convertir fechas ISO a formato YYYY-MM-DD para inputs tipo date
              birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
              startDate: user.startDate ? user.startDate.split('T')[0] : '',
              endDate: user.endDate ? user.endDate.split('T')[0] : '',
            }
          : {
              id: Date.now(),
              rolId: roles[0]?.id,
              avatarUrl: `https://picsum.photos/seed/${Date.now()}/40/40`,
              addresses: [],
              emergencyContacts: [],
          });
      setActiveTab('personal');
      setShowPassword(false);
    }
  }, [user, roles, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // FIX: Ensure rolId is stored as a number to match the type definition.
    setFormData(prev => ({ ...prev, [name]: name === 'rolId' ? Number(value) : value }));
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const base64Avatar = await toBase64(file);
        setFormData(prev => ({ ...prev, avatarUrl: base64Avatar }));
    }
  };

  const handleSubformChange = (listName: 'addresses' | 'emergencyContacts', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const list = [...(prev[listName] || [])];
        list[index] = { ...list[index], [name]: value };
        return { ...prev, [listName]: list };
    });
  };

  const handleAddSubformItem = (listName: 'addresses' | 'emergencyContacts') => {
    const newItem: Address | EmergencyContact = listName === 'addresses'
        ? { id: Date.now(), direccion: '', distrito: '', ciudad: '', referencia: '' }
        : { id: Date.now(), nombre: '', parentesco: '', numero: '' };
    
    setFormData(prev => {
        const list = [...(prev[listName] || [])];
        list.push(newItem as any); // Cast to any to bypass TS type checking for push operation
        return { ...prev, [listName]: list };
    });
  };

  const handleRemoveSubformItem = (listName: 'addresses' | 'emergencyContacts', id: number) => {
    setFormData(prev => {
        const list = (prev[listName] || []).filter(item => item.id !== id);
        return { ...prev, [listName]: list };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres || !formData.apellidos || !formData.usuario || !formData.rolId) {
      alert('Nombres, Apellidos, Usuario y Rol son campos requeridos.');
      return;
    }
    
    // For new user, password is required
    if (!user && (!formData.password || formData.password.trim() === '')) {
        alert('La contraseña es requerida para nuevos usuarios.');
        return;
    }

    const dataToSave = { ...formData };
    // If editing and password is empty, don't update password by removing the key
    if (user && (!dataToSave.password || dataToSave.password.trim() === '')) {
        delete dataToSave.password;
    }

    onSave(dataToSave as User);
    onClose();
  };

  const handleDelete = () => {
    if (user) {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar a ${user.nombres} ${user.apellidos}?`,
            () => {
                onDelete(user.id);
                onClose();
            }
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Editar Miembro del Equipo' : 'Añadir Nuevo Miembro'}
      maxWidthClass="max-w-4xl"
      footer={
        <div className="w-full flex justify-between items-center">
          {user ? (
             <button
                type="button"
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                <GoogleIcon name="delete" className="mr-2 h-5 w-5" />
                Eliminar
            </button>
          ) : <div />}
          <div className="space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" form="user-form" className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]">Guardar Cambios</button>
          </div>
        </div>
      }
    >
        <div className="flex border-b">
            <button onClick={() => setActiveTab('personal')} className={`px-4 py-2 text-sm ${activeTab === 'personal' ? 'border-b-2 border-[#aa632d] text-[#aa632d]' : 'text-gray-500'}`}>Datos Personales y Laborales</button>
            <button onClick={() => setActiveTab('direcciones')} className={`px-4 py-2 text-sm ${activeTab === 'direcciones' ? 'border-b-2 border-[#aa632d] text-[#aa632d]' : 'text-gray-500'}`}>Direcciones</button>
            <button onClick={() => setActiveTab('emergencia')} className={`px-4 py-2 text-sm ${activeTab === 'emergencia' ? 'border-b-2 border-[#aa632d] text-[#aa632d]' : 'text-gray-500'}`}>Contactos de Emergencia</button>
        </div>
        <form id="user-form" onSubmit={handleSubmit} className="p-6">
            {activeTab === 'personal' && (
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Foto de Perfil</label>
                            
                            <div className="mt-1 flex items-center space-x-4">
                                <img src={formData.avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover bg-gray-100"/>
                                <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden"/>
                                <button type="button" onClick={() => avatarInputRef.current?.click()} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Cambiar foto</button>
                            </div>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                                <input type="text" name="nombres" value={formData.nombres || ''} onChange={handleChange} required className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                                <input type="text" name="apellidos" value={formData.apellidos || ''} onChange={handleChange} required className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                            <select name="documentType" value={formData.documentType || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2">
                                {Object.values(DocumentType).map(dt => <option key={dt} value={dt}>{dt}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">N° de Documento</label>
                            <input type="text" name="documentNumber" value={formData.documentNumber || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">N° de Teléfono</label>
                            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                            <input type="date" name="birthDate" value={formatDateForInput(formData.birthDate instanceof Date && !isNaN(formData.birthDate.getTime()) ? formData.birthDate : new Date())} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                            <input type="text" name="nationality" value={formData.nationality || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                    </div>
                    <hr className="my-6"/>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                            <input type="text" name="usuario" value={formData.usuario || ''} onChange={handleChange} required className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                    required={!user}
                                    className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 pr-10"
                                    placeholder={user ? "Dejar en blanco para no cambiar" : "Contraseña"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                            <select name="rolId" value={formData.rolId || ''} onChange={handleChange} required className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2">
                                {roles.map(role => <option key={role.id} value={role.id}>{role.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Puesto de Trabajo</label>
                            <select name="position" value={formData.position || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2">
                                <option value="">Seleccionar puesto...</option>
                                {jobPositions.map(pos => <option key={pos.id} value={pos.nombre}>{pos.nombre}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio Laboral</label>
                            <input type="date" name="startDate" value={formatDateForInput(formData.startDate instanceof Date && !isNaN(formData.startDate.getTime()) ? formData.startDate : new Date())} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                            <input type="date" name="endDate" value={formatDateForInput(formData.endDate instanceof Date && !isNaN(formData.endDate.getTime()) ? formData.endDate : new Date())} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jefe Directo</label>
                            <input type="text" name="directBoss" value={formData.directBoss || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                            <input type="text" name="bankName" value={formData.bankName || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de AFP/ONP</label>
                            <select name="afpType" value={formData.afpType || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2">
                                <option value="">Seleccionar...</option>
                                <option value="AFP">AFP</option>
                                <option value="ONP">ONP</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">% de Aporte AFP</label>
                            <input type="number" name="afpPercentage" value={formData.afpPercentage || ''} onChange={handleChange} step="0.01" min="0" max="100" className="w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"/>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'direcciones' && (
                <div className="space-y-4">
                    {formData.addresses?.map((address, index) => (
                        <div key={address.id} className="border p-4 rounded-md relative space-y-2 bg-gray-50">
                             <button type="button" onClick={() => handleRemoveSubformItem('addresses', address.id)} className="absolute top-2 right-2 text-red-500"><GoogleIcon name="delete" className="text-lg" /></button>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div><label className="text-xs">Dirección</label><input name="direccion" value={address.direccion} onChange={(e) => handleSubformChange('addresses', index, e)} className="w-full p-1 border-black bg-[#f9f9fa] text-black rounded"/></div>
                                <div><label className="text-xs">Distrito</label><input name="distrito" value={address.distrito} onChange={(e) => handleSubformChange('addresses', index, e)} className="w-full p-1 border-black bg-[#f9f9fa] text-black rounded"/></div>
                                <div><label className="text-xs">Ciudad</label><input name="ciudad" value={address.ciudad} onChange={(e) => handleSubformChange('addresses', index, e)} className="w-full p-1 border-black bg-[#f9f9fa] text-black rounded"/></div>
                            </div>
                            <div><label className="text-xs">Referencia</label><input name="referencia" value={address.referencia || ''} onChange={(e) => handleSubformChange('addresses', index, e)} className="w-full p-1 border-black bg-[#f9f9fa] text-black rounded"/></div>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddSubformItem('addresses')} className="flex items-center text-sm text-[#aa632d]"><PlusIcon className="mr-1"/> Añadir Dirección</button>
                </div>
            )}
            {activeTab === 'emergencia' && (
                 <div className="space-y-4">
                    {formData.emergencyContacts?.map((contact, index) => (
                        <div key={contact.id} className="border p-4 rounded-md relative space-y-2 bg-gray-50">
                             <button type="button" onClick={() => handleRemoveSubformItem('emergencyContacts', contact.id)} className="absolute top-2 right-2 text-red-500"><GoogleIcon name="delete" className="text-lg" /></button>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div><label className="text-xs">Nombre Completo</label><input name="nombre" value={contact.nombre} onChange={(e) => handleSubformChange('emergencyContacts', index, e)} className="w-full p-1 border-black bg-[#f9f9fa] text-black rounded"/></div>
                                <div><label className="text-xs">Parentesco</label><input name="parentesco" value={contact.parentesco} onChange={(e) => handleSubformChange('emergencyContacts', index, e)} className="w-full p-1 border-black bg-[#f9f9fa] text-black rounded"/></div>
                                <div><label className="text-xs">Número</label><input name="numero" value={contact.numero} onChange={(e) => handleSubformChange('emergencyContacts', index, e)} className="w-full p-1 border-black bg-[#f9f9fa] text-black rounded"/></div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddSubformItem('emergencyContacts')} className="flex items-center text-sm text-[#aa632d]"><PlusIcon className="mr-1"/> Añadir Contacto</button>
                </div>
            )}
        </form>
    </Modal>
  );
};

export default UsuarioFormModal;