import React from 'react';
import type { VentaExtra } from '../../types';

interface VentasExtraPageProps {
  ventas: VentaExtra[];
  onSaveVenta: (venta: VentaExtra) => void;
  onDeleteVenta: (ventaId: number) => void;
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const VentasExtraPage: React.FC<VentasExtraPageProps> = ({ ventas, onSaveVenta, onDeleteVenta, requestConfirmation }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ventas Extra</h2>
      {/* Aquí va la lógica y UI real de ventas extra */}
      <ul>
        {ventas.map(v => (
          <li key={v.id}>
            {v.descripcion} - {v.monto}
            <button onClick={() => onDeleteVenta(v.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VentasExtraPage;
