import React, { useState } from 'react';
import { X } from 'lucide-react';
import * as api from '../../services/api';
import { ConfiguracionProducto, TipoMovimiento } from '../../types';

interface MovimientoInventarioModalProps {
  configuraciones: ConfiguracionProducto[];
  productoIdInicial: number | null;
  onClose: () => void;
  onSave: () => void;
}

const TIPOS_MOVIMIENTO: { value: TipoMovimiento; label: string; color: string }[] = [
  { value: 'entrada', label: 'Entrada de Stock', color: 'text-green-600' },
  { value: 'salida', label: 'Salida de Stock', color: 'text-red-600' },
  { value: 'ajuste', label: 'Ajuste de Inventario', color: 'text-yellow-600' },
  { value: 'reserva', label: 'Reserva de Producto', color: 'text-purple-600' },
  { value: 'devolucion', label: 'Devolución', color: 'text-blue-600' }
];

export default function MovimientoInventarioModal({
  configuraciones,
  productoIdInicial,
  onClose,
  onSave
}: MovimientoInventarioModalProps) {
  const configInicial = configuraciones.find(c => c.productoId === productoIdInicial);

  const [formData, setFormData] = useState({
    configuracionProductoId: configInicial?.id || 0,
    tipoMovimiento: 'entrada' as TipoMovimiento,
    cantidad: 0,
    costoUnitario: configInicial?.costoUnitario || 0,
    precioVenta: 0,
    motivo: '',
    referencia: '',
    creadoPor: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const configuracionSeleccionada = configuraciones.find(
    c => c.id === formData.configuracionProductoId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.configuracionProductoId === 0) {
      setError('Selecciona un producto');
      return;
    }

    if (formData.cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (!formData.motivo.trim()) {
      setError('Debes indicar el motivo del movimiento');
      return;
    }

    // Validar que no se saque más stock del disponible
    if (
      (formData.tipoMovimiento === 'salida' || formData.tipoMovimiento === 'reserva') &&
      configuracionSeleccionada &&
      formData.cantidad > configuracionSeleccionada.stockActual
    ) {
      setError(`Stock insuficiente. Disponible: ${configuracionSeleccionada.stockActual}`);
      return;
    }

    setLoading(true);
    try {
      await api.registrarMovimiento(formData);
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  const stockResultante = configuracionSeleccionada
    ? formData.tipoMovimiento === 'entrada'
      ? configuracionSeleccionada.stockActual + formData.cantidad
      : formData.tipoMovimiento === 'salida' || formData.tipoMovimiento === 'reserva'
      ? configuracionSeleccionada.stockActual - formData.cantidad
      : configuracionSeleccionada.stockActual
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Registrar Movimiento de Inventario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Selección de producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producto *
            </label>
            <select
              value={formData.configuracionProductoId}
              onChange={(e) => {
                const configId = parseInt(e.target.value);
                const config = configuraciones.find(c => c.id === configId);
                setFormData({
                  ...formData,
                  configuracionProductoId: configId,
                  costoUnitario: config?.costoUnitario || 0
                });
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>Seleccionar producto...</option>
              {configuraciones.map(config => (
                <option key={config.id} value={config.id}>
                  Producto ID: {config.productoId} - Stock: {config.stockActual} {config.unidadMedida}
                </option>
              ))}
            </select>
            {configuracionSeleccionada && (
              <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                <p><strong>Stock actual:</strong> {configuracionSeleccionada.stockActual} {configuracionSeleccionada.unidadMedida}</p>
                <p><strong>Stock mínimo:</strong> {configuracionSeleccionada.stockMinimo} {configuracionSeleccionada.unidadMedida}</p>
                <p><strong>Costo unitario:</strong> S/ {configuracionSeleccionada.costoUnitario.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Movimiento *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS_MOVIMIENTO.map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoMovimiento: tipo.value })}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    formData.tipoMovimiento === tipo.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`font-medium ${tipo.color}`}>{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            {/* Costo unitario (para entradas) */}
            {formData.tipoMovimiento === 'entrada' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Unitario (S/)
                </label>
                <input
                  type="number"
                  value={formData.costoUnitario}
                  onChange={(e) => setFormData({ ...formData, costoUnitario: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            {/* Precio venta (para salidas) */}
            {(formData.tipoMovimiento === 'salida' || formData.tipoMovimiento === 'reserva') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Venta (S/)
                </label>
                <input
                  type="number"
                  value={formData.precioVenta}
                  onChange={(e) => setFormData({ ...formData, precioVenta: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del Movimiento *
            </label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe el motivo del movimiento..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Referencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia
              </label>
              <input
                type="text"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Factura #123, Venta #456"
              />
            </div>

            {/* Creado por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registrado por
              </label>
              <input
                type="text"
                value={formData.creadoPor}
                onChange={(e) => setFormData({ ...formData, creadoPor: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tu nombre"
              />
            </div>
          </div>

          {/* Resumen del movimiento */}
          {configuracionSeleccionada && formData.cantidad > 0 && (
            <div className={`p-4 rounded-lg border-2 ${
              formData.tipoMovimiento === 'entrada'
                ? 'bg-green-50 border-green-200'
                : formData.tipoMovimiento === 'salida' || formData.tipoMovimiento === 'reserva'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h3 className="font-semibold mb-2">Resumen del Movimiento</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Stock actual:</strong> {configuracionSeleccionada.stockActual} {configuracionSeleccionada.unidadMedida}
                </p>
                <p>
                  <strong>Movimiento:</strong>{' '}
                  {formData.tipoMovimiento === 'entrada' ? '+' : '-'}{formData.cantidad} {configuracionSeleccionada.unidadMedida}
                </p>
                <p className="text-lg font-bold">
                  <strong>Stock resultante:</strong> {stockResultante} {configuracionSeleccionada.unidadMedida}
                </p>
                {stockResultante < configuracionSeleccionada.stockMinimo && (
                  <p className="text-orange-600 font-medium">
                    ⚠️ El stock quedará por debajo del mínimo ({configuracionSeleccionada.stockMinimo})
                  </p>
                )}
                {formData.tipoMovimiento === 'entrada' && formData.cantidad > 0 && (
                  <p className="mt-2">
                    <strong>Valor total:</strong> S/ {(formData.cantidad * formData.costoUnitario).toFixed(2)}
                  </p>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
