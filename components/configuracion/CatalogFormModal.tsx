import React, { useState, useEffect, FC } from 'react';
import Modal from '../shared/Modal';

interface CatalogField {
    name: keyof any;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select';
    required?: boolean;
    options?: { label: string; value: string | number }[];
    valueType?: 'string' | 'number';
    placeholder?: string;
}

interface CatalogFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: any) => void;
    item: any | null;
    title: string;
    fields: CatalogField[];
    itemCategories?: { id: number, nombre: string }[];
    categoryField?: string;
}

const CatalogFormModal: FC<CatalogFormModalProps> = ({ isOpen, onClose, onSave, item, title, fields, itemCategories, categoryField }) => {
    const [formData, setFormData] = useState<any>(item || {});

    useEffect(() => {
        setFormData(item || {});
    }, [item]);

    const handleFieldChange = (field: CatalogField, rawValue: string) => {
        const shouldCastNumber = field.type === 'number' || field.valueType === 'number';
        const parsedValue = shouldCastNumber && rawValue !== '' ? Number(rawValue) : rawValue;
        setFormData(prev => ({ ...prev, [field.name]: parsedValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        for (const field of fields) {
            if (field.required) {
                const value = formData[field.name];
                
                // Para campos numéricos, permitir 0 como valor válido
                if (field.type === 'number') {
                    if (value === null || value === undefined || value === '') {
                        alert(`El campo "${field.label}" es obligatorio.`);
                        return;
                    }
                } else {
                    // Para campos de texto, verificar que no esté vacío
                    if (!value || String(value).trim() === '') {
                        alert(`El campo "${field.label}" es obligatorio.`);
                        return;
                    }
                }
            }
        }
        onSave(formData);
    };

    return (
        <Modal 
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidthClass="max-w-md"
            footer={
                <div className="space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" form="catalog-form" className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]">Guardar</button>
                </div>
            }
        >
            <form id="catalog-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                {fields.map(field => {
                    const fieldName = String(field.name);
                    const value = formData[field.name] ?? '';
                    const isCategorySelect = field.name === categoryField && itemCategories;

                    return (
                        <div key={fieldName}>
                            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {isCategorySelect ? (
                                <select
                                    id={fieldName}
                                    name={fieldName}
                                    value={value}
                                    onChange={(e) => handleFieldChange(field, e.target.value)}
                                    required={field.required}
                                    className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"
                                >
                                    <option value="">Seleccionar...</option>
                                    {itemCategories!.map(cat => (
                                        <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                                    ))}
                                </select>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    id={fieldName}
                                    name={fieldName}
                                    value={value}
                                    onChange={(e) => handleFieldChange(field, e.target.value)}
                                    required={field.required}
                                    rows={3}
                                    className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    id={fieldName}
                                    name={fieldName}
                                    value={value}
                                    onChange={(e) => handleFieldChange(field, e.target.value)}
                                    required={field.required}
                                    className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"
                                >
                                    <option value="">{field.placeholder || 'Seleccionar...'}</option>
                                    {(field.options || []).map(option => (
                                        <option key={`${fieldName}-${option.value}`} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    id={fieldName}
                                    name={fieldName}
                                    value={value}
                                    onChange={(e) => handleFieldChange(field, e.target.value)}
                                    required={field.required}
                                    className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2"
                                />
                            )}
                        </div>
                    );
                })}
            </form>
        </Modal>
    );
};

export default CatalogFormModal;