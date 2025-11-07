
import React, { useState, useMemo, useEffect } from 'react';
import type { Lead, Campaign, VentaExtra, Incidencia, Egreso, Goal, Seguidor, Publicacion, User, Role } from '../../types.ts';
import GeneralDashboard from './GeneralDashboard.tsx';
import MarketingDashboard from './MarketingDashboard.tsx';
import RecepcionDashboard from './RecepcionDashboard.tsx';
import ProcedimientosDashboard from './ProcedimientosDashboard.tsx';
import FinanzasDashboard from './FinanzasDashboard.tsx';
import RecursosHumanosDashboard from './RecursosHumanosDashboard.tsx';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';

interface DashboardProps {
    leads: Lead[];
    campaigns: Campaign[];
    ventasExtra: VentaExtra[];
    incidencias: Incidencia[];
    egresos: Egreso[];
    permissions: string[];
    goals: Goal[];
    seguidores: Seguidor[];
    publicaciones: Publicacion[];
    users: User[];
    roles: Role[];
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const TABS = [
    { id: 'general', name: 'General', icon: <GoogleIcon name="home" className="text-lg mr-2" /> },
    { id: 'marketing', name: 'Comercial', icon: <GoogleIcon name="campaign" className="text-lg mr-2" /> },
    { id: 'recepcion', name: 'Administración', icon: <GoogleIcon name="volunteer_activism" className="text-lg mr-2" /> },
    { id: 'procedimientos', name: 'Procedimientos', icon: <GoogleIcon name="digital_wellbeing" className="text-lg mr-2" /> },
    { id: 'finanzas', name: 'Finanzas', icon: <GoogleIcon name="attach_money" className="text-lg mr-2" /> },
    { id: 'rrhh', name: 'Recursos Humanos', icon: <GoogleIcon name="manage_accounts" className="text-lg mr-2" /> },
];

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { permissions } = props;
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const visibleTabs = useMemo(() => {
        return TABS.filter(tab => permissions.includes(tab.id));
    }, [permissions]);

    const [activeTab, setActiveTab] = useState(visibleTabs.length > 0 ? visibleTabs[0].name : '');

    useEffect(() => {
        if (visibleTabs.length > 0 && !visibleTabs.some(tab => tab.name === activeTab)) {
            setActiveTab(visibleTabs[0].name);
        } else if (visibleTabs.length === 0) {
            setActiveTab('');
        }
    }, [visibleTabs, activeTab]);

    const handleApplyDateFilter = (dates: { from: string, to: string }) => {
        setDateRange(dates);
    };

    const renderContent = () => {
        if (!activeTab) {
            return (
                <div className="text-center p-8 bg-white rounded-2xl shadow-soft-md">
                    <h2 className="text-xl font-semibold text-munnay-800">Bienvenido</h2>
                    <p className="text-gray-600 mt-2">No tienes permisos para ver ninguna sección del panel de control.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'General':
                return <GeneralDashboard {...props} dateRange={dateRange} />;
            case 'Comercial':
                return <MarketingDashboard {...props} />;
            case 'Administración':
                return <RecepcionDashboard {...props} />;
            case 'Procedimientos':
                return <ProcedimientosDashboard {...props} />;
            case 'Finanzas':
                return <FinanzasDashboard />;
            case 'Recursos Humanos':
                return <RecursosHumanosDashboard users={props.users} roles={props.roles} goals={props.goals} />;
            default:
                return <GeneralDashboard {...props} dateRange={dateRange} />;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-munnay-900">Dashboard</h1>
                 {visibleTabs.some(tab => tab.id === 'general') && activeTab === 'General' && (
                     <DateRangeFilter onApply={handleApplyDateFilter} />
                )}
            </div>

            {visibleTabs.length > 0 && (
                 <div className="mb-6">
                    <div className="border-b border-munnay-200">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                            {visibleTabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`${
                                        activeTab === tab.name
                                            ? 'border-munnay-600 text-munnay-700 font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-munnay-700 hover:border-munnay-300'
                                    } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300`}
                                >
                                    {tab.icon}
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            )}
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;