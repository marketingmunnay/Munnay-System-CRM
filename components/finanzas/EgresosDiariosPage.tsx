import React from 'react';
import type { Egreso, Proveedor, EgresoCategory } from '../../types';

interface EgresosDiariosPageProps {
  egresos: Egreso[];
  onSaveEgreso: (egreso: Egreso) => void;
  onDeleteEgreso: (egresoId: number) => void;
  proveedores: Proveedor[];
  egresoCategories: EgresoCategory[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const EgresosDiariosPage: React.FC<EgresosDiariosPageProps> = ({
  egresos,
  onSaveEgreso,
  onDeleteEgreso,
  proveedores,
  egresoCategories,
  requestConfirmation,
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Egresos Diarios</h2>
      {/* Aquí va la lógica y UI real de egresos diarios */}
      <ul>
        {egresos.map(e => (
          <li key={e.id}>
            {e.descripcion} - {e.monto}
            <button onClick={() => onDeleteEgreso(e.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EgresosDiariosPage;
