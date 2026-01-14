import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Calendar, User, Activity, AlertCircle, Info, X } from 'lucide-react';
import { SystemLog } from '../../types';
import * as api from '../../services/api';

// Datos de ejemplo para desarrollo hasta que el backend esté listo
const MOCK_LOGS: SystemLog[] = [
  { id: 1, fecha: new Date().toISOString(), usuario: 'Admin', usuarioId: 1, accion: 'login', modulo: 'Auth', detalles: 'Inicio de sesión exitoso' },
  { id: 2, fecha: new Date(Date.now() - 3600000).toISOString(), usuario: 'Vanesa', usuarioId: 2, accion: 'crear', modulo: 'Leads', detalles: 'Nuevo lead registrado: Juan Perez' },
  { id: 3, fecha: new Date(Date.now() - 7200000).toISOString(), usuario: 'Admin', usuarioId: 1, accion: 'editar', modulo: 'Inventario', detalles: 'Actualización de stock: Botox (50 -> 45). Se actualizó manualmente por ajuste.' },
  { id: 4, fecha: new Date(Date.now() - 86400000).toISOString(), usuario: 'Liz', usuarioId: 3, accion: 'eliminar', modulo: 'Citas', detalles: 'Cita cancelada: Ana Garcia. Motivo: Paciente solicitó reagendar pero no confirmó fecha.' },
  { id: 5, fecha: new Date(Date.now() - 90000000).toISOString(), usuario: 'Sistema', usuarioId: 0, accion: 'error', modulo: 'Integraciones', detalles: 'Error de conexión con WhatsApp API. Timeout de 30s excedido.', metadata: { stack: 'Error: Connection ETIMEDOUT\n at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1146:16)', requestBody: { phone: '51999999999', template: 'reminder_1' } } },
];

interface LogDetailModalProps {
  log: SystemLog;
  onClose: () => void;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Detalle del Log #{log.id}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha y Hora</p>
              <p className="text-gray-900">{new Date(log.fecha).toLocaleString('es-PE')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Módulo</p>
              <p className="text-gray-900 font-medium">{log.modulo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Usuario</p>
              <div className="flex items-center gap-2">
                 <User className="w-4 h-4 text-gray-400" />
                 <span className="text-gray-900">{log.usuario} (ID: {log.usuarioId})</span>
              </div>
            </div>
             <div>
              <p className="text-sm font-medium text-gray-500">Acción</p>
               <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase mt-1 ${
                  log.accion === 'crear' ? 'bg-green-100 text-green-800' :
                  log.accion === 'editar' ? 'bg-blue-100 text-blue-800' :
                  log.accion === 'eliminar' ? 'bg-red-100 text-red-800' :
                  log.accion === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {log.accion}
                </span>
            </div>
            {log.ip && (
              <div>
                <p className="text-sm font-medium text-gray-500">IP de Origen</p>
                <p className="text-gray-900 font-mono text-sm">{log.ip}</p>
              </div>
            )}
          </div>

          <div>
             <p className="text-sm font-medium text-gray-500 mb-2">Detalles</p>
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 text-sm whitespace-pre-wrap">
               {log.detalles}
             </div>
          </div>

          {log.metadata && (
             <div>
               <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                 <AlertCircle className="w-4 h-4" /> 
                 Datos Técnicos / Metadatos
               </p>
               <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                 <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
               </div>
             </div>
          )}
        </div>
        
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('todos');
  const [dateRange, setDateRange] = useState<'hoy' | 'semana' | 'mes'>('semana');
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, [dateRange]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // Intentar cargar del backend real si está disponible
      try {
        const data = await api.getSystemLogs(dateRange, selectedModule !== 'todos' ? selectedModule : undefined, filterText);
        // Si el backend devuelve array vacío pero no error, asumimos que funciona y seteamos data.
        // Si falla, cath below will trigger mock data
        setLogs(data);
      } catch (e) {
         console.warn("Backend logs not available yet, using mock data", e);
         // Fallback a datos mock si el endpoint falla (mientras desplegamos backend)
         // Simulamos filtrado simple en el mock
         const now = new Date();
         let filteredMocks = [...MOCK_LOGS];
         
         // Simulacion basica de fecha
         if (dateRange === 'hoy') {
            filteredMocks = filteredMocks.filter(l => new Date(l.fecha).toDateString() === now.toDateString());
         } 
         // ... otros rangos simplificados
         
         setLogs(filteredMocks);
      }
    } catch (error) {
      console.error('Error cargando logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
      // Filtrado local complementario (útil para búsqueda en texto ya cargado)
    const matchesText = 
      log.usuario.toLowerCase().includes(filterText.toLowerCase()) ||
      log.detalles.toLowerCase().includes(filterText.toLowerCase()) ||
      log.modulo.toLowerCase().includes(filterText.toLowerCase());
    
    const matchesModule = selectedModule === 'todos' || log.modulo === selectedModule;

    return matchesText && matchesModule;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'crear': return 'bg-green-100 text-green-800';
      case 'editar': return 'bg-blue-100 text-blue-800';
      case 'eliminar': return 'bg-red-100 text-red-800';
      case 'login': return 'bg-purple-100 text-purple-800';
      case 'error': return 'bg-red-50 text-red-600 border border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueModules = Array.from(new Set(logs.map(l => l.modulo)));

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-600" />
            Registro de Actividad y Logs
          </h1>
          <p className="text-gray-600 mt-1">Monitoreo de acciones, errores y seguridad del sistema</p>
        </div>
        <button 
          onClick={loadLogs}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por usuario, detalle..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los módulos</option>
            {uniqueModules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
             value={dateRange}
             onChange={(e) => setDateRange(e.target.value as any)}
             className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="hoy">Hoy</option>
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mes</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Fecha y Hora</th>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Acción</th>
                <th className="px-6 py-3">Módulo</th>
                <th className="px-6 py-3">Detalles</th>
                <th className="px-6 py-3 text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedLog(log)}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(log.fecha).toLocaleString('es-PE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {log.usuario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getActionColor(log.accion)}`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {log.modulo}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={log.detalles}>
                      {log.detalles}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                            Ver Detalle
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron registros coincidenes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
       
       {selectedLog && (
           <LogDetailModal 
              log={selectedLog} 
              onClose={() => setSelectedLog(null)} 
           />
       )}
    </div>
  );
}

