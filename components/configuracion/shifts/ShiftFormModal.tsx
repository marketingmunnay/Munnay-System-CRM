import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock } from 'lucide-react';

interface TimeBlock {
    id: string;
    start: string;
    end: string;
}

interface ShiftFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialDate: Date | null;
    initialBlocks?: TimeBlock[]; // Array of { start: "HH:mm", end: "HH:mm" }
    userId: number | null;
    userName: string;
    location: string;
}

const ShiftFormModal: React.FC<ShiftFormModalProps> = ({ isOpen, onClose, onSave, initialDate, initialBlocks, userId, userName, location: initialLocation }) => {
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const [location, setLocation] = useState(initialLocation || 'Principal');
    const [note, setNote] = useState('');
    const [selectedDate, setSelectedDate] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
             setBlocks(initialBlocks || [{ id: Date.now().toString(), start: '09:00', end: '13:00' }]);
             setLocation(initialLocation || 'Principal');
             
             if (initialDate) {
                 // Format as YYYY-MM-DD for input
                 const yyyy = initialDate.getFullYear();
                 const mm = String(initialDate.getMonth() + 1).padStart(2, '0');
                 const dd = String(initialDate.getDate()).padStart(2, '0');
                 setSelectedDate(`${yyyy}-${mm}-${dd}`);
             } else {
                 setSelectedDate('');
             }
        }
    }, [isOpen, initialBlocks, initialLocation, initialDate]);

    const addBlock = () => {
        setBlocks([...blocks, { id: Date.now().toString(), start: '14:00', end: '18:00' }]);
    };


    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlock = (id: string, field: 'start' | 'end', value: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const calculateTotalHours = () => {
        let totalMinutes = 0;
        blocks.forEach(block => {
            if (!block.start || !block.end) return;
            const start = new Date(`2000-01-01T${block.start}`);
            const end = new Date(`2000-01-01T${block.end}`);
            if (end > start) {
                totalMinutes += (end.getTime() - start.getTime()) / 60000;
            }
        });
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate) {
            alert("Por favor seleccione una fecha");
            return;
        }
        // Send date string directly "YYYY-MM-DD" to avoid timezone issues
        onSave({ userId, date: selectedDate, timeBlocks: blocks, location, note });
        onClose();
    };

    if (!isOpen) return null;

    // Generate 5-minute interval options
    const timeOptions = [];
    for (let i = 0; i < 24 * 60; i += 5) {
        const h = Math.floor(i / 60).toString().padStart(2, '0');
        const m = (i % 60).toString().padStart(2, '0');
        timeOptions.push(`${h}:${m}`);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Editar Turno</h3>
                        <p className="text-sm text-gray-500">{userName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                        <input 
                            type="date"
                            required
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full border rounded-md p-2 bg-gray-50 text-sm"
                            // If initialDate was provided (editing existing), maybe disable? 
                            // But allowing change is flexible.
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación / Centro</label>
                        <select 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border rounded-md p-2 bg-gray-50 text-sm"
                        >
                            <option value="Principal">Sede Principal</option>
                            <option value="Secundaria">Sede Secundaria</option>
                            <option value="Remoto">Remoto</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Bloques Horarios</label>
                        {blocks.map((block, index) => (
                            <div key={block.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border">
                                <div className="flex-1 relative">
                                    <Clock size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select 
                                        value={block.start}
                                        onChange={(e) => updateBlock(block.id, 'start', e.target.value)}
                                        className="w-full pl-7 p-1 border rounded text-sm focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        {timeOptions.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <span className="text-gray-400">-</span>
                                <div className="flex-1 relative">
                                    <select 
                                        value={block.end}
                                        onChange={(e) => updateBlock(block.id, 'end', e.target.value)}
                                        className="w-full p-1 border rounded text-sm focus:ring-purple-500 focus:border-purple-500"
                                    >
                                         {timeOptions.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeBlock(block.id)}
                                    className="text-red-400 hover:text-red-600 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button 
                        type="button" 
                        onClick={addBlock}
                        className="flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                        <Plus size={16} className="mr-1" /> Añadir bloque
                    </button>

                    <div className="pt-2 border-t flex justify-between items-center">
                         <span className="text-sm text-gray-600">Total Horas:</span>
                         <span className="font-bold text-gray-800 text-lg">{calculateTotalHours()}</span>
                    </div>

                    <div className="pt-2">
                        <textarea 
                            placeholder="Notas opcionales..." 
                            className="w-full border rounded-md p-2 text-sm h-16"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
                        >
                            Guardar Turno
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShiftFormModal;
