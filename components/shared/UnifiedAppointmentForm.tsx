import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../shared/Modal';
import type { Appointment, Lead, Service } from '../../types';
import { getAvailability } from '../../services/api';

type Mode = 'calendar' | 'lead' | 'edit';

export interface AppointmentComposerResult {
  lead: {
    id?: number;
    nombres: string;
    apellidos?: string;
    numero: string;
    email?: string;
    redSocial?: string;
  };
  appointment: {
    serviceId: number;
    professionalId?: string;
    resourceId?: string;
    date: string;
    time: string;
    durationMinutes: number;
    notes?: string;
  };
  meta: {
    mode: Mode;
  };
}

export interface AppointmentActorOption {
  id: string;
  nombre: string;
  rol?: 'staff' | 'space';
  avatarUrl?: string;
}

interface AppointmentDetails {
  serviceId?: number;
  professionalId?: string;
  resourceId?: string;
  date: string;
  time: string;
  durationMinutes: number;
  notes: string;
}

interface UnifiedAppointmentFormProps {
  lead?: Partial<Lead> | null;
  appointment?: Partial<Appointment> | null;
  services: Service[];
  professionals: AppointmentActorOption[];
  resources: AppointmentActorOption[];
  mode?: Mode;
  defaultDate?: Date;
  defaultTime?: string;
  defaultResourceId?: string;
  onSave: (data: AppointmentComposerResult) => Promise<void> | void;
  onCancel: () => void;
}

interface AvailabilityState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  isAvailable: boolean;
  suggestions: Array<{ fecha: string; horaInicio: string; profesionalId?: string; ambienteId?: number }>;
}

const timeOptions = Array.from({ length: (21 - 8) * 4 + 1 }, (_, idx) => {
  const totalMinutes = idx * 15 + 8 * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

const formatDateInput = (date?: Date | string) => {
  if (!date) return '';
  const obj = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(obj.getTime())) return '';
  return obj.toISOString().split('T')[0];
};

const formatTimeInput = (date?: Date | string) => {
  if (!date) return '';
  const obj = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(obj.getTime())) return '';
  return `${obj.getHours().toString().padStart(2, '0')}:${obj.getMinutes().toString().padStart(2, '0')}`;
};

