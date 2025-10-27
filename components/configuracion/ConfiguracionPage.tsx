import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import type { User, Role, BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory, JobPosition, ProductCategory, Proveedor, EgresoCategory, TipoProveedor, Goal, ComprobanteElectronico } from '../../types';
import { PlusIcon, TrashIcon } from '../shared/Icons';
import UsuarioFormModal from './UsuarioFormModal';
import RolFormModal from './RolFormModal';
import Modal from '../shared/Modal';
import ImportExportPage from './ImportExportPage';
import ProveedorFormModal from '../finanzas/ProveedorFormModal';
import MetasPage from './MetasPage';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface ConfiguracionPageProps {
    users: User[];
    roles: Role[];
    businessInfo: BusinessInfo;
    goals: Goal[];
    clientSources: ClientSource[];
    services: Service[];
    products: Product[];
    memberships: Membership[];
    serviceCategories: ServiceCategory[];
    productCategories: ProductCategory[];
    jobPositions: JobPosition[];
    proveedores: Proveedor[];
    tiposProveedor: TipoProveedor[];
    egresoCategories: EgresoCategory[];
    onSaveUser: (user: User) => void;
    onDeleteUser: (userId: number) => void;
    onSaveRole: (role: Role) => void;
    onDeleteRole: (roleId: number) => void;
    onSaveBusinessInfo: (info: BusinessInfo) => void;
    onSaveGoal: (goal: Goal) => void;
    onDeleteGoal: (goalId: number) => void;
    onSaveClientSource: (source: ClientSource) => void;
    onDeleteClientSource: (id: number) => void;
    onSaveService: (service: Service) => void;
    onDeleteService: (id: number) => void;
    onSaveProduct: (product: Product) => void;
    onDeleteProduct: (id: number) => void;
    onSaveMembership: (membership: Membership) => void;
    onDeleteMembership: (id: number) => void;
    onSaveServiceCategory: (category: ServiceCategory) => void;
    onDeleteServiceCategory: (id: number) => void;
    onSaveProductCategory: (category: ProductCategory) => void;
    onDeleteProductCategory: (id: number) => void;
    onSaveJobPosition: (position: JobPosition) => void;
    onDeleteJobPosition: (id: number) => void;
    onSaveProveedor: (proveedor: Proveedor) => void;
    onDeleteProveedor: (proveedorId: number) => void;
    onSaveTipoProveedor: (tipo: TipoProveedor) => void;
    onDeleteTipoProveedor: (id: number) => void;
    onSaveEgresoCategory: (category: EgresoCategory) => void;
    onDeleteEgresoCategory: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
    comprobantes: ComprobanteElectronico[];
}

const SETTINGS_SECTIONS = [
    { id: 'equipo', label: 'Gestión del Equipo', icon: 'groups' },
    { id: 'miembros', label: 'Miembros del equipo', parent: 'equipo' },
    { id: 'roles', label: 'Roles y Permisos', parent: 'equipo' },
    { id: 'puestos', label: 'Puestos de Trabajo', parent: 'equipo' },
    { id: 'negocio', label: 'Configuración del Negocio', icon: 'store' },
    { id: 'datos', label: 'Datos del negocio', parent: 'negocio' },
    { id: 'proveedores', label: 'Proveedores', parent: 'negocio' },
    { id: 'tipos-proveedor', label: 'Tipos de Proveedor', parent: 'negocio' },
    { id: 'origenes', label: 'Origen de Clientes', parent: 'negocio' },
    { id: 'categorias-egresos', label: 'Categorías de Egresos', parent: 'negocio' },
    { id: 'servicios-productos', label: 'Servicios y Productos', icon: 'inventory_2' },
    { id: 'categorias', label: 'Categorías de Servicios', parent: 'servicios-productos' },
    { id: 'product-categorias', label: 'Categorías de Productos', parent: 'servicios-productos' },
    { id: 'servicios', label: 'Servicios', parent: 'servicios-productos' },
    { id: 'productos', label: 'Productos', parent: 'servicios-productos' },
    { id: 'membresias', label: 'Membresías', parent: 'servicios-productos' },
    { id: 'metas', label: 'Metas y Objetivos', icon: 'flag' },
    { id: 'importar-exportar', label: 'Importar / Exportar', icon: 'import_export' }
];

