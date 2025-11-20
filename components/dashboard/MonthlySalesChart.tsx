import React, { useState, useMemo } from 'react';
import type { Lead, VentaExtra } from '../../types.ts';
import { parseDate } from '../../utils/time.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlySalesChartProps {
    leads: Lead[];
    ventasExtra: VentaExtra[];
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ leads, ventasExtra }) => {
    const availableYears = useMemo(() => {
        const allYears = new Set<number>();
        ventasExtra.forEach(v => {
            const d = parseDate(v.fechaVenta) || new Date(v.fechaVenta);
            allYears.add(d.getUTCFullYear());
        });
        leads.forEach(l => {
            if (l.fechaHoraAgenda) {
                allYears.add(new Date(l.fechaHoraAgenda).getFullYear());
            }
        });

        if (allYears.size === 0) {
            return [new Date().getFullYear()];
        }
        return Array.from(allYears).sort((a, b) => b - a);
    }, [leads, ventasExtra]);

    const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);
    
    const chartData = useMemo(() => {
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            name: MONTH_NAMES[i],
            Ventas: 0,
        }));

        // Process Ventas Extra
        ventasExtra.forEach(v => {
            const ventaDate = parseDate(v.fechaVenta) || new Date(v.fechaVenta);
            if (ventaDate.getUTCFullYear() === selectedYear) {
                const month = ventaDate.getUTCMonth();
                monthlyData[month].Ventas += v.montoPagado;
            }
        });

        // Process Lead related sales (initial payment + treatment payments)
        leads.forEach(l => {
            if (l.fechaHoraAgenda) {
                const agendaDate = parseDate(l.fechaHoraAgenda) || new Date(l.fechaHoraAgenda);
                if (agendaDate.getUTCFullYear() === selectedYear) {
                    const month = agendaDate.getUTCMonth();
                    
                    // Add initial appointment fee
                    monthlyData[month].Ventas += l.montoPagado || 0;
                    
                    // Add treatment fees (assuming payment is made at time of appointment scheduling)
                    if (l.tratamientos) {
                        l.tratamientos.forEach(t => {
                            monthlyData[month].Ventas += t.montoPagado || 0;
                        });
                    }
                }
            }
        });

        return monthlyData;
    }, [leads, ventasExtra, selectedYear]);

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Total General de Ventas (Mes a Mes)</h3>
                <select 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                    className="border-gray-300 rounded-md shadow-sm text-sm p-2 focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value: number) => `S/${value/1000}k`} />
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                backdropFilter: 'blur(5px)',
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            }}
                            formatter={(value: number, name: string) => [`S/ ${value.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name]}
                            labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Line type="monotone" dataKey="Ventas" stroke="#aa632d" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlySalesChart;