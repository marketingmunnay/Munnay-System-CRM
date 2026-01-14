import React, { useState } from 'react';
import { Clock, Users, Calendar, Ban, Globe, Check, Plus, Trash2, Edit2 } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface AppointmentStatusConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
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

const MOCK_RESOURCES = [
    { id: '1', name: 'Dra. Marilia', description: 'Especialista Facial' },
    { id: '2', name: 'Dra. Sofía', description: 'Dermatología' },
    { id: '3', name: 'Cabina 1', description: 'Sala de procedimientos' },
];

const MOCK_STATUSES = [
  { id: 'confirmed', name: 'Confirmado', color: '#10B981', icon: 'check' },
  { id: 'pending', name: 'Pendiente', color: '#F59E0B', icon: 'clock' },
  { id: 'cancelled', name: 'Cancelado', color: '#EF4444', icon: 'x' },
];

export default function CitasConfigPage() {
  const [activeTab, setActiveTab] = useState('general');
  // General Config
  const [timezone, setTimezone] = useState('America/Lima');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [startDay, setStartDay] = useState(1);
  
  // Resources
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  
  // Statuses
  const [statuses, setStatuses] = useState<AppointmentStatusConfig[]>(MOCK_STATUSES);
  
  // Online Booking
  const [onlineBookingEnabled, setOnlineBookingEnabled] = useState(false);

  // Closure Dates
  const [closureDates, setClosureDates] = useState<{start: string, end: string, reason: string}[]>([]);

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
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'statuses' && (
            <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Estados de Citas</h3>
                  <p className="text-sm text-gray-500">Configura los estados y colores para diferenciar citas.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Nuevo Estado
                </button>
              </div>
               <div className="space-y-3 max-w-xl">
                 {statuses.map(st => (
                   <div key={st.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                     <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded border flex items-center justify-center" style={{backgroundColor: st.color}}>
                          {/* Placeholder for icon rendering logic */}
                       </div>
                       <span className="font-medium text-gray-900">{st.name}</span>
                     </div>
                     <button className="text-gray-400 hover:text-gray-600"><Edit2 className="w-4 h-4" /></button>
                   </div>
                 ))}
               </div>
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