const SimpleListManager: FC<{
    title: string;
    items: { id: number; nombre: string }[];
    onSave: (item: { id: number; nombre: string }) => void;
    onDelete: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ title, items, onSave, onDelete, requestConfirmation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{ id: number; nombre: string } | null>(null);

    const handleOpenAdd = () => {
        setEditingItem({ id: Date.now(), nombre: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: { id: number; nombre: string }) => {
        setEditingItem({ ...item });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = () => {
        if (editingItem && editingItem.nombre.trim()) {
            onSave(editingItem);
        }
        handleCloseModal();
    };

    const handleDelete = (item: { id: number; nombre: string }) => {
         requestConfirmation(`¿Estás seguro de que quieres eliminar "${item.nombre}"?`, () => onDelete(item.id));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">{title}</h2>
                <button onClick={handleOpenAdd} className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225]"><PlusIcon className="mr-2"/>Añadir</button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <table className="w-full text-sm">
                    <thead className="text-left text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="p-2">Nombre</th>
                            <th className="p-2 w-28">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="p-2 text-black">{item.nombre}</td>
                                <td className="p-2">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleOpenEdit(item)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                                            <GoogleIcon name="edit" className="text-lg" />
                                        </button>
                                        <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar">
                                            <GoogleIcon name="delete" className="text-lg" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && editingItem && (
                 <Modal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    title={items.some(i => i.id === editingItem.id) ? `Editar ${title.slice(0,-1)}` : `Añadir ${title.slice(0,-1)}`}
                    maxWidthClass="max-w-md"
                    footer={
                        <div className="space-x-2">
                            <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]">Guardar</button>
                        </div>
                    }
                >
                    <div className="p-6">
                        <label className="text-sm font-medium text-black">Nombre</label>
                        <input
                            type="text"
                            value={editingItem.nombre}
                            onChange={(e) => setEditingItem({ ...editingItem, nombre: e.target.value })}
                            className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mt-1 text-black"
                        />
                    </div>
                 </Modal>
            )}
        </div>
    );
};

const CatalogManager: FC<{
    title: string;
    items: any[];
    onSave: (item: any) => void;
    onDelete: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
    fields: { name: keyof any, label: string, type: string, required?: boolean }[];
    itemCategories?: { id: number, nombre: string }[];
    categoryField?: string;
}> = ({ title, items, onSave, onDelete, requestConfirmation, fields, itemCategories, categoryField = 'categoria' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const handleAdd = () => {
        const initialItem = fields.reduce((acc, field) => {
            acc[field.name] = field.type === 'number' ? 0 : '';
            return acc;
        }, { id: Date.now() } as any);
        setEditingItem(initialItem);
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = (item: any) => {
        onSave(item);
        setIsModalOpen(false);
    };
    
    const handleDelete = (item: any) => {
        requestConfirmation(`¿Estás seguro de que quieres eliminar "${item.nombre}"?`, () => onDelete(item.id));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">{title}</h2>
                <button onClick={handleAdd} className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"><PlusIcon className="mr-2"/>Añadir</button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <table className="w-full text-sm">
                    <thead className="text-left text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {fields.map(f => <th key={String(f.name)} className="p-2">{f.label}</th>)}
                            <th className="p-2 w-28">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-b">
                                {fields.map(f => <td key={`${item.id}-${String(f.name)}`} className="p-2 text-black">{item[f.name]}</td>)}
                                <td>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar"><GoogleIcon name="edit" className="text-lg" /></button>
                                        <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar"><GoogleIcon name="delete" className="text-lg" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <CatalogFormModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    item={editingItem}
                    title={editingItem?.id && items.find(i => i.id === editingItem.id) ? `Editar ${title}` : `Añadir ${title}`}
                    fields={fields}
                    itemCategories={itemCategories}
                    categoryField={categoryField}
                />
            )}
        </div>
    );
};

const CatalogFormModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: any) => void;
    item: any | null;
    title: string;
    fields: { name: keyof any, label: string, type: string, required?: boolean }[];
    itemCategories?: { id: number, nombre: string }[];
    categoryField?: string;
}> = ({ isOpen, onClose, onSave, item, title, fields, itemCategories, categoryField }) => {
    const [formData, setFormData] = useState<any>(item || {});
    // FIX: Add explicit return for the ReactNode to fix type error.
    return (
        <Modal 
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidthClass="max-w-md"
            footer={
                <div className="space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={() => onSave(formData)} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]">Guardar</button>
                </div>
            }
        >
            <div className="p-6 space-y-4">
                {fields.map(field => (
                    <div key={String(field.name)}>
                        <label htmlFor={String(field.name)} className="block text-sm font-medium text-gray-700">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.name === categoryField && itemCategories ? (
                             <select
                                id={String(field.name)}
                                name={String(field.name)}
                                value={formData[field.name] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                required={field.required}
                                className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"
                            >
                                <option value="">Seleccionar...</option>
                                {itemCategories.map(cat => (
                                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                id={String(field.name)}
                                name={String(field.name)}
                                value={formData[field.name] ?? ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                                required={field.required}
                                className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"
                            />
                        )}
                    </div>
                ))}
            </div>
        </Modal>
    );
};


const BusinessInfoSection: FC<{
    businessInfo: BusinessInfo;
    onSaveBusinessInfo: (info: BusinessInfo) => void;
}> = ({ businessInfo, onSaveBusinessInfo }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<BusinessInfo>(businessInfo);

    useEffect(() => {
        setFormData(businessInfo);
    }, [businessInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSaveBusinessInfo(formData);
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-bold text-black mb-4">Datos del Negocio</h2>
            <div className="space-y-4">
                {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">RUC</label>
                            <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md p-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Dirección</label>
                            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md p-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">URL del Logo</label>
                            <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md p-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">URL Imagen de Login</label>
                            <input type="text" name="loginImageUrl" value={formData.loginImageUrl || ''} onChange={handleChange} className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md p-2" />
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]">Guardar</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm"><span className="font-medium text-gray-700">Nombre:</span> <span className="text-gray-900">{businessInfo.nombre}</span></p>
                        <p className="text-sm"><span className="font-medium text-gray-700">RUC:</span> <span className="text-gray-900">{businessInfo.ruc}</span></p>
                        <p className="text-sm"><span className="font-medium text-gray-700">Dirección:</span> <span className="text-gray-900">{businessInfo.direccion}</span></p>
                        <p className="text-sm"><span className="font-medium text-gray-700">Teléfono:</span> <span className="text-gray-900">{businessInfo.telefono}</span></p>
                        <p className="text-sm"><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{businessInfo.email}</span></p>
                        {businessInfo.logoUrl && (
                            <div className="pt-2">
                                <p className="font-medium text-gray-700 text-sm mb-1">Logo actual:</p>
                                <img src={businessInfo.logoUrl} alt="Logo del Negocio" className="h-16 object-contain" />
                            </div>
                        )}
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Editar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const UsersManager: FC<{
    users: User[];
    roles: Role[];
    jobPositions: JobPosition[];
    onSaveUser: (user: User) => void;
    onDeleteUser: (userId: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ users, roles, jobPositions, onSaveUser, onDeleteUser, requestConfirmation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Miembros del equipo</h2>
                <button onClick={handleAddUser} className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225]"><PlusIcon className="mr-2"/>Añadir Miembro</button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <table className="w-full text-sm">
                    <thead className="text-left text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="p-2">Usuario</th>
                            <th className="p-2">Nombre Completo</th>
                            <th className="p-2">Rol</th>
                            <th className="p-2">Puesto</th>
                            <th className="p-2 w-28">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const userRole = roles.find(role => role.id === user.rolId);
                            return (
                                <tr key={user.id} className="border-b">
                                    <td className="p-2 text-black">{user.usuario}</td>
                                    <td className="p-2 text-black">{user.nombres} {user.apellidos}</td>
                                    <td className="p-2 text-gray-600">{userRole?.nombre || 'N/A'}</td>
                                    <td className="p-2 text-gray-600">{user.position || 'N/A'}</td>
                                    <td className="p-2">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                                                <GoogleIcon name="edit" className="text-lg" />
                                            </button>
                                            <button onClick={() => requestConfirmation(`¿Estás seguro de que quieres eliminar a ${user.nombres} ${user.apellidos}?`, () => onDeleteUser(user.id))} className="text-red-600 hover:text-red-800 p-1" title="Eliminar">
                                                <GoogleIcon name="delete" className="text-lg" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <UsuarioFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={onSaveUser}
                onDelete={onDeleteUser}
                user={editingUser}
                roles={roles}
                jobPositions={jobPositions}
                requestConfirmation={requestConfirmation}
            />
        </div>
    );
};

const RolesManager: FC<{
    roles: Role[];
    onSaveRole: (role: Role) => void;
    onDeleteRole: (roleId: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ roles, onSaveRole, onDeleteRole, requestConfirmation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const handleAddRole = () => {
        setEditingRole(null);
        setIsModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingRole(null);
        setIsModalOpen(false);
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Roles y Permisos</h2>
                <button onClick={handleAddRole} className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225]"><PlusIcon className="mr-2"/>Añadir Rol</button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <table className="w-full text-sm">
                    <thead className="text-left text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="p-2">Nombre del Rol</th>
                            <th className="p-2">Páginas con Acceso</th>
                            <th className="p-2 w-28">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(role => (
                            <tr key={role.id} className="border-b">
                                <td className="p-2 text-black font-medium">{role.nombre}</td>
                                <td className="p-2 text-gray-600">{role.permissions.length} páginas</td>
                                <td className="p-2">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEditRole(role)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                                            <GoogleIcon name="edit" className="text-lg" />
                                        </button>
                                        <button onClick={() => requestConfirmation(`¿Estás seguro de que quieres eliminar el rol "${role.nombre}"?`, () => onDeleteRole(role.id))} className="text-red-600 hover:text-red-800 p-1" title="Eliminar">
                                            <GoogleIcon name="delete" className="text-lg" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <RolFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={onSaveRole}
                role={editingRole}
            />
        </div>
    );
};

const ProveedoresManager: FC<{
    proveedores: Proveedor[];
    tiposProveedor: TipoProveedor[];
    onSaveProveedor: (proveedor: Proveedor) => void;
    onDeleteProveedor: (proveedorId: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ proveedores, tiposProveedor, onSaveProveedor, onDeleteProveedor, requestConfirmation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

    const handleAddProveedor = () => {
        setEditingProveedor(null);
        setIsModalOpen(true);
    };

    const handleEditProveedor = (proveedor: Proveedor) => {
        setEditingProveedor(proveedor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProveedor(null);
        setIsModalOpen(false);
    };

    const handleDeleteProveedorWithConfirmation = (proveedor: Proveedor) => {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar al proveedor "${proveedor.razonSocial}"?`,
            () => onDeleteProveedor(proveedor.id)
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Proveedores</h2>
                <button onClick={handleAddProveedor} className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225]"><PlusIcon className="mr-2"/>Añadir Proveedor</button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <table className="w-full text-sm">
                    <thead className="text-left text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="p-2">Razón Social</th>
                            <th className="p-2">RUC</th>
                            <th className="p-2">Tipo</th>
                            <th className="p-2">Contacto</th>
                            <th className="p-2 w-28">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proveedores.map(prov => (
                            <tr key={prov.id} className="border-b">
                                <td className="p-2 text-black font-medium">{prov.razonSocial}</td>
                                <td className="p-2 text-gray-600">{prov.ruc}</td>
                                <td className="p-2 text-gray-600">{prov.tipo}</td>
                                <td className="p-2 text-gray-600">{prov.numeroContacto}</td>
                                <td className="p-2">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEditProveedor(prov)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                                            <GoogleIcon name="edit" className="text-lg" />
                                        </button>
                                        <button onClick={() => handleDeleteProveedorWithConfirmation(prov)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar">
                                            <GoogleIcon name="delete" className="text-lg" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ProveedorFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={onSaveProveedor}
                onDelete={onDeleteProveedor}
                proveedor={editingProveedor}
                tiposProveedor={tiposProveedor}
            />
        </div>
    );
};


export const ConfiguracionPage: React.FC<ConfiguracionPageProps> = ({
    users, roles, businessInfo, goals, clientSources, services, products, memberships,
    serviceCategories, productCategories, jobPositions, proveedores, tiposProveedor, egresoCategories,
    onSaveUser, onDeleteUser, onSaveRole, onDeleteRole, onSaveBusinessInfo, onSaveGoal, onDeleteGoal,
    onSaveClientSource, onDeleteClientSource, onSaveService, onDeleteService, onSaveProduct, onDeleteProduct,
    onSaveMembership, onDeleteMembership, onSaveServiceCategory, onDeleteServiceCategory,
    onSaveProductCategory, onDeleteProductCategory, onSaveJobPosition, onDeleteJobPosition,
    onSaveProveedor, onDeleteProveedor, onSaveTipoProveedor, onDeleteTipoProveedor,
    onSaveEgresoCategory, onDeleteEgresoCategory, requestConfirmation, comprobantes
}) => {
    const [activeSection, setActiveSection] = useState('datos');

    const renderContent = () => {
        switch (activeSection) {
            case 'datos':
                return <BusinessInfoSection businessInfo={businessInfo} onSaveBusinessInfo={onSaveBusinessInfo} />;
            case 'miembros':
                return <UsersManager users={users} roles={roles} jobPositions={jobPositions} onSaveUser={onSaveUser} onDeleteUser={onDeleteUser} requestConfirmation={requestConfirmation} />;
            case 'roles':
                return <RolesManager roles={roles} onSaveRole={onSaveRole} onDeleteRole={onDeleteRole} requestConfirmation={requestConfirmation} />;
            case 'puestos':
                return <SimpleListManager title="Puestos de Trabajo" items={jobPositions} onSave={onSaveJobPosition} onDelete={onDeleteJobPosition} requestConfirmation={requestConfirmation} />;
            case 'origenes':
                return <SimpleListManager title="Origen de Clientes" items={clientSources} onSave={onSaveClientSource} onDelete={onDeleteClientSource} requestConfirmation={requestConfirmation} />;
            case 'categorias':
                return <SimpleListManager title="Categorías de Servicios" items={serviceCategories} onSave={onSaveServiceCategory} onDelete={onDeleteServiceCategory} requestConfirmation={requestConfirmation} />;
            case 'product-categorias':
                return <SimpleListManager title="Categorías de Productos" items={productCategories} onSave={onSaveProductCategory} onDelete={onDeleteProductCategory} requestConfirmation={requestConfirmation} />;
            case 'categorias-egresos':
                return <SimpleListManager title="Categorías de Egresos" items={egresoCategories} onSave={onSaveEgresoCategory} onDelete={onDeleteEgresoCategory} requestConfirmation={requestConfirmation} />;
            case 'tipos-proveedor':
                return <SimpleListManager title="Tipos de Proveedor" items={tiposProveedor} onSave={onSaveTipoProveedor} onDelete={onDeleteTipoProveedor} requestConfirmation={requestConfirmation} />;
            case 'servicios':
                return <CatalogManager 
                    title="Servicios" 
                    items={services} 
                    onSave={onSaveService} 
                    onDelete={onDeleteService} 
                    requestConfirmation={requestConfirmation}
                    fields={[
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                        { name: 'categoria', label: 'Categoría', type: 'select', required: true },
                        { name: 'precio', label: 'Precio', type: 'number', required: true },
                    ]}
                    itemCategories={serviceCategories}
                />;
            case 'productos':
                return <CatalogManager 
                    title="Productos" 
                    items={products} 
                    onSave={onSaveProduct} 
                    onDelete={onDeleteProduct} 
                    requestConfirmation={requestConfirmation}
                    fields={[
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                        { name: 'categoria', label: 'Categoría', type: 'select', required: true },
                        { name: 'precio', label: 'Precio', type: 'number', required: true },
                    ]}
                    itemCategories={productCategories}
                />;
            case 'membresias':
                return <CatalogManager 
                    title="Membresías" 
                    items={memberships} 
                    onSave={onSaveMembership} 
                    onDelete={onDeleteMembership} 
                    requestConfirmation={requestConfirmation}
                    fields={[
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                        { name: 'precio', label: 'Precio', type: 'number', required: true },
                        { name: 'numeroSesiones', label: 'N° Sesiones', type: 'number', required: true },
                        { name: 'descripcion', label: 'Descripción', type: 'textarea' },
                    ]}
                />;
            case 'proveedores':
                return <ProveedoresManager proveedores={proveedores} tiposProveedor={tiposProveedor} onSaveProveedor={onSaveProveedor} onDeleteProveedor={onDeleteProveedor} requestConfirmation={requestConfirmation} />;
            case 'metas':
                return <MetasPage goals={goals} onSaveGoal={onSaveGoal} onDeleteGoal={onDeleteGoal} requestConfirmation={requestConfirmation} />;
            case 'importar-exportar':
                return <ImportExportPage comprobantes={comprobantes} />;
            default:
                return <p>Selecciona una sección.</p>;
        }
    };

    const groupedSections = useMemo(() => {
        const groups: Record<string, typeof SETTINGS_SECTIONS> = {};
        SETTINGS_SECTIONS.forEach(section => {
            if (section.parent) {
                if (!groups[section.parent]) {
                    groups[section.parent] = [];
                }
                groups[section.parent].push(section);
            }
        });
        return groups;
    }, []);

    const topLevelSections = SETTINGS_SECTIONS.filter(section => !section.parent);

    return (
        <div className="flex h-full bg-white rounded-lg shadow-lg">
            {/* Sidebar de Configuración */}
            <aside className="w-64 flex-shrink-0 border-r p-6 bg-gray-50/50">
                <h1 className="text-2xl font-bold text-black mb-6">Configuración</h1>
                <nav className="space-y-2">
                    {topLevelSections.map(section => (
                        <div key={section.id}>
                            <button
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center p-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeSection === section.id || (groupedSections[section.id] && groupedSections[section.id].some(sub => sub.id === activeSection))
                                        ? 'bg-orange-100 text-[#aa632d]'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <GoogleIcon name={section.icon} className="mr-3 text-xl"/>
                                {section.label}
                            </button>
                            {groupedSections[section.id] && (activeSection === section.id || groupedSections[section.id].some(sub => sub.id === activeSection)) && (
                                <div className="pl-6 mt-1 space-y-1">
                                    {groupedSections[section.id].map(subSection => (
                                        <button
                                            key={subSection.id}
                                            onClick={() => setActiveSection(subSection.id)}
                                            className={`w-full text-left p-2 text-sm rounded-lg transition-colors ${
                                                activeSection === subSection.id ? 'bg-[#aa632d] text-white' : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {subSection.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 p-6 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};