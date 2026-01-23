import React, { useState, useEffect } from 'react';
import Modal from '../../shared/Modal';
import { Search } from 'lucide-react';

interface User {
    id: number;
    nombres: string;
    apellidos: string;
    avatarUrl?: string;
    role?: any;
}

interface TeamSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableUsers: User[];
    selectedUserIds: number[];
    onSave: (ids: number[]) => void;
}

const TeamSelectionModal: React.FC<TeamSelectionModalProps> = ({ isOpen, onClose, availableUsers, selectedUserIds, onSave }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelected, setTempSelected] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            setTempSelected(selectedUserIds);
            setSearchTerm('');
        }
    }, [isOpen, selectedUserIds]);

    const filteredUsers = availableUsers.filter(u => 
        u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUser = (id: number) => {
        setTempSelected(prev => 
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        onSave(tempSelected);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Seleccionar miembros del equipo"
        >
            <div className="p-6">
                <p className="text-sm text-gray-500 mb-4">
                    Selecciona qué miembros del equipo pueden recibir turnos en esta ubicación.
                </p>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar miembro..."
                        className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {filteredUsers.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-4">No se encontraron usuarios</p>
                    ) : (
                        filteredUsers.map(user => (
                            <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                    checked={tempSelected.includes(user.id)}
                                    onChange={() => toggleUser(user.id)}
                                />
                                <div className="ml-3 flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold mr-2">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                                        ) : (
                                            `${user.nombres[0]}${user.apellidos[0]}`
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {user.nombres} {user.apellidos}
                                    </span>
                                </div>
                            </label>
                        ))
                    )}
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default TeamSelectionModal;
