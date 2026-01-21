import React, { useState } from 'react';
import { MoreHorizontal, Plus, Copy, Ban, Trash } from 'lucide-react';

interface ShiftCellProps {
    date: Date;
    shift?: any; // The shift object from DB
    userId: number;
    userName: string;
    onEdit: () => void;
    onDelete: () => void;
    onSetDayOff: () => void;
    onRecurring: () => void;
}

const ShiftCell: React.FC<ShiftCellProps> = ({ shift, onEdit, onDelete, onSetDayOff, onRecurring }) => {
    const [showMenu, setShowMenu] = useState(false);

    // Close menu on click outside could be handled by a global or overlay, 
    // but for simplicity we rely on mouse leave or direct interaction
    
    // Check if day off
    if (shift?.isDayOff) {
        return (
            <div 
                className="relative h-24 bg-gray-100 border border-gray-200 rounded-lg m-1 p-2 flex flex-col items-center justify-center group transition-all hover:shadow-md cursor-pointer"
                onMouseEnter={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(false)}
            >
                 <span className="text-gray-400 text-xs font-semibold text-center select-none">No trabaja</span>
                 {showMenu && (
                    <div className="absolute top-2 right-2">
                         <button onClick={onDelete} title="Limpiar" className="text-gray-400 hover:text-red-500">
                             <Trash size={14} />
                         </button>
                    </div>
                 )}
            </div>
        );
    }

    // Empty State
    if (!shift || !shift.timeBlocks || shift.timeBlocks.length === 0) {
        return (
            <div 
                className="relative h-24 bg-white border border-dashed border-gray-300 rounded-lg m-1 flex items-center justify-center group hover:bg-gray-50 transition-all cursor-pointer"
                onMouseEnter={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(false)}
            >
                {showMenu ? (
                    <button 
                         onClick={onEdit}
                         className="flex flex-col items-center text-purple-600 animate-fadeIn"
                    >
                        <Plus size={24} />
                        <span className="text-xs font-medium mt-1">Añadir</span>
                    </button>
                ) : (
                    <span className="text-gray-300 text-xs">Vacío</span>
                )}
            </div>
        );
    }

    // Active Shift State
    return (
        <div 
            className="relative h-24 bg-purple-50 border border-purple-100 rounded-lg m-1 p-2 group hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between"
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
        >
            <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                {shift.timeBlocks.map((block: any, idx: number) => (
                    <div key={idx} className="bg-white/80 text-purple-900 text-xs px-2 py-1 rounded shadow-sm text-center font-medium border border-purple-100">
                        {block.start} - {block.end}
                    </div>
                ))}
            </div>

            {/* Context Menu Trigger */}
            {showMenu && (
                <div className="absolute top-1 right-1 flex bg-white rounded-md shadow-md border p-0.5 z-10" onClick={e => e.stopPropagation()}>
                    <button onClick={onEdit} title="Editar" className="p-1 hover:bg-purple-100 rounded text-purple-700">
                         <Plus size={12} />
                    </button>
                    <button onClick={onRecurring} title="Repetir semanas futuras" className="p-1 hover:bg-blue-100 rounded text-blue-700">
                         <Copy size={12} />
                    </button>
                    <button onClick={onSetDayOff} title="Marcar día libre" className="p-1 hover:bg-orange-100 rounded text-orange-700">
                         <Ban size={12} />
                    </button>
                    <button onClick={onDelete} title="Eliminar" className="p-1 hover:bg-red-100 rounded text-red-700">
                         <Trash size={12} />
                    </button>
                </div>
            )}
            
            <div className="text-[10px] text-purple-400 text-center mt-1">
                {shift.location === 'Principal' ? 'Sede Princ.' : shift.location}
            </div>
        </div>
    );
};

export default ShiftCell;
