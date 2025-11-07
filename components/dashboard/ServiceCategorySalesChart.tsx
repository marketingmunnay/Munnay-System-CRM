import React, { useState, useMemo } from 'react';
import type { Lead, VentaExtra } from '../../types.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ServiceCategorySalesChartProps {
    leads: Lead[];
    ventasExtra: VentaExtra[];
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const CATEGORIES_TO_DISPLAY: ('Evaluación Médica' | 'Evaluación Específica' | 'Hydrafacial' | 'Limpieza Facial')[] = [
    'Evaluación Médica', 
    'Evaluación Específica', 
    'Hydrafacial', 
    'Limpieza Facial'
];

// Munnay color palette constants for charts (Recharts requires hex values)
const CHART_COLORS = {
    grid: '#E7D2A0',      // munnay-200
    axis: '#AA632D',      // munnay-600
    primary: '#C88338',   // munnay-500
    border: '#E7D2A0',    // munnay-200
};

const ServiceCategorySalesChart: React.FC<ServiceCategorySalesChartProps> = ({ leads, ventasExtra }) => {
    const availableYears = useMemo(() => {
        const allYears = new Set<number>();
        ventasExtra.forEach(v => allYears.add(new Date(v.fechaVenta + 'T00:00:00').getFullYear()));
        leads.forEach(l => {
            if (l.fechaHoraAgenda) {
                allYears.add(new Date(l.fechaHoraAgenda).getFullYear());
            }
        });
        if (allYears.size === 0) return [new Date().getFullYear()];
        return Array.from(allYears).sort((a, b) => b - a);
    }, [leads, ventasExtra]);

    const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);

    const chartsData = useMemo(() => {
        const result: Record<string, { data: { name: string; Ventas: number }[], average: number }> = {};

        CATEGORIES_TO_DISPLAY.forEach(category => {
            const monthlyData = Array.from({ length: 12 }, (_, i) => ({
                name: MONTH_NAMES[i],
                Ventas: 0,
            }));

            // Process Ventas Extra
            ventasExtra.forEach(v => {
                if (v.categoria === category) {
                    const ventaDate = new Date(v.fechaVenta + 'T00:00:00');
                    if (ventaDate.getFullYear() === selectedYear) {
                        monthlyData[ventaDate.getMonth()].Ventas += v.montoPagado;
                    }
                }
            });

            // Process Lead related sales
            leads.forEach(l => {
                if (l.categoria === category && l.fechaHoraAgenda) {
                    const agendaDate = new Date(l.fechaHoraAgenda);
                    if (agendaDate.getFullYear() === selectedYear) {
                        const month = agendaDate.getMonth();
                        // Add initial appointment fee if it belongs to this category
                        monthlyData[month].Ventas += l.montoPagado || 0;
                        
                        // Add treatment fees if lead category matches
                        if (l.tratamientos) {
                            l.tratamientos.forEach(t => {
                                monthlyData[month].Ventas += t.montoPagado || 0;
                            });
                        }
                    }
                }
            });
            
            const totalSales = monthlyData.reduce((sum, month) => sum + month.Ventas, 0);
            const average = totalSales > 0 ? totalSales / 12 : 0;

            result[category] = { data: monthlyData, average };
        });

        return result;
    }, [leads, ventasExtra, selectedYear]);

    const renderChart = (category: string) => {
        const { data, average } = chartsData[category];
        
        return (
            <div key={category} className="border border-munnay-200 p-4 rounded-2xl bg-munnay-50/30">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-munnay-800">{category}</h4>
                    <div className="bg-white border border-munnay-200 rounded-xl px-3 py-1 text-right shadow-soft">
                        <p className="text-xs text-munnay-600">Promedio Mensual</p>
                        <p className="text-sm font-bold text-munnay-700">
                            {`S/ ${average.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                    </div>
                </div>
                 <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                            <XAxis dataKey="name" stroke={CHART_COLORS.axis} fontSize={12} />
                            <YAxis stroke={CHART_COLORS.axis} fontSize={12} tickFormatter={(value: number) => `S/${value/1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: `1px solid ${CHART_COLORS.border}`, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.10)' }}
                                formatter={(value: number) => [`S/ ${value.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Ventas']}
                                labelStyle={{ fontWeight: 'bold', color: '#643423' }}
                            />
                            <Legend wrapperStyle={{fontSize: "12px"}} />
                            <Line type="monotone" dataKey="Ventas" stroke={CHART_COLORS.primary} strokeWidth={3} dot={{ r: 3, fill: CHART_COLORS.primary }} />
                        </LineChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft-lg mt-6 border border-munnay-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-munnay-900">Ventas por Categoría de Servicio</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CATEGORIES_TO_DISPLAY.map(category => renderChart(category))}
            </div>
        </div>
    );
};

export default ServiceCategorySalesChart;