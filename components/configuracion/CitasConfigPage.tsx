import React, { useState, useEffect } from 'react';
import { Clock, Users, Calendar, Ban, Globe, Check, Plus, Trash2, Edit2, X, AlertCircle, Save } from 'lucide-react';
import { getUsers, getBusinessInfo, saveBusinessInfo } from '../../services/api';
import type { User, BusinessInfo } from '../../types';

interface Resource {
  id: string;
  name: string;
  type: 'personal' | 'infrastructure';
  description?: string;
  imageUrl?: string;
  userId?: number; // Linked user for personal resources
}

interface AppointmentStatusConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface CancellationReason {
  id: string;
  reason: string;
  requiresNote: boolean;
}

const ZONES = [
  { value: 'America/Lima', label: '(GMT-05:00) Lima' },
  { value: 'America/Bogota', label: '(GMT-05:00) Bogotá' },
  { value: 'America/Mexico_City', label: '(GMT-06:00) Ciudad de México' },
  { value: 'Europe/Madrid', label: '(GMT+01:00) Madrid' },
];

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 6, label: 'Sábado' },
];

const MOCK_RESOURCES: Resource[] = [
    { id: '1', name: 'Dra. Marilia', type: 'personal', description: 'Especialista Facial' },
    { id: '2', name: 'Dra. Sofía', type: 'personal', description: 'Dermatología' },
    { id: '3', name: 'Cabina 1', type: 'infrastructure', description: 'Sala de procedimientos' },
];

const MOCK_STATUSES = [
  { id: 'confirmed', name: 'Confirmado', color: '#10B981', icon: 'check' },
  { id: 'pending', name: 'Pendiente', color: '#F59E0B', icon: 'clock' },
  { id: 'cancelled', name: 'Cancelado', color: '#EF4444', icon: 'x' },
];

const MOCK_CANCELLATION_REASONS: CancellationReason[] = [
  { id: '1', reason: 'Cliente solicitó cancelar', requiresNote: false },
  { id: '2', reason: 'No se presentó (No Show)', requiresNote: true },
  { id: '3', reason: 'Médico no disponible', requiresNote: true },
];

