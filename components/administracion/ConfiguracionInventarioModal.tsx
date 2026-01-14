import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import * as api from '../../services/api';
import { ConfiguracionProducto, UnidadMedida } from '../../types';

interface ConfiguracionInventarioModalProps {
  productoId: number | null;
  configuracion: ConfiguracionProducto | null;
  productos: any[];
  onClose: () => void;
  onSave: () => void;
}

const UNIDADES_MEDIDA: UnidadMedida[] = ['unidades', 'cajas', 'paquetes', 'blister', 'ml', 'g', 'litros'];

export default function ConfiguracionInventarioModal({
  productoId: productoIdProp,
  configuracion,
  productos,
  onClose,
  onSave
}: ConfiguracionInventarioModalProps) {
  const [formData, setFormData] = useState({
    productoId: productoIdProp || 0,
    stockActual: 0,
    stockMinimo: 5,
    unidadMedida: 'unidades' as UnidadMedida,
    equivalenciaBase: 1,
    costoUnitario: 0,
    aplicaIGV: true,
    igvPorcentaje: 18,
    alertasActivas: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (configuracion) {
      setFormData({
        productoId: configuracion.productoId,
        stockActual: configuracion.stockActual,
        stockMinimo: configuracion.stockMinimo,
        unidadMedida: configuracion.unidadMedida as UnidadMedida,
        equivalenciaBase: configuracion.equivalenciaBase,
        costoUnitario: configuracion.costoUnitario,
        aplicaIGV: configuracion.aplicaIGV,
        igvPorcentaje: configuracion.igvPorcentaje,
        alertasActivas: configuracion.alertasActivas
      });
    }
  }, [configuracion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.productoId === 0) {
      setError('Selecciona un producto');
      return;
    }

    if (formData.costoUnitario <= 0) {
      setError('El costo unitario debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      if (configuracion) {
        await api.actualizarConfiguracionProducto(configuracion.id, formData);
      } else {
        await api.crearConfiguracionProducto(formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const productoSeleccionado = (productos || []).find(p => p.id === formData.productoId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {configuracion ? 'Editar' : 'Nueva'} Configuración de Inventario
          </h2>
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
              value={formData.productoId}
              onChange={(e) => setFormData({ ...formData, productoId: parseInt(e.target.value) })}
              disabled={!!configuracion}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value={0}>Seleccionar producto...</option>
              {(productos || []).map(producto => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} - {producto.categoria}
                </option>
              ))}
            </select>
            {productoSeleccionado && (
              <p className="mt-1 text-sm text-gray-600">
                Precio de venta: S/ {productoSeleccionado.precio.toFixed(2)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stock actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Actual *
              </label>
              <input
                type="number"
                value={formData.stockActual}
                onChange={(e) => setFormData({ ...formData, stockActual: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>

            {/* Stock mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="number"
                value={formData.stockMinimo}
                onChange={(e) => setFormData({ ...formData, stockMinimo: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Se generará alerta cuando el stock llegue a este nivel
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Unidad de medida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Medida *
              </label>
              <select
                value={formData.unidadMedida}
                onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value as UnidadMedida })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {UNIDADES_MEDIDA.map(unidad => (
                  <option key={unidad} value={unidad}>{unidad}</option>
                ))}
              </select>
            </div>

            {/* Equivalencia base */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equivalencia Base
              </label>
              <input
                type="number"
                value={formData.equivalenciaBase}
                onChange={(e) => setFormData({ ...formData, equivalenciaBase: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0.01"
                step="0.01"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Ej: 1 caja = 10 unidades
              </p>
            </div>
          </div>

          {/* Costo unitario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo Unitario (S/) *
            </label>
            <input
              type="number"
              value={formData.costoUnitario}
              onChange={(e) => setFormData({ ...formData, costoUnitario: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Costo de compra o adquisición del producto
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Aplica IGV */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.aplicaIGV}
                  onChange={(e) => setFormData({ ...formData, aplicaIGV: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Aplica IGV</span>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                Incluir IGV en el precio de venta
              </p>
            </div>

            {/* Porcentaje IGV */}
            {formData.aplicaIGV && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje IGV (%)
                </label>
                <input
                  type="number"
                  value={formData.igvPorcentaje}
                  onChange={(e) => setFormData({ ...formData, igvPorcentaje: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            )}
          </div>

          {/* Alertas activas */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alertasActivas}
                onChange={(e) => setFormData({ ...formData, alertasActivas: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Alertas Activas</span>
            </label>
            <p className="mt-1 text-xs text-gray-500 ml-6">
              Recibir notificaciones cuando el stock esté bajo o agotado
            </p>
          </div>

          {/* Resumen de cálculos */}
          {productoSeleccionado && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Resumen de Cálculos</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Valor de inventario:</p>
                  <p className="font-semibold text-gray-900">
                    S/ {(formData.stockActual * formData.costoUnitario).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Valor de venta:</p>
                  <p className="font-semibold text-gray-900">
                    S/ {(formData.stockActual * productoSeleccionado.precio).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Margen por unidad:</p>
                  <p className="font-semibold text-green-600">
                    S/ {(productoSeleccionado.precio - formData.costoUnitario).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Margen total:</p>
                  <p className="font-semibold text-green-600">
                    S/ {((productoSeleccionado.precio - formData.costoUnitario) * formData.stockActual).toFixed(2)}
                  </p>
                </div>
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
              {loading ? 'Guardando...' : (configuracion ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
