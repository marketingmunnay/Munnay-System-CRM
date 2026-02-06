import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { GoalProgress } from '../../types.ts';
import { GoalPeriod, GoalPeriodLabels, GoalObjectiveLabels } from '../../types.ts';
import { getGoalProgress } from '../../services/api.ts';

const GoogleIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

/* ─────────────── Stars ─────────────── */
const StarRating: React.FC<{ stars: number }> = ({ stars }) => {
    const fullStars = Math.floor(stars);
    const hasHalf = stars - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: fullStars }).map((_, i) => (
                <GoogleIcon key={`f${i}`} name="star" className="text-amber-400 text-base" />
            ))}
            {hasHalf && <GoogleIcon name="star_half" className="text-amber-400 text-base" />}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <GoogleIcon key={`e${i}`} name="star" className="text-gray-300 text-base" />
            ))}
            <span className="ml-1 text-xs font-semibold text-gray-600">{stars.toFixed(1)}</span>
        </div>
    );
};

/* ─────────────── Mini chart (evolución) ─────────────── */
const MiniEvolutionChart: React.FC<{ evolution: Array<{ date: string; value: number }>; unit: string }> = ({ evolution, unit }) => {
    if (!evolution || evolution.length === 0) {
        return <p className="text-[11px] text-gray-400 italic">Sin datos aún</p>;
    }

    const values = evolution.map(e => e.value);
    const maxVal = Math.max(...values, 1);
    const chartWidth = 260;
    const chartHeight = 60;
    const padding = 4;

    const points = values.map((v, i) => {
        const x = padding + (i / Math.max(values.length - 1, 1)) * (chartWidth - padding * 2);
        const y = chartHeight - padding - (v / maxVal) * (chartHeight - padding * 2);
        return `${x},${y}`;
    });

    const areaPath = `M${padding},${chartHeight - padding} L${points.join(' L')} L${padding + ((values.length - 1) / Math.max(values.length - 1, 1)) * (chartWidth - padding * 2)},${chartHeight - padding} Z`;

    const formatLabel = (val: number) => {
        if (unit === 'soles') return `S/.${val.toLocaleString('es-PE')}`;
        if (unit === 'porcentaje') return `${val}%`;
        return val.toLocaleString('es-PE');
    };

    return (
        <div className="relative">
            <svg width={chartWidth} height={chartHeight} className="block">
                <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                    </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#gradient)" />
                <polyline fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" points={points.join(' ')} />
                {/* Dots */}
                {values.map((v, i) => {
                    const x = padding + (i / Math.max(values.length - 1, 1)) * (chartWidth - padding * 2);
                    const y = chartHeight - padding - (v / maxVal) * (chartHeight - padding * 2);
                    return <circle key={i} cx={x} cy={y} r="3" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />;
                })}
            </svg>
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 px-1">
                <span>{evolution[0]?.date?.slice(5) || ''}</span>
                <span className="font-semibold text-gray-600">{formatLabel(values[values.length - 1])}</span>
                <span>{evolution[evolution.length - 1]?.date?.slice(5) || ''}</span>
            </div>
        </div>
    );
};

