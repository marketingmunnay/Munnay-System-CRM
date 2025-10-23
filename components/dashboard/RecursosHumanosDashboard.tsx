
import React, { useMemo } from 'react';
import type { User, Role, Goal } from '../../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const GoogleIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface RecursosHumanosDashboardProps {
    users: User[];
    roles: Role[];
    goals: Goal[];
}

const calculateAge = (birthDate?: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const calculateYearsOfService = (startDate?: string): number | null => {
    if (!startDate) return null;
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return diffYears;
}

const RecursosHumanosDashboard: React.FC<RecursosHumanosDashboardProps> = ({ users, roles, goals }) => {

    const stats = useMemo(() => {
        const totalEmployees = users.length;
        const maleCount = users.filter(u => u.sex === 'M').length;
        const femaleCount = users.filter(u => u.sex === 'F').length;

        const totalSalary = users.reduce((sum, u) => sum + (u.salary || 0), 0);
        const averageSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;

        const contractTypes = users.reduce((acc, user) => {
            const type = user.contractType || 'No especificado';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const contractTypeData = Object.entries(contractTypes).map(([name, value]) => ({ name, value }));

        const maritalStatus = users.reduce((acc, user) => {
            const status = user.maritalStatus || 'No especificado';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const maritalStatusData = Object.entries(maritalStatus).map(([name, value]) => ({ name, value }));

        const ageRanges = { '20-29': 0, '30-39': 0, '40-49': 0, '50+': 0 };
        users.forEach(user => {
            const age = calculateAge(user.birthDate);
            if (age) {
                if (age >= 20 && age <= 29) ageRanges['20-29']++;
                else if (age >= 30 && age <= 39) ageRanges['30-39']++;
                else if (age >= 40 && age <= 49) ageRanges['40-49']++;
                else if (age >= 50) ageRanges['50+']++;
            }
        });
        const ageRangeData = Object.entries(ageRanges).map(([name, value]) => ({ name, 'N° de trabajadores': value }));

        const serviceYearsRanges = { '0-1 años': 0, '2-4 años': 0, '5-9 años': 0, '10+ años': 0 };
        users.forEach(user => {
            const years = calculateYearsOfService(user.startDate);
            if (years !== null) {
                if (years <= 1) serviceYearsRanges['0-1 años']++;
                else if (years <= 4) serviceYearsRanges['2-4 años']++;
                else if (years <= 9) serviceYearsRanges['5-9 años']++;
                else serviceYearsRanges['10+ años']++;
            }
        });
        const serviceYearsData = Object.entries(serviceYearsRanges).map(([name, value]) => ({ name, 'colaboradores': value }));

        const employeeGoals = users.map(user => {
            const userGoals = goals.filter(g => g.personal === user.nombres);
            // This is a simplified metric, a real one would calculate progress
            return {
                name: `${user.nombres} ${user.apellidos}`,
                goalsMet: userGoals.length, // Mocking "met" as "assigned" for demo
                avatarUrl: user.avatarUrl,
            }
        }).sort((a, b) => b.goalsMet - a.goalsMet).slice(0, 5);
        
        const roleDistribution = roles.map((role, index) => {
            const count = users.filter(user => user.rolId === role.id).length;
            const percentage = totalEmployees > 0 ? (count / totalEmployees) * 100 : 0;
            const colors = ['bg-orange-500', 'bg-cyan-400', 'bg-blue-600'];
            return {
                name: role.nombre,
                percentage: percentage,
                color: colors[index % colors.length],
            };
        }).filter(r => r.percentage > 0);

        return { totalEmployees, maleCount, femaleCount, averageSalary, contractTypeData, maritalStatusData, ageRangeData, serviceYearsData, employeeGoals, roleDistribution };
    }, [users, roles, goals]);

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md col-span-full">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-700">
                        <GoogleIcon name="groups" className="text-xl mr-2" />
                        <h3 className="font-semibold">Total de Empleados</h3>
                    </div>
                </div>

                {/* Body */}
                <div className="flex justify-between items-end mt-4">
                    <div>
                        <span className="text-4xl font-bold text-black">{stats.totalEmployees}</span>
                        <span className="ml-2 text-3xl font-semibold text-gray-700">Empleados</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">From last year</span>
                        <span className="flex items-center bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full text-xs">
                            <GoogleIcon name="trending_up" className="text-sm mr-1"/>
                            4.35%
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex w-full h-2.5 rounded-full overflow-hidden mt-6 bg-gray-200">
                    {stats.roleDistribution.map(role => (
                        <div
                            key={role.name}
                            className={role.color}
                            style={{ width: `${role.percentage}%` }}
                            title={`${role.name} (${role.percentage.toFixed(0)}%)`}
                        ></div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-start space-x-6 mt-4 text-sm text-gray-600">
                    {stats.roleDistribution.map(role => (
                        <div key={role.name} className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${role.color}`}></span>
                            <span>{role.name} ({role.percentage.toFixed(0)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card de genero */}
                <div className="bg-white p-6 rounded-lg shadow col-span-1 flex items-center h-full">
                    <div className="text-left pr-4">
                        <h3 className="text-sm font-semibold text-gray-500 whitespace-nowrap mb-1">Colaboradores por género</h3>
                        <p className="text-5xl font-bold text-black">{stats.totalEmployees}</p>
                        <p className="text-xs text-gray-500 mt-1">Total de colaboradores</p>
                    </div>
                    <div className="border-l border-gray-200 h-20 mx-4"></div>
                    <div className="flex-grow flex justify-around">
                        <div className="text-center">
                            <GoogleIcon name="male" className="text-blue-500 text-4xl mx-auto"/>
                            <p className="font-bold text-2xl text-black mt-1">{stats.maleCount}</p>
                            <p className="text-xs text-gray-500">Hombres</p>
                        </div>
                        <div className="text-center">
                            <GoogleIcon name="female" className="text-pink-500 text-4xl mx-auto"/>
                            <p className="font-bold text-2xl text-black mt-1">{stats.femaleCount}</p>
                            <p className="text-xs text-gray-500">Mujeres</p>
                        </div>
                    </div>
                </div>

                {/* Card sueldo promedio */}
                <div className="bg-white p-6 rounded-lg shadow col-span-1 flex items-center space-x-6 h-full">
                    <GoogleIcon name="payments" className="text-green-500 text-5xl"/>
                    <div>
                         <h3 className="text-sm font-semibold text-gray-500">Sueldo Promedio</h3>
                         <p className="text-3xl font-bold text-black mt-1">
                            S/ {stats.averageSalary.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                         </p>
                    </div>
                </div>
                
                {/* Card condicion */}
                <div className="bg-white p-6 rounded-lg shadow col-span-1 h-full">
                     <h3 className="text-sm font-semibold text-gray-500 mb-4 flex items-center">
                        <GoogleIcon name="contract" className="text-lg mr-2 text-gray-500" />
                        Trabajadores por Condición
                     </h3>
                     <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.contractTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={35}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.contractTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="" />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-grow flex flex-col justify-center space-y-3">
                            {stats.contractTypeData.map((entry, index) => (
                                <div key={`legend-${index}`} className="flex items-center text-sm">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                                    <span className="text-gray-500 flex-grow">{entry.name}:</span>
                                    <span className="font-semibold text-black ml-2">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card estado civil */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <GoogleIcon name="favorite" className="text-xl mr-2 text-red-400" />
                        Trabajadores por Estado Civil
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats.maritalStatusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" name="N° de trabajadores" barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Card rango de edad */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <GoogleIcon name="cake" className="text-xl mr-2 text-pink-400" />
                        Trabajadores por Rango de Edad
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats.ageRangeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="N° de trabajadores" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card años de servicio */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <GoogleIcon name="hourglass_top" className="text-xl mr-2 text-blue-400" />
                        Colaboradores por Años de Servicio
                    </h3>
                     <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={stats.serviceYearsData}>
                             <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="name" />
                             <YAxis />
                             <Tooltip />
                             <Legend />
                             <Line type="monotone" dataKey="colaboradores" stroke="#ffc658" strokeWidth={2} />
                        </LineChart>
                     </ResponsiveContainer>
                </div>
                
                {/* Card top trabajadores */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <GoogleIcon name="emoji_events" className="text-xl mr-2 text-yellow-500" />
                        Top Colaboradores por Metas Cumplidas
                    </h3>
                    <div className="space-y-3">
                        {stats.employeeGoals.map((employee, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                                <span className="font-bold text-gray-400 text-lg w-5">{index + 1}</span>
                                <img src={employee.avatarUrl} alt={employee.name} className="w-9 h-9 rounded-full" />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-800">{employee.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600 text-lg">{employee.goalsMet}</p>
                                    <p className="text-xs text-gray-500">Metas</p>
                                </div>
                            </div>
                        ))}
                         {stats.employeeGoals.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No hay metas asignadas a colaboradores.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecursosHumanosDashboard;