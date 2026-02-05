import React, { useState } from 'react';
import Modal from '../shared/Modal';

interface UnifiedAppointmentFormProps {
  lead?: any; // Lead existente o datos para crear uno nuevo
  appointment?: any; // Cita existente para editar
  mode?: 'calendar' | 'lead' | 'edit';
  onSave: (data: any) => void;
  onCancel: () => void;
}

const UnifiedAppointmentForm: React.FC<UnifiedAppointmentFormProps> = ({ lead, appointment, mode = 'calendar', onSave, onCancel }) => {
  // Estados de ejemplo para pasos y datos
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    lead: lead || {},
    appointment: appointment || {},
  });

  // Ejemplo de navegación de pasos
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Renderizado de pasos (simplificado)
  return (
    <Modal isOpen={true} onClose={onCancel} title="Agendar Cita" maxWidthClass="max-w-2xl">
      <div className="space-y-6">
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">1. Selecciona o crea paciente</h3>
            {/* Aquí iría el selector/creador de lead */}
            <input className="input w-full" placeholder="Nombre del paciente" value={form.lead.nombre || ''} onChange={e => setForm(f => ({ ...f, lead: { ...f.lead, nombre: e.target.value } }))} />
            <button className="btn-primary mt-4" onClick={nextStep}>Siguiente</button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">2. Detalles de la cita</h3>
            {/* Aquí irían los campos de servicio, profesional, recurso, fecha, hora, etc. */}
            <input className="input w-full" placeholder="Servicio" value={form.appointment.servicio || ''} onChange={e => setForm(f => ({ ...f, appointment: { ...f.appointment, servicio: e.target.value } }))} />
            <input className="input w-full mt-2" placeholder="Fecha" value={form.appointment.fecha || ''} onChange={e => setForm(f => ({ ...f, appointment: { ...f.appointment, fecha: e.target.value } }))} />
            <div className="flex gap-2 mt-4">
              <button className="btn-secondary" onClick={prevStep}>Atrás</button>
              <button className="btn-primary" onClick={nextStep}>Siguiente</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">3. Confirmación</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs">{JSON.stringify(form, null, 2)}</pre>
            <div className="flex gap-2 mt-4">
              <button className="btn-secondary" onClick={prevStep}>Atrás</button>
              <button className="btn-success" onClick={() => onSave(form)}>Guardar cita</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UnifiedAppointmentForm;
