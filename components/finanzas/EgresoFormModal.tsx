
import React, { useState, useEffect } from 'react';
import type { Egreso, Proveedor, EgresoCategory } from '../../types.ts';
import { TipoComprobante, ModoPagoEgreso, TipoComprobanteLabels } from '../../types.ts';
import Modal from '../shared/Modal.tsx';
import { TrashIcon } from '../shared/Icons.tsx';
import { formatDateForInput } from '../../utils/time';

interface EgresoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (egreso: Egreso) => void;
  onDelete: (egresoId: number) => void;
  egreso: Egreso | null;
  proveedores: Proveedor[];
  egresoCategories: EgresoCategory[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function EgresoFormModal({ isOpen, onClose, onSave, onDelete, egreso, proveedores, egresoCategories, requestConfirmation }: EgresoFormModalProps) {
  const [formData, setFormData] = useState<Partial<Egreso>>({});
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const MAX_ATTACHMENTS = 12; // allow up to 12 comprobantes

  // Filtrar proveedores según la categoría seleccionada - SOLO proveedores de esa categoría
  const filteredProveedores = formData.categoria 
    ? proveedores.filter(p => p.categoriaEgreso === formData.categoria)
    : proveedores;

  useEffect(() => {
        if (isOpen) {
        if (egreso) {
            setFormData({
                ...egreso,
                fechaRegistro: formatDateForInput(egreso.fechaRegistro),
                fechaPago: formatDateForInput(egreso.fechaPago),
                // Ensure backward compatibility: if old fotoUrl exists, map to comprobantes
                comprobantes: egreso.comprobantes || (egreso.fotoUrl ? [{ url: egreso.fotoUrl, mimeType: egreso.fotoMimeType, name: egreso.fotoName }] : [])
            });
        } else {
            setFormData({
                id: Date.now(),
                fechaRegistro: new Date().toISOString().split('T')[0],
                fechaPago: new Date().toISOString().split('T')[0],
                categoria: egresoCategories[0]?.nombre || '',
                tipoComprobante: TipoComprobante.SinComprobante,
                montoTotal: 0,
                montoPagado: 0,
                deuda: 0,
                tipoMoneda: 'Soles',
                comprobantes: []
            });
        }
    }
  }, [egreso, isOpen, egresoCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let newFormData = { ...formData, [name]: type === 'number' ? Number(value) : value };

    // Si cambia la categoría, resetear el proveedor si el actual no está en la nueva lista filtrada
    if (name === 'categoria' && formData.proveedor) {
        const proveedoresDisponibles = proveedores.filter(p => p.categoriaEgreso === value);
        const proveedorActualDisponible = proveedoresDisponibles.find(p => p.razonSocial === formData.proveedor);
        if (!proveedorActualDisponible) {
            newFormData.proveedor = '';
            newFormData.fechaPago = '';
        }
    }

    // Calcular automáticamente la fecha de pago cuando se selecciona un proveedor
    if (name === 'proveedor' && value) {
        const proveedorSeleccionado = proveedores.find(p => p.razonSocial === value);
        if (proveedorSeleccionado?.diasCredito && formData.fechaRegistro) {
            const fechaRegistro = new Date(formData.fechaRegistro);
            const fechaPago = new Date(fechaRegistro);
            fechaPago.setDate(fechaPago.getDate() + proveedorSeleccionado.diasCredito);
            newFormData.fechaPago = fechaPago.toISOString().split('T')[0];
        }
    }

    // Recalcular fecha de pago si cambia la fecha de registro y hay un proveedor seleccionado
    if (name === 'fechaRegistro' && formData.proveedor) {
        const proveedorSeleccionado = proveedores.find(p => p.razonSocial === formData.proveedor);
        if (proveedorSeleccionado?.diasCredito) {
            const fechaRegistro = new Date(value);
            const fechaPago = new Date(fechaRegistro);
            fechaPago.setDate(fechaPago.getDate() + proveedorSeleccionado.diasCredito);
            newFormData.fechaPago = fechaPago.toISOString().split('T')[0];
        }
    }

    if (name === 'montoTotal' || name === 'montoPagado') {
        const montoTotal = name === 'montoTotal' ? Number(value) : (newFormData.montoTotal || 0);
        const montoPagado = name === 'montoPagado' ? Number(value) : (newFormData.montoPagado || 0);
        newFormData.deuda = montoTotal - montoPagado;
    }

    setFormData(newFormData);
  };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Prepare list of files to upload, respecting MAX_ATTACHMENTS
        const existing = (formData.comprobantes || []);
        const availableSlots = Math.max(0, MAX_ATTACHMENTS - existing.length);
        const toProcess = Array.from(files).slice(0, availableSlots);

        if (toProcess.length === 0) {
            setUploadError(`Ya alcanzaste el límite de ${MAX_ATTACHMENTS} comprobantes.`);
            return;
        }

        setUploading(true);
        setUploadError(null);

        for (let i = 0; i < toProcess.length; i++) {
            const file = toProcess[i];
            let tempUrl: string | undefined;
            try {
                // Show immediate preview for images while uploading (append)
                if (file.type.startsWith('image/')) {
                    tempUrl = URL.createObjectURL(file);
                    setFormData(prev => ({ ...prev, comprobantes: [ ...(prev.comprobantes || []), { url: tempUrl, mimeType: file.type, name: file.name } ] }));
                } else {
                    setFormData(prev => ({ ...prev, comprobantes: [ ...(prev.comprobantes || []), { url: '', mimeType: file.type, name: file.name } ] }));
                }

                setUploadProgress(0);

                const fd = new FormData();
                fd.append('comprobante', file);

                // Use XMLHttpRequest to get progress events per-file
                const payload: any = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/expenses/upload');

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            setUploadProgress(percent);
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const json = JSON.parse(xhr.responseText);
                                resolve(json);
                            } catch (e) {
                                resolve({});
                            }
                        } else {
                            let msg = xhr.statusText || `Upload failed (${xhr.status})`;
                            try {
                                const err = JSON.parse(xhr.responseText || '{}');
                                msg = err.message || msg;
                            } catch {}
                            reject(new Error(msg));
                        }
                    };

                    xhr.onerror = () => reject(new Error('Network error during upload'));
                    xhr.onabort = () => reject(new Error('Upload aborted'));

                    xhr.send(fd);
                });

                // Replace temporary entry (with empty url) with final payload
                setFormData(prev => {
                    const prevList = prev.comprobantes || [];
                    // find first temporary entry matching name or empty url
                    const idx = prevList.findIndex(p => p.name === file.name && (!p.url || p.url === ''));
                    const newItem = { url: payload.url || '', mimeType: payload.mimeType || file.type, name: payload.name || file.name };
                    if (idx !== -1) {
                        const copy = [...prevList];
                        copy[idx] = newItem;
                        // also keep fotoUrl compatibility
                        return { ...prev, comprobantes: copy, fotoUrl: copy[0]?.url, fotoMimeType: copy[0]?.mimeType, fotoName: copy[0]?.name };
                    }
                    const copy = [...prevList, newItem];
                    return { ...prev, comprobantes: copy, fotoUrl: copy[0]?.url, fotoMimeType: copy[0]?.mimeType, fotoName: copy[0]?.name };
                });

            } catch (error) {
                const msg = (error as Error).message || 'Error uploading file';
                setUploadError(msg);
            } finally {
                setUploadProgress(null);
                try { if (tempUrl) URL.revokeObjectURL(tempUrl); } catch {}
            }
        }

        setUploading(false);
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proveedor || !formData.descripcion || !formData.montoTotal) {
      alert('Proveedor, Descripción y Monto Total son campos requeridos.');
      return;
    }
        onSave({ ...formData } as Egreso);
  };

   const handleDelete = () => {
    if (egreso && onDelete) {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar este egreso de ${egreso.proveedor}? Esta acción no se puede deshacer.`,
            () => {
                onDelete(egreso.id);
                onClose();
            }
        );
    }
  };
  
  const renderFormField = (label: string, name: keyof Egreso, type: string = 'text', options?: {value: string, label: string}[], required: boolean = false) => {
      if (type === 'date') {
        return (
            <div className="flex flex-col">
                <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={formatDateForInput(formData[name] as string) || ''}
                    onChange={handleChange}
                    required={required}
                    className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                    style={{ colorScheme: 'light' }}
                />
            </div>
        );
    }
    return (
     <div className="flex flex-col">
        <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        {type === 'select' ? (
          <select id={name} name={name} value={formData[name] as string || ''} onChange={handleChange} className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
            {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <input type={type} id={name} name={name} step={type === 'number' ? '0.01' : undefined} value={String(formData[name] ?? '')} onChange={handleChange} required={required} className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]" />
        )}
      </div>
  )};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={egreso ? 'Editar Egreso' : 'Registrar Nuevo Egreso'}
      maxWidthClass="max-w-4xl"
      footer={
        <div className="w-full flex justify-between items-center">
          {egreso && onDelete ? (
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
            <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] transition-colors">Guardar Egreso</button>
          </div>
        </div>
      }
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Información General</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {renderFormField('Fecha de Registro', 'fechaRegistro', 'date', [], true)}
                    <div className="flex flex-col">
                        <label htmlFor="fechaPago" className="mb-1 text-sm font-medium text-gray-700">
                            Fecha de Pago <span className="text-gray-400 text-xs">(Opcional)</span>
                            {formData.proveedor && proveedores.find(p => p.razonSocial === formData.proveedor)?.diasCredito && (
                                <span className="ml-2 text-xs text-green-600">
                                    <GoogleIcon name="schedule" className="text-xs" /> Auto-calculada
                                </span>
                            )}
                        </label>
                        <input
                            type="date"
                            id="fechaPago"
                            name="fechaPago"
                            value={formatDateForInput(formData.fechaPago) || ''}
                            onChange={handleChange}
                            className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                            style={{ colorScheme: 'light' }}
                        />
                        <p className="mt-1 text-xs text-gray-500">Se calcula automáticamente según días de crédito del proveedor</p>
                    </div>
                    
                    <div className="flex flex-col">
                        <label htmlFor="categoria" className="mb-1 text-sm font-medium text-gray-700">Categoría<span className="text-red-500">*</span></label>
                        <select id="categoria" name="categoria" value={formData.categoria || ''} onChange={handleChange} className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
                            {egresoCategories.map(cat => <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>)}
                        </select>
                    </div>
                    
                    <div className="flex flex-col">
                        <label htmlFor="proveedor" className="mb-1 text-sm font-medium text-gray-700">
                            Proveedor<span className="text-red-500">*</span>
                            {formData.categoria && filteredProveedores.length < proveedores.length && (
                                <span className="ml-2 text-xs text-blue-600">
                                    <GoogleIcon name="filter_alt" className="text-xs" /> Filtrado por categoría
                                </span>
                            )}
                        </label>
                        <select 
                            id="proveedor" 
                            name="proveedor" 
                            value={formData.proveedor || ''} 
                            onChange={handleChange} 
                            required
                            className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        >
                            <option value="">Seleccionar proveedor...</option>
                            {filteredProveedores.map(p => <option key={p.id} value={p.razonSocial}>{p.razonSocial}</option>)}
                        </select>
                        {filteredProveedores.length === 0 && formData.categoria && (
                            <p className="mt-1 text-xs text-orange-600">No hay proveedores con esta categoría</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="descripcion" className="mb-1 text-sm font-medium text-gray-700">Descripción<span className="text-red-500">*</span></label>
                        <textarea id="descripcion" name="descripcion" value={formData.descripcion || ''} onChange={handleChange} required rows={2} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="observaciones" className="mb-1 text-sm font-medium text-gray-700">Observaciones</label>
                        <textarea id="observaciones" name="observaciones" value={formData.observaciones || ''} onChange={handleChange} rows={2} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]" />
                    </div>
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Detalles del Comprobante</legend>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          {renderFormField('Tipo de Comprobante', 'tipoComprobante', 'select', Object.values(TipoComprobante).map(v => ({ value: v, label: TipoComprobanteLabels[v as TipoComprobante] || String(v)})))}
                    {renderFormField('Serie', 'serieComprobante')}
                    {renderFormField('Número', 'nComprobante')}
                 </div>
            </fieldset>

             <fieldset className="border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Información del Pago</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-2 items-end">
                    <div>
                        <label htmlFor="tipoMoneda" className="mb-1 text-sm font-medium text-gray-700">Moneda<span className="text-red-500">*</span></label>
                        <select id="tipoMoneda" name="tipoMoneda" value={formData.tipoMoneda || 'Soles'} onChange={handleChange} required className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]">
                            <option value="Soles">Soles (S/)</option>
                            <option value="Dólares">Dólares ($)</option>
                        </select>
                    </div>
                    {renderFormField('Monto Total', 'montoTotal', 'number', [], true)}
                    {renderFormField('Monto Pagado', 'montoPagado', 'number')}
                    <div>
                        <label htmlFor="deuda" className="mb-1 text-sm font-medium text-gray-700">Deuda</label>
                        <input type="number" id="deuda" name="deuda" value={formData.deuda || 0} readOnly className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 bg-gray-100 font-bold text-red-600"/>
                    </div>
                    {renderFormField('Modo de Pago', 'modoPago', 'select', Object.values(ModoPagoEgreso).map(v=>({value: v, label: v})))}
                 </div>
            </fieldset>
            
            <fieldset className="border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Adjunto</legend>
                 <div className="mt-2">
                    <label htmlFor="fotoUrl" className="mb-1 text-sm font-medium text-gray-700">Cargar Comprobante (PDF o imagen JPG/PNG)</label>
                     <input
                        type="file"
                        id="fotoUrl"
                        name="fotoUrl"
                        accept=".pdf,image/*,.jpg,.jpeg,.png,application/pdf"
                        onChange={handleFileChange}
                        multiple
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#aa632d] hover:file:bg-orange-100"
                    />
                    {uploading && (
                        <div className="mt-2">
                            <p className="text-sm text-blue-600">Subiendo comprobante...</p>
                            <div className="w-full bg-gray-200 rounded h-2 mt-1 overflow-hidden">
                                <div className="h-2 bg-[#aa632d]" style={{ width: `${uploadProgress ?? 0}%` }} />
                            </div>
                            {uploadProgress !== null && <p className="text-xs text-gray-600 mt-1">{uploadProgress}%</p>}
                        </div>
                    )}
                    {uploadError && (
                        <p className="text-sm text-red-600 mt-2">Error: {uploadError}</p>
                    )}
                     {formData.comprobantes && formData.comprobantes.length > 0 && (
                        <div className="mt-2 grid grid-cols-1 gap-2">
                            {formData.comprobantes.map((c, idx) => (
                                <div key={idx} className="flex items-center space-x-3">
                                    <div className="flex-1">
                                        {c.mimeType && c.mimeType.startsWith('image/') ? (
                                            <img src={c.url} alt={c.name || `Comprobante ${idx+1}`} className="max-h-32 rounded-md" />
                                        ) : c.mimeType === 'application/pdf' ? (
                                            <object data={c.url} type="application/pdf" width="100%" height={120} className="rounded-md border">
                                                <p className="text-sm">PDF no puede ser mostrado. <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Abrir comprobante</a></p>
                                            </object>
                                        ) : (
                                            <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{c.name || 'Abrir comprobante'}</a>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button type="button" onClick={() => {
                                            // remove attachment locally
                                            setFormData(prev => ({ ...prev, comprobantes: (prev.comprobantes || []).filter((_, i) => i !== idx), fotoUrl: (prev.comprobantes && prev.comprobantes[0] && idx === 0 ? (prev.comprobantes[1]?.url || '') : prev.fotoUrl) }));
                                        }} className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200">Eliminar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}
                 </div>
            </fieldset>

        </form>
      </div>
    </Modal>
  );
}