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
import MembershipFormModal from './MembershipFormModal.tsx';
import Pagination from '../shared/Pagination';
import { usePagination } from '../../utils/usePagination';

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
    onImportCampaigns?: (campaigns: any[]) => Promise<void>;
    onImportMetaCampaigns?: (metaCampaigns: any[]) => Promise<void>;
}

const SETTINGS_SECTIONS = [
    { id: 'equipo', label: 'Gestión del Equipo', icon: 'groups' },
    { id: 'miembros', label: 'Miembros del equipo', parent: 'equipo' },
    { id: 'negocio', label: 'Configuración del Negocio', icon: 'store' },
    { id: 'datos', label: 'Datos del negocio', parent: 'negocio' },
    { id: 'proveedores', label: 'Proveedores', parent: 'negocio' },
    { id: 'origenes', label: 'Origen de Clientes', parent: 'negocio' },
    { id: 'servicios-productos', label: 'Servicios y Productos', icon: 'inventory_2' },
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
    egresoCategories: EgresoCategory[];
    onSaveProveedor: (proveedor: Proveedor) => void;
    onDeleteProveedor: (id: number) => void;
    onSaveTipoProveedor: (tipo: TipoProveedor) => void;
    onDeleteTipoProveedor: (id: number) => void;
    onSaveEgresoCategory: (category: EgresoCategory) => void;
    onDeleteEgresoCategory: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ proveedores, tiposProveedor, egresoCategories, onSaveProveedor, onDeleteProveedor, onSaveTipoProveedor, onDeleteTipoProveedor, onSaveEgresoCategory, onDeleteEgresoCategory, requestConfirmation }) => {
    const [activeTab, setActiveTab] = useState('proveedores');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
    const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
    const [editingTipo, setEditingTipo] = useState<TipoProveedor | null>(null);
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState<EgresoCategory | null>(null);
    
    // Paginación para proveedores
    const proveedoresPagination = usePagination(proveedores, 20);

    const handleOpenModal = (proveedor?: Proveedor) => {
        setEditingProveedor(proveedor || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProveedor(null);
    };

    const handleSaveProveedor = (proveedor: Proveedor) => {
        onSaveProveedor(proveedor);
        handleCloseModal();
    };

    const handleDeleteProveedor = (id: number) => {
        requestConfirmation('¿Está seguro de eliminar este proveedor?', () => {
            onDeleteProveedor(id);
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Gestión de Proveedores</h2>
                <div className="flex gap-2">
                    {activeTab === 'proveedores' && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Proveedor
                        </button>
                    )}
                    {activeTab === 'tipos' && (
                        <button
                            onClick={() => { setEditingTipo({ id: Date.now(), nombre: '' }); setIsTipoModalOpen(true); }}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Tipo
                        </button>
                    )}
                    {activeTab === 'categorias' && (
                        <button
                            onClick={() => { setEditingCategoria({ id: Date.now(), nombre: '' }); setIsCategoriaModalOpen(true); }}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Categoría
                        </button>
                    )}
                </div>
            </div>

            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('proveedores')}
                        className={`${activeTab === 'proveedores' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Proveedores
                    </button>
                    <button
                        onClick={() => setActiveTab('tipos')}
                        className={`${activeTab === 'tipos' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Tipos de Proveedor
                    </button>
                    <button
                        onClick={() => setActiveTab('categorias')}
                        className={`${activeTab === 'categorias' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Categorías de Egresos
                    </button>
                </nav>
            </div>

            {activeTab === 'proveedores' && (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Razón Social</th>
                                    <th className="text-left p-2">RUC</th>
                                    <th className="text-left p-2">Tipo</th>
                                    <th className="text-left p-2">Categoría Egreso</th>
                                    <th className="text-left p-2">Contacto</th>
                                    <th className="text-left p-2">Días Crédito</th>
                                    <th className="text-left p-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proveedoresPagination.paginatedItems.map((proveedor) => (
                                    <tr key={proveedor.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{proveedor.razonSocial}</td>
                                        <td className="p-2">{proveedor.ruc || 'N/A'}</td>
                                        <td className="p-2">{proveedor.tipo}</td>
                                        <td className="p-2">{proveedor.categoriaEgreso || 'N/A'}</td>
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
                                                    onClick={() => handleDeleteProveedor(proveedor.id)}
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
                    {proveedores.length > 20 && (
                        <Pagination
                            currentPage={proveedoresPagination.currentPage}
                            totalPages={proveedoresPagination.totalPages}
                            onPageChange={proveedoresPagination.goToPage}
                            itemsPerPage={proveedoresPagination.itemsPerPage}
                            totalItems={proveedoresPagination.totalItems}
                        />
                    )}
                </>
            )}

            {activeTab === 'tipos' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Nombre del Tipo</th>
                                <th className="text-left p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tiposProveedor.map((tipo) => (
                                <tr key={tipo.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{tipo.nombre}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingTipo(tipo); setIsTipoModalOpen(true); }}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => requestConfirmation('¿Está seguro de eliminar este tipo?', () => onDeleteTipoProveedor(tipo.id))}
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
            )}

            {activeTab === 'categorias' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Nombre de la Categoría</th>
                                <th className="text-left p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {egresoCategories.map((cat) => (
                                <tr key={cat.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{cat.nombre}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingCategoria(cat); setIsCategoriaModalOpen(true); }}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => requestConfirmation('¿Está seguro de eliminar esta categoría?', () => onDeleteEgresoCategory(cat.id))}
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
            )}

            {isModalOpen && (
                <ProveedorFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveProveedor}
                    onDelete={onDeleteProveedor}
                    proveedor={editingProveedor}
                    tiposProveedor={tiposProveedor}
                    egresoCategories={egresoCategories}
                    requestConfirmation={requestConfirmation}
                />
            )}

            {isTipoModalOpen && editingTipo && (
                <Modal isOpen={isTipoModalOpen} onClose={() => setIsTipoModalOpen(false)} title={editingTipo.id < 1000000 ? 'Editar Tipo' : 'Añadir Tipo'}>
                    <div className="p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Tipo</label>
                        <input
                            type="text"
                            value={editingTipo.nombre}
                            onChange={(e) => setEditingTipo({ ...editingTipo, nombre: e.target.value })}
                            className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsTipoModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                            <button onClick={() => { onSaveTipoProveedor(editingTipo); setIsTipoModalOpen(false); }} className="px-4 py-2 bg-[#aa632d] text-white rounded-md">Guardar</button>
                        </div>
                    </div>
                </Modal>
            )}

            {isCategoriaModalOpen && editingCategoria && (
                <Modal isOpen={isCategoriaModalOpen} onClose={() => setIsCategoriaModalOpen(false)} title={editingCategoria.id < 1000000 ? 'Editar Categoría' : 'Añadir Categoría'}>
                    <div className="p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Categoría</label>
                        <input
                            type="text"
                            value={editingCategoria.nombre}
                            onChange={(e) => setEditingCategoria({ ...editingCategoria, nombre: e.target.value })}
                            className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsCategoriaModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                            <button onClick={() => { onSaveEgresoCategory(editingCategoria); setIsCategoriaModalOpen(false); }} className="px-4 py-2 bg-[#aa632d] text-white rounded-md">Guardar</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const ServiciosSection: FC<{
    services: Service[];
    serviceCategories: ServiceCategory[];
    onSaveService: (service: Service) => void;
    onDeleteService: (id: number) => void;
    onSaveServiceCategory: (category: ServiceCategory) => void;
    onDeleteServiceCategory: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ services, serviceCategories, onSaveService, onDeleteService, onSaveServiceCategory, onDeleteServiceCategory, requestConfirmation }) => {
    const [activeTab, setActiveTab] = useState('servicios');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState<ServiceCategory | null>(null);

    const handleOpenServiceModal = (service?: Service) => {
        setEditingService(service || null);
        setIsServiceModalOpen(true);
    };

    const handleCloseServiceModal = () => {
        setIsServiceModalOpen(false);
        setEditingService(null);
    };

    const handleSaveService = (service: Service) => {
        onSaveService(service);
        handleCloseServiceModal();
    };

    const handleDeleteService = (id: number) => {
        requestConfirmation('¿Está seguro de eliminar este servicio?', () => {
            onDeleteService(id);
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Gestión de Servicios</h2>
                <div className="flex gap-2">
                    {activeTab === 'servicios' && (
                        <button
                            onClick={() => handleOpenServiceModal()}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Servicio
                        </button>
                    )}
                    {activeTab === 'categorias' && (
                        <button
                            onClick={() => { setEditingCategoria({ id: Date.now(), nombre: '' }); setIsCategoriaModalOpen(true); }}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Categoría
                        </button>
                    )}
                </div>
            </div>

            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('servicios')}
                        className={`${activeTab === 'servicios' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Servicios
                    </button>
                    <button
                        onClick={() => setActiveTab('categorias')}
                        className={`${activeTab === 'categorias' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Categorías de Servicios
                    </button>
                </nav>
            </div>

            {activeTab === 'servicios' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Nombre</th>
                                <th className="text-left p-2">Categoría</th>
                                <th className="text-left p-2">Precio</th>
                                <th className="text-left p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{service.nombre}</td>
                                    <td className="p-2">{service.categoria}</td>
                                    <td className="p-2">
                                        {service.precio === 0 ? (
                                            <span className="text-green-600 font-medium">Gratis</span>
                                        ) : (
                                            `S/ ${service.precio?.toFixed(2)}`
                                        )}
                                    </td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenServiceModal(service)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteService(service.id)}
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
            )}

            {activeTab === 'categorias' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Nombre de la Categoría</th>
                                <th className="text-left p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviceCategories.map((cat) => (
                                <tr key={cat.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{cat.nombre}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingCategoria(cat); setIsCategoriaModalOpen(true); }}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => requestConfirmation('¿Está seguro de eliminar esta categoría?', () => onDeleteServiceCategory(cat.id))}
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
            )}

            {isServiceModalOpen && (
                <CatalogFormModal
                    isOpen={isServiceModalOpen}
                    onClose={handleCloseServiceModal}
                    onSave={handleSaveService}
                    item={editingService}
                    title={editingService ? 'Editar Servicio' : 'Añadir Servicio'}
                    fields={[
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                        { name: 'categoria', label: 'Categoría', type: 'text', required: true },
                        { name: 'precio', label: 'Precio', type: 'number', required: true },
                    ]}
                    itemCategories={serviceCategories}
                    categoryField="categoria"
                />
            )}

            {isCategoriaModalOpen && editingCategoria && (
                <Modal isOpen={isCategoriaModalOpen} onClose={() => setIsCategoriaModalOpen(false)} title={editingCategoria.id < 1000000 ? 'Editar Categoría' : 'Añadir Categoría'}>
                    <div className="p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Categoría</label>
                        <input
                            type="text"
                            value={editingCategoria.nombre}
                            onChange={(e) => setEditingCategoria({ ...editingCategoria, nombre: e.target.value })}
                            className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsCategoriaModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                            <button onClick={() => { onSaveServiceCategory(editingCategoria); setIsCategoriaModalOpen(false); }} className="px-4 py-2 bg-[#aa632d] text-white rounded-md">Guardar</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const ProductosSection: FC<{
    products: Product[];
    productCategories: ProductCategory[];
    onSaveProduct: (product: Product) => void;
    onDeleteProduct: (id: number) => void;
    onSaveProductCategory: (category: ProductCategory) => void;
    onDeleteProductCategory: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ products, productCategories, onSaveProduct, onDeleteProduct, onSaveProductCategory, onDeleteProductCategory, requestConfirmation }) => {
    const [activeTab, setActiveTab] = useState('productos');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState<ProductCategory | null>(null);

    const handleOpenProductModal = (product?: Product) => {
        setEditingProduct(product || null);
        setIsProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = (product: Product) => {
        onSaveProduct(product);
        handleCloseProductModal();
    };

    const handleDeleteProduct = (id: number) => {
        requestConfirmation('¿Está seguro de eliminar este producto?', () => {
            onDeleteProduct(id);
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Gestión de Productos</h2>
                <div className="flex gap-2">
                    {activeTab === 'productos' && (
                        <button
                            onClick={() => handleOpenProductModal()}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Producto
                        </button>
                    )}
                    {activeTab === 'categorias' && (
                        <button
                            onClick={() => { setEditingCategoria({ id: Date.now(), nombre: '' }); setIsCategoriaModalOpen(true); }}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Categoría
                        </button>
                    )}
                </div>
            </div>

            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('productos')}
                        className={`${activeTab === 'productos' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Productos
                    </button>
                    <button
                        onClick={() => setActiveTab('categorias')}
                        className={`${activeTab === 'categorias' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Categorías de Productos
                    </button>
                </nav>
            </div>

            {activeTab === 'productos' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Nombre</th>
                                <th className="text-left p-2">Categoría</th>
                                <th className="text-left p-2">Precio</th>
                                <th className="text-left p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{product.nombre}</td>
                                    <td className="p-2">{product.categoria}</td>
                                    <td className="p-2">
                                        {product.precio === 0 ? (
                                            <span className="text-green-600 font-medium">Gratis</span>
                                        ) : (
                                            `S/ ${product.precio?.toFixed(2)}`
                                        )}
                                    </td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenProductModal(product)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
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
            )}

            {activeTab === 'categorias' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Nombre de la Categoría</th>
                                <th className="text-left p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productCategories.map((cat) => (
                                <tr key={cat.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{cat.nombre}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingCategoria(cat); setIsCategoriaModalOpen(true); }}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => requestConfirmation('¿Está seguro de eliminar esta categoría?', () => onDeleteProductCategory(cat.id))}
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
            )}

            {isProductModalOpen && (
                <CatalogFormModal
                    isOpen={isProductModalOpen}
                    onClose={handleCloseProductModal}
                    onSave={handleSaveProduct}
                    item={editingProduct}
                    title={editingProduct ? 'Editar Producto' : 'Añadir Producto'}
                    fields={[
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                        { name: 'categoria', label: 'Categoría', type: 'text', required: true },
                        { name: 'precio', label: 'Precio', type: 'number', required: true },
                    ]}
                    itemCategories={productCategories}
                />
            )}

            {isCategoriaModalOpen && editingCategoria && (
                <Modal isOpen={isCategoriaModalOpen} onClose={() => setIsCategoriaModalOpen(false)} title={editingCategoria.id < 1000000 ? 'Editar Categoría' : 'Añadir Categoría'}>
                    <div className="p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Categoría</label>
                        <input
                            type="text"
                            value={editingCategoria.nombre}
                            onChange={(e) => setEditingCategoria({ ...editingCategoria, nombre: e.target.value })}
                            className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsCategoriaModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                            <button onClick={() => { onSaveProductCategory(editingCategoria); setIsCategoriaModalOpen(false); }} className="px-4 py-2 bg-[#aa632d] text-white rounded-md">Guardar</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const MembresiasSection: FC<{
    memberships: Membership[];
    services: Service[];
    onSaveMembership: (membership: Membership) => void;
    onDeleteMembership: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ memberships, services, onSaveMembership, onDeleteMembership, requestConfirmation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMembership, setEditingMembership] = useState<Membership | null>(null);

    const handleOpenModal = (membership?: Membership) => {
        setEditingMembership(membership || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMembership(null);
    };

    const handleSave = (membership: Membership) => {
        onSaveMembership(membership);
        handleCloseModal();
    };

    const handleDelete = (id: number) => {
        requestConfirmation('¿Está seguro de eliminar esta membresía?', () => {
            onDeleteMembership(id);
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Membresías</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Añadir Membresía
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-2">Nombre</th>
                            <th className="text-left p-2">Descripción</th>
                            <th className="text-left p-2">Servicios</th>
                            <th className="text-left p-2">Precio Total</th>
                            <th className="text-left p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {memberships.map((membership) => (
                            <tr key={membership.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 font-medium">{membership.nombre}</td>
                                <td className="p-2 text-sm text-gray-600">{membership.descripcion}</td>
                                <td className="p-2 text-sm">
                                    {membership.servicios && membership.servicios.length > 0 ? (
                                        <div className="space-y-1">
                                            {membership.servicios.map((s, idx) => (
                                                <div key={idx} className="text-xs">
                                                    • {s.servicioNombre} ({s.numeroSesiones} sesiones)
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Sin servicios</span>
                                    )}
                                </td>
                                <td className="p-2 font-medium text-green-600">
                                    S/ {membership.servicios?.reduce((sum, s) => sum + (s.precio || 0), 0).toFixed(2) || '0.00'}
                                </td>
                                <td className="p-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(membership)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(membership.id)}
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
                <MembershipFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    membership={editingMembership}
                    services={services}
                />
            )}
        </div>
    );
};

const MiembrosEquipoSection: FC<{
    users: User[];
    roles: Role[];
    jobPositions: JobPosition[];
    onSaveUser: (user: Partial<User>) => void;
    onDeleteUser: (id: number) => void;
    onSaveRole: (role: Role) => void;
    onDeleteRole: (id: number) => void;
    onSaveJobPosition: (position: JobPosition) => void;
    onDeleteJobPosition: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({ users, roles, jobPositions, onSaveUser, onDeleteUser, onSaveRole, onDeleteRole, onSaveJobPosition, onDeleteJobPosition, requestConfirmation }) => {
    const [activeTab, setActiveTab] = useState('miembros');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPosition | null>(null);

    const handleOpenModal = (user?: User) => {
        setEditingUser(user || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (user: Partial<User>) => {
        console.log('=== ConfiguracionPage handleSaveUser ===');
        console.log('Usuario recibido:', user);
        try {
            await onSaveUser(user);
            console.log('Usuario guardado, cerrando modal...');
            handleCloseModal();
        } catch (error) {
            console.error('Error en ConfiguracionPage handleSaveUser:', error);
            alert('Error al guardar el usuario: ' + error);
        }
    };

    const handleDeleteUser = (id: number) => {
        requestConfirmation('¿Está seguro de eliminar este miembro?', () => {
            onDeleteUser(id);
        });
    };

    const handleOpenRoleModal = (role?: Role) => {
        setEditingRole(role || { id: Date.now(), nombre: '', permissions: ['dashboard'], dashboardMetrics: [] });
        setIsRoleModalOpen(true);
    };

    const handleOpenJobModal = (job?: JobPosition) => {
        setEditingJob(job || { id: Date.now(), nombre: '' });
        setIsJobModalOpen(true);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Gestión del Equipo</h2>
                <div className="flex gap-2">
                    {activeTab === 'miembros' && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Miembro
                        </button>
                    )}
                    {activeTab === 'roles' && (
                        <button
                            onClick={() => handleOpenRoleModal()}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Rol
                        </button>
                    )}
                    {activeTab === 'puestos' && (
                        <button
                            onClick={() => handleOpenJobModal()}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Puesto
                        </button>
                    )}
                </div>
            </div>

            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('miembros')}
                        className={`${activeTab === 'miembros' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Miembros del Equipo
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`${activeTab === 'roles' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Roles y Permisos
                    </button>
                    <button
                        onClick={() => setActiveTab('puestos')}
                        className={`${activeTab === 'puestos' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Puestos de Trabajo
                    </button>
                </nav>
            </div>

            {activeTab === 'miembros' && (
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
                                    <td className="p-2">{user.email || 'N/A'}</td>
                                    <td className="p-2">{user.position || 'N/A'}</td>
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
                                                onClick={() => handleDeleteUser(user.id)}
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
            )}

            {activeTab === 'roles' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Nombre del Rol</th>
                                <th className="text-left p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role) => (
                                <tr key={role.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{role.nombre}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenRoleModal(role)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => requestConfirmation('¿Está seguro de eliminar este rol?', () => onDeleteRole(role.id))}
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
            )}

            {activeTab === 'puestos' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Nombre del Puesto</th>
                                <th className="text-left p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobPositions.map((job) => (
                                <tr key={job.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{job.nombre}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenJobModal(job)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => requestConfirmation('¿Está seguro de eliminar este puesto?', () => onDeleteJobPosition(job.id))}
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
            )}

            {isModalOpen && (
                <MiembroEquipoFormModal
                    isOpen={isModalOpen}
                    user={editingUser}
                    roles={roles}
                    jobPositions={jobPositions}
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                    onDelete={onDeleteUser}
                    requestConfirmation={requestConfirmation}
                />
            )}
            
            {isRoleModalOpen && editingRole && (
                <RolFormModal
                    isOpen={isRoleModalOpen}
                    onClose={() => setIsRoleModalOpen(false)}
                    onSave={(role) => { onSaveRole(role); setIsRoleModalOpen(false); }}
                    role={editingRole}
                />
            )}

            {isJobModalOpen && editingJob && (
                <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title={editingJob.id < 1000000 ? 'Editar Puesto' : 'Añadir Puesto'}>
                    <div className="p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Puesto</label>
                        <input
                            type="text"
                            value={editingJob.nombre}
                            onChange={(e) => setEditingJob({ ...editingJob, nombre: e.target.value })}
                            className="w-full border-black bg-[#f9f9fa] rounded-md p-2 mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsJobModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                            <button onClick={() => { 
                                console.log('Guardando puesto:', editingJob); 
                                try {
                                    onSaveJobPosition(editingJob); 
                                    console.log('Puesto guardado exitosamente');
                                    setIsJobModalOpen(false); 
                                } catch (error) {
                                    console.error('Error al guardar puesto:', error);
                                    alert('Error al guardar el puesto. Por favor revisa la consola.');
                                }
                            }} className="px-4 py-2 bg-[#aa632d] text-white rounded-md">Guardar</button>
                        </div>
                    </div>
                </Modal>
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
                    jobPositions={props.jobPositions}
                    onSaveUser={props.onSaveUser}
                    onDeleteUser={props.onDeleteUser}
                    onSaveRole={props.onSaveRole}
                    onDeleteRole={props.onDeleteRole}
                    onSaveJobPosition={props.onSaveJobPosition}
                    onDeleteJobPosition={props.onDeleteJobPosition}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'proveedores':
                return <ProveedoresSection
                    proveedores={props.proveedores}
                    tiposProveedor={props.tiposProveedor}
                    egresoCategories={props.egresoCategories}
                    onSaveProveedor={props.onSaveProveedor}
                    onDeleteProveedor={props.onDeleteProveedor}
                    onSaveTipoProveedor={props.onSaveTipoProveedor}
                    onDeleteTipoProveedor={props.onDeleteTipoProveedor}
                    onSaveEgresoCategory={props.onSaveEgresoCategory}
                    onDeleteEgresoCategory={props.onDeleteEgresoCategory}
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
            case 'servicios':
                return <ServiciosSection
                    services={props.services}
                    serviceCategories={props.serviceCategories}
                    onSaveService={props.onSaveService}
                    onDeleteService={props.onDeleteService}
                    onSaveServiceCategory={props.onSaveServiceCategory}
                    onDeleteServiceCategory={props.onDeleteServiceCategory}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'productos':
                return <ProductosSection
                    products={props.products}
                    productCategories={props.productCategories}
                    onSaveProduct={props.onSaveProduct}
                    onDeleteProduct={props.onDeleteProduct}
                    onSaveProductCategory={props.onSaveProductCategory}
                    onDeleteProductCategory={props.onDeleteProductCategory}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'membresias':
                return <MembresiasSection
                    memberships={props.memberships}
                    services={props.services}
                    onSaveMembership={props.onSaveMembership}
                    onDeleteMembership={props.onDeleteMembership}
                    requestConfirmation={props.requestConfirmation}
                />;
            case 'metas':
                return <MetasPage goals={props.goals} onSaveGoal={props.onSaveGoal} onDeleteGoal={props.onDeleteGoal} requestConfirmation={props.requestConfirmation} users={props.users} />;
            case 'importar-exportar':
                return <ImportExportPage 
                    comprobantes={props.comprobantes} 
                    onImportCampaigns={props.onImportCampaigns}
                    onImportMetaCampaigns={props.onImportMetaCampaigns}
                />;
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