import React, { useState, useEffect } from 'react';
import type { Goal, User } from '../../types.ts';
import { GoalArea, GoalUnit, GoalObjective, GoalAreaLabels, GoalObjectiveLabels, GoalPeriod, GoalPeriodLabels, GoalLevel, GoalLevelLabels } from '../../types.ts';
import Modal from '../shared/Modal.tsx';

interface GoalFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Goal) => void;
    goal: Goal | null;
    users: User[];
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const formatDateForInput = (date: string | Date | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string' && date.length === 10 && date.includes('-')) return date;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
};

const toIsoDateString = (value: string): string => {
    if (!value) return new Date().toISOString();
    if (value.includes('T')) return new Date(value).toISOString();
    return new Date(`${value}T00:00:00`).toISOString();
};

// Objetivos agrupados por área para facilitar la selección
const objectivesByArea: Record<GoalArea, GoalObjective[]> = {
    [GoalArea.Comercial]: [
        GoalObjective.VentasServicios, GoalObjective.VentasProductos,
        GoalObjective.Agendados, GoalObjective.Leads, GoalObjective.ConversionLeads,
        GoalObjective.EvaluacionesMedicas, GoalObjective.LimpiezaFacial,
        GoalObjective.Hydrafacial, GoalObjective.EvaluacionesEspecificas,
    ],
    [GoalArea.Recepcion]: [
        GoalObjective.PorcentajeCierre, GoalObjective.CantidadCierre,
        GoalObjective.PacientesDeudores, GoalObjective.PacientesNoCerraron,
        GoalObjective.MontoRecaudadoDia, GoalObjective.CierreEvaluaciones,
        GoalObjective.Recuperados,
    ],
    [GoalArea.Procedimientos]: [
        GoalObjective.EfectividadTratamientos, GoalObjective.EfectividadMotusAX,
        GoalObjective.EfectividadExionFace, GoalObjective.FidelizacionRetorno,
        GoalObjective.MantenimientoMotusAX, GoalObjective.SeguimientosCompletados,
        GoalObjective.LimpiezaFacial, GoalObjective.Hydrafacial,
    ],
    [GoalArea.Marketing]: [
        GoalObjective.Leads, GoalObjective.CostoPorResultado,
        GoalObjective.ViewsReelTiktok, GoalObjective.ViewsVideoTiktok,
        GoalObjective.VideoViralTiktok, GoalObjective.Seguidores,
        GoalObjective.Visualizaciones, GoalObjective.Alcance, GoalObjective.Engagement,
    ],
    [GoalArea.Medico]: [
        GoalObjective.EfectividadTratamientos, GoalObjective.VentasSkinCare,
    ],
    [GoalArea.Administracion]: [
        GoalObjective.RotacionPersonal, GoalObjective.NivelStock,
        GoalObjective.ROI,
    ],
};

