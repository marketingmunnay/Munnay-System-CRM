import React, { useState, useEffect } from 'react';
import { X, Plus, DollarSign, Package, Truck } from 'lucide-react';
import * as api from '../../services/api';
import { PagoProducto } from '../../types';

interface PagoParcialModalProps {
  productos: any[];
  pagoExistente?: PagoProducto | null;
  onClose: () => void;
  onSave: () => void;
}

type Vista = 'crear' | 'abonar' | 'entregar' | 'lista';

export default function PagoParcialModal({
  productos,
  pagoExistente,
  onClose,
  onSave
}: PagoParcialModalProps) {
  const [vista, setVista] = useState<Vista>(pagoExistente ? 'abonar' : 'crear');
  const [pagosPendientes, setPagosPendientes] = useState<PagoProducto[]>([]);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<PagoProducto | null>(pagoExistente || null);
  
  const [formCrear, setFormCrear] = useState({
    productoId: 0,
    nHistoria: '',
    montoTotal: 0,
    montoPagado: 0,
    metodoPago: 'Efectivo',
    esPrepago: false,
    observaciones: ''
  });

  const [formAbonar, setFormAbonar] = useState({
    montoAbonado: 0,
    metodoPago: 'Efectivo',
    registradoPor: '',
    observaciones: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pagoExistente) {
      cargarPagosPendientes();
    }
  }, []);

  const cargarPagosPendientes = async () => {
    try {
      const pagos = await api.getPagosProductos();
      setPagosPendientes(pagos.filter((p: PagoProducto) => 
        p.estadoPago !== 'completado' && p.estadoPago !== 'cancelado'
      ));
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    }
  };

  const handleCrearPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formCrear.productoId === 0) {
      setError('Selecciona un producto');
      return;
    }

    if (!formCrear.nHistoria.trim()) {
      setError('Ingresa el número de historia del paciente');
      return;
    }

    if (formCrear.montoTotal <= 0) {
      setError('El monto total debe ser mayor a 0');
      return;
    }

    if (formCrear.montoPagado < 0) {
      setError('El monto pagado no puede ser negativo');
      return;
    }

    if (formCrear.montoPagado > formCrear.montoTotal) {
      setError('El monto pagado no puede ser mayor al monto total');
      return;
    }

    setLoading(true);
    try {
      await api.crearPagoProducto(formCrear);
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleAbonar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pagoSeleccionado) {
      setError('No hay pago seleccionado');
      return;
    }

    if (formAbonar.montoAbonado <= 0) {
      setError('El monto a abonar debe ser mayor a 0');
      return;
    }

    if (formAbonar.montoAbonado > pagoSeleccionado.saldoPendiente) {
      setError(`El monto no puede ser mayor al saldo pendiente (S/ ${pagoSeleccionado.saldoPendiente.toFixed(2)})`);
      return;
    }

    setLoading(true);
    try {
      await api.abonarPagoProducto(pagoSeleccionado.id, formAbonar);
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el abono');
    } finally {
      setLoading(false);
    }
  };

  const handleEntregar = async () => {
    if (!pagoSeleccionado) return;

    if (pagoSeleccionado.estadoPago !== 'completado') {
      setError('El producto solo puede entregarse cuando el pago esté completado');
      return;
    }

    if (window.confirm('¿Confirmas la entrega del producto al paciente?')) {
      setLoading(true);
      try {
        await api.entregarProducto(pagoSeleccionado.id);
        onSave();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al entregar el producto');
      } finally {
        setLoading(false);
      }
    }
  };

  const productoSeleccionado = productos.find(p => p.id === formCrear.productoId);

  const renderCrear = () => (
    <form onSubmit={handleCrearPago} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Producto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Producto *
        </label>
        <select
          value={formCrear.productoId}
          onChange={(e) => {
            const prodId = parseInt(e.target.value);
            const prod = productos.find(p => p.id === prodId);
            setFormCrear({
              ...formCrear,
              productoId: prodId,
              montoTotal: prod?.precio || 0
            });
          }}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value={0}>Seleccionar producto...</option>
          {productos.map(prod => (
            <option key={prod.id} value={prod.id}>
              {prod.nombre} - S/ {prod.precio.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {/* Historia clínica */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          N° Historia Clínica *
        </label>
        <input
          type="text"
          value={formCrear.nHistoria}
          onChange={(e) => setFormCrear({ ...formCrear, nHistoria: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: H-2024-001"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Monto total */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto Total (S/) *
          </label>
          <input
            type="number"
            value={formCrear.montoTotal}
            onChange={(e) => setFormCrear({ ...formCrear, montoTotal: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Monto inicial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pago Inicial (S/)
          </label>
          <input
            type="number"
            value={formCrear.montoPagado}
            onChange={(e) => setFormCrear({ ...formCrear, montoPagado: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago *
        </label>
        <select
          value={formCrear.metodoPago}
          onChange={(e) => setFormCrear({ ...formCrear, metodoPago: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Yape">Yape</option>
        </select>
      </div>

      {/* Es prepago */}
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formCrear.esPrepago}
            onChange={(e) => setFormCrear({ ...formCrear, esPrepago: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Es prepago (sin stock disponible)</span>
        </label>
        <p className="mt-1 text-xs text-gray-500 ml-6">
          Marca esta opción si el cliente paga antes de tener el producto en stock
        </p>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones
        </label>
        <textarea
          value={formCrear.observaciones}
          onChange={(e) => setFormCrear({ ...formCrear, observaciones: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Notas adicionales..."
        />
      </div>

      {/* Resumen */}
      {formCrear.montoTotal > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Resumen del Pago</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Monto total:</strong> S/ {formCrear.montoTotal.toFixed(2)}</p>
            <p><strong>Pago inicial:</strong> S/ {formCrear.montoPagado.toFixed(2)}</p>
            <p className="text-lg font-bold text-blue-900">
              <strong>Saldo pendiente:</strong> S/ {(formCrear.montoTotal - formCrear.montoPagado).toFixed(2)}
            </p>
            {formCrear.montoPagado >= formCrear.montoTotal && (
              <p className="text-green-600 font-medium">✓ Pago completo - Producto listo para entrega</p>
            )}
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Pago'}
        </button>
      </div>
    </form>
  );

  const renderAbonar = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Selección de pago pendiente */}
      {!pagoSeleccionado && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona un pago pendiente
          </label>
          <div className="space-y-2">
            {pagosPendientes.map(pago => (
              <button
                key={pago.id}
                type="button"
                onClick={() => setPagoSeleccionado(pago)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 text-left transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Paciente: {pago.nHistoria}</p>
                    <p className="text-sm text-gray-600">
                      Total: S/ {pago.montoTotal.toFixed(2)} | 
                      Pagado: S/ {pago.montoPagado.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      S/ {pago.saldoPendiente.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Saldo pendiente</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de abono */}
      {pagoSeleccionado && (
        <form onSubmit={handleAbonar} className="space-y-6">
          {/* Info del pago */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Información del Pago</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Paciente:</strong> {pagoSeleccionado.nHistoria}</p>
              <p><strong>Monto total:</strong> S/ {pagoSeleccionado.montoTotal.toFixed(2)}</p>
              <p><strong>Ya pagado:</strong> S/ {pagoSeleccionado.montoPagado.toFixed(2)}</p>
              <p className="text-lg font-bold text-red-600">
                <strong>Saldo pendiente:</strong> S/ {pagoSeleccionado.saldoPendiente.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Monto a abonar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a Abonar (S/) *
            </label>
            <input
              type="number"
              value={formAbonar.montoAbonado}
              onChange={(e) => setFormAbonar({ ...formAbonar, montoAbonado: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0.01"
              max={pagoSeleccionado.saldoPendiente}
              step="0.01"
              required
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setFormAbonar({ ...formAbonar, montoAbonado: pagoSeleccionado.saldoPendiente / 2 })}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setFormAbonar({ ...formAbonar, montoAbonado: pagoSeleccionado.saldoPendiente })}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Saldo completo
              </button>
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago *
            </label>
            <select
              value={formAbonar.metodoPago}
              onChange={(e) => setFormAbonar({ ...formAbonar, metodoPago: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Yape">Yape</option>
            </select>
          </div>

          {/* Registrado por */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registrado por
            </label>
            <input
              type="text"
              value={formAbonar.registradoPor}
              onChange={(e) => setFormAbonar({ ...formAbonar, registradoPor: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Tu nombre"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formAbonar.observaciones}
              onChange={(e) => setFormAbonar({ ...formAbonar, observaciones: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          {/* Resumen */}
          {formAbonar.montoAbonado > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-900 mb-2">Nuevo Saldo</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Saldo actual:</strong> S/ {pagoSeleccionado.saldoPendiente.toFixed(2)}</p>
                <p><strong>Abono:</strong> -S/ {formAbonar.montoAbonado.toFixed(2)}</p>
                <p className="text-lg font-bold text-green-900">
                  <strong>Nuevo saldo:</strong> S/ {(pagoSeleccionado.saldoPendiente - formAbonar.montoAbonado).toFixed(2)}
                </p>
                {formAbonar.montoAbonado >= pagoSeleccionado.saldoPendiente && (
                  <p className="text-green-600 font-medium">✓ Pago completado - El producto quedará listo para entrega</p>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setPagoSeleccionado(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar Abono'}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  const renderEntregar = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Lista de productos listos para entrega */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Productos Listos para Entrega</h3>
        <div className="space-y-2">
          {pagosPendientes
            .filter(p => p.estadoPago === 'completado' && p.estadoProducto === 'pendiente_entrega')
            .map(pago => (
              <div key={pago.id} className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Paciente: {pago.nHistoria}</p>
                    <p className="text-sm text-gray-600">
                      Monto: S/ {pago.montoTotal.toFixed(2)} | Pagado: {new Date(pago.fechaPago).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPagoSeleccionado(pago);
                      handleEntregar();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    Entregar
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cerrar
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Gestión de Pagos de Productos</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          {!pagoExistente && (
            <div className="flex gap-2">
              <button
                onClick={() => setVista('crear')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  vista === 'crear'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                Nuevo Pago
              </button>
              <button
                onClick={() => setVista('abonar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  vista === 'abonar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Abonar
              </button>
              <button
                onClick={() => setVista('entregar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  vista === 'entregar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Truck className="w-4 h-4" />
                Entregar
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          {vista === 'crear' && renderCrear()}
          {vista === 'abonar' && renderAbonar()}
          {vista === 'entregar' && renderEntregar()}
        </div>
      </div>
    </div>
  );
}
