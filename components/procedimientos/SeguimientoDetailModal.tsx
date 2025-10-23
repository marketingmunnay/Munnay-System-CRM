import React from 'react';
import type { Lead } from '../../types.ts';
import Modal from '../shared/Modal.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface SeguimientoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Lead | null;
}

const SeguimientoDetailModal: React.FC<SeguimientoDetailModalProps> = ({ isOpen, onClose, patient }) => {
  if (!isOpen || !patient) return null;

  const getSymptoms = (seguimiento: typeof patient.seguimientos[0]) => {
      const symptoms = [
          seguimiento.inflamacion && 'Inflamación',
          seguimiento.ampollas && 'Ampollas',
          seguimiento.alergias && 'Alergias',
          seguimiento.malestarGeneral && 'Malestar General',
          seguimiento.brote && 'Brote',
          seguimiento.dolorDeCabeza && 'Dolor de Cabeza',
          seguimiento.moretones && 'Moretones',
      ].filter(Boolean);

      return symptoms.length > 0 ? symptoms.join(', ') : 'Ninguno reportado';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial de Seguimiento: ${patient.nombres} ${patient.apellidos}`}
      maxWidthClass="max-w-4xl"
       footer={
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cerrar</button>
        </div>
      }
    >
      <div className="p-6 bg-gray-50/50 max-h-[70vh] overflow-y-auto">
        <div className="space-y-6">
          {patient.seguimientos && patient.seguimientos.length > 0 ? (
            patient.seguimientos
              .slice() // Create a copy to avoid modifying the original array
              .sort((a, b) => new Date(b.fechaSeguimiento).getTime() - new Date(a.fechaSeguimiento).getTime()) // Sort by most recent
              .map(seguimiento => (
                <div key={seguimiento.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{seguimiento.nombreProcedimiento}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(seguimiento.fechaSeguimiento + 'T00:00:00').toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="text-gray-500">Realizado por:</p>
                      <p className="font-semibold text-gray-700">{seguimiento.personal}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 flex items-center">
                        <GoogleIcon name="coronavirus" className="mr-2 text-base text-red-500" />
                        Síntomas Reportados
                      </h4>
                      <p className="text-sm text-gray-800 pl-7">{getSymptoms(seguimiento)}</p>
                    </div>
                    {seguimiento.observacion && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-600 flex items-center">
                          <GoogleIcon name="comment" className="mr-2 text-base text-blue-500" />
                          Observaciones del Personal
                        </h4>
                        <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded-md border mt-1 pl-7">{seguimiento.observacion}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <GoogleIcon name="folder_off" className="text-4xl mx-auto mb-2" />
              <p>No hay seguimientos registrados para este paciente.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SeguimientoDetailModal;