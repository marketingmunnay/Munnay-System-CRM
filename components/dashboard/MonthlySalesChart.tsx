import React, { useState, useMemo } from 'react';
import type { Lead, VentaExtra } from '../../types.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlySalesChartProps {
    leads: Lead[];
    ventasExtra: VentaExtra[];
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Munnay color palette constants for charts (Recharts requires hex values)
const CHART_COLORS = {
    grid: '#E7D2A0',      // munnay-200
    axis: '#AA632D',      // munnay-600
    primary: '#C88338',   // munnay-500
    secondary: '#D29F4D', // munnay-400
    border: '#E7D2A0',    // munnay-200
};

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ leads, ventasExtra }) => {
    const availableYears = useMemo(() => {
        const allYears = new Set<number>();
        ventasExtra.forEach(v => allYears.add(new Date(v.fechaVenta + 'T00:00:00').getFullYear()));
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
            const ventaDate = new Date(v.fechaVenta + 'T00:00:00');
            if (ventaDate.getFullYear() === selectedYear) {
                const month = ventaDate.getMonth();
                monthlyData[month].Ventas += v.montoPagado;
            }
        });

        // Process Lead related sales (initial payment + treatment payments)
        leads.forEach(l => {
            if (l.fechaHoraAgenda) {
                const agendaDate = new Date(l.fechaHoraAgenda);
                if (agendaDate.getFullYear() === selectedYear) {
                    const month = agendaDate.getMonth();
                    
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
        <div className="bg-white p-6 rounded-3xl shadow-soft-lg mt-6 border border-munnay-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-munnay-900">Total General de Ventas (Mes a Mes)</h3>
                <select 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                    className="border-munnay-200 bg-munnay-50 rounded-xl shadow-soft text-sm p-2 focus:ring-2 focus:ring-munnay-500 focus:border-munnay-500 transition-all duration-300"
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
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                        <XAxis dataKey="name" stroke={CHART_COLORS.axis} fontSize={12} />
                        <YAxis stroke={CHART_COLORS.axis} fontSize={12} tickFormatter={(value: number) => `S/${value/1000}k`} />
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${CHART_COLORS.border}`, 
                                borderRadius: '16px',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.10)',
                            }}
                            formatter={(value: number, name: string) => [`S/ ${value.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name]}
                            labelStyle={{ fontWeight: 'bold', color: '#643423' }}
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Line type="monotone" dataKey="Ventas" stroke={CHART_COLORS.primary} strokeWidth={3} activeDot={{ r: 8, fill: CHART_COLORS.secondary }} dot={{ r: 4, fill: CHART_COLORS.primary }}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlySalesChart;