import React, { useState, useMemo } from 'react';
import type { User, Role, Lead, Goal } from '../../types.ts';
import PerfilEmpleadoDetalle from './PerfilEmpleadoModal.tsx';

const GoogleIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface RecursosHumanosPageProps {
    users: User[];
    roles: Role[];
    leads: Lead[];
    goals: Goal[];
    currentUser: User | null;
}

const RecursosHumanosPage: React.FC<RecursosHumanosPageProps> = ({ users, roles, leads, goals, currentUser }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
    };
    
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    }, []);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <p className="text-sm text-gray-500">Recursos Humanos &gt; Perfiles de Equipo</p>
                <h1 className="text-2xl font-bold text-black">{greeting}, {currentUser?.nombres}!</h1>
            </div>

            <div className="flex-grow flex space-x-6 overflow-hidden">
                {/* Team Members List */}
                <div className="w-1/3 bg-white p-6 rounded-xl shadow-md overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Miembros del Equipo</h3>
                    <div className="space-y-2">
                        {users.map(user => {
                            const role = roles.find(r => r.id === user.rolId);
                            const isSelected = selectedUser?.id === user.id;
                            return (
                                <div 
                                    key={user.id} 
                                    className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-orange-100' : 'hover:bg-gray-50'}`}
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <img src={user.avatarUrl} alt={user.nombres} className="w-12 h-12 rounded-full" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-gray-900">{user.nombres} {user.apellidos}</p>
                                        <p className="text-xs text-gray-500">{user.position || role?.nombre}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Profile Detail View */}
                <div className="w-2/3 bg-white rounded-xl shadow-md overflow-y-auto">
                    {selectedUser ? (
                        <PerfilEmpleadoDetalle
                            user={selectedUser}
                            role={roles.find(r => r.id === selectedUser.rolId)}
                            leads={leads}
                            goals={goals}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                             <GoogleIcon name="person_search" className="text-6xl text-gray-300 mb-4"/>
                            <h3 className="text-lg font-semibold">Selecciona un miembro del equipo</h3>
                            <p>Haz clic en un miembro de la lista para ver su perfil y progreso.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecursosHumanosPage;