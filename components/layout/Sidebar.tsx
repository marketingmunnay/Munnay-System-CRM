import React, { useState, useEffect, useMemo } from 'react';
import type { Page, BusinessInfo } from '../../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isCollapsed: boolean;
  permissions: Page[];
  businessInfo: BusinessInfo | null;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

type NavItem = {
    id: string;
    label: string;
    icon?: React.ReactNode;
    page?: Page;
    subItems?: NavItem[];
};

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <GoogleIcon name="home" className="text-xl" />, page: 'dashboard' },
    { id: 'calendario', label: 'Calendario', icon: <GoogleIcon name="calendar_month" className="text-xl" />, page: 'calendario' },
    { 
        id: 'marketing', label: 'Comercial', icon: <GoogleIcon name="campaign" className="text-xl" />, subItems: [
            { id: 'marketing-campanas', label: 'Campañas', page: 'marketing-campanas' },
            { id: 'marketing-leads', label: 'Leads', page: 'marketing-leads' },
            {
                id: 'redes-sociales',
                label: 'Redes Sociales',
                subItems: [
                    { id: 'redes-sociales-publicaciones', label: 'Publicaciones', page: 'redes-sociales-publicaciones' },
                    { id: 'redes-sociales-seguidores', label: 'Seguidores', page: 'redes-sociales-seguidores' },
                ]
            },
            { id: 'procedimientos-ventas-extra', label: 'Ventas', page: 'procedimientos-ventas-extra' },
        ]
    },
    {
        id: 'administracion', label: 'Administración', icon: <GoogleIcon name="admin_panel_settings" className="text-xl" />, subItems: [
            { 
                id: 'recepcion', 
                label: 'Recepción', 
                subItems: [
                    { id: 'recepcion-agendados', label: 'Agendados', page: 'recepcion-agendados' },
                    { id: 'recepcion-ventas-extra', label: 'Recuperados', page: 'recepcion-ventas-extra' },
                    { id: 'recepcion-incidencias', label: 'Incidencias', page: 'recepcion-incidencias' },
                ]
            },
            {
                id: 'contabilidad',
                label: 'Contabilidad',
                subItems: [
                     { id: 'finanzas-egresos', label: 'Egresos', page: 'finanzas-egresos' },
                     { id: 'finanzas-facturacion', label: 'Facturación', page: 'finanzas-facturacion' },
                ]
            },
        ]
    },
     {
        id: 'rrhh', label: 'Recursos Humanos', icon: <GoogleIcon name="manage_accounts" className="text-xl" />, subItems: [
            { id: 'rrhh-perfiles', label: 'Perfiles de Equipo', page: 'rrhh-perfiles' },
        ]
    },
    {
        id: 'procedimientos', label: 'Procedimientos', icon: <GoogleIcon name="digital_wellbeing" className="text-xl" />, subItems: [
            { id: 'procedimientos-atenciones', label: 'Atenciones Diarias', page: 'procedimientos-atenciones' },
            { id: 'procedimientos-seguimiento', label: 'Seguimiento', page: 'procedimientos-seguimiento' },
            { id: 'procedimientos-incidencias', label: 'Incidencias', page: 'procedimientos-incidencias' },
            { id: 'pacientes-historia', label: 'Historia Pacientes', page: 'pacientes-historia' },
        ]
    },
    { id: 'informes', label: 'Informes', icon: <GoogleIcon name="bar_chart_4_bars" className="text-xl" />, page: 'informes' },
    { id: 'configuracion', label: 'Configuración', icon: <GoogleIcon name="settings" className="text-xl" />, page: 'configuracion' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isCollapsed, permissions, businessInfo }) => {
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const filteredNavItems = useMemo(() => {
        const userPermissions = new Set(['dashboard', ...permissions]);

        const filterRecursively = (items: NavItem[]): NavItem[] => {
            return items
                .map(item => {
                    if (item.subItems) {
                        const filteredSubs = filterRecursively(item.subItems);
                        if (filteredSubs.length > 0) {
                            return { ...item, subItems: filteredSubs };
                        }
                    }
                    if (item.page && userPermissions.has(item.page)) {
                        return item;
                    }
                    return null;
                })
                .filter((item): item is NavItem => item !== null);
        };

        return filterRecursively(navItems);
    }, [permissions]);

    const isSubItemActive = (item: NavItem): boolean => {
        if (item.page && item.page === currentPage) {
            return true;
        }
        if (item.subItems) {
            return item.subItems.some(sub => isSubItemActive(sub));
        }
        return false;
    };

    useEffect(() => {
        const findAncestors = (items: NavItem[], page: Page, ancestors: string[] = []): string[] | null => {
            for (const item of items) {
                if (item.page === page) {
                    return ancestors;
                }
                if (item.subItems) {
                    const result = findAncestors(item.subItems, page, [...ancestors, item.id]);
                    if (result !== null) {
                        return result;
                    }
                }
            }
            return null;
        };
        const ancestors = findAncestors(navItems, currentPage);
        if (ancestors) {
            setOpenMenus(prev => [...new Set([...prev, ...ancestors])]);
        }
    }, [currentPage]);
    
    const toggleMenu = (id: string) => {
        setOpenMenus(prev => 
            prev.includes(id) ? prev.filter(menuId => menuId !== id) : [...prev, id]
        );
    };

    return (
        <aside className={`flex flex-col bg-white border-r border-munnay-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="h-16 flex items-center justify-center border-b border-munnay-200 flex-shrink-0 bg-munnay-50">
                {isCollapsed ? (
                    businessInfo?.logoUrl && <img src={businessInfo.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                ) : (
                    businessInfo?.logoUrl && <img src={businessInfo.logoUrl} alt="Logo" className="h-10" />
                )}
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-white to-munnay-50">
                {filteredNavItems.map(item => (
                    <React.Fragment key={item.id}>
                        {item.id === 'informes' && <hr className="!my-4 border-munnay-200" />}
                        <div>
                            {item.subItems ? (
                                <>
                                    <button
                                        onClick={() => toggleMenu(item.id)}
                                        className={`w-full flex items-center justify-between p-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                            isSubItemActive(item) ? 'bg-munnay-100 text-munnay-700' : 'text-gray-600 hover:bg-munnay-50'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                                            {!isCollapsed && <span className="ml-3">{item.label}</span>}
                                        </div>
                                        {!isCollapsed && (openMenus.includes(item.id) ? <GoogleIcon name="expand_less" className="w-4 h-4" /> : <GoogleIcon name="expand_more" className="w-4 h-4" />)}
                                    </button>
                                    {openMenus.includes(item.id) && !isCollapsed && (
                                        <div className="pl-6 mt-1 space-y-1">
                                            {item.subItems.map(subItem => (
                                                <div key={subItem.id}>
                                                    {subItem.subItems ? (
                                                        <>
                                                            <button
                                                                onClick={() => toggleMenu(subItem.id)}
                                                                className={`w-full flex items-center justify-between p-2 rounded-xl text-sm font-medium transition-all duration-300 text-left ${
                                                                     isSubItemActive(subItem)
                                                                        ? 'text-munnay-700 font-semibold'
                                                                        : 'text-gray-500 hover:text-munnay-700'
                                                                }`}
                                                            >
                                                                {subItem.label}
                                                                {openMenus.includes(subItem.id) ? <GoogleIcon name="expand_less" className="w-4 h-4" /> : <GoogleIcon name="expand_more" className="w-4 h-4" />}
                                                            </button>
                                                            {openMenus.includes(subItem.id) && (
                                                                <div className="pl-4 mt-1 space-y-1">
                                                                    {subItem.subItems.map(leafItem => (
                                                                        <button
                                                                            key={leafItem.id}
                                                                            onClick={() => setCurrentPage(leafItem.page as Page)}
                                                                            className={`w-full text-left p-2 text-sm rounded-xl transition-all duration-300 ${
                                                                                currentPage === leafItem.page ? 'bg-munnay-600 text-white shadow-soft' : 'text-gray-500 hover:bg-munnay-50'
                                                                            }`}
                                                                        >
                                                                            {leafItem.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button
                                                            key={subItem.id}
                                                            onClick={() => setCurrentPage(subItem.page as Page)}
                                                            className={`w-full text-left p-2 text-sm rounded-xl transition-all duration-300 ${
                                                                currentPage === subItem.page ? 'bg-munnay-600 text-white shadow-soft' : 'text-gray-500 hover:bg-munnay-50'
                                                            }`}
                                                        >
                                                            {subItem.label}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => setCurrentPage(item.page as Page)}
                                    className={`w-full flex items-center p-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                        currentPage === item.page ? 'bg-munnay-600 text-white shadow-soft' : 'text-gray-600 hover:bg-munnay-50'
                                    }`}
                                >
                                    <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                                </button>
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </nav>
        </aside>
    );
};