import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Calendar, User, Activity } from 'lucide-react';
import { SystemLog } from '../../types';
import * as api from '../../services/api';

// Datos de ejemplo para desarrollo hasta que el backend esté listo
const MOCK_LOGS: SystemLog[] = [
  { id: 1, fecha: new Date().toISOString(), usuario: 'Admin', usuarioId: 1, accion: 'login', modulo: 'Auth', detalles: 'Inicio de sesión exitoso' },
  { id: 2, fecha: new Date(Date.now() - 3600000).toISOString(), usuario: 'Vanesa', usuarioId: 2, accion: 'crear', modulo: 'Leads', detalles: 'Nuevo lead registrado: Juan Perez' },
  { id: 3, fecha: new Date(Date.now() - 7200000).toISOString(), usuario: 'Admin', usuarioId: 1, accion: 'editar', modulo: 'Inventario', detalles: 'Actualización de stock: Botox (50 -> 45)' },
  { id: 4, fecha: new Date(Date.now() - 86400000).toISOString(), usuario: 'Liz', usuarioId: 3, accion: 'eliminar', modulo: 'Citas', detalles: 'Cita cancelada: Ana Garcia' },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('todos');
  const [dateRange, setDateRange] = useState<'hoy' | 'semana' | 'mes'>('semana');

  useEffect(() => {
    loadLogs();
  }, [dateRange]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // TODO: Conectar con endpoint real
      // const data = await api.getSystemLogs(dateRange);
      // setLogs(data);
      
      // Simulación de carga
      setTimeout(() => {
        setLogs(MOCK_LOGS);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error cargando logs:', error);
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
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
          <p className="text-gray-600 mt-1">Monitoreo de acciones y seguridad del sistema</p>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 text-gray-600">
                      {log.detalles}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron registros coincidenes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
