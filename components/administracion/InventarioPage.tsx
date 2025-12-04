import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { ProductoConInventario, MovimientoInventario, PagoProducto, AlertaStock, ConfiguracionProducto } from '../../types';
import { Package, Plus, AlertTriangle, TrendingUp, DollarSign, CheckCircle, Clock, Box } from 'lucide-react';
import ConfiguracionInventarioModal from './ConfiguracionInventarioModal';
import MovimientoInventarioModal from './MovimientoInventarioModal';
import PagoParcialModal from './PagoParcialModal';

interface InventarioPageProps {
  productos: any[];
  onReload?: () => void;
}

export default function InventarioPage({ productos, onReload }: InventarioPageProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'configuracion' | 'movimientos' | 'pagos' | 'alertas'>('dashboard');
  const [reporte, setReporte] = useState<any>(null);
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionProducto[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [pagos, setPagos] = useState<PagoProducto[]>([]);
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [loading, setLoading] = useState(false);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedConfiguracion, setSelectedConfiguracion] = useState<ConfiguracionProducto | null>(null);
  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reporteData, movimientosData, pagosData, alertasData] = await Promise.all([
        api.getReporteInventario(),
        api.getMovimientosInventario(),
        api.getPagosProductos(),
        api.getAlertas()
      ]);

      setReporte(reporteData);
      setMovimientos(movimientosData);
      setPagos(pagosData);
      setAlertas(alertasData.filter((a: AlertaStock) => !a.resuelto));

      // Extraer configuraciones del reporte
      if (reporteData.reporte) {
        const configs: ConfiguracionProducto[] = reporteData.reporte.map((item: any) => ({
          id: item.id,
          productoId: item.productoId,
          stockActual: item.stockActual,
          stockMinimo: item.stockMinimo,
          unidadMedida: item.unidadMedida,
          equivalenciaBase: 1,
          costoUnitario: item.costoUnitario,
          aplicaIGV: item.aplicaIGV,
          igvPorcentaje: item.igvMonto ? 18 : 0,
          alertasActivas: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        setConfiguraciones(configs);
      }
    } catch (error) {
      console.error('Error al cargar datos de inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearConfiguracion = (productoId: number) => {
    setSelectedProductoId(productoId);
    setSelectedConfiguracion(null);
    setShowConfigModal(true);
  };

  const handleEditarConfiguracion = (config: ConfiguracionProducto) => {
    setSelectedConfiguracion(config);
    setSelectedProductoId(config.productoId);
    setShowConfigModal(true);
  };

  const handleRegistrarMovimiento = (productoId?: number) => {
    setSelectedProductoId(productoId || null);
    setShowMovimientoModal(true);
  };

  const handleCrearPago = () => {
    setShowPagoModal(true);
  };

  const handleMarcarAlertaVista = async (id: number) => {
    try {
      await api.marcarAlertaVista(id);
      await loadData();
    } catch (error) {
      console.error('Error al marcar alerta:', error);
    }
  };

  const handleResolverAlerta = async (id: number) => {
    try {
      await api.resolverAlerta(id);
      await loadData();
    } catch (error) {
      console.error('Error al resolver alerta:', error);
    }
  };

  const getEstadoPagoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'text-green-600 bg-green-50';
      case 'parcial': return 'text-yellow-600 bg-yellow-50';
      case 'pendiente': return 'text-red-600 bg-red-50';
      case 'cancelado': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEstadoProductoColor = (estado: string) => {
    switch (estado) {
      case 'entregado': return 'text-green-600 bg-green-50';
      case 'pendiente_entrega': return 'text-blue-600 bg-blue-50';
      case 'reservado': return 'text-purple-600 bg-purple-50';
      case 'pendiente_stock': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTipoAlertaColor = (tipo: string) => {
    switch (tipo) {
      case 'stock_cero': return 'text-red-600 bg-red-50 border-red-200';
      case 'stock_critico': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'stock_bajo': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{reporte?.resumen?.totalProductos || 0}</p>
            </div>
            <Box className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold text-gray-900">S/ {reporte?.resumen?.totalValorInventario?.toFixed(2) || '0.00'}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Venta</p>
              <p className="text-2xl font-bold text-gray-900">S/ {reporte?.resumen?.totalValorVenta?.toFixed(2) || '0.00'}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertas Activas</p>
              <p className="text-2xl font-bold text-gray-900">{alertas.length}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Alertas importantes */}
      {alertas.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alertas de Stock
          </h3>
          <div className="space-y-2">
            {alertas.slice(0, 5).map(alerta => (
              <div key={alerta.id} className={`p-3 rounded-lg border flex justify-between items-center ${getTipoAlertaColor(alerta.tipoAlerta)}`}>
                <div>
                  <p className="font-medium">{alerta.mensaje}</p>
                  <p className="text-sm">Stock actual: {alerta.stockActual} | Mínimo: {alerta.stockMinimo}</p>
                </div>
                <button
                  onClick={() => handleResolverAlerta(alerta.id)}
                  className="px-3 py-1 bg-white rounded hover:bg-gray-50 text-sm font-medium"
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de productos con inventario */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Productos en Inventario</h3>
          <button
            onClick={() => setActiveTab('configuracion')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Configurar Producto
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Venta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reporte?.reporte?.map((item: any) => (
                <tr key={item.productoId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.productoNombre}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.stockActual}</div>
                    <div className="text-xs text-gray-500">Mín: {item.stockMinimo}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.unidadMedida}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">S/ {item.costoUnitario?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">S/ {item.precioVenta?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">S/ {item.valorInventario?.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.estadoStock === 'normal' ? 'bg-green-100 text-green-800' :
                      item.estadoStock === 'bajo' ? 'bg-yellow-100 text-yellow-800' :
                      item.estadoStock === 'critico' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.estadoStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => handleRegistrarMovimiento(item.productoId)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Movimiento
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderConfiguracion = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Configuración de Inventario</h3>
        <button
          onClick={() => handleCrearConfiguracion(0)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Configuración
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Mínimo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IGV</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alertas</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reporte?.reporte?.map((item: any) => {
              const config = configuraciones.find(c => c.productoId === item.productoId);
              return (
                <tr key={item.productoId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.productoNombre}</td>
                  <td className="px-6 py-4">{item.stockActual}</td>
                  <td className="px-6 py-4">{item.stockMinimo}</td>
                  <td className="px-6 py-4">{item.unidadMedida}</td>
                  <td className="px-6 py-4">S/ {item.costoUnitario?.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {item.aplicaIGV ? (
                      <span className="text-green-600">Sí (18%)</span>
                    ) : (
                      <span className="text-gray-600">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.alertasActivas ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => config && handleEditarConfiguracion(config)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMovimientos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Movimientos de Inventario</h3>
        <button
          onClick={() => handleRegistrarMovimiento()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Registrar Movimiento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado Por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {movimientos.map(mov => (
              <tr key={mov.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(mov.createdAt).toLocaleDateString('es-PE')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    mov.tipoMovimiento === 'entrada' ? 'bg-green-100 text-green-800' :
                    mov.tipoMovimiento === 'salida' ? 'bg-red-100 text-red-800' :
                    mov.tipoMovimiento === 'ajuste' ? 'bg-yellow-100 text-yellow-800' :
                    mov.tipoMovimiento === 'reserva' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {mov.tipoMovimiento}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{mov.cantidad}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {mov.stockAnterior} → {mov.stockNuevo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{mov.motivo}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{mov.creadoPor || 'Sistema'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPagos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pagos de Productos</h3>
        <button
          onClick={handleCrearPago}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Pago
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado Pago</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pagos.map(pago => (
              <tr key={pago.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{pago.nHistoria}</td>
                <td className="px-6 py-4">S/ {pago.montoTotal.toFixed(2)}</td>
                <td className="px-6 py-4">S/ {pago.montoPagado.toFixed(2)}</td>
                <td className="px-6 py-4 font-medium">S/ {pago.saldoPendiente.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getEstadoPagoColor(pago.estadoPago)}`}>
                    {pago.estadoPago}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getEstadoProductoColor(pago.estadoProducto)}`}>
                    {pago.estadoProducto.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(pago.fechaPago).toLocaleDateString('es-PE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAlertas = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Alertas de Stock</h3>

      <div className="grid gap-4">
        {alertas.map(alerta => (
          <div key={alerta.id} className={`p-4 rounded-lg border ${getTipoAlertaColor(alerta.tipoAlerta)}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold text-lg">{alerta.tipoAlerta.replace('_', ' ').toUpperCase()}</span>
                </div>
                <p className="text-sm mb-2">{alerta.mensaje}</p>
                <div className="flex gap-4 text-sm">
                  <span>Stock actual: <strong>{alerta.stockActual}</strong></span>
                  <span>Stock mínimo: <strong>{alerta.stockMinimo}</strong></span>
                  <span>Fecha: {new Date(alerta.createdAt).toLocaleDateString('es-PE')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {!alerta.visto && (
                  <button
                    onClick={() => handleMarcarAlertaVista(alerta.id)}
                    className="px-3 py-1 bg-white rounded hover:bg-gray-50 text-sm font-medium"
                  >
                    Marcar vista
                  </button>
                )}
                <button
                  onClick={() => handleResolverAlerta(alerta.id)}
                  className="px-3 py-1 bg-white rounded hover:bg-gray-50 text-sm font-medium"
                >
                  Resolver
                </button>
              </div>
            </div>
          </div>
        ))}

        {alertas.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay alertas activas</p>
            <p className="text-gray-500 text-sm mt-2">Todos los productos tienen stock suficiente</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            Gestión de Inventario
          </h1>
          <p className="text-gray-600 mt-1">Control inteligente de stock, pagos parciales y alertas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'configuracion', label: 'Configuración', icon: Package },
            { id: 'movimientos', label: 'Movimientos', icon: Box },
            { id: 'pagos', label: 'Pagos', icon: DollarSign },
            { id: 'alertas', label: 'Alertas', icon: AlertTriangle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.id === 'alertas' && alertas.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {alertas.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'configuracion' && renderConfiguracion()}
          {activeTab === 'movimientos' && renderMovimientos()}
          {activeTab === 'pagos' && renderPagos()}
          {activeTab === 'alertas' && renderAlertas()}
        </>
      )}

      {/* Modales */}
      {showConfigModal && (
        <ConfiguracionInventarioModal
          productoId={selectedProductoId}
          configuracion={selectedConfiguracion}
          productos={productos}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedConfiguracion(null);
            setSelectedProductoId(null);
          }}
          onSave={async () => {
            await loadData();
            if (onReload) onReload();
            setShowConfigModal(false);
            setSelectedConfiguracion(null);
            setSelectedProductoId(null);
          }}
        />
      )}

      {showMovimientoModal && (
        <MovimientoInventarioModal
          configuraciones={configuraciones}
          productoIdInicial={selectedProductoId}
          onClose={() => {
            setShowMovimientoModal(false);
            setSelectedProductoId(null);
          }}
          onSave={async () => {
            await loadData();
            setShowMovimientoModal(false);
            setSelectedProductoId(null);
          }}
        />
      )}

      {showPagoModal && (
        <PagoParcialModal
          productos={productos}
          onClose={() => setShowPagoModal(false)}
          onSave={async () => {
            await loadData();
            setShowPagoModal(false);
          }}
        />
      )}
    </div>
  );
}
