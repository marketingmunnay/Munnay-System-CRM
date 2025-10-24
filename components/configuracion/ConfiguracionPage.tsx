import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import type { User, Role, BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory, JobPosition, ProductCategory, Proveedor, EgresoCategory, TipoProveedor, Goal, ComprobanteElectronico } from '../../types.ts';
import { PlusIcon, TrashIcon } from '../shared/Icons.tsx';
import UsuarioFormModal from './UsuarioFormModal.tsx';
import RolFormModal from './RolFormModal.tsx';
import Modal from '../shared/Modal.tsx';
import ImportExportPage from './ImportExportPage.tsx';
import ProveedorFormModal from '../finanzas/ProveedorFormModal.tsx';
import MetasPage from './MetasPage.tsx';

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
    const [formData, setFormData] = useState(item);

    useEffect(() => {
        setFormData(item);
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} footer={
            <div className="space-x-2">
                <button onClick={onClose}>Cancelar</button>
                <button onClick={handleSubmit} className="bg-[#aa632d] text-white px-4 py-2 rounded-lg">Guardar</button>
            </div>
        } maxWidthClass="max-w-lg">
            <form className="p-6 space-y-4">
                {fields.map(field => (
                    <div key={String(field.name)}>
                        <label className="text-sm font-medium text-black">{field.label}</label>
                        {field.type === 'select' && field.name === categoryField ? (
                             <select name={String(field.name)} value={formData?.[field.name] || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mt-1 text-black">
                                <option value="">Seleccionar...</option>
                                {itemCategories?.map(cat => <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>)}
                             </select>
                        ) : field.type === 'textarea' ? (
                            <textarea name={String(field.name)} value={formData?.[field.name] || ''} onChange={handleChange} rows={3} className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mt-1 text-black" />
                        ) : (
                            <input type={field.type} name={String(field.name)} value={formData?.[field.name] || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mt-1 text-black"/>
                        )}
                    </div>
                ))}
            </form>
        </Modal>
    )
}


const ConfiguracionPage: React.FC<ConfiguracionPageProps> = (props) => {
    const {
        users, roles, businessInfo, clientSources, services, products, memberships,
        serviceCategories, productCategories, jobPositions, proveedores, tiposProveedor, egresoCategories,
        goals, onSaveGoal, onDeleteGoal,
        onSaveUser, onDeleteUser, onSaveRole, onDeleteRole, onSaveBusinessInfo, onSaveClientSource,
        onDeleteClientSource, onSaveService, onDeleteService, onSaveProduct, onDeleteProduct,
        onSaveMembership, onDeleteMembership, onSaveServiceCategory, onDeleteServiceCategory,
        onSaveProductCategory, onDeleteProductCategory, onSaveJobPosition, onDeleteJobPosition,
        onSaveProveedor, onDeleteProveedor, onSaveTipoProveedor, onDeleteTipoProveedor, 
        onSaveEgresoCategory, onDeleteEgresoCategory, requestConfirmation, comprobantes
    } = props;

    const [activeSection, setActiveSection] = useState('miembros');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [businessInfoData, setBusinessInfoData] = useState<BusinessInfo>(businessInfo);
    const [isProveedorModalOpen, setIsProveedorModalOpen] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
    
    const logoInputRef = useRef<HTMLInputElement>(null);
    const loginImageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setBusinessInfoData(businessInfo);
    }, [businessInfo]);
    
    const handleBusinessImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'loginImageUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setBusinessInfoData(prev => ({ ...prev, [field]: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setIsRoleModalOpen(true);
    };

    const handleAddRole = () => {
        setEditingRole(null);
        setIsRoleModalOpen(true);
    };
    
    const handleAddProveedor = () => {
        setEditingProveedor(null);
        setIsProveedorModalOpen(true);
    };
    
    const handleEditProveedor = (proveedor: Proveedor) => {
        setEditingProveedor(proveedor);
        setIsProveedorModalOpen(true);
    };

    const handleDeleteUserWithConfirmation = (user: User) => {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar al usuario "${user.nombres} ${user.apellidos}"?`,
            () => onDeleteUser(user.id)
        );
    };

    const handleDeleteRoleWithConfirmation = (role: Role) => {
        const usersWithRole = users.filter(u => u.rolId === role.id).length;
        if (usersWithRole > 0) {
            alert(`No se puede eliminar el rol "${role.nombre}" porque está asignado a ${usersWithRole} usuario(s).`);
            return;
        }
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar el rol "${role.nombre}"?`,
            () => onDeleteRole(role.id)
        );
    };

    const handleDeleteProveedorWithConfirmation = (proveedor: Proveedor) => {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar al proveedor "${proveedor.razonSocial}"?`,
            () => onDeleteProveedor(proveedor.id)
        );
    };


    const renderContent = () => {
        switch (activeSection) {
            case 'miembros':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Miembros del equipo</h2>
                            <button onClick={handleAddUser} className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225]"><PlusIcon className="mr-2"/>Añadir</button>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="p-2">Nombre</th><th>Usuario</th><th>Rol</th><th>Acciones</th></tr></thead>
                                <tbody>
                                    {users.map(user => <tr key={user.id} className="border-b"><td className="p-2 text-black">{user.nombres} {user.apellidos}</td><td className="text-black">{user.usuario}</td><td className="text-black">{roles.find(r=>r.id===user.rolId)?.nombre}</td><td><div className="flex items-center space-x-2"><button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar"><GoogleIcon name="edit" className="text-lg" /></button><button onClick={() => handleDeleteUserWithConfirmation(user)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar"><GoogleIcon name="delete" className="text-lg" /></button></div></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                        <UsuarioFormModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={onSaveUser} onDelete={onDeleteUser} user={editingUser} roles={roles} jobPositions={jobPositions} requestConfirmation={requestConfirmation} />
                    </div>
                );
            case 'roles':
                 return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Roles y Permisos</h2>
                            <button onClick={handleAddRole} className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225]"><PlusIcon className="mr-2"/>Añadir</button>
                        </div>
                         <div className="bg-white p-4 rounded-lg shadow">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="p-2">Nombre del Rol</th><th>Acciones</th></tr></thead>
                                <tbody>
                                    {roles.map(role => <tr key={role.id} className="border-b"><td className="p-2 text-black">{role.nombre}</td><td><div className="flex items-center space-x-2"><button onClick={() => handleEditRole(role)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar"><GoogleIcon name="edit" className="text-lg" /></button><button onClick={() => handleDeleteRoleWithConfirmation(role)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar"><GoogleIcon name="delete" className="text-lg" /></button></div></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                        <RolFormModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} onSave={onSaveRole} role={editingRole} />
                    </div>
                );
            case 'puestos':
                return <SimpleListManager title="Puestos de Trabajo" items={jobPositions} onSave={onSaveJobPosition} onDelete={onDeleteJobPosition} requestConfirmation={requestConfirmation}/>
            case 'datos':
                 return (
                    <div>
                        <h2 className="text-xl font-bold text-black mb-4">Datos del Negocio</h2>
                        <div className="bg-white p-6 rounded-lg shadow space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-black">Nombre del Negocio</label>
                                    <input value={businessInfoData.nombre} onChange={e => setBusinessInfoData(prev => ({...prev, nombre: e.target.value}))} className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mt-1 text-black"/>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-black">RUC</label>
                                    <input value={businessInfoData.ruc} onChange={e => setBusinessInfoData(prev => ({...prev, ruc: e.target.value}))} className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mt-1 text-black"/>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-black">Dirección</label>
                                    <input value={businessInfoData.direccion} onChange={e => setBusinessInfoData(prev => ({...prev, direccion: e.target.value}))} className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mt-1 text-black"/>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-black">Teléfono</label>
                                    <input value={businessInfoData.telefono} onChange={e => setBusinessInfoData(prev => ({...prev, telefono: e.target.value}))} className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mt-1 text-black"/>
                                </div>
                                 <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-black">Email</label>
                                    <input value={businessInfoData.email} onChange={e => setBusinessInfoData(prev => ({...prev, email: e.target.value}))} className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mt-1 text-black"/>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium text-black">Logo del Negocio</label>
                                <div className="flex items-center space-x-4">
                                    {businessInfoData.logoUrl ? (
                                        <img src={businessInfoData.logoUrl} alt="Logo Preview" className="h-16 object-contain bg-gray-100 p-1 border rounded-md" />
                                    ) : (
                                        <div className="h-16 w-32 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-500">Sin logo</div>
                                    )}
                                    <input type="file" ref={logoInputRef} onChange={(e) => handleBusinessImageChange(e, 'logoUrl')} accept="image/*" className="hidden" />
                                    <button type="button" onClick={() => logoInputRef.current?.click()} className="flex items-center bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-200 transition-colors">
                                        <GoogleIcon name="upload_file" className="mr-2"/> Subir Logo
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-black">Imagen de Fondo del Login</label>
                                <div className="flex items-center space-x-4">
                                    {businessInfoData.loginImageUrl ? (
                                        <img src={businessInfoData.loginImageUrl} alt="Login Image Preview" className="h-16 w-32 object-cover bg-gray-100 p-1 border rounded-md" />
                                    ) : (
                                        <div className="h-16 w-32 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-500">Sin imagen</div>
                                    )}
                                    <input type="file" ref={loginImageInputRef} onChange={(e) => handleBusinessImageChange(e, 'loginImageUrl')} accept="image/*" className="hidden" />
                                    <button type="button" onClick={() => loginImageInputRef.current?.click()} className="flex items-center bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-200 transition-colors">
                                        <GoogleIcon name="upload_file" className="mr-2"/> Subir Imagen
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={() => onSaveBusinessInfo(businessInfoData)} className="bg-[#aa632d] text-white px-6 py-2 rounded-lg shadow hover:bg-[#8e5225] w-full md:w-auto">Guardar Cambios</button>
                            </div>
                        </div>
                    </div>
                );
            case 'origenes':
                 return <SimpleListManager title="Origen de Clientes" items={clientSources} onSave={onSaveClientSource} onDelete={onDeleteClientSource} requestConfirmation={requestConfirmation}/>
            case 'proveedores':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Proveedores</h2>
                            <button onClick={handleAddProveedor} className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225]"><PlusIcon className="mr-2"/>Añadir</button>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="p-2">Razón Social</th><th>RUC</th><th>Tipo</th><th>Contacto</th><th>Acciones</th></tr></thead>
                                <tbody>
                                    {proveedores.map(p => <tr key={p.id} className="border-b"><td className="p-2 text-black">{p.razonSocial}</td><td className="text-black">{p.ruc}</td><td className="text-black">{p.tipo}</td><td className="text-black">{p.numeroContacto}</td><td><div className="flex items-center space-x-2"><button onClick={() => handleEditProveedor(p)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar"><GoogleIcon name="edit" className="text-lg" /></button><button onClick={() => handleDeleteProveedorWithConfirmation(p)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar"><GoogleIcon name="delete" className="text-lg" /></button></div></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                        <ProveedorFormModal isOpen={isProveedorModalOpen} onClose={() => setIsProveedorModalOpen(false)} onSave={onSaveProveedor} onDelete={onDeleteProveedor} proveedor={editingProveedor} tiposProveedor={tiposProveedor} />
                    </div>
                );
            case 'tipos-proveedor':
                return <SimpleListManager title="Tipos de Proveedor" items={tiposProveedor} onSave={onSaveTipoProveedor} onDelete={onDeleteTipoProveedor} requestConfirmation={requestConfirmation}/>
            case 'categorias':
                 return <SimpleListManager title="Categorías de Servicios" items={serviceCategories} onSave={onSaveServiceCategory} onDelete={onDeleteServiceCategory} requestConfirmation={requestConfirmation}/>
            case 'product-categorias':
                return <SimpleListManager title="Categorías de Productos" items={productCategories} onSave={onSaveProductCategory} onDelete={onDeleteProductCategory} requestConfirmation={requestConfirmation}/>
            case 'categorias-egresos':
                return <SimpleListManager title="Categorías de Egresos" items={egresoCategories} onSave={onSaveEgresoCategory} onDelete={onDeleteEgresoCategory} requestConfirmation={requestConfirmation}/>
            case 'servicios':
                return <CatalogManager 
                    title="Servicios"
                    items={services}
                    onSave={onSaveService}
                    onDelete={onDeleteService}
                    requestConfirmation={requestConfirmation}
                    fields={[
                        { name: 'nombre', label: 'Nombre del Servicio', type: 'text' },
                        { name: 'categoria', label: 'Categoría', type: 'select' },
                        { name: 'precio', label: 'Precio (S/)', type: 'number' },
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
                        { name: 'nombre', label: 'Nombre del Producto', type: 'text' },
                        { name: 'categoria', label: 'Categoría', type: 'select' },
                        { name: 'precio', label: 'Precio (S/)', type: 'number' },
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
                        { name: 'nombre', label: 'Nombre de la Membresía', type: 'text' },
                        { name: 'precio', label: 'Precio (S/)', type: 'number' },
                        { name: 'numeroSesiones', label: 'N° de Sesiones', type: 'number' },
                        { name: 'descripcion', label: 'Descripción', type: 'textarea' },
                    ]}
                />;
            case 'metas':
                return <MetasPage 
                    goals={goals} 
                    onSaveGoal={onSaveGoal}
                    onDeleteGoal={onDeleteGoal}
                    requestConfirmation={requestConfirmation}
                />;
            case 'importar-exportar':
                return <ImportExportPage comprobantes={comprobantes} />;
            default:
                return <div>Selecciona una sección</div>;
        }
    };

    return (
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
            <aside className="md:w-1/4 flex-shrink-0">
                <nav className="space-y-4">
                    {SETTINGS_SECTIONS.filter(s => !s.parent).map(section => (
                        <div key={section.id}>
                            <h3 className="text-xs uppercase text-black font-semibold flex items-center tracking-wider"><GoogleIcon name={section.icon || ''} className="mr-2 text-base"/>{section.label}</h3>
                            <ul className="mt-2 space-y-1 border-l-2 border-gray-200 ml-2.5 pl-4">
                                {SETTINGS_SECTIONS.filter(s => s.parent === section.id).map(sub => (
                                    <li key={sub.id}><button onClick={() => setActiveSection(sub.id)} className={`w-full text-left p-2 rounded-md text-sm ${activeSection === sub.id ? 'bg-orange-100 text-[#aa632d] font-semibold' : 'text-black hover:bg-gray-100'}`}>{sub.label}</button></li>
                                ))}
                                {section.id !== 'equipo' && section.id !== 'negocio' && section.id !== 'servicios-productos' && (
                                    <li><button onClick={() => setActiveSection(section.id)} className={`w-full text-left p-2 rounded-md text-sm ${activeSection === section.id ? 'bg-orange-100 text-[#aa632d] font-semibold' : 'text-black hover:bg-gray-100'}`}>{section.label}</button></li>
                                )}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
            <main className="flex-1">
                {renderContent()}
            </main>
        </div>
    );
};
export default ConfiguracionPage;