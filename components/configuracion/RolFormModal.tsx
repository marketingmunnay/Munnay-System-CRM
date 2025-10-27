import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Role, Page } from '../../types.ts';
import { ALL_PAGES_CONFIG, DASHBOARD_METRICS_CONFIG } from '../../constants.ts';
import Modal from '../shared/Modal.tsx';

interface RolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  role: Role | null;
}

// FIX: Renamed 'RolFormModalModalProps' to 'RolFormModalProps'
const RolFormModal: React.FC<RolFormModalProps> = ({ isOpen, onClose, onSave, role }) => {
  const [formData, setFormData] = useState<Partial<Role>>({ permissions: [], dashboardMetrics: [] });
  const selectAllRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(role ? { ...role } : { 
          id: Date.now(),
          nombre: '',
          permissions: ['dashboard'], // Dashboard is mandatory
          dashboardMetrics: []
      });
    }
  }, [role, isOpen]);

  const groupedPages = useMemo(() => {
    // FIX: Explicitly typing the initial value of reduce to correctly type the accumulator.
    // This ensures that TypeScript correctly infers the type of `groupedPages`
    // and resolves errors related to calling array methods on 'unknown' types.
    return ALL_PAGES_CONFIG.reduce((acc: Record<string, { id: Page; label: string; group: string }[]>, page) => {
        const group = page.group;
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(page);
        return acc;
    }, {} as Record<string, { id: Page; label: string; group: string }[]>);
  }, []);

  useEffect(() => {
    // This effect updates the indeterminate state of the "Select All" checkboxes
    Object.entries(groupedPages).forEach(([groupName, groupPages]) => {
      const groupPageIds = groupPages.map(p => p.id);
      
      const groupPermissionsInState = groupPageIds.filter(p => formData.permissions?.includes(p));
      
      const checkbox = selectAllRefs.current[groupName];
      if (checkbox) {
        if (groupPermissionsInState.length === 0) {
          checkbox.checked = false;
          checkbox.indeterminate = false;
        } else if (groupPermissionsInState.length === groupPageIds.length) {
          checkbox.checked = true;
          checkbox.indeterminate = false;
        } else {
          checkbox.checked = false;
          checkbox.indeterminate = true;
        }
      }
    });
  }, [formData.permissions, groupedPages]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePermissionChange = (pageId: Page) => {
    if (pageId === 'dashboard') return; // Cannot uncheck dashboard
    setFormData(prev => {
        const currentPermissions = prev.permissions || [];
        const newPermissions = currentPermissions.includes(pageId)
            ? currentPermissions.filter(p => p !== pageId)
            : [...currentPermissions, pageId];
        return { ...prev, permissions: newPermissions };
    });
  };

  const handleGroupPermissionChange = (groupPages: { id: Page; label: string; group: string }[], isChecked: boolean) => {
    setFormData(prev => {
      const currentPermissions = new Set(prev.permissions || []);
      const groupPageIds = groupPages.map(p => p.id).filter(id => id !== 'dashboard');

      if (isChecked) {
        groupPageIds.forEach(id => currentPermissions.add(id));
      } else {
        groupPageIds.forEach(id => currentPermissions.delete(id));
      }

      return { ...prev, permissions: Array.from(currentPermissions) };
    });
  };

  const handleMetricChange = (metricId: string) => {
    setFormData(prev => {
        const currentMetrics = prev.dashboardMetrics || [];
        const newMetrics = currentMetrics.includes(metricId)
            ? currentMetrics.filter(m => m !== metricId)
            : [...currentMetrics, metricId];
        return { ...prev, dashboardMetrics: newMetrics };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre) {
      alert('El nombre del rol es requerido.');
      return;
    }
    onSave(formData as Role);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? 'Editar Rol y Permisos' : 'Añadir Nuevo Rol'}
      maxWidthClass="max-w-2xl"
      footer={
        <div className="w-full flex justify-end">
          <div className="space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" form="role-form" className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]">Guardar Rol</button>
          </div>
        </div>
      }
    >
      <div className="p-6">
        <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
                <input type="text" id="nombre" name="nombre" value={formData.nombre || ''} onChange={handleChange} required className="w-full md:w-1/2 border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 focus:ring-[#aa632d] focus:border-[#aa632d]" />
            </div>
            
            <fieldset>
                <legend className="text-sm font-medium text-black mb-2">Permisos de Acceso a Páginas</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedPages).map(([group, pages]) => (
                        <div key={group} className="border p-4 rounded-md bg-gray-50/50 flex flex-col">
                            <div className="flex justify-between items-center border-b pb-3 mb-3">
                                <h4 className="font-semibold text-gray-800">{group}</h4>
                                <div className="flex items-center">
                                    <label htmlFor={`select-all-${group}`} className="text-xs font-medium text-gray-600 mr-2">Todos</label>
                                    <input
                                        id={`select-all-${group}`}
                                        type="checkbox"
                                        ref={el => { selectAllRefs.current[group] = el; }}
                                        onChange={(e) => handleGroupPermissionChange(pages, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-[#aa632d] focus:ring-[#aa632d]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                {pages.map(page => (
                                    <div key={page.id} className="relative flex items-start">
                                        <div className="flex h-6 items-center">
                                            <input
                                                id={page.id}
                                                name="permissions"
                                                type="checkbox"
                                                checked={formData.permissions?.includes(page.id)}
                                                onChange={() => handlePermissionChange(page.id)}
                                                disabled={page.id === 'dashboard'}
                                                className="h-4 w-4 rounded border-gray-300 text-[#aa632d] focus:ring-[#aa632d] disabled:opacity-50"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm leading-6">
                                            <label htmlFor={page.id} className="font-medium text-gray-700">{page.label}</label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>

            {formData.permissions?.includes('dashboard') && (
                 <fieldset>
                    <legend className="text-sm font-medium text-black mb-2">Permisos del Panel de Control</legend>
                    <div className="border p-4 rounded-md space-y-3 bg-gray-50/50">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {DASHBOARD_METRICS_CONFIG.map(metric => (
                                <div key={metric.id} className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id={`metric-${metric.id}`}
                                            name="dashboardMetrics"
                                            type="checkbox"
                                            checked={formData.dashboardMetrics?.includes(metric.id)}
                                            onChange={() => handleMetricChange(metric.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-[#aa632d] focus:ring-[#aa632d]"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor={`metric-${metric.id}`} className="font-medium text-gray-700">{metric.label}</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 </fieldset>
            )}

        </form>
      </div>
    </Modal>
  );
};

export default RolFormModal;