const GoalFormModal: React.FC<GoalFormModalProps> = ({ isOpen, onClose, onSave, goal, users }) => {
    const [formData, setFormData] = useState<Partial<Goal>>({});

    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            if (goal) {
                setFormData({
                    ...goal,
                    startDate: formatDateForInput(goal.startDate),
                    endDate: formatDateForInput(goal.endDate),
                });
            } else {
                setFormData({
                    id: Date.now(),
                    name: '',
                    area: GoalArea.Comercial,
                    objective: GoalObjective.VentasServicios,
                    value: 0,
                    valueOptimo: undefined,
                    unit: GoalUnit.Soles,
                    personal: undefined,
                    userId: undefined,
                    startDate: today,
                    endDate: today,
                    period: GoalPeriod.Mensual,
                    level: GoalLevel.Minimo,
                    currency: 'PEN',
                    description: '',
                    isActive: true,
                });
            }
        }
    }, [goal, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let finalValue: any = value;
        if (type === 'number') finalValue = value === '' ? undefined : Number(value);
        if (name === 'personal' && value === '') finalValue = undefined;
        if (name === 'userId') finalValue = value === '' ? undefined : Number(value);
        if (name === 'isActive') finalValue = value === 'true';
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    // Cuando cambia el área, ajustar el objetivo al primero disponible
    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const area = e.target.value as GoalArea;
        const objectives = objectivesByArea[area] || [];
        setFormData(prev => ({
            ...prev,
            area,
            objective: objectives[0] || prev.objective,
        }));
    };

    // Cuando cambia el usuario asignado, sincronizar personal
    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value === '' ? undefined : Number(e.target.value);
        const user = users.find(u => u.id === userId);
        setFormData(prev => ({
            ...prev,
            userId,
            personal: user ? `${user.nombres} ${user.apellidos}`.trim() : undefined,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim() || !formData.area || !formData.startDate || !formData.endDate) {
            alert('Nombre, área, fecha de inicio y fecha de fin son requeridos.');
            return;
        }
        const payload: Goal = {
            ...(formData as Goal),
            startDate: toIsoDateString(formData.startDate as string),
            endDate: toIsoDateString(formData.endDate as string),
        };
        onSave(payload);
    };

    const availableObjectives = objectivesByArea[formData.area as GoalArea] || Object.values(GoalObjective);

    const inputClass = "mt-1 w-full border border-slate-300 bg-white rounded-xl shadow-sm text-sm p-2.5 text-slate-900 focus:ring-2 focus:ring-[#aa632d]/30 focus:border-[#aa632d] transition-colors";
    const labelClass = "block text-xs font-semibold text-slate-600 uppercase tracking-wide";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={goal ? 'Editar Meta' : 'Crear Nueva Meta'}
            maxWidthClass="max-w-2xl"
            footer={
                <div className="flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-semibold">Cancelar</button>
                    <button onClick={handleSubmit} className="px-5 py-2 bg-[#aa632d] text-white rounded-xl hover:bg-[#8e5225] text-sm font-semibold shadow">
                        <GoogleIcon name="save" className="text-base mr-1 align-middle" /> Guardar Meta
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Nombre */}
                <div>
                    <label htmlFor="name" className={labelClass}>Nombre de la Meta</label>
                    <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className={inputClass} placeholder="Ej: Ventas diarias Asesora Senior" />
                </div>

                {/* Descripción */}
                <div>
                    <label htmlFor="description" className={labelClass}>Descripción / Reglas</label>
                    <textarea id="description" name="description" rows={2} value={formData.description || ''} onChange={handleChange} className={inputClass} placeholder="Solo cuenta lo pagado efectivo del día. Productos + tratamientos." />
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className={labelClass}>Fecha Inicio</label>
                        <input type="date" id="startDate" name="startDate" value={formData.startDate ? formatDateForInput(formData.startDate) : ''} onChange={handleChange} required className={inputClass} style={{ colorScheme: 'light' }} />
                    </div>
                    <div>
                        <label htmlFor="endDate" className={labelClass}>Fecha Fin</label>
                        <input type="date" id="endDate" name="endDate" value={formData.endDate ? formatDateForInput(formData.endDate) : ''} onChange={handleChange} required className={inputClass} style={{ colorScheme: 'light' }} />
                    </div>
                </div>

                {/* Área + Objetivo */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="area" className={labelClass}>Área</label>
                        <select id="area" name="area" value={formData.area || ''} onChange={handleAreaChange} required className={inputClass}>
                            {(Object.values(GoalArea) as GoalArea[]).map(area => (
                                <option key={area} value={area}>{GoalAreaLabels[area]}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="objective" className={labelClass}>Objetivo a Medir</label>
                        <select id="objective" name="objective" value={formData.objective || ''} onChange={handleChange} required className={inputClass}>
                            {availableObjectives.map(obj => (
                                <option key={obj} value={obj}>{GoalObjectiveLabels[obj]}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Periodicidad + Nivel + Unidad */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="period" className={labelClass}>Periodo</label>
                        <select id="period" name="period" value={formData.period || GoalPeriod.Mensual} onChange={handleChange} className={inputClass}>
                            {(Object.values(GoalPeriod) as GoalPeriod[]).map(p => (
                                <option key={p} value={p}>{GoalPeriodLabels[p]}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="level" className={labelClass}>Nivel</label>
                        <select id="level" name="level" value={formData.level || GoalLevel.Minimo} onChange={handleChange} className={inputClass}>
                            {(Object.values(GoalLevel) as GoalLevel[]).map(l => (
                                <option key={l} value={l}>{GoalLevelLabels[l]}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="unit" className={labelClass}>Unidad</label>
                        <select id="unit" name="unit" value={formData.unit || ''} onChange={handleChange} required className={inputClass}>
                            <option value={GoalUnit.Cantidad}>Cantidad</option>
                            <option value={GoalUnit.Porcentaje}>Porcentaje (%)</option>
                            <option value={GoalUnit.Soles}>Soles (S/.)</option>
                        </select>
                    </div>
                </div>

                {/* Valores: Mínimo + Óptimo */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="value" className={labelClass}>
                            Valor Mínimo {formData.unit === GoalUnit.Soles ? '(S/.)' : formData.unit === GoalUnit.Porcentaje ? '(%)' : ''}
                        </label>
                        <input type="number" id="value" name="value" value={formData.value ?? ''} onChange={handleChange} required className={inputClass} min={0} step="any" />
                    </div>
                    <div>
                        <label htmlFor="valueOptimo" className={labelClass}>
                            Valor Óptimo (Bono) <span className="text-slate-400 normal-case font-normal">— opcional</span>
                        </label>
                        <input type="number" id="valueOptimo" name="valueOptimo" value={formData.valueOptimo ?? ''} onChange={handleChange} className={inputClass} min={0} step="any" placeholder="Ej: 52000" />
                    </div>
                </div>

                {/* Asignación de personal */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="userId" className={labelClass}>Asignar a Miembro</label>
                        <select id="userId" name="userId" value={formData.userId || ''} onChange={handleUserChange} className={inputClass}>
                            <option value="">— General (todo el equipo) —</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.nombres} {user.apellidos} · {user.position || 'Sin puesto'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="isActive" className={labelClass}>Estado</label>
                        <select id="isActive" name="isActive" value={String(formData.isActive ?? true)} onChange={handleChange} className={inputClass}>
                            <option value="true">✅ Activa</option>
                            <option value="false">⏸ Pausada</option>
                        </select>
                    </div>
                </div>

                {/* Info de contexto */}
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 space-y-1">
                    <p><strong>💡 Tip:</strong> Puedes cambiar estas metas cuando quieras desde Configuración sin tocar código.</p>
                    <p>El <strong>Valor Mínimo</strong> es la obligación base. El <strong>Valor Óptimo</strong> activa bonos.</p>
                    <p>Si seleccionas periodo "Diario", el progreso se mide cada día de forma independiente.</p>
                </div>
            </form>
        </Modal>
    );
};

export default GoalFormModal;