export default function CitasConfigPage({ initialTab = 'general' }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Sync if initialTab changes (optional, but good if parent changes it)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // General Config
  const [timezone, setTimezone] = useState('America/Lima');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [startDay, setStartDay] = useState(1);
  
  // Resources
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Statuses
  const [statuses, setStatuses] = useState<AppointmentStatusConfig[]>(MOCK_STATUSES);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<AppointmentStatusConfig | null>(null);

  // Cancellation Reasons
  const [cancellationReasons, setCancellationReasons] = useState<CancellationReason[]>(MOCK_CANCELLATION_REASONS);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [editingCancellationReason, setEditingCancellationReason] = useState<CancellationReason | null>(null);
  
  // Online Booking
  const [onlineBookingEnabled, setOnlineBookingEnabled] = useState(false);

  // Closure Dates
  const [closureDates, setClosureDates] = useState<{start: string, end: string, reason: string}[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);

  useEffect(() => {
    // Load Business Info (Timezone)
    getBusinessInfo().then(info => {
      setBusinessInfo(info);
      if (info.timezone) {
        setTimezone(info.timezone);
        // Sync with local storage for immediate frontend use elsewhere
        localStorage.setItem('systemTimezone', info.timezone);
      }
    }).catch(console.error);
  }, []);

  const handleSaveGeneral = async () => {
      try {
          if (!businessInfo) return;
          const updatedInfo = { ...businessInfo, timezone };
          await saveBusinessInfo(updatedInfo);
          setBusinessInfo(updatedInfo);
          localStorage.setItem('systemTimezone', timezone);
          alert('Configuración guardada correctamente.');
      } catch (error) {
          console.error("Error saving config:", error);
          alert('Error al guardar la configuración.');
      }
  };

  useEffect(() => {
    if (activeTab === 'resources') {
      getUsers().then(setUsers).catch(console.error);
    }
  }, [activeTab]);

  const handleSaveResource = (resource: Resource) => {
    if (editingResource) {
      setResources(prev => prev.map(r => r.id === resource.id ? resource : r));
    } else {
      setResources(prev => [...prev, { ...resource, id: Date.now().toString() }]);
    }
    setIsResourceModalOpen(false);
    setEditingResource(null);
  };

  const handleDeleteResource = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este recurso?')) {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSaveStatus = (status: AppointmentStatusConfig) => {
      if (editingStatus) {
        setStatuses(prev => prev.map(s => s.id === status.id ? status : s));
      } else {
        setStatuses(prev => [...prev, { ...status, id: Date.now().toString() }]);
      }
      setIsStatusModalOpen(false);
      setEditingStatus(null);
  };

    const handleDeleteStatus = (id: string) => {
      if (window.confirm('¿Estás seguro de eliminar este estado?')) {
        setStatuses(prev => prev.filter(s => s.id !== id));
      }
    };

    const handleSaveCancellationReason = (reason: CancellationReason) => {
      if (editingCancellationReason) {
        setCancellationReasons(prev => prev.map(r => r.id === reason.id ? reason : r));
      } else {
        setCancellationReasons(prev => [...prev, { ...reason, id: Date.now().toString() }]);
      }
      setIsCancellationModalOpen(false);
      setEditingCancellationReason(null);
  };

  const handleDeleteCancellationReason = (id: string) => {
     if (window.confirm('¿Estás seguro de eliminar este motivo de cancelación?')) {
      setCancellationReasons(prev => prev.filter(r => r.id !== id));
    }
  };

  const tabs = [
    { id: 'general', label: 'Hora y Calendario', icon: Clock },
    { id: 'resources', label: 'Recursos', icon: Users },
    { id: 'statuses', label: 'Estados y Cancelaciones', icon: Calendar },
    { id: 'blocks', label: 'Bloqueos y Reservas', icon: Ban },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'general' && (
          <div className="space-y-8 max-w-2xl">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Regional</h3>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                      {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formato de Hora</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                    <button 
                      onClick={() => setTimeFormat('12h')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFormat === '12h' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      12 Horas (AM/PM)
                    </button>
                    <button 
                      onClick={() => setTimeFormat('24h')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFormat === '24h' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      24 Horas
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primer día de la semana</label>
                  <select 
                    value={startDay}
                    onChange={(e) => setStartDay(Number(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  >
                    {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t flex justify-end">
                  <button
                    onClick={handleSaveGeneral}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Configuración
                  </button>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Personal y Recursos</h3>
                <p className="text-sm text-gray-500">Gestiona quiénes o qué espacios pueden recibir citas.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingResource(null);
                  setIsResourceModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Nuevo Recurso
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(res => (
                <div key={res.id} className="border rounded-lg p-4 flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-gray-500">{res.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{res.name}</h4>
                    <p className="text-sm text-gray-500">{res.description}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${res.type === 'personal' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {res.type === 'personal' ? 'Personal' : 'Infraestructura'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setEditingResource(res);
                        setIsResourceModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button 
                      onClick={() => handleDeleteResource(res.id)}
                      className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            {isResourceModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                   <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}
                    </h3>
                    <button onClick={() => setIsResourceModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newResource: Resource = {
                      id: editingResource?.id || Date.now().toString(),
                      name: formData.get('name') as string,
                      type: formData.get('type') as 'personal' | 'infrastructure',
                      description: formData.get('description') as string,
                      userId: formData.get('userId') ? Number(formData.get('userId')) : undefined
                    };
                    handleSaveResource(newResource);
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select name="type" defaultValue={editingResource?.type || 'personal'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                          <option value="personal">Personal</option>
                          <option value="infrastructure">Infraestructura</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input name="name" required defaultValue={editingResource?.name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                      </div>

                       <div>
                        <label className="block text-sm font-medium text-gray-700">Usuario Vinculado (Opcional)</label>
                        <select name="userId" defaultValue={editingResource?.userId || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                           <option value="">Ninguno</option>
                           {users.map(u => (
                             <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
                           ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <input name="description" defaultValue={editingResource?.description} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                      </div>

                      <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => setIsResourceModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'statuses' && (
            <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Estados de Citas</h3>
                  <p className="text-sm text-gray-500">Configura los estados y colores para diferenciar citas.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingStatus(null);
                    setIsStatusModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Nuevo Estado
                </button>
              </div>
               <div className="space-y-3 max-w-xl">
                 {statuses.map(st => (
                   <div key={st.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                     <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded border flex items-center justify-center" style={{backgroundColor: st.color}}>
                          <div className="w-3 h-3 bg-white rounded-full opacity-50"></div>
                       </div>
                       <span className="font-medium text-gray-900">{st.name}</span>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingStatus(st);
                            setIsStatusModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStatus(st.id)}
                          className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   </div>
                 ))}
               </div>

                <div className="pt-8 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                        <h3 className="text-lg font-medium text-gray-900">Motivos de Cancelación</h3>
                        <p className="text-sm text-gray-500">Razones predefinidas para cancelar citas.</p>
                        </div>
                        <button 
                          onClick={() => {
                            setEditingCancellationReason(null);
                            setIsCancellationModalOpen(true);
                          }}
                          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Plus className="w-4 h-4" />
                        Agregar Motivo
                        </button>
                    </div>
                    <div className="space-y-3 max-w-xl">
                        {cancellationReasons.map(reason => (
                        <div key={reason.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-gray-400" />
                                <div>
                                    <span className="font-medium text-gray-900 block">{reason.reason}</span>
                                    {reason.requiresNote && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Requiere nota</span>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                onClick={() => {
                                    setEditingCancellationReason(reason);
                                    setIsCancellationModalOpen(true);
                                }}
                                className="text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                onClick={() => handleDeleteCancellationReason(reason.id)}
                                className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

               {isStatusModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">
                          {editingStatus ? 'Editar Estado' : 'Nuevo Estado'}
                        </h3>
                         <button onClick={() => setIsStatusModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                      </div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const newStatus: AppointmentStatusConfig = {
                          id: editingStatus?.id || Date.now().toString(),
                          name: formData.get('name') as string,
                          color: formData.get('color') as string,
                          icon: 'circle' // Default icon logic to be improved
                        };
                        handleSaveStatus(newStatus);
                      }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Estado</label>
                            <input name="name" required defaultValue={editingStatus?.name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Color</label>
                            <div className="flex gap-2 mt-1">
                                <input type="color" name="color" defaultValue={editingStatus?.color || '#000000'} className="h-10 w-20 p-1 rounded border border-gray-300" />
                                <input type="text" disabled value="Selecciona un color" className="flex-1 bg-gray-100 border border-gray-300 rounded px-3 text-sm text-gray-500 flex items-center"/>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {isCancellationModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">
                          {editingCancellationReason ? 'Editar Motivo' : 'Nuevo Motivo'}
                        </h3>
                         <button onClick={() => setIsCancellationModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                      </div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const newReason: CancellationReason = {
                          id: editingCancellationReason?.id || Date.now().toString(),
                          reason: formData.get('reason') as string,
                          requiresNote: formData.get('requiresNote') === 'on'
                        };
                        handleSaveCancellationReason(newReason);
                      }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Motivo</label>
                            <input name="reason" required defaultValue={editingCancellationReason?.reason} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="Ej: No se presentó" />
                          </div>
                           <div className="flex items-center gap-2">
                             <input type="checkbox" name="requiresNote" id="requiresNote" defaultChecked={editingCancellationReason?.requiresNote} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                             <label htmlFor="requiresNote" className="text-sm text-gray-700">Requiere nota explicativa obligatoria</label>
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <button type="button" onClick={() => setIsCancellationModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
            </div>
        )}
        
        {activeTab === 'blocks' && (
            <div className="space-y-8">
               <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Reservas Online</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 max-w-2xl">
                    <div>
                      <p className="font-medium text-gray-900">Habilitar widget de reservas</p>
                      <p className="text-sm text-gray-500">Permite que los clientes agenden sus propias citas a través de un enlace público.</p>
                    </div>
                     <button 
                        onClick={() => setOnlineBookingEnabled(!onlineBookingEnabled)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${onlineBookingEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${onlineBookingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                  </div>
               </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-medium text-gray-900">Fechas de Cierre (Feriados/Vacaciones)</h3>
                     <button className="text-sm text-blue-600 hover:underline">+ Agregar fecha</button>
                  </div>
                  <div className="p-8 text-center border-2 border-dashed rounded-lg text-gray-500">
                    No hay fechas de cierre configuradas.
                  </div>
               </div>
            </div>
        )}
      </div>
    </div>
  );
}
