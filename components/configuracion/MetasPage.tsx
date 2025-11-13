
import React, { useState, useMemo } from 'react';
import type { Goal, User } from '../../types.ts';
import { GoalArea } from '../../types.ts';
import GoalFormModal from './GoalFormModal.tsx';
import { PlusIcon } from '../shared/Icons.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface MetasPageProps {
    goals: Goal[];
    users: User[];
    onSaveGoal: (goal: Goal) => void;
    onDeleteGoal: (goalId: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const MetasPage: React.FC<MetasPageProps> = ({ goals, users, onSaveGoal, onDeleteGoal, requestConfirmation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const groupedGoals = useMemo(() => {
        return goals.reduce((acc, goal) => {
            (acc[goal.area] = acc[goal.area] || []).push(goal);
            return acc;
        }, {} as Record<GoalArea, Goal[]>);
    }, [goals]);

    const handleAddGoal = () => {
        setEditingGoal(null);
        setIsModalOpen(true);
    };
    
    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleSaveAndClose = (goal: Goal) => {
        onSaveGoal(goal);
        setIsModalOpen(false);
    };
    
    const handleDeleteGoalWithConfirmation = (goal: Goal) => {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar la meta "${goal.name}"?`,
            () => onDeleteGoal(goal.id)
        );
    };

    const areaIcons: Record<GoalArea, string> = {
        [GoalArea.Comercial]: 'campaign',
        [GoalArea.Administracion]: 'admin_panel_settings',
        [GoalArea.Recepcion]: 'support_agent',
        [GoalArea.Procedimientos]: 'medical_services',
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-black">Metas y Objetivos</h2>
                <button
                    onClick={handleAddGoal}
                    className="flex items-center justify-center bg-[#aa632d] text-white px-8 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                >
                    <PlusIcon className="mr-1 h-4 w-4"/>
                    Crear Nueva Meta
                </button>
            </div>

            <div className="space-y-6">
                {Object.values(GoalArea).map(area => (
                    <div key={area}>
                        <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                             <GoogleIcon name={areaIcons[area]} className="mr-2 text-gray-500" />
                             {area}
                        </h3>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="p-2">Nombre de la Meta</th>
                                        <th className="p-2">Objetivo Medido</th>
                                        <th className="p-2">Personal Asignado</th>
                                        <th className="p-2">Periodo</th>
                                        <th className="p-2">Valor</th>
                                        <th className="p-2 w-28">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(groupedGoals[area] || []).map(goal => (
                                        <tr key={goal.id} className="border-b last:border-b-0">
                                            <td className="p-2 font-medium text-black">{goal.name}</td>
                                            <td className="p-2 text-gray-600">{goal.objective}</td>
                                            <td className="p-2 text-gray-600">{goal.personal || 'General'}</td>
                                            <td className="p-2 text-gray-600">
                                                {new Date(goal.startDate + 'T00:00:00').toLocaleDateString('es-PE')} - {new Date(goal.endDate + 'T00:00:00').toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="p-2 text-black font-semibold">
                                                {goal.value.toLocaleString('es-PE')} {goal.unit === 'porcentaje' ? '%' : ''}
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => handleEditGoal(goal)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                                                        <GoogleIcon name="edit" className="text-lg" />
                                                    </button>
                                                    <button onClick={() => handleDeleteGoalWithConfirmation(goal)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar">
                                                        <GoogleIcon name="delete" className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                     {(!groupedGoals[area] || groupedGoals[area].length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="text-center p-4 text-gray-500">No hay metas definidas para esta área.</td>
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