/* ─────────────── Progress card ─────────────── */
const GoalCard: React.FC<{ progress: GoalProgress }> = ({ progress }) => {
    const { goal, currentValue, targetValue, percentage, remaining, stars, isAchieved, daysRemaining, evolution } = progress;

    const formatValue = (val: number) => {
        const unit = goal.unit as string;
        if (unit === 'soles') return `S/. ${val.toLocaleString('es-PE')}`;
        if (unit === 'porcentaje') return `${val.toFixed(1)}%`;
        return val.toLocaleString('es-PE');
    };

    const barColor = isAchieved
        ? 'bg-green-500'
        : percentage >= 75
            ? 'bg-blue-500'
            : percentage >= 50
                ? 'bg-amber-500'
                : 'bg-red-500';

    const statusBadge = isAchieved
        ? { text: '¡Lograda!', bg: 'bg-green-100 text-green-700' }
        : daysRemaining <= 0
            ? { text: 'Vencida', bg: 'bg-red-100 text-red-700' }
            : { text: `${daysRemaining} días restantes`, bg: 'bg-blue-50 text-blue-700' };

    return (
        <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{goal.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                        {GoalObjectiveLabels[goal.objective] || goal.objective}
                    </p>
                </div>
                <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusBadge.bg}`}>
                    {statusBadge.text}
                </span>
            </div>

            {/* Value + progress */}
            <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900">{formatValue(currentValue)}</span>
                <span className="text-sm text-gray-500">/ {formatValue(targetValue)}</span>
            </div>

            {/* Progress bar */}
            <div className="relative w-full bg-gray-100 rounded-full h-3 mb-3">
                <div
                    className={`h-3 rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
                {percentage > 100 && (
                    <div className="absolute -top-1 right-0 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        +{(percentage - 100).toFixed(0)}%
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500">
                    {percentage.toFixed(0)}% completado
                </span>
                {remaining > 0 && !isAchieved && (
                    <span className="text-xs text-gray-500">
                        Falta: {formatValue(remaining)}
                    </span>
                )}
            </div>

            {/* Stars */}
            <div className="flex justify-between items-center mb-3">
                <StarRating stars={stars} />
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${goal.period === 'diario' ? 'bg-purple-50 text-purple-700' : goal.period === 'semanal' ? 'bg-indigo-50 text-indigo-700' : 'bg-sky-50 text-sky-700'}`}>
                    {GoalPeriodLabels[goal.period] || goal.period}
                </span>
            </div>

            {/* Evolución */}
            <div className="pt-2 border-t">
                <p className="text-[11px] font-semibold text-gray-600 mb-1">Evolución</p>
                <MiniEvolutionChart evolution={evolution} unit={goal.unit} />
            </div>
        </div>
    );
};

/* ─────────────── Resumen de rendimiento ─────────────── */
const PerformanceSummary: React.FC<{ progressList: GoalProgress[] }> = ({ progressList }) => {
    const total = progressList.length;
    const achieved = progressList.filter(p => p.isAchieved).length;
    const avgStars = total > 0 ? progressList.reduce((s, p) => s + p.stars, 0) / total : 0;
    const avgPercentage = total > 0 ? progressList.reduce((s, p) => s + p.percentage, 0) / total : 0;

    const performanceLevel =
        avgStars >= 4.5 ? { label: 'Excelente', color: 'text-green-600', icon: 'emoji_events' }
            : avgStars >= 3.5 ? { label: 'Muy Bueno', color: 'text-blue-600', icon: 'thumb_up' }
                : avgStars >= 2.5 ? { label: 'Bueno', color: 'text-amber-600', icon: 'trending_up' }
                    : avgStars >= 1.5 ? { label: 'Necesita Mejorar', color: 'text-orange-600', icon: 'trending_flat' }
                        : { label: 'Crítico', color: 'text-red-600', icon: 'warning' };

    return (
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border p-5 mb-5">
            <div className="flex items-center gap-3 mb-4">
                <GoogleIcon name={performanceLevel.icon} className={`text-3xl ${performanceLevel.color}`} />
                <div>
                    <p className={`text-lg font-bold ${performanceLevel.color}`}>{performanceLevel.label}</p>
                    <p className="text-[11px] text-gray-500">Rendimiento general del periodo</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                    <p className="text-[11px] text-gray-500">Metas Activas</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{achieved}</p>
                    <p className="text-[11px] text-gray-500">Logradas</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{avgPercentage.toFixed(0)}%</p>
                    <p className="text-[11px] text-gray-500">Progreso Promedio</p>
                </div>
                <div className="text-center">
                    <StarRating stars={avgStars} />
                    <p className="text-[11px] text-gray-500 mt-0.5">Promedio Estrellas</p>
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════
   MetaProgressDashboard – componente principal
   ════════════════════════════════════════════════════════ */

interface MetaProgressDashboardProps {
    userId: number;
}

const MetaProgressDashboard: React.FC<MetaProgressDashboardProps> = ({ userId }) => {
    const [progressList, setProgressList] = useState<GoalProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<GoalPeriod | 'todos'>('todos');
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        return today.toISOString().slice(0, 10);
    });

    const fetchProgress = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const period = selectedPeriod === 'todos' ? undefined : selectedPeriod;
            const data = await getGoalProgress(userId, period, selectedDate);
            setProgressList(data);
        } catch (err: any) {
            console.error('Error al cargar progreso de metas:', err);
            setError('No se pudo cargar el progreso. Verifica la conexión.');
        } finally {
            setLoading(false);
        }
    }, [userId, selectedPeriod, selectedDate]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    const filteredProgress = useMemo(() => {
        if (selectedPeriod === 'todos') return progressList;
        return progressList.filter(p => p.period === selectedPeriod);
    }, [progressList, selectedPeriod]);

    const periodTabs: Array<{ key: GoalPeriod | 'todos'; label: string; icon: string }> = [
        { key: 'todos', label: 'Todos', icon: 'grid_view' },
        { key: GoalPeriod.Diario, label: 'Día', icon: 'today' },
        { key: GoalPeriod.Semanal, label: 'Semana', icon: 'date_range' },
        { key: GoalPeriod.Mensual, label: 'Mes', icon: 'calendar_month' },
    ];

    return (
        <div className="space-y-4">
            {/* Header + Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <GoogleIcon name="flag" className="text-amber-500" />
                    Progreso de Metas
                </h3>

                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1.5 text-gray-700 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    />
                    <button
                        onClick={fetchProgress}
                        className="text-gray-500 hover:text-amber-600 transition-colors p-1.5 rounded-lg hover:bg-amber-50"
                        title="Refrescar"
                    >
                        <GoogleIcon name="refresh" className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Period tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {periodTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setSelectedPeriod(tab.key)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            selectedPeriod === tab.key
                                ? 'bg-white text-amber-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <GoogleIcon name={tab.icon} className="text-sm" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
                    <span className="ml-3 text-sm text-gray-500">Calculando progreso...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
                    <GoogleIcon name="error" className="text-red-500" />
                    {error}
                </div>
            )}

            {!loading && !error && filteredProgress.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <GoogleIcon name="flag" className="text-5xl text-gray-300 block mx-auto mb-3" />
                    <p className="font-semibold">No hay metas asignadas</p>
                    <p className="text-xs mt-1">Asigna metas desde Configuración &gt; Metas y Objetivos</p>
                </div>
            )}

            {!loading && !error && filteredProgress.length > 0 && (
                <>
                    <PerformanceSummary progressList={filteredProgress} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProgress.map(progress => (
                            <GoalCard key={progress.goalId} progress={progress} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MetaProgressDashboard;
