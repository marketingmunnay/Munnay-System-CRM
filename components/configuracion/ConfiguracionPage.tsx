import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import type { User, Role, BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory, JobPosition, ProductCategory, ProductBrand, Proveedor, EgresoCategory, TipoProveedor, Goal, ComprobanteElectronico, UnidadMedida } from '../../types';
import type { BulkImportEgresosResponse } from '../../services/api';
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
const UNIDADES_MEDIDA: UnidadMedida[] = ['unidades', 'cajas', 'paquetes', 'blister', 'ml', 'g', 'litros'];

const GoogleIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className || ''}`.trim()}>{name}</span>
);

interface SettingsSection {
    id: string;
    label: string;
    icon?: string;
    parent?: string;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
    { id: 'negocio', label: 'Negocio', icon: 'storefront' },
    { id: 'datos', label: 'Datos del negocio', parent: 'negocio' },
    { id: 'origenes', label: 'Origen de clientes', parent: 'negocio' },
    { id: 'metas', label: 'Metas estratégicas', parent: 'negocio' },
    { id: 'importar-exportar', label: 'Importar / Exportar', parent: 'negocio' },

    { id: 'operaciones', label: 'Operaciones', icon: 'inventory_2' },
    { id: 'servicios', label: 'Servicios', parent: 'operaciones' },
    { id: 'productos', label: 'Productos', parent: 'operaciones' },
    { id: 'membresias', label: 'Membresías', parent: 'operaciones' },

    { id: 'finanzas', label: 'Finanzas', icon: 'request_quote' },
    { id: 'proveedores', label: 'Proveedores', parent: 'finanzas' },

    { id: 'equipo', label: 'Equipo', icon: 'groups' },
    { id: 'miembros', label: 'Miembros y roles', parent: 'equipo' },
];

interface SimpleListManagerProps {
    title: string;
    items: ClientSource[];
    onSave: (item: ClientSource) => Promise<void> | void;
    onDelete: (id: number) => Promise<void> | void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const SimpleListManager: FC<SimpleListManagerProps> = ({ title, items, onSave, onDelete, requestConfirmation }) => {
    const [search, setSearch] = useState('');
    const [name, setName] = useState('');
    const [editing, setEditing] = useState<ClientSource | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

    const filteredItems = useMemo(() => {
        const term = search.trim().toLowerCase();
        return term.length === 0 ? items : items.filter(item => item.nombre.toLowerCase().includes(term));
    }, [items, search]);

    const resetForm = () => {
        setEditing(null);
        setName('');
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setFeedback({ kind: 'error', message: 'Ingresa un nombre válido.' });
            return;
        }

        setIsSaving(true);
        const payload: ClientSource = editing ? { ...editing, nombre: trimmed } : { id: Date.now(), nombre: trimmed };

        try {
            await Promise.resolve(onSave(payload));
            setFeedback({ kind: 'success', message: editing ? 'Origen actualizado.' : 'Origen registrado.' });
            resetForm();
        } catch (error) {
            console.error('Error guardando el origen de clientes:', error);
            setFeedback({ kind: 'error', message: 'No se pudo guardar, intenta de nuevo.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setFeedback(null), 2500);
        }
    };

    const handleDelete = (item: ClientSource) => {
        requestConfirmation(`¿Eliminar "${item.nombre}"?`, () => {
            Promise.resolve(onDelete(item.id)).catch(error => console.error('Error eliminando el origen de clientes:', error));
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border space-y-6">
            <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Origen</p>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
                    <div className="relative w-full max-w-xs">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">search</span>
                        <input
                            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 focus:border-[#aa632d] focus:outline-none"
                            placeholder="Buscar origen"
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                        />
                    </div>
                </div>
                <p className="text-sm text-slate-500">Mantén actualizadas las fuentes de donde llegan los leads.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="text"
                        placeholder="Nombre del origen"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-[#aa632d] focus:outline-none"
                    />
                    <div className="flex gap-2">
                        {editing && (
                            <button
                                type="button"
                                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                                onClick={resetForm}
                            >
                                Cancelar
                            </button>
                        )}
                        <button
                            type="submit"
                            className="rounded-2xl bg-[#aa632d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8e5225] disabled:opacity-50"
                            disabled={isSaving}
                        >
                            {editing ? 'Actualizar' : 'Agregar'}
                        </button>
                    </div>
                </div>
                {feedback && (
                    <p className={`text-sm font-semibold ${feedback.kind === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{feedback.message}</p>
                )}
            </form>

            <div className="grid gap-3 md:grid-cols-2">
                {filteredItems.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">Sin coincidencias</div>}
                {filteredItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{item.nombre}</p>
                            <p className="text-xs text-slate-400">ID #{item.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="rounded-2xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                                onClick={() => {
                                    setEditing(item);
                                    setName(item.nombre);
                                }}
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600"
                                onClick={() => handleDelete(item)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProductosSection: FC<{
    products: Product[];
    productCategories: ProductCategory[];
    productBrands: ProductBrand[];
    proveedores: Proveedor[];
    onSaveProduct: (product: Product) => void;
    onDeleteProduct: (id: number) => void;
    onSaveProductCategory: (category: ProductCategory) => void;
    onDeleteProductCategory: (id: number) => void;
    onSaveProductBrand: (brand: ProductBrand) => void;
    onDeleteProductBrand: (id: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}> = ({
    products,
    productCategories,
    productBrands,
    proveedores,
    onSaveProduct,
    onDeleteProduct,
    onSaveProductCategory,
    onDeleteProductCategory,
    onSaveProductBrand,
    onDeleteProductBrand,
    requestConfirmation,
}) => {
    const [activeTab, setActiveTab] = useState<'productos' | 'categorias' | 'marcas'>('productos');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState<ProductCategory | null>(null);
    const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
    const [editingMarca, setEditingMarca] = useState<ProductBrand | null>(null);
    const isCustomBrand = (brand: ProductBrand) => brand.id >= 0;

    const marcaOptions = useMemo(() => productBrands.map(brand => ({ label: brand.nombre, value: brand.nombre })), [productBrands]);
    const proveedorOptions = useMemo(() => proveedores.map(prov => ({ label: prov.nombre, value: prov.id })), [proveedores]);
    const proveedorLookup = useMemo(() => {
        const map: Record<number, string> = {};
        proveedores.forEach(prov => {
            map[prov.id] = prov.nombre;
        });
        return map;
    }, [proveedores]);

    const handleOpenProductModal = (product?: Product) => {
        if (product) {
            setEditingProduct({
                ...product,
                precioCoste: product.precioCoste ?? 0,
                precioTotal: product.precioTotal ?? product.precio,
            });
        } else {
            setEditingProduct({
                id: Date.now(),
                nombre: '',
                descripcion: '',
                categoria: productCategories[0]?.nombre ?? '',
                marca: productBrands[0]?.nombre ?? '',
                proveedorId: proveedores[0]?.id,
                unidadMedida: UNIDADES_MEDIDA[0],
                valorMedida: 1,
                precioCoste: 0,
                precioTotal: 0,
                precio: 0,
            });
        }
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
        requestConfirmation('¿Está seguro de eliminar este producto?', () => onDeleteProduct(id));
    };

    const handleOpenCategoriaModal = (category?: ProductCategory) => {
        setEditingCategoria(category ?? { id: Date.now(), nombre: '' });
        setIsCategoriaModalOpen(true);
    };

    const handleSaveCategoria = () => {
        if (!editingCategoria) return;
        onSaveProductCategory(editingCategoria);
        setIsCategoriaModalOpen(false);
        setEditingCategoria(null);
    };

    const handleDeleteCategoria = (id: number) => {
        requestConfirmation('¿Está seguro de eliminar esta categoría?', () => onDeleteProductCategory(id));
    };

    const handleOpenMarcaModal = (brand?: ProductBrand) => {
        if (brand && !isCustomBrand(brand)) {
            return;
        }
        setEditingMarca(brand ?? { id: Date.now(), nombre: '' });
        setIsMarcaModalOpen(true);
    };

    const handleSaveMarca = () => {
        if (!editingMarca) return;
        onSaveProductBrand(editingMarca);
        setIsMarcaModalOpen(false);
        setEditingMarca(null);
    };

    const handleDeleteMarca = (id: number) => {
        const targetBrand = productBrands.find(brand => brand.id === id);
        if (!targetBrand || !isCustomBrand(targetBrand)) return;
        requestConfirmation('¿Está seguro de eliminar esta marca?', () => onDeleteProductBrand(id));
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
                            onClick={() => handleOpenCategoriaModal()}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Categoría
                        </button>
                    )}
                    {activeTab === 'marcas' && (
                        <button
                            onClick={() => handleOpenMarcaModal()}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Marca
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
                        Categorías
                    </button>
                    <button
                        onClick={() => setActiveTab('marcas')}
                        className={`${activeTab === 'marcas' ? 'border-[#aa632d] text-[#aa632d]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Marcas
                    </button>
                </nav>
            </div>

            {activeTab === 'productos' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Producto</th>
                                <th className="text-left p-2">Categoría</th>
                                <th className="text-left p-2">Marca</th>
                                <th className="text-left p-2">Medida</th>
                                <th className="text-left p-2">Proveedor</th>
                                <th className="text-left p-2">Precio Coste</th>
                                <th className="text-left p-2">Precio Total</th>
                                <th className="text-left p-2">Precio Venta</th>
                                <th className="text-left p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">
                                        <div className="font-medium text-gray-900">{product.nombre}</div>
                                        {product.descripcion && <div className="text-xs text-gray-500">{product.descripcion}</div>}
                                    </td>
                                    <td className="p-2">{product.categoria || 'Sin categoría'}</td>
                                    <td className="p-2">{product.marca || 'Sin marca'}</td>
                                    <td className="p-2">{product.valorMedida ?? 1} {product.unidadMedida}</td>
                                    <td className="p-2">{product.proveedorId ? proveedorLookup[product.proveedorId] : 'Sin proveedor'}</td>
                                    <td className="p-2">S/ {(product.precioCoste ?? 0).toFixed(2)}</td>
                                    <td className="p-2">S/ {(product.precioTotal ?? 0).toFixed(2)}</td>
                                    <td className="p-2">
                                        {product.precio === 0 ? (
                                            <span className="text-green-600 font-medium">Gratis</span>
                                        ) : (
                                            `S/ ${(product.precio ?? 0).toFixed(2)}`
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
                            {productCategories.map(cat => (
                                <tr key={cat.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{cat.nombre}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenCategoriaModal(cat)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategoria(cat.id)}
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

            {activeTab === 'marcas' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Nombre de la Marca</th>
                                <th className="text-left p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productBrands.map(brand => {
                                const brandIsCustom = isCustomBrand(brand);
                                return (
                                    <tr key={brand.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">
                                            <div className="flex items-center gap-2">
                                                <span>{brand.nombre}</span>
                                                {!brandIsCustom && <span className="text-xs text-gray-400">(automática)</span>}
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenMarcaModal(brand)}
                                                    disabled={!brandIsCustom}
                                                    className={`text-blue-600 hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed`}
                                                    title={brandIsCustom ? 'Editar' : 'Marcas automáticas se generan desde los productos'}
                                                >
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMarca(brand.id)}
                                                    disabled={!brandIsCustom}
                                                    className={`text-red-600 hover:text-red-800 disabled:opacity-40 disabled:cursor-not-allowed`}
                                                    title={brandIsCustom ? 'Eliminar' : 'Marcas automáticas no se pueden eliminar'}
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <p className="text-xs text-gray-500 mt-3">Las marcas automáticas se generan desde los productos existentes. Las marcas personalizadas se guardan localmente en este navegador.</p>
                </div>
            )}

            {isProductModalOpen && editingProduct && (
                <CatalogFormModal
                    isOpen={isProductModalOpen}
                    onClose={handleCloseProductModal}
                    onSave={handleSaveProduct}
                    item={editingProduct}
                    title={editingProduct?.id && products.find(p => p.id === editingProduct.id) ? 'Editar Producto' : 'Añadir Producto'}
                    fields={[
                        { name: 'nombre', label: 'Nombre del producto', type: 'text', required: true },
                        { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
                        {
                            name: 'unidadMedida',
                            label: 'Tipo de medida',
                            type: 'select',
                            required: true,
                            options: UNIDADES_MEDIDA.map(unidad => ({ label: unidad, value: unidad })),
                        },
                        { name: 'valorMedida', label: 'Valor de la medida', type: 'number', required: true },
                        { name: 'precioCoste', label: 'Precio de coste', type: 'number', required: true },
                        { name: 'precioTotal', label: 'Precio total', type: 'number', required: true },
                        { name: 'precio', label: 'Precio de venta', type: 'number', required: true },
                        { name: 'categoria', label: 'Categoría', type: 'text', required: true },
                        {
                            name: 'marca',
                            label: 'Marca',
                            type: 'select',
                            required: true,
                            options: marcaOptions,
                            placeholder: productBrands.length ? 'Seleccionar marca' : 'Registra una marca primero',
                        },
                        {
                            name: 'proveedorId',
                            label: 'Proveedor',
                            type: 'select',
                            required: true,
                            options: proveedorOptions,
                            valueType: 'number',
                            placeholder: proveedores.length ? 'Seleccionar proveedor' : 'Registra un proveedor',
                        },
                    ]}
                    itemCategories={productCategories}
                    categoryField="categoria"
                />
            )}

            {isCategoriaModalOpen && editingCategoria && (
                <Modal
                    isOpen={isCategoriaModalOpen}
                    onClose={() => setIsCategoriaModalOpen(false)}
                    title={editingCategoria.id && productCategories.find(cat => cat.id === editingCategoria.id) ? 'Editar Categoría' : 'Añadir Categoría'}
                >
                    <div className="p-6 space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Categoría</label>
                        <input
                            type="text"
                            value={editingCategoria.nombre}
                            onChange={e => setEditingCategoria({ ...editingCategoria, nombre: e.target.value })}
                            className="w-full border-black bg-[#f9f9fa] rounded-md p-2"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsCategoriaModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                            <button onClick={handleSaveCategoria} className="px-4 py-2 bg-[#aa632d] text-white rounded-md">Guardar</button>
                        </div>
                    </div>
                </Modal>
            )}

            {isMarcaModalOpen && editingMarca && (
                <Modal
                    isOpen={isMarcaModalOpen}
                    onClose={() => setIsMarcaModalOpen(false)}
                    title={editingMarca.id && productBrands.find(brand => brand.id === editingMarca.id) ? 'Editar Marca' : 'Añadir Marca'}
                >
                    <div className="p-6 space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Marca</label>
                        <input
                            type="text"
                            value={editingMarca.nombre}
                            onChange={e => setEditingMarca({ ...editingMarca, nombre: e.target.value })}
                            className="w-full border-black bg-[#f9f9fa] rounded-md p-2"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsMarcaModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                            <button onClick={handleSaveMarca} className="px-4 py-2 bg-[#aa632d] text-white rounded-md">Guardar</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};


const MAX_LOGIN_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

const BusinessInfoSection: FC<{
    businessInfo: BusinessInfo;
    onSaveBusinessInfo: (info: BusinessInfo) => void;
}> = ({ businessInfo, onSaveBusinessInfo }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<BusinessInfo>(businessInfo);
    const [imageError, setImageError] = useState('');
    const [loginImageMode, setLoginImageMode] = useState<'file' | 'url'>('file');
    const loginImageInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setFormData(businessInfo);
        setImageError('');
    }, [businessInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'loginImageUrl') {
            setImageError('');
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const readFileAsDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleLoginImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setImageError('');
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImageError('Selecciona un archivo de imagen válido.');
            event.target.value = '';
            return;
        }

        if (file.size > MAX_LOGIN_IMAGE_BYTES) {
            setImageError('La imagen debe pesar menos de 2 MB.');
            event.target.value = '';
            return;
        }

        try {
            const dataUrl = await readFileAsDataUrl(file);
            setFormData(prev => ({ ...prev, loginImageUrl: dataUrl }));
        } catch (error) {
            console.error('No se pudo leer la imagen seleccionada', error);
            setImageError('Ocurrió un error al procesar la imagen. Intenta con otro archivo.');
        } finally {
            event.target.value = '';
        }
    };

    const handleRemoveLoginImage = () => {
        setFormData(prev => ({ ...prev, loginImageUrl: '' }));
        setImageError('');
        if (loginImageInputRef.current) {
            loginImageInputRef.current.value = '';
        }
    };

    const handleSave = () => {
        console.log('=== GUARDANDO BUSINESS INFO ===');
        console.log('formData:', formData);
        console.log('loginImageUrl:', formData.loginImageUrl);
        console.log('imageError:', imageError);
        if (imageError) {
            console.log('Abortando: hay error de imagen');
            return;
        }
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Login</label>
                            <div className="flex gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginImageMode('file');
                                        setImageError('');
                                    }}
                                    className={`px-3 py-1 rounded-full border ${loginImageMode === 'file' ? 'bg-[#aa632d] text-white border-[#aa632d]' : 'text-gray-600 border-gray-300 hover:border-gray-400'}`}
                                >
                                    Importar imagen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginImageMode('url');
                                        setImageError('');
                                    }}
                                    className={`px-3 py-1 rounded-full border ${loginImageMode === 'url' ? 'bg-[#374151] text-white border-[#374151]' : 'text-gray-600 border-gray-300 hover:border-gray-400'}`}
                                >
                                    Usar enlace
                                </button>
                            </div>
                            <input
                                ref={loginImageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLoginImageUpload}
                                className="hidden"
                                style={{ display: 'none' }}
                            />
                            {loginImageMode === 'file' ? (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            type="button"
                                            onClick={() => loginImageInputRef.current?.click()}
                                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] w-full sm:w-auto"
                                        >
                                            {formData.loginImageUrl ? 'Cambiar imagen' : 'Seleccionar archivo'}
                                        </button>
                                        <p className="text-xs text-gray-500">Formatos permitidos: JPG, PNG, WEBP. Máximo 2 MB.</p>
                                        {imageError && <p className="text-xs text-red-600">{imageError}</p>}
                                    </div>
                                    {formData.loginImageUrl && (
                                        <div className="relative">
                                            <img
                                                src={formData.loginImageUrl}
                                                alt="Vista previa login"
                                                className="h-28 w-40 object-cover rounded-md border"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveLoginImage}
                                                className="absolute -top-2 -right-2 bg-white text-red-600 border border-red-200 rounded-full p-1 shadow"
                                                aria-label="Eliminar imagen"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-3">
                                    <input
                                        type="url"
                                        name="loginImageUrl"
                                        value={formData.loginImageUrl || ''}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="w-full border-black bg-[#f9f9fa] rounded-md p-2"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Pega la URL de la imagen alojada. Usa esta opción solo si tu archivo ya está hospedado.</p>
                                </div>
                            )}
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
                    productBrands={props.productBrands}
                    proveedores={props.proveedores}
                    onSaveProduct={props.onSaveProduct}
                    onDeleteProduct={props.onDeleteProduct}
                    onSaveProductCategory={props.onSaveProductCategory}
                    onDeleteProductCategory={props.onDeleteProductCategory}
                    onSaveProductBrand={props.onSaveProductBrand}
                    onDeleteProductBrand={props.onDeleteProductBrand}
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
                    onImportLeads={props.onImportLeads}
                    onImportVentasExtra={props.onImportVentasExtra}
                    onImportIncidencias={props.onImportIncidencias}
                    onImportEgresos={props.onImportEgresos}
                    onImportProveedores={props.onImportProveedores}
                    onImportPublicaciones={props.onImportPublicaciones}
                    onImportSeguidores={props.onImportSeguidores}
                    onImportComprobantes={props.onImportComprobantes}
                    onImportServices={props.onImportServices}
                    onImportProducts={props.onImportProducts}
                    onImportMemberships={props.onImportMemberships}
                    onImportServiceCategories={props.onImportServiceCategories}
                    onImportProductCategories={props.onImportProductCategories}
                    onImportEgresoCategories={props.onImportEgresoCategories}
                    onImportJobPositions={props.onImportJobPositions}
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