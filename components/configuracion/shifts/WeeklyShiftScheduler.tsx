import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter, Search, Users, RefreshCw } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import ShiftCell from './ShiftCell';
import ShiftFormModal from './ShiftFormModal';
import { apiRequest } from '../../../services/api'; 
// Assuming apiRequest helper exists, otherwise use fetch

const WeeklyShiftScheduler: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [shifts, setShifts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]); // Should fetch from API
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalData, setModalData] = useState<{ isOpen: boolean, userId: number | null, date: Date | null, shift: any | null }>({
        isOpen: false,
        userId: null,
        date: null,
        shift: null
    });

    // Calendar Range
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Users
            // This endpoint might need adjustment depending on your structure
            const usersRes = await apiRequest<any[]>('/amenities/roles/users?role=all', 'GET'); 
            // Mocking user fetch if endpoint differs:
            // const usersRes = [{id: 1, nombres: 'Juan', apellidos: 'Perez', avatarUrl: '', position: 'Medico'}, ...];
            
            // 2. Fetch Shifts
            const startStr = format(weekStart, 'yyyy-MM-dd');
            const endStr = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const shiftsRes = await apiRequest<any[]>(`/shifts?start=${startStr}&end=${endStr}`, 'GET');

            setShifts(shiftsRes || []);
            // Use API users or fallback if tool fails
            if (usersRes && Array.isArray(usersRes)) {
                 setUsers(usersRes);
            } else {
                 // Fallback fetch if specific endpoint fails
                 setUsers([]); 
            }
        } catch (error) {
            console.error("Failed to load schedule data", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load & On Date Change
    useEffect(() => {
        // We need to fetch real users. For now let's assume we fetch them.
        // In a real scenario, reuse your existing users hook or context.
        const loadUsersAndShifts = async () => {
             // Fetch users separately if needed, or rely on shifts include
             // For grid, we need ALL users, not just those with shifts.
             const allUsers = await apiRequest<any[]>('/users', 'GET'); // Generalized user endpoint
             setUsers(allUsers || []);
             
             const startStr = format(weekStart, 'yyyy-MM-dd');
             const endStr = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
             const shiftsRes = await apiRequest<any[]>(`/shifts?start=${startStr}&end=${endStr}`, 'GET');
             setShifts(shiftsRes || []);
             setLoading(false);
        };
        loadUsersAndShifts();
    }, [currentDate]);

    // Handlers
    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

    const handleSaveShift = async (data: any) => {
        try {
            await apiRequest('/shifts', 'POST', data);
            // Refresh
            const startStr = format(weekStart, 'yyyy-MM-dd');
            const endStr = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const shiftsRes = await apiRequest<any[]>(`/shifts?start=${startStr}&end=${endStr}`, 'GET');
            setShifts(shiftsRes || []);
        } catch (e) {
            console.error(e);
            alert("Error al guardar el turno");
        }
    };

    const handleDeleteShift = async (id: number) => {
        if (!confirm('¿Eliminar este turno?')) return;
        try {
            await apiRequest(`/shifts/${id}`, 'DELETE');
            setShifts(prev => prev.filter(s => s.id !== id));
        } catch (e) {
             console.error(e);
        }
    };

    const handleSetDayOff = async (userId: number, date: Date) => {
        // Quick act to set isDayOff = true
        await handleSaveShift({
            userId,
            date,
            isDayOff: true,
            timeBlocks: []
        });
    };

    const handleRecurring = async (userId: number, date: Date) => {
        const weeks = prompt("¿Repetir este turno para cuántas semanas futuras?", "4");
        if (!weeks) return;
        try {
            await apiRequest('/shifts/recurring', 'POST', {
                userId,
                sourceDate: date,
                weeksToRepeat: parseInt(weeks)
            });
            alert("Turnos generados correctamente.");
        } catch (e) {
            alert("Error al generar recurrencia");
        }
    };

    // Compute derived state
    const filteredUsers = users.filter(u => 
        (u.nombres + ' ' + u.apellidos).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.position || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getShiftForCell = (userId: number, date: Date) => {
        return shifts.find(s => s.userId === userId && isSameDay(new Date(s.date), date));
    };

    const getTotalHoursUser = (userId: number) => {
        // Calculate total hours for this user in the current view
        let totalMinutes = 0;
        shifts.filter(s => s.userId === userId).forEach(s => {
            if (s.isDayOff || !s.timeBlocks) return;
            s.timeBlocks.forEach((b: any) => {
                 const start = new Date(`2000-01-01T${b.start}`);
                 const end = new Date(`2000-01-01T${b.end}`);
                 if (end > start) totalMinutes += (end.getTime() - start.getTime()) / 60000;
            });
        });
        const h = Math.floor(totalMinutes / 60);
        return h;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
            {/* Header Control */}
            <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Calendar className="mr-2 text-purple-600" />
                        Turnos Programados
                    </h2>
                    <div className="flex bg-gray-100 rounded-lg p-1 items-center">
                        <button onClick={handlePrevWeek} className="p-1 hover:bg-white rounded-md transition-colors"><ChevronLeft size={20} /></button>
                        <div className="px-4 font-medium text-sm w-36 text-center">
                            {format(weekStart, 'd MMM', { locale: es })} - {format(endOfWeek(currentDate || new Date(), { weekStartsOn: 1 }), 'd MMM', { locale: es })}
                        </div>
                        <button onClick={handleNextWeek} className="p-1 hover:bg-white rounded-md transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar personal..." 
                            className="pl-9 pr-4 py-2 border rounded-full text-sm bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <button className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600">
                        <Filter size={16} />
                        <span>Filtrar Sede</span>
                     </button>
                     <button className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium shadow-sm">
                        <Users size={16} />
                        <span>Gestionar Equipo</span>
                     </button>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="flex-1 overflow-x-auto overflow-y-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-3 text-left w-64 border-r font-semibold text-gray-600 text-sm">Personal</th>
                            {weekDays.map((day, i) => (
                                <th key={i} className={`p-3 text-center border-b font-medium text-gray-600 w-32 ${isSameDay(day, new Date()) ? 'bg-purple-50 text-purple-700' : ''}`}>
                                    <div className="uppercase text-xs tracking-wider opacity-70">{format(day, 'EEE', { locale: es })}</div>
                                    <div className="text-lg">{format(day, 'd')}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={8} className="p-10 text-center text-gray-500">Cargando horario...</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-3 border-r bg-white sticky left-0 z-10 md:static">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200">
                                            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" /> : user.nombres.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">{user.nombres} {user.apellidos}</div>
                                            <div className="text-xs text-gray-500 flex items-center justify-between w-full">
                                                <span>{user.position || 'Personal'}</span> 
                                            </div>
                                            <div className="text-[10px] bg-gray-100 inline-block px-1.5 rounded mt-1 text-gray-600">
                                                {getTotalHoursUser(user.id)}h / semana
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                {weekDays.map((day, i) => {
                                    const shift = getShiftForCell(user.id, day);
                                    return (
                                        <td key={`${user.id}-${i}`} className="p-1 border-r border-gray-100 align-top h-28">
                                            <ShiftCell 
                                                date={day}
                                                userId={user.id}
                                                userName={user.nombres}
                                                shift={shift}
                                                onEdit={() => setModalData({ 
                                                    isOpen: true, 
                                                    userId: user.id, 
                                                    date: day,
                                                    shift: shift 
                                                })}
                                                onDelete={() => shift && handleDeleteShift(shift.id)}
                                                onSetDayOff={() => handleSetDayOff(user.id, day)}
                                                onRecurring={() => handleRecurring(user.id, day)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <ShiftFormModal 
                isOpen={modalData.isOpen}
                onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
                onSave={handleSaveShift}
                initialDate={modalData.date}
                userId={modalData.userId}
                userName={filteredUsers.find(u => u.id === modalData.userId)?.nombres || ''}
                initialBlocks={modalData.shift?.timeBlocks}
                location={modalData.shift?.location}
            />
        </div>
    );
};

export default WeeklyShiftScheduler;