const UnifiedAppointmentForm: React.FC<UnifiedAppointmentFormProps> = ({
  lead,
  appointment,
  services,
  professionals,
  resources,
  mode = 'calendar',
  defaultDate,
  defaultTime,
  defaultResourceId,
  onSave,
  onCancel,
}) => {
  const initialDate = formatDateInput(defaultDate) || formatDateInput(appointment?.startTime) || formatDateInput(new Date());
  const initialTime = defaultTime || formatTimeInput(appointment?.startTime) || '09:00';

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadData, setLeadData] = useState(() => ({
    id: lead?.id,
    nombres: lead?.nombres || '',
    apellidos: lead?.apellidos || '',
    numero: lead?.numero || '',
    email: lead?.email || '',
    redSocial: lead?.redSocial || 'Instagram',
  }));

  const [details, setDetails] = useState<AppointmentDetails>(() => ({
    serviceId: services[0]?.id,
    professionalId: professionals[0]?.id,
    resourceId: defaultResourceId || resources[0]?.id,
    date: initialDate,
    time: initialTime,
    durationMinutes: services[0]?.duracionMinutos || 60,
    notes: appointment?.notes || '',
  }));

  const [availability, setAvailability] = useState<AvailabilityState>({ status: 'idle', isAvailable: true, suggestions: [] });

  useEffect(() => {
    setLeadData(prev => ({
      id: lead?.id,
      nombres: lead?.nombres || prev.nombres,
      apellidos: lead?.apellidos || prev.apellidos,
      numero: lead?.numero || prev.numero,
      email: lead?.email || prev.email,
      redSocial: lead?.redSocial || prev.redSocial,
    }));
  }, [lead?.id]);

  useEffect(() => {
    if (!details.serviceId || !details.date || !details.time) return;
    const service = services.find(s => s.id === details.serviceId);
    if (!service) return;
    let cancelled = false;
    setAvailability(prev => ({ ...prev, status: 'loading' }));
    getAvailability({
      fecha: details.date,
      horaInicio: details.time,
      duracionMinutos: service.duracionMinutos || details.durationMinutes,
      servicioIds: [service.id],
      profesionalId: details.professionalId,
      ambienteId: details.resourceId ? Number(details.resourceId) : undefined,
    })
      .then(res => {
        if (cancelled) return;
        setAvailability({ status: 'ready', isAvailable: res.isAvailable, suggestions: res.suggestions });
      })
      .catch(() => {
        if (cancelled) return;
        setAvailability({ status: 'error', isAvailable: false, suggestions: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [details.serviceId, details.date, details.time, details.professionalId, details.resourceId, services]);

  const canContinueStep1 = leadData.nombres.trim().length > 1 && leadData.numero.trim().length >= 9;
  const serviceSelected = services.find(service => service.id === details.serviceId);
  const canContinueStep2 = Boolean(details.serviceId && details.date && details.time && serviceSelected);

  const summaryItems = useMemo(() => {
    const serviceName = serviceSelected?.nombre || 'Servicio por definir';
    const professionalName = professionals.find(p => p.id === details.professionalId)?.nombre || 'Sin profesional';
    const resourceName = resources.find(r => r.id === details.resourceId)?.nombre || 'Sin ambiente';
    return [
      {
        label: 'Paciente',
        value: `${leadData.nombres} ${leadData.apellidos}`.trim() || 'Sin nombre',
        extra: leadData.numero,
      },
      {
        label: 'Servicio',
        value: serviceName,
        extra: `${serviceSelected?.duracionMinutos || details.durationMinutes} min`,
      },
      {
        label: 'Profesional',
        value: professionalName,
        extra: resources.length > 0 ? resourceName : undefined,
      },
      {
        label: 'Fecha y hora',
        value: `${details.date} · ${details.time}`,
        extra: availability.isAvailable ? 'Horario disponible' : 'Fuera de disponibilidad',
      },
    ];
  }, [leadData, details, serviceSelected, professionals, resources, availability.isAvailable]);

  const handleDetailChange = <K extends keyof AppointmentDetails>(key: K, value: AppointmentDetails[K]) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!serviceSelected) return;
    const payload: AppointmentComposerResult = {
      lead: {
        id: leadData.id,
        nombres: leadData.nombres.trim(),
        apellidos: leadData.apellidos?.trim(),
        numero: leadData.numero.trim(),
        email: leadData.email?.trim(),
        redSocial: leadData.redSocial,
      },
      appointment: {
        serviceId: serviceSelected.id,
        professionalId: details.professionalId,
        resourceId: details.resourceId,
        date: details.date,
        time: details.time,
        durationMinutes: serviceSelected.duracionMinutos || details.durationMinutes,
        notes: details.notes?.trim(),
      },
      meta: { mode },
    };

    try {
      setIsSubmitting(true);
      await onSave(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-3 text-sm text-slate-500">
      {[1, 2, 3].map((value, index) => (
        <React.Fragment key={value}>
          <button
            type="button"
            onClick={() => setStep(value)}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
              step === value ? 'border-[#aa632d] text-[#aa632d]' : 'border-slate-200 text-slate-400'
            }`}
          >
            {value}
          </button>
          {index < 2 && <span className="h-px w-16 bg-slate-200" />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={mode === 'lead' ? 'Agendar cita para el lead' : 'Agendar Cita'}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-6 px-6 py-5">
        <div className="flex items-center justify-between">
          <StepIndicator />
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Agenda moderna</span>
        </div>

        {step === 1 && (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">Nombres *</label>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                value={leadData.nombres}
                onChange={e => setLeadData(prev => ({ ...prev, nombres: e.target.value }))}
                placeholder="Ej. Ana María"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Apellidos</label>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                value={leadData.apellidos}
                onChange={e => setLeadData(prev => ({ ...prev, apellidos: e.target.value }))}
                placeholder="Ej. Sánchez"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Teléfono *</label>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                value={leadData.numero}
                onChange={e => setLeadData(prev => ({ ...prev, numero: e.target.value }))}
                placeholder="970 000 000"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Correo</label>
              <input
                type="email"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                value={leadData.email}
                onChange={e => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Canal</label>
              <select
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                value={leadData.redSocial}
                onChange={e => setLeadData(prev => ({ ...prev, redSocial: e.target.value }))}
              >
                {['Instagram', 'WhatsApp', 'Facebook', 'Referido'].map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Servicio</label>
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                  value={details.serviceId}
                  onChange={e => {
                    const serviceId = Number(e.target.value);
                    const service = services.find(s => s.id === serviceId);
                    handleDetailChange('serviceId', serviceId);
                    handleDetailChange('durationMinutes', service?.duracionMinutos || details.durationMinutes);
                  }}
                >
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Profesional</label>
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                  value={details.professionalId}
                  onChange={e => handleDetailChange('professionalId', e.target.value || undefined)}
                >
                  {professionals.length === 0 && <option>No hay personal configurado</option>}
                  {professionals.map(pro => (
                    <option key={pro.id} value={pro.id}>
                      {pro.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Espacio</label>
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                  value={details.resourceId}
                  onChange={e => handleDetailChange('resourceId', e.target.value || undefined)}
                >
                  {resources.length === 0 && <option>No hay ambientes configurados</option>}
                  {resources.map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Fecha</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                    value={details.date}
                    onChange={e => handleDetailChange('date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Hora</label>
                  <select
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                    value={details.time}
                    onChange={e => handleDetailChange('time', e.target.value)}
                  >
                    {timeOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
              {availability.status === 'loading' && <p>Verificando disponibilidad…</p>}
              {availability.status === 'ready' && availability.isAvailable && <p>Horario disponible para agendar.</p>}
              {availability.status === 'ready' && !availability.isAvailable && (
                <div className="space-y-2">
                  <p className="font-semibold text-[#b45309]">Este horario ya está ocupado.</p>
                  {availability.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {availability.suggestions.slice(0, 4).map(suggestion => (
                        <button
                          key={`${suggestion.fecha}-${suggestion.horaInicio}`}
                          type="button"
                          onClick={() => {
                            handleDetailChange('date', suggestion.fecha);
                            handleDetailChange('time', suggestion.horaInicio);
                          }}
                          className="rounded-full border border-[#aa632d]/40 px-3 py-1 text-xs font-semibold text-[#aa632d] hover:bg-[#aa632d]/10"
                        >
                          {suggestion.fecha} · {suggestion.horaInicio}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {availability.status === 'error' && (
                <p className="font-semibold text-rose-500">No se pudo validar la disponibilidad. Intenta nuevamente.</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">Notas para el equipo</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
                value={details.notes}
                onChange={e => handleDetailChange('notes', e.target.value)}
                placeholder="Detalles relevantes, alergias, recordatorios…"
              />
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {summaryItems.map(item => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
                  {item.extra && <p className="text-sm text-slate-500">{item.extra}</p>}
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
              <p>Al confirmar, se creará la cita y se actualizará el lead con estado "Agendado".</p>
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 mt-2">
          <button type="button" onClick={onCancel} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            Cancelar
          </button>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-[#aa632d] hover:text-[#aa632d]"
                onClick={() => setStep(step - 1)}
              >
                Atrás
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                className="rounded-2xl bg-[#aa632d] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#8e5225] disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={(step === 1 && !canContinueStep1) || (step === 2 && !canContinueStep2)}
                onClick={() => setStep(step + 1)}
              >
                Siguiente
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                className="rounded-2xl bg-[#0f9d58] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0b8043] disabled:opacity-60"
                disabled={isSubmitting || !canContinueStep2}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Guardando…' : 'Confirmar cita'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UnifiedAppointmentForm;
