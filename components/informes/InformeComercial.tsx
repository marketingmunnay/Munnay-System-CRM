
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell } from 'recharts';
import type { Lead, Campaign, VentaExtra, Goal, Publicacion, Seguidor } from '../../types.ts';
import { LeadStatus } from '../../types.ts';
import StatCard from '../dashboard/StatCard.tsx';
import * as api from '../../services/api.ts';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface InformeComercialProps {
    leads: Lead[];
    campaigns: Campaign[];
    ventasExtra: VentaExtra[];
    dateRange: { from: string; to: string };
    goals: Goal[];
    publicaciones: Publicacion[];
    seguidores: Seguidor[];
}

const formatCurrency = (value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const simpleMarkdownToHtml = (text: string) => {
    if (!text) return '';
    // Process bold (**text**)
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Process newlines
    html = html.replace(/\n/g, '<br />');
    return html;
};

// FIX: Exports InformeComercial as a named export.
export const InformeComercial: React.FC<InformeComercialProps> = ({ leads, campaigns, ventasExtra, dateRange, goals, publicaciones, seguidores }) => {
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const { filteredLeads, filteredCampaigns, filteredVentasExtra } = useMemo(() => {
        const { from, to } = dateRange;
        
        const checkDate = (itemDateStr?: string) => {
            if (!from && !to) return true;
            if (!itemDateStr) return false;
            
            // Extract date part if it's a datetime (YYYY-MM-DD)
            const dateOnly = itemDateStr.split('T')[0];
            
            // Simple string comparison for YYYY-MM-DD format
            if (from && dateOnly < from) return false;
            if (to && dateOnly > to) return false;
            return true;
        };

        return {
            filteredLeads: leads.filter(l => checkDate(l.fechaLead)),
            filteredCampaigns: campaigns.filter(c => checkDate(c.fecha)),
            filteredVentasExtra: ventasExtra.filter(v => checkDate(v.fechaVenta)),
        };
    }, [leads, campaigns, ventasExtra, dateRange]);

    const stats = useMemo(() => {
        const totalInversion = filteredCampaigns.reduce((sum, c) => sum + c.importeGastado, 0);
        const totalLeads = filteredLeads.length;
        const costoPorLead = totalLeads > 0 ? totalInversion / totalLeads : 0;
        
        const ventasPorLeads = filteredLeads.reduce((sum, l) => sum + (l.montoPagado || 0) + (l.tratamientos?.reduce((s,t) => s + t.montoPagado, 0) || 0), 0);
        const ventasAdicionales = filteredVentasExtra.reduce((sum, v) => sum + v.montoPagado, 0);
        const ingresosTotales = ventasPorLeads + ventasAdicionales;

        const roi = totalInversion > 0 ? ((ingresosTotales - totalInversion) / totalInversion) * 100 : 0;
        const leadsConvertidos = filteredLeads.filter(l => l.estado === LeadStatus.Agendado && l.montoPagado > 0).length;
        const tasaConversion = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0;

        return { totalInversion, totalLeads, costoPorLead, ingresosTotales, roi, tasaConversion };
    }, [filteredLeads, filteredCampaigns, filteredVentasExtra]);
    
    const goalAnalysisText = useMemo(() => {
        const calculateGoalProgress = (goal: Goal): number => {
            const isWithinGoalRange = (dateStr?: string) => {
                if (!dateStr) return false;
                
                // Extract date part if it's a datetime (YYYY-MM-DD)
                const dateOnly = dateStr.split('T')[0];
                
                // Simple string comparison for YYYY-MM-DD format
                return dateOnly >= goal.startDate && dateOnly <= goal.endDate;
            };

            switch (goal.objective) {
                case 'Ventas de Servicios': {
                    const ventasLeads = leads
                        .filter(l => isWithinGoalRange(l.fechaHoraAgenda))
                        .reduce((sum, l) => sum + (l.montoPagado || 0) + (l.tratamientos?.reduce((s, t) => s + t.montoPagado, 0) || 0), 0);
                    const ventasExtras = ventasExtra
                        .filter(v => v.categoria !== 'Productos' && isWithinGoalRange(v.fechaVenta))
                        .reduce((sum, v) => sum + v.montoPagado, 0);
                    return ventasLeads + ventasExtras;
                }
                case 'Seguidores': {
                    return seguidores
                        .filter(s => isWithinGoalRange(s.fecha))
                        .reduce((sum, s) => sum + (s.seguidores - s.dejaronDeSeguir), 0);
                }
                case 'Aceptación de Tratamientos': {
                    const leadsInPeriod = leads.filter(l => isWithinGoalRange(l.fechaHoraAgenda) && (l.aceptoTratamiento === 'Si' || l.aceptoTratamiento === 'No'));
                    if (leadsInPeriod.length === 0) return 0;
                    const accepted = leadsInPeriod.filter(l => l.aceptoTratamiento === 'Si').length;
                    return (accepted / leadsInPeriod.length) * 100;
                }
                case 'Engagement': {
                    const pubsInPeriod = publicaciones.filter(p => isWithinGoalRange(p.fechaPost));
                    if (pubsInPeriod.length === 0) return 0;
                    const totalInteractions = pubsInPeriod.reduce((sum, p) => sum + p.comentarios + p.reacciones, 0);
                    const totalViews = pubsInPeriod.reduce((sum, p) => sum + p.vistas, 0);
                    if (totalViews === 0) return 0;
                    return (totalInteractions / totalViews) * 100;
                }
                default: return 0;
            }
        };

        if (!goals || goals.length === 0) return 'No hay metas definidas para analizar.';

        const { from, to } = dateRange;

        const relevantGoals = goals.filter(goal => {
            // Simple string comparison for YYYY-MM-DD format
            if (from && to) return goal.startDate <= to && goal.endDate >= from;
            if (from) return goal.endDate >= from;
            if (to) return goal.startDate <= to;
            return true;
        });

        if (relevantGoals.length === 0) return 'No hay metas activas en el periodo seleccionado.';

        const analysisByArea: Record<string, string[]> = {};
        relevantGoals.forEach(goal => {
            const currentValue = calculateGoalProgress(goal);
            const targetValue = goal.value;
            const progress = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
            const achieved = currentValue >= targetValue;

            const unit = goal.unit === 'porcentaje' ? '%' : (goal.objective.toLowerCase().includes('ventas') ? 'S/ ' : '');
            const format = (val: number) => unit === 'S/ ' ? `${unit}${val.toLocaleString('es-PE')}` : `${val.toLocaleString('es-PE')}${unit}`;
            
            const summary = `- Meta "${goal.name}": ${achieved ? 'Lograda' : 'En progreso'}. Avance: ${progress.toFixed(1)}% (${format(currentValue)} de ${format(targetValue)}).`;
            if (!analysisByArea[goal.area]) analysisByArea[goal.area] = [];
            analysisByArea[goal.area].push(summary);
        });

        let formattedString = '';
        for (const area in analysisByArea) {
            formattedString += `\n**Área: ${area}**\n` + analysisByArea[area].join('\n');
        }
        return formattedString.trim();
    }, [goals, dateRange, leads, ventasExtra, publicaciones, seguidores]);


    const leadSourceData = useMemo(() => {
        const sourceMap: Record<string, { leads: number, convertidos: number }> = {};
        filteredLeads.forEach(lead => {
            const source = lead.redSocial || 'Desconocido';
            if (!sourceMap[source]) {
                sourceMap[source] = { leads: 0, convertidos: 0 };
            }
            sourceMap[source].leads++;
            if (lead.estado === LeadStatus.Agendado && lead.montoPagado > 0) {
                sourceMap[source].convertidos++;
            }
        });
        return Object.entries(sourceMap).map(([name, data]) => ({
            name,
            Leads: data.leads,
            'Tasa de Conversión': data.leads > 0 ? (data.convertidos / data.leads) * 100 : 0,
        }));
    }, [filteredLeads]);
    
    const funnelData = useMemo(() => {
        const totalLeads = filteredLeads.length;
        const agendados = filteredLeads.filter(l => l.estado === LeadStatus.Agendado).length;
        const atendidos = filteredLeads.filter(l => l.estadoRecepcion === 'Atendido').length;
        const aceptaron = filteredLeads.filter(l => l.aceptoTratamiento === 'Si').length;
        return [
            { value: totalLeads, name: 'Total Leads' },
            { value: agendados, name: 'Agendados' },
            { value: atendidos, name: 'Atendidos' },
            { value: aceptaron, name: 'Aceptaron Trat.' },
        ];
    }, [filteredLeads]);

    const sellerPerformanceData = useMemo(() => {
        const sellerMap: Record<string, { leads: number, ventas: number }> = {};
        filteredLeads.forEach(lead => {
            const seller = lead.vendedor;
            if (!sellerMap[seller]) {
                sellerMap[seller] = { leads: 0, ventas: 0 };
            }
            sellerMap[seller].leads++;
            if (lead.estado === LeadStatus.Agendado) {
                 sellerMap[seller].ventas += (lead.montoPagado || 0) + (lead.tratamientos?.reduce((s,t) => s + t.montoPagado, 0) || 0);
            }
        });
        return Object.entries(sellerMap).map(([name, data]) => ({
            name,
            Leads: data.leads,
            Ventas: data.ventas,
        }));
    }, [filteredLeads]);

    const handleGenerateAnalysis = async () => {
        setIsGenerating(true);
        setAiAnalysis('');

        const prompt = `
            Actúa como un analista de negocios experto para la clínica estética "Munnay". Tu tarea es crear un **análisis comercial corto y preciso** basado en los siguientes datos.

            **Periodo del Informe:** ${dateRange.from || 'Inicio'} a ${dateRange.to || 'Fin'}

            **Datos Clave:**
            - **Inversión Total:** ${formatCurrency(stats.totalInversion)}
            - **Leads Generados:** ${stats.totalLeads}
            - **Ingresos Totales:** ${formatCurrency(stats.ingresosTotales)}
            - **ROI:** ${stats.roi.toFixed(1)}%
            - **Tasa de Conversión:** ${stats.tasaConversion.toFixed(1)}%
            - **Embudo de Ventas:** ${funnelData.map(item => `${item.name}: ${item.value}`).join(', ')}

            **Análisis de Metas:**
            ${goalAnalysisText}

            **Instrucciones para el Resumen Ejecutivo:**
            Genera un resumen en formato Markdown que sea **breve y directo**. Estructúralo con los siguientes títulos en negrita:
            - **Diagnóstico General:** Un resumen del rendimiento comercial general.
            - **Análisis de Metas:** Un análisis conciso del cumplimiento de metas, indicando para cada una si fue **"Lograda"** o **"No Lograda"**.
            - **Recomendaciones Clave:** Una o dos recomendaciones accionables para mejorar los resultados.
            
            **Importante:** No incluyas encabezados numerados o con '###' como "### 2. ...". Solo usa los títulos en negrita que te he proporcionado.
        `;
        
        try {
            const generatedText = await api.generateAiContent(prompt);
            setAiAnalysis(generatedText);
        } catch (error) {
            console.error("Error generating analysis:", error);
            setAiAnalysis("Hubo un error al generar el análisis. Por favor, intente de nuevo más tarde.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div id="report-content" className="bg-white p-6 rounded-lg shadow space-y-8">
             <style>{`
                @media print {
                    body {
                        background-color: white;
                    }
                    .print-container {
                        padding: 2rem;
                    }
                    .no-print {
                        display: none;
                    }
                    main {
                        padding: 0;
                        overflow: visible;
                    }
                    #report-content {
                        box-shadow: none;
                        border: none;
                    }
                }
             `}</style>
            
            {/* Header */}
            <div className="flex justify-between items-center print:block">
                <div>
                    <h2 className="text-2xl font-bold text-black">Informe Comercial</h2>
                    <p className="text-gray-500">Periodo: {dateRange.from || 'Inicio'} al {dateRange.to || 'Fin'}</p>
                </div>
                <div className="flex items-center space-x-2 no-print">
                     <button 
                        onClick={handleGenerateAnalysis} 
                        disabled={isGenerating || !aiAnalysis}
                        className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
                        {isGenerating ? (
                            <>
                                <GoogleIcon name="cached" className="mr-2 animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <GoogleIcon name="auto_awesome" className="mr-2" />
                                Generar Análisis IA
                            </>
                        )}
                    </button>
                     <button 
                        onClick={handlePrint}
                        className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-300 transition-colors"
                    >
                        <GoogleIcon name="print" className="mr-2" />
                        Imprimir
                    </button>
                </div>
            </div>

            {/* AI Analysis Section */}
            {(aiAnalysis || isGenerating) && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                        <GoogleIcon name="psychology" className="mr-2 text-blue-500" />
                        Resumen Ejecutivo (Generado por IA)
                    </h3>
                    {isGenerating ? (
                        <div className="flex items-center justify-center py-8 text-gray-600">
                            <GoogleIcon name="hourglass_empty" className="mr-3 animate-pulse text-3xl" />
                            <p>La inteligencia artificial está analizando los datos...</p>
                        </div>
                    ) : (
                        <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(aiAnalysis) }} />
                    )}
                </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Inversión en Marketing" value={formatCurrency(stats.totalInversion)} icon="monetization_on" iconBgClass="bg-red-100" iconColorClass="text-red-500"/>
                <StatCard title="Total Leads Generados" value={stats.totalLeads.toLocaleString('es-PE')} icon="groups" iconBgClass="bg-blue-100" iconColorClass="text-blue-500"/>
                <StatCard title="Ingresos Totales (Comercial)" value={formatCurrency(stats.ingresosTotales)} icon="payments" iconBgClass="bg-green-100" iconColorClass="text-green-500"/>
                <StatCard title="ROI (Retorno de Inversión)" value={`${stats.roi.toFixed(1)}%`} icon="show_chart" iconBgClass="bg-purple-100" iconColorClass="text-purple-500"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lead Source Performance */}
                <div className="bg-white p-6 rounded-lg shadow h-[400px]">
                    <h3 className="text-xl font-bold text-black mb-4">Rendimiento por Origen de Lead</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={leadSourceData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Leads', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Tasa de Conversión (%)', angle: 90, position: 'insideRight' }} />
                            <Tooltip formatter={(value: number, name: string) => {
                                if (name === 'Tasa de Conversión') return [`${value.toFixed(1)}%`, name];
                                return [value.toLocaleString('es-PE'), name];
                            }}/>
                            <Legend />
                            <Bar yAxisId="left" dataKey="Leads" fill="#8884d8" name="Leads" />
                            <Bar yAxisId="right" dataKey="Tasa de Conversión" fill="#82ca9d" name="Tasa de Conversión" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Sales Funnel */}
                <div className="bg-white p-6 rounded-lg shadow h-[400px] flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-black mb-4">Embudo de Ventas</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <FunnelChart>
                            <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString('es-PE')}`, name]}/>
                            <Funnel
                                dataKey="value"
                                data={funnelData}
                                isAnimationActive
                                // Removed nameProperty as it's not a valid prop for Funnel
                                label
                                fill="#8884d8"
                            >
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                                ))}
                                <LabelList dataKey="name" position="right" fill="#000" stroke="none" />
                            </Funnel>
                        </FunnelChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Seller Performance */}
            <div className="bg-white p-6 rounded-lg shadow h-[400px]">
                <h3 className="text-xl font-bold text-black mb-4">Rendimiento por Vendedor</h3>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={sellerPerformanceData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Leads', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Ventas (S/)', angle: 90, position: 'insideRight' }} />
                        <Tooltip formatter={(value: number, name: string) => {
                            if (name === 'Ventas') return [formatCurrency(value), name];
                            return [value.toLocaleString('es-PE'), name];
                        }}/>
                        <Legend />
                        <Bar yAxisId="left" dataKey="Leads" fill="#8884d8" name="Leads Generados" />
                        <Bar yAxisId="right" dataKey="Ventas" fill="#82ca9d" name="Ventas Generadas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
    