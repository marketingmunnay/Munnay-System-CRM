
import React, { useState, useEffect } from 'react';
import type { Goal, Personal } from '../../types.ts';
import { GoalArea, GoalUnit, GoalObjective } from '../../types.ts';
import Modal from '../shared/Modal.tsx';

interface GoalFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Goal) => void;
    goal: Goal | null;
}

const PERSONAL_OPTIONS: Personal[] = ['Vanesa', 'Elvira', 'Janela', 'Liz', 'Keila', 'Luz', 'Dra. Marilia', 'Dra. Sofía', 'Dr. Carlos'];

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const GoalFormModal: React.FC<GoalFormModalProps> = ({ isOpen, onClose, onSave, goal }) => {
    const [formData, setFormData] = useState<Partial<Goal>>({});

    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            setFormData(goal ? { ...goal } : {
                id: Date.now(),
                name: '',
                area: GoalArea.Comercial,
                objective: GoalObjective.Leads,
                value: 0,
                unit: GoalUnit.Cantidad,
                personal: undefined,
                startDate: today,
                endDate: today,
            });
        }
    }, [goal, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let finalValue: string | number | undefined = value;
        if (type === 'number') {
            finalValue = Number(value);
        }
        if (name === 'personal' && value === '') {
            finalValue = undefined;
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim() || !formData.area || !formData.startDate || !formData.endDate) {
            alert('Nombre, área, fecha de inicio y fecha de fin son requeridos.');
            return;
        }
        onSave(formData as Goal);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={goal ? 'Editar Meta' : 'Crear Nueva Meta'}
            maxWidthClass="max-w-lg"
            footer={
                <div className="space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]">Guardar Meta</button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Meta</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        placeholder="Ej: Aumentar leads de Instagram"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                            style={{ colorScheme: 'light' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                            style={{ colorScheme: 'light' }}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700">Área</label>
                        <select
                            id="area"
                            name="area"
                            value={formData.area || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        >
                            {Object.values(GoalArea).map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="personal" className="block text-sm font-medium text-gray-700">Personal Asignado (Opcional)</label>
                        <select
                            id="personal"
                            name="personal"
                            value={formData.personal || ''}
                            onChange={handleChange}
                            className="mt-1 w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        >
                            <option value="">General</option>
                            {PERSONAL_OPTIONS.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="objective" className="block text-sm font-medium text-gray-700">Objetivo a Medir</label>
                    <select
                        id="objective"
                        name="objective"
                        value={formData.objective || ''}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                    >
                        {Object.values(GoalObjective).map(obj => (
                            <option key={obj} value={obj}>{obj}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valor Objetivo</label>
                        <input
                            type="number"
                            id="value"
                            name="value"
                            value={formData.value || 0}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        />
                    </div>
                    <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unidad</label>
                        <select
                            id="unit"
                            name="unit"
                            value={formData.unit || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        >
                            <option value={GoalUnit.Cantidad}>Cantidad</option>
                            <option value={GoalUnit.Porcentaje}>Porcentaje (%)</option>
                        </select>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default GoalFormModal;
