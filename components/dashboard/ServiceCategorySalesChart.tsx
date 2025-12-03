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
            <div key={category} className="border p-4 rounded-lg bg-gray-50/50">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-gray-700">{category}</h4>
                    <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-right shadow-sm">
                        <p className="text-xs text-gray-500">Promedio Mensual</p>
                        <p className="text-sm font-bold text-[#8884d8]">
                            {`S/ ${average.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                    </div>
                </div>
                 <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value: number) => `S/${value/1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                formatter={(value: number) => [`S/ ${value.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Ventas']}
                            />
                            <Legend wrapperStyle={{fontSize: "12px"}} />
                            <Line type="monotone" dataKey="Ventas" stroke="#aa632d" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Ventas por Categoría de Servicio</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CATEGORIES_TO_DISPLAY.map(category => renderChart(category))}
            </div>
        </div>
    );
};

export default ServiceCategorySalesChart;