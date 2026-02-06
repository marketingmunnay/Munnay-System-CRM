import React, { useState, useMemo } from 'react';
import type { Goal, User } from '../../types.ts';
import { GoalArea, GoalAreaLabels, GoalObjectiveLabels, GoalPeriodLabels, GoalLevelLabels } from '../../types.ts';
import GoalFormModal from './GoalFormModal.tsx';
import { PlusIcon } from '../shared/Icons.tsx';
import { formatDateForDisplay } from '../../utils/time.ts';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface MetasPageProps {
    goals: Goal[];
    users: User[];
    onSaveGoal: (goal: Goal) => Promise<void> | void;
    onDeleteGoal: (goalId: number) => Promise<void> | void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const formatGoalValue = (goal: Goal): string => {
    const unit = goal.unit as string;
    if (unit === 'soles') {
        return `S/. ${goal.value.toLocaleString('es-PE')}`;
    }
    if (unit === 'porcentaje') {
        return `${goal.value}%`;
    }
    return goal.value.toLocaleString('es-PE');
};

const formatOptimo = (goal: Goal): string => {
    if (!goal.valueOptimo) return '—';
    const unit = goal.unit as string;
    if (unit === 'soles') {
        return `S/. ${goal.valueOptimo.toLocaleString('es-PE')}`;
    }
    if (unit === 'porcentaje') {
        return `${goal.valueOptimo}%`;
    }
    return goal.valueOptimo.toLocaleString('es-PE');
};

const MetasPage: React.FC<MetasPageProps> = ({ goals, users, onSaveGoal, onDeleteGoal, requestConfirmation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const groupedGoals = useMemo(() => {
        return goals.reduce((acc, goal) => {
            (acc[goal.area] = acc[goal.area] || []).push(goal);
            return acc;
        }, {} as Record<GoalArea, Goal[]>);
    }, [goals]);

    const handleAddGoal = () => { setEditingGoal(null); setIsModalOpen(true); };
    const handleEditGoal = (goal: Goal) => { setEditingGoal(goal); setIsModalOpen(true); };

    const handleSaveAndClose = async (goal: Goal) => {
        try {
            await Promise.resolve(onSaveGoal(goal));
            setIsModalOpen(false);
            setEditingGoal(null);
        } catch (error) {
            console.error('Error al guardar la meta:', error);
            alert('No se pudo guardar la meta. Inténtalo nuevamente.');
        }
    };

    const handleDeleteGoalWithConfirmation = (goal: Goal) => {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar la meta "${goal.name}"?`,
            () => {
                Promise.resolve(onDeleteGoal(goal.id)).catch(error => {
                    console.error('Error al eliminar la meta:', error);
                    alert('No se pudo eliminar la meta. Inténtalo nuevamente.');
                });
            }
        );
    };

    const areaIcons: Record<GoalArea, string> = {
        [GoalArea.Comercial]: 'campaign',
        [GoalArea.Administracion]: 'admin_panel_settings',
        [GoalArea.Recepcion]: 'support_agent',
        [GoalArea.Procedimientos]: 'medical_services',
        [GoalArea.Marketing]: 'trending_up',
        [GoalArea.Medico]: 'stethoscope',
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-black">Metas y Objetivos</h2>
                    <p className="text-sm text-slate-500 mt-1">Configura las metas de cada miembro del equipo. Puedes cambiarlas cuando quieras.</p>
                </div>
                <button onClick={handleAddGoal} className="flex items-center justify-center bg-[#aa632d] text-white px-8 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors">
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Crear Nueva Meta
                </button>
            </div>

            <div className="space-y-6">
                {(Object.values(GoalArea) as GoalArea[]).map(area => (
                    <div key={area}>
                        <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                            <GoogleIcon name={areaIcons[area]} className="mr-2 text-gray-500" />
                            {GoalAreaLabels[area]}
                            <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                {(groupedGoals[area] || []).length} metas
                            </span>
                        </h3>
                        <div className="bg-white p-3 rounded-lg shadow overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="text-left text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-1.5">Meta</th>
                                        <th className="px-2 py-1.5">Objetivo</th>
                                        <th className="px-2 py-1.5">Periodo</th>
                                        <th className="px-2 py-1.5">Nivel</th>
                                        <th className="px-2 py-1.5">Asignado a</th>
                                        <th className="px-2 py-1.5">Vigencia</th>
                                        <th className="px-2 py-1.5 text-right">Mínimo</th>
                                        <th className="px-2 py-1.5 text-right">Óptimo</th>
                                        <th className="px-2 py-1.5">Estado</th>
                                        <th className="px-2 py-1.5 w-20">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(groupedGoals[area] || []).map(goal => (
                                        <tr key={goal.id} className="border-b last:border-b-0 hover:bg-slate-50">
                                            <td className="px-2 py-2 font-medium text-black">{goal.name}</td>
                                            <td className="px-2 py-2 text-gray-600">{GoalObjectiveLabels[goal.objective] || goal.objective}</td>
                                            <td className="px-2 py-2">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                                                    {GoalPeriodLabels[goal.period] || goal.period || 'Mensual'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${goal.level === 'optimo' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    {GoalLevelLabels[goal.level] || goal.level || 'Mínimo'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2 text-gray-600">{goal.personal || 'General'}</td>
                                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">
                                                {goal.startDate ? formatDateForDisplay(goal.startDate) : '—'} — {goal.endDate ? formatDateForDisplay(goal.endDate) : '—'}
                                            </td>
                                            <td className="px-2 py-2 text-right font-semibold text-black">{formatGoalValue(goal)}</td>
                                            <td className="px-2 py-2 text-right font-semibold text-green-700">{formatOptimo(goal)}</td>
                                            <td className="px-2 py-2">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${goal.isActive !== false ? 'text-green-600' : 'text-slate-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${goal.isActive !== false ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                                    {goal.isActive !== false ? 'Activa' : 'Pausada'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="flex items-center space-x-1">
                                                    <button onClick={() => handleEditGoal(goal)} className="text-blue-600 hover:text-blue-800 p-0.5" title="Editar">
                                                        <GoogleIcon name="edit" className="text-base" />
                                                    </button>
                                                    <button onClick={() => handleDeleteGoalWithConfirmation(goal)} className="text-red-600 hover:text-red-800 p-0.5" title="Eliminar">
                                                        <GoogleIcon name="delete" className="text-base" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!groupedGoals[area] || groupedGoals[area].length === 0) && (
                                        <tr>
                                            <td colSpan={10} className="text-center py-3 text-gray-500">No hay metas definidas para esta área.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            <GoalFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAndClose}
                goal={editingGoal}
                users={users}
            />
        </div>
    );
};

export default MetasPage;
