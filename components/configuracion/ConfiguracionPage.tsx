import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import type { User, Role, BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory, JobPosition, ProductCategory, Proveedor, EgresoCategory, TipoProveedor, Goal, ComprobanteElectronico } from '../../types';
import { PlusIcon, TrashIcon } from '../shared/Icons';
import UsuarioFormModal from './UsuarioFormModal';
import RolFormModal from './RolFormModal';
import Modal from '../shared/Modal';
import ImportExportPage from './ImportExportPage';
import ProveedorFormModal from '../finanzas/ProveedorFormModal';
import MetasPage from './MetasPage';
import CatalogFormModal from './CatalogFormModal'; // Import CatalogFormModal
import MiembroEquipoFormModal from './MiembroEquipoFormModal.tsx';

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
                    title={editingItem?.id && items.find(i => i.id === editingItem.id) ? `Editar ${title.slice(0,-1)}` : `Añadir ${title}`}
                    fields={fields}
                    itemCategories={itemCategories}
                    categoryField={categoryField}
                />
            )}
        </div>
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
                            <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">RUC</label>
                            <input type="text" name="ruc" value={formData.ruc || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dirección</label>
                            <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input type="text" name="telefono" value={formData.telefono || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL del Logo</label>
                            <input type="url" name="logoUrl" value={formData.logoUrl || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md p-2"/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">URL Imagen Login</label>
                            <input type="url" name="loginImageUrl" value={formData.loginImageUrl || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md p-2"/>
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button type="button" onClick={handleSave} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]">Guardar</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-800">
                            <div><span className="font-medium text-gray-500">Nombre:</span> {businessInfo.nombre}</div>
                            <div><span className="font-medium text-gray-500">RUC:</span> {businessInfo.ruc}</div>
                            <div><span className="font-medium text-gray-500">Dirección:</span> {businessInfo.direccion}</div>
                            <div><span className="font-medium text-gray-500">Teléfono:</span> {businessInfo.telefono}</div>
                            <div><span className="font-medium text-gray-500">Email:</span> {businessInfo.email}</div>
                            <div className="flex items-center">
                                <span className="font-medium text-gray-500 mr-2">Logo:</span>
                                {businessInfo.logoUrl ? <img src={businessInfo.logoUrl} alt="Logo" className="h-8 object-contain"/> : 'N/A'}
                            </div>
                            <div className="md:col-span-2"><span className="font-medium text-gray-500">Imagen Login:</span> {businessInfo.loginImageUrl ? <img src={businessInfo.loginImageUrl} alt="Login" className="h-24 w-auto object-contain mt-2"/> : 'N/A'}</div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Editar Datos</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const ProveedoresSection: FC<{
    proveedores: Proveedor[];
    tiposProveedor: TipoProveedor[];
    onSave: (proveedor: Proveedor) => void;
    onDelete: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ proveedores, tiposProveedor, onSave, onDelete, requestConfirmation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

    const handleOpenModal = (proveedor?: Proveedor) => {
        setEditingProveedor(proveedor || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProveedor(null);
    };

    const handleSave = (proveedor: Proveedor) => {
        onSave(proveedor);
        handleCloseModal();
    };

    const handleDelete = (id: number) => {
        requestConfirmation('¿Está seguro de eliminar este proveedor?', () => {
            onDelete(id);
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Proveedores</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Añadir Proveedor
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-2">Razón Social</th>
                            <th className="text-left p-2">RUC</th>
                            <th className="text-left p-2">Tipo</th>
                            <th className="text-left p-2">Contacto</th>
                            <th className="text-left p-2">Días Crédito</th>
                            <th className="text-left p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proveedores.map((proveedor) => (
                            <tr key={proveedor.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{proveedor.razonSocial}</td>
                                <td className="p-2">{proveedor.ruc || 'N/A'}</td>
                                <td className="p-2">{proveedor.tipo}</td>
                                <td className="p-2">{proveedor.numeroContacto || 'N/A'}</td>
                                <td className="p-2">{proveedor.diasCredito ? `${proveedor.diasCredito} días` : 'N/A'}</td>
                                <td className="p-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(proveedor)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(proveedor.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Eliminar"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <ProveedorFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    onDelete={onDelete}
                    proveedor={editingProveedor}
                    tiposProveedor={tiposProveedor}
                    requestConfirmation={requestConfirmation}
                />
            )}
        </div>
    );
};

const MiembrosEquipoSection: FC<{
    users: User[];
    roles: Role[];
    documentTypes: DocumentType[];
    onSave: (user: Partial<User>) => void;
    onDelete: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ users, roles, documentTypes, onSave, onDelete, requestConfirmation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleOpenModal = (user?: User) => {
        setEditingUser(user || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSave = (user: Partial<User>) => {
        onSave(user);
        handleCloseModal();
    };

    const handleDelete = (id: number) => {
        requestConfirmation('¿Está seguro de eliminar este miembro?', () => {
            onDelete(id);
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Miembros del Equipo</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Añadir Miembro
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-2">Nombres</th>
                            <th className="text-left p-2">Apellidos</th>
                            <th className="text-left p-2">Usuario</th>
                            <th className="text-left p-2">Rol</th>
                            <th className="text-left p-2">Email Personal</th>
                            <th className="text-left p-2">Puesto</th>
                            <th className="text-left p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{user.nombres}</td>
                                <td className="p-2">{user.apellidos}</td>
                                <td className="p-2">{user.usuario}</td>
                                <td className="p-2">{roles.find(r => r.id === user.rolId)?.nombre || 'N/A'}</td>
                                <td className="p-2">{user.personalEmail || 'N/A'}</td>
                                <td className="p-2">{user.jobPosition || 'N/A'}</td>
                                <td className="p-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(user)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Eliminar"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <MiembroEquipoFormModal
                    user={editingUser}
                    roles={roles}
                    documentTypes={documentTypes}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const ConfiguracionPage: React.FC<ConfiguracionPageProps> = (props) => {
    const [activeSection, setActiveSection] = useState('datos');

    const renderContent = () => {
        switch (activeSection) {
            case 'datos':
                return <BusinessInfoSection businessInfo={props.businessInfo} onSaveBusinessInfo={props.onSaveBusinessInfo} />;
            case 'miembros':
                return <MiembrosEquipoSection
                    users={props.users}
                    roles={props.roles}
                    documentTypes={props.documentTypes}
                    onSave={props.onSaveUser}
                    onDelete={props.onDeleteUser}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'roles':
                return <SimpleListManager
                    title="Roles"
                    items={props.roles}
                    onSave={props.onSaveRole}
                    onDelete={props.onDeleteRole}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'puestos':
                return <SimpleListManager
                    title="Puestos de Trabajo"
                    items={props.jobPositions}
                    onSave={props.onSaveJobPosition}
                    onDelete={props.onDeleteJobPosition}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'proveedores':
                return <ProveedoresSection
                    proveedores={props.proveedores}
                    tiposProveedor={props.tiposProveedor}
                    onSave={props.onSaveProveedor}
                    onDelete={props.onDeleteProveedor}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'tipos-proveedor':
                return <SimpleListManager
                    title="Tipos de Proveedor"
                    items={props.tiposProveedor}
                    onSave={props.onSaveTipoProveedor}
                    onDelete={props.onDeleteTipoProveedor}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'origenes':
                return <SimpleListManager
                    title="Origen de Clientes"
                    items={props.clientSources}
                    onSave={props.onSaveClientSource}
                    onDelete={props.onDeleteClientSource}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'categorias-egresos':
                return <SimpleListManager
                    title="Categorías de Egresos"
                    items={props.egresoCategories}
                    onSave={props.onSaveEgresoCategory}
                    onDelete={props.onDeleteEgresoCategory}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'categorias':
                return <SimpleListManager
                    title="Categorías de Servicios"
                    items={props.serviceCategories}
                    onSave={props.onSaveServiceCategory}
                    onDelete={props.onDeleteServiceCategory}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'product-categorias':
                return <SimpleListManager
                    title="Categorías de Productos"
                    items={props.productCategories}
                    onSave={props.onSaveProductCategory}
                    onDelete={props.onDeleteProductCategory}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'servicios':
                return <CatalogManager
                    title="Servicios"
                    items={props.services}
                    onSave={props.onSaveService}
                    onDelete={props.onDeleteService}
                    requestConfirmation={props.requestConfirmation}
                    fields={[
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                        { name: 'categoria', label: 'Categoría', type: 'text', required: true },
                        { name: 'precio', label: 'Precio', type: 'number', required: true },
                    ]}
                    itemCategories={props.serviceCategories}
                />;
            case 'productos':
                return <CatalogManager
                    title="Productos"
                    items={props.products}
                    onSave={props.onSaveProduct}
                    onDelete={props.onDeleteProduct}
                    requestConfirmation={props.requestConfirmation}
                    fields={[
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                        { name: 'categoria', label: 'Categoría', type: 'text', required: true },
                        { name: 'precio', label: 'Precio', type: 'number', required: true },
                    ]}
                    itemCategories={props.productCategories}
                />;
            case 'membresias':
                return <CatalogManager
                    title="Membresías"
                    items={props.memberships}
                    onSave={props.onSaveMembership}
                    onDelete={props.onDeleteMembership}
                    requestConfirmation={props.requestConfirmation}
                    fields={[
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                        { name: 'precio', label: 'Precio', type: 'number', required: true },
                        { name: 'numeroSesiones', label: 'N° Sesiones', type: 'number', required: true },
                        { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
                    ]}
                />;
            case 'metas':
                return <MetasPage goals={props.goals} onSaveGoal={props.onSaveGoal} onDeleteGoal={props.onDeleteGoal} requestConfirmation={props.requestConfirmation} />;
            case 'importar-exportar':
                return <ImportExportPage comprobantes={props.comprobantes} />;
            default:
                return <BusinessInfoSection businessInfo={props.businessInfo} onSaveBusinessInfo={props.onSaveBusinessInfo} />;
        }
    };

    const getParentSection = (id: string) => {
        const item = SETTINGS_SECTIONS.find(s => s.id === id);
        return item?.parent;
    };

    return (
        <div className="flex space-x-6 h-full">
            <aside className="w-80 flex-shrink-0 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
                <h2 className="text-xl font-bold text-black mb-4">Configuración</h2>
                <nav className="space-y-1">
                    {SETTINGS_SECTIONS.filter(s => !s.parent).map(section => (
                        <div key={section.id}>
                            <button
                                onClick={() => setActiveSection(section.id === activeSection ? '' : (SETTINGS_SECTIONS.find(s => s.parent === section.id)?.id || section.id))}
                                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    (activeSection === section.id || getParentSection(activeSection) === section.id)
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <GoogleIcon name={section.icon} className="mr-3 text-lg"/>
                                {section.label}
                            </button>
                            { (activeSection === section.id || getParentSection(activeSection) === section.id) && (
                                <div className="pl-6 mt-1 space-y-1">
                                    {SETTINGS_SECTIONS.filter(s => s.parent === section.id).map(subSection => (
                                        <button
                                            key={subSection.id}
                                            onClick={() => setActiveSection(subSection.id)}
                                            className={`flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                                                activeSection === subSection.id
                                                    ? 'bg-gray-100 text-gray-900 font-medium'
                                                    : 'text-gray-600 hover:bg-gray-50'
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
            <main className="flex-1 bg-gray-50 p-6 rounded-lg overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

// FIX: Changed from default export to named export
export { ConfiguracionPage };