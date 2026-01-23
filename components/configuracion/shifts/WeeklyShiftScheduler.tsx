import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter, Search, Users, RefreshCw } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import ShiftCell from './ShiftCell';
import ShiftFormModal from './ShiftFormModal';
import TeamSelectionModal from './TeamSelectionModal';
import RecurringShiftModal from './RecurringShiftModal';
import { apiRequest } from '../../../services/api'; 
// Assuming apiRequest helper exists, otherwise use fetch

const WeeklyShiftScheduler: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [shifts, setShifts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]); // All fetched users
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals State
    const [modalData, setModalData] = useState<{ isOpen: boolean, userId: number | null, date: Date | null, shift: any | null }>({
        isOpen: false,
        userId: null,
        date: null,
        shift: null
    });
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [recurringModalData, setRecurringModalData] = useState<{ isOpen: boolean, userId: number | null, date: Date | null }>({
         isOpen: false,
         userId: null,
         date: null
    });

    // Persistent Settings
    const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);

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
            
            // 2. Fetch Shifts
            const startStr = format(weekStart, 'yyyy-MM-dd');
            const endStr = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const shiftsRes = await apiRequest<any[]>(`/shifts?start=${startStr}&end=${endStr}`, 'GET');

            setShifts(shiftsRes || []);
            
            if (usersRes && Array.isArray(usersRes)) {
                 setUsers(usersRes);
                 
                 // Initial load of selected IDs from localStorage if available, else all
                 const stored = localStorage.getItem('munnay_shift_team_ids');
                 if (stored) {
                     setSelectedTeamIds(JSON.parse(stored));
                 } else {
                     // Default to all users if none stored
                     setSelectedTeamIds(usersRes.map(u => u.id));
                 }

            } else {
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
        const loadUsersAndShifts = async () => {
             const allUsers = await apiRequest<any[]>('/amenities/roles/users?role=all', 'GET'); // Generalized user endpoint
             setUsers(allUsers || []);
             
             // Initial load of selected IDs from localStorage
             const stored = localStorage.getItem('munnay_shift_team_ids');
             if (stored) {
                 setSelectedTeamIds(JSON.parse(stored));
             } else if (allUsers && allUsers.length > 0) {
                 setSelectedTeamIds(allUsers.map((u: any) => u.id));
             }

             const startStr = format(weekStart, 'yyyy-MM-dd');
             const endStr = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
             const shiftsRes = await apiRequest<any[]>(`/shifts?start=${startStr}&end=${endStr}`, 'GET');
             setShifts(shiftsRes || []);
             setLoading(false);
        };
        loadUsersAndShifts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate]);

    const handleSaveTeamSelection = (ids: number[]) => {
        setSelectedTeamIds(ids);
        localStorage.setItem('munnay_shift_team_ids', JSON.stringify(ids));
    };

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
        setRecurringModalData({ isOpen: true, userId, date });
    };

    const handleSaveRecurring = async (data: any) => {
        try {
            await apiRequest('/shifts/recurring', 'POST', data);
            
            // Refresh shifts as many new ones were created
            const startStr = format(weekStart, 'yyyy-MM-dd');
            const endStr = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const shiftsRes = await apiRequest<any[]>(`/shifts?start=${startStr}&end=${endStr}`, 'GET');
            setShifts(shiftsRes || []);
            
            alert("Turnos generados correctamente.");
        } catch (e) {
            console.error(e);
            alert("Error al generar recurrencia");
        }
    };

    // Compute derived state
    const displayableUsers = users.filter(u => selectedTeamIds.includes(u.id));

    const filteredUsers = displayableUsers.filter(u => 
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
                        <div className="px-4 font-medium text-sm w-36 text-center capitalize">
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
                     <button 
                        onClick={() => setTeamModalOpen(true)}
                        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium shadow-sm"
                     >
                        <Users size={16} />
                        <span>Gestionar Equipo</span>
                     </button>
                </div>
            </div>

            {/* Subheader Filters */}
            <div className="px-6 py-2 bg-white border-b flex items-center">
                <div className="text-sm font-medium text-gray-700 mr-2">Miembro del equipo:</div>
                <button 
                    onClick={() => setTeamModalOpen(true)}
                    className="text-sm text-purple-600 font-semibold hover:underline"
                >
                    Cambiar
                </button>
                <div className="ml-8 flex space-x-8 text-xs text-gray-500">
                    {/* Add daily totals here if needed */}
                     {weekDays.map((day, i) => (
                        <div key={i} className="hidden">
                             {/* Placeholder for daily totals */}
                        </div>
                     ))}
                </div>
            </div>

            {/* Grid Principal */}
            <div className="flex-1 overflow-x-auto overflow-y-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                    <thead className="bg-white sticky top-0 z-10">
                        <tr>
                            <th className="p-4 text-left w-64 border-r border-b font-bold text-gray-900 text-sm">
                                {/* Empty header for user column */}
                            </th>
                            {weekDays.map((day, i) => (
                                <th key={i} className={`p-3 text-center border-b border-gray-100 font-medium text-gray-600 w-32 ${isSameDay(day, new Date()) ? 'bg-purple-50 text-purple-700' : ''}`}>
                                    <div className="capitalize text-sm font-bold">{format(day, 'EEE, d MMM', { locale: es })}</div>
                                    <div className="text-xs font-normal text-gray-400 mt-0.5">0 h</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={8} className="p-10 text-center text-gray-500">Cargando horario...</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 border-r border-gray-100 bg-white sticky left-0 z-10 md:static">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-white shadow-sm">
                                                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" /> : <span className="text-sm">{user.nombres.charAt(0)}{user.apellidos.charAt(0)}</span>}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{user.nombres} {user.apellidos}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {shifts.some(s => s.userId === user.id) ? 'Con turnos' : 'Sin turnos'}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setModalData({ isOpen: true, userId: user.id, date: null, shift: null })}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                        </button>
                                    </div>
                                </td>
                                {weekDays.map((day, i) => {
                                    const shift = getShiftForCell(user.id, day);
                                    return (
                                        <td key={`${user.id}-${i}`} className="p-1 border-r border-gray-100 align-top h-24">
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

            {/* Modals */}
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

            <TeamSelectionModal
                isOpen={teamModalOpen}
                onClose={() => setTeamModalOpen(false)}
                availableUsers={users}
                selectedUserIds={selectedTeamIds}
                onSave={handleSaveTeamSelection}
            />

            {recurringModalData.isOpen && recurringModalData.userId && recurringModalData.date && (
                <RecurringShiftModal 
                    isOpen={recurringModalData.isOpen}
                    onClose={() => setRecurringModalData({ isOpen: false, userId: null, date: null })}
                    userId={recurringModalData.userId}
                    userName={users.find(u => u.id === recurringModalData.userId)?.nombres || ''}
                    startDate={recurringModalData.date}
                    onSave={handleSaveRecurring}
                />
            )}
        </div>
    );
};

export default WeeklyShiftScheduler;
