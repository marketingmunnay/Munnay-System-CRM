import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../shared/Modal';
import type { Lead, Service, ClientSource, Ambiente, AvailabilitySlot, Appointment } from '../../types';
import { DocumentType, LeadStatus, Seller } from '../../types';
import { formatDateForInput } from '../../utils/time';
import {
  searchLeads,
  getAmbientes,
  getAvailability,
  createAppointment,
  sendAppointmentConfirmation
} from '../../services/api';
import type { AppointmentStatus } from '../../types';
import type { CreateAppointmentPayload } from '../../types';

interface AppointmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  clientSources: ClientSource[];
  onSaveLead: (lead: Lead) => Promise<void> | void;
  onAppointmentCreated?: (appointment: Appointment) => void;
  defaultDate?: Date;
  defaultResourceId?: string;
  channels?: {
    whatsapp: boolean;
    email: boolean;
  };
}

const stepList = [
  { id: 'cliente', label: 'Cliente', hint: 'Identifica al paciente y valida sus datos fiscales' },
  { id: 'servicios', label: 'Servicios', hint: 'Selecciona tratamientos y ajusta la duración total' },
  { id: 'agenda', label: 'Agenda', hint: 'Bloquea horario, profesional y ambiente disponibles' },
  { id: 'confirmacion', label: 'Confirmación', hint: 'Define origen, estado y confirmaciones' }
] as const;

type WizardStep = typeof stepList[number]['id'];

type ChannelOption = 'whatsapp' | 'email';

type AvailabilitySuggestion = {
  fecha: string;
  horaInicio: string;
  profesionalId?: string;
  ambienteId?: number;
};

const stepGuidance: Record<WizardStep, string> = {
  cliente: 'Necesitamos un cliente válido para continuar con la cita.',
  servicios: 'Elige al menos un servicio para calcular la duración y precio estimado.',
  agenda: 'Confirma disponibilidad antes de avanzar a la confirmación.',
  confirmacion: 'Revisa el resumen y selecciona canales de confirmación.'
};

const sourceStateMap: Record<string, AppointmentStatus> = {
  'Call Center': 'Booked',
  Recepcion: 'Confirmed',
  'Lead Digital': 'Booked',
  WhatsApp: 'Booked',
  Profesional: 'Booked',
  Web: 'Confirmed'
};

const defaultChannels: { whatsapp: boolean; email: boolean } = {
  whatsapp: true,
  email: false
};

const defaultLeadTemplate = (fecha: Date): Lead => ({
  id: Date.now(),
  fechaLead: formatDateForInput(fecha) ?? new Date().toISOString().split('T')[0],
  nombres: '',
  apellidos: '',
  numero: '',
  email: '',
  sexo: 'F',
  redSocial: 'Calendario',
  anuncio: '',
  vendedor: Seller.Vanesa,
  estado: LeadStatus.Nuevo,
  montoPagado: 0,
  servicios: [],
  categoria: '',
  fechaHoraAgenda: undefined
});

const createLeadFormState = () => ({
  nombres: '',
  apellidos: '',
  numero: '',
  email: '',
  documentType: DocumentType.DNI,
  documentNumber: '',
  notas: ''
});

type LeadFormState = ReturnType<typeof createLeadFormState>;

const AppointmentWizard: React.FC<AppointmentWizardProps> = ({
  isOpen,
  onClose,
  services,
  clientSources,
  onSaveLead,
  onAppointmentCreated,
  defaultDate,
  defaultResourceId,
  channels = defaultChannels
}) => {
  const [activeStep, setActiveStep] = useState<WizardStep>('cliente');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadForm, setLeadForm] = useState<LeadFormState>(createLeadFormState);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [manualDuration, setManualDuration] = useState<number | ''>('');
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [selectedAmbienteId, setSelectedAmbienteId] = useState<number | null>(null);
  const [selectedProfesionalId, setSelectedProfesionalId] = useState<string | undefined>(defaultResourceId);
  const [selectedDate, setSelectedDate] = useState(() => formatDateForInput(defaultDate ?? new Date()) ?? '');
  const [startTime, setStartTime] = useState('09:00');
  const [availabilityState, setAvailabilityState] = useState<'idle' | 'checking' | 'ok' | 'conflict'>('idle');
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [availabilitySuggestions, setAvailabilitySuggestions] = useState<AvailabilitySuggestion[]>([]);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [estadoInicial, setEstadoInicial] = useState<AppointmentStatus>('Booked');
  const [origen, setOrigen] = useState('Call Center');
  const [notas, setNotas] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<ChannelOption[]>(() => {
    const defaults: ChannelOption[] = [];
    if (channels.whatsapp) defaults.push('whatsapp');
    if (channels.email) defaults.push('email');
    return defaults;
  });
  const [emitirComprobante, setEmitirComprobante] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState<'none' | 'percent' | 'amount'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const sourceOptions = useMemo(() => {
    if (clientSources && clientSources.length > 0) {
      const names = clientSources.map(source => source.nombre);
      return Array.from(new Set([...names, ...Object.keys(sourceStateMap)]));
    }
    return Object.keys(sourceStateMap);
  }, [clientSources]);

  const totalDuration = useMemo(() => {
    const base = selectedServiceIds.reduce((sum, id) => {
      const svc = services.find(s => s.id === id);
      return sum + (svc?.duracionMinutos || 60);
    }, 0);
    if (base === 0) return 60;
    if (manualDuration && typeof manualDuration === 'number') return manualDuration;
    return base;
  }, [selectedServiceIds, services, manualDuration]);

  const totalPrecio = useMemo(() => {
    return selectedServiceIds.reduce((sum, id) => {
      const svc = services.find(service => service.id === id);
      return sum + (svc?.precio || 0);
    }, 0);
  }, [selectedServiceIds, services]);

  const descuentoAplicado = useMemo(() => {
    if (discountType === 'none' || discountValue <= 0) return 0;
    if (discountType === 'percent') {
      return Math.min(totalPrecio, (totalPrecio * discountValue) / 100);
    }
    return Math.min(totalPrecio, discountValue);
  }, [discountType, discountValue, totalPrecio]);

  const totalConDescuento = useMemo(() => {
    const result = totalPrecio - descuentoAplicado;
    return result > 0 ? result : 0;
  }, [totalPrecio, descuentoAplicado]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveStep('cliente');
    setAvailabilityState('idle');
    setAvailabilityMessage(null);
    setSelectedLead(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedServiceIds([]);
    setManualDuration('');
    setSelectedAmbienteId(null);
    setSelectedProfesionalId(defaultResourceId);
    setSelectedDate(formatDateForInput(defaultDate ?? new Date()) ?? '');
    setStartTime(
      defaultDate
        ? `${defaultDate.getHours().toString().padStart(2, '0')}:${defaultDate.getMinutes().toString().padStart(2, '0')}`
        : '09:00'
    );
    setLeadForm(createLeadFormState());
  }, [isOpen, defaultDate, defaultResourceId]);

  useEffect(() => {
    if (sourceOptions.length === 0) return;
    if (!sourceOptions.includes(origen)) {
      const next = sourceOptions[0];
      setOrigen(next);
      const mapped = sourceStateMap[next];
      if (mapped) setEstadoInicial(mapped);
    }
  }, [sourceOptions, origen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchAmbientes = async () => {
      try {
        const data = await getAmbientes();
        setAmbientes(data);
      } catch (err) {
        console.error('Error obteniendo ambientes', err);
      }
    };
    fetchAmbientes();
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    const runSearch = async () => {
      setIsSearching(true);
      try {
        const resp = await searchLeads(searchQuery.trim());
        if (!cancelled) setSearchResults(resp);
      } catch (err) {
        console.error('Error buscando leads', err);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };
    const handle = setTimeout(runSearch, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedDate || !startTime || selectedServiceIds.length === 0) {
      setAvailabilityState('idle');
      setAvailabilitySlots([]);
      setAvailabilitySuggestions([]);
      setAvailabilityMessage(null);
      return;
    }
    setAvailabilityState('checking');
    setAvailabilitySuggestions([]);
    const check = async () => {
      try {
        const resp = await getAvailability({
          fecha: selectedDate,
          horaInicio: startTime,
          duracionMinutos: totalDuration,
          servicioIds: selectedServiceIds,
          profesionalId: selectedProfesionalId,
          ambienteId: selectedAmbienteId ?? undefined
        });
        setAvailabilitySlots(resp.slots);
        setAvailabilitySuggestions(resp.suggestions ?? []);
        const hasAlternatives = (resp.suggestions ?? []).length > 0;
        setAvailabilityState(resp.isAvailable ? 'ok' : 'conflict');
        setAvailabilityMessage(
          resp.isAvailable
            ? 'Espacio disponible'
            : hasAlternatives
              ? 'Sin espacio con esta combinación. Te proponemos alternativas abajo.'
              : 'Conflicto de disponibilidad'
        );
      } catch (err) {
        console.error('Error verificando disponibilidad', err);
        setAvailabilityState('conflict');
        setAvailabilitySlots([]);
        setAvailabilitySuggestions([]);
        setAvailabilityMessage('No se pudo validar disponibilidad');
      }
    };
    check();
  }, [selectedDate, startTime, selectedServiceIds, totalDuration, selectedProfesionalId, selectedAmbienteId]);

  const handleLeadFormChange = <K extends keyof LeadFormState>(field: K, value: LeadFormState[K]) => {
    setLeadForm(prev => ({ ...prev, [field]: value }));
  };

  const profesionalOptions = useMemo(() => {
    const values = services
      .map(service => service.profesionalRequerido)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(values));
  }, [services]);

  const ambientesMap = useMemo(() => {
    const map = new Map<number, Ambiente>();
    ambientes.forEach(ambiente => map.set(ambiente.id, ambiente));
    return map;
  }, [ambientes]);

  const suggestionFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('es-PE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      }),
    []
  );

  const handleApplySuggestion = (suggestion: AvailabilitySuggestion) => {
    setSelectedDate(suggestion.fecha);
    setStartTime(suggestion.horaInicio);
    if (suggestion.profesionalId) {
      setSelectedProfesionalId(suggestion.profesionalId);
    }
    if (suggestion.ambienteId !== undefined) {
      setSelectedAmbienteId(suggestion.ambienteId);
    }
  };

  const describeSuggestionWindow = (suggestion: AvailabilitySuggestion) => {
    const date = new Date(`${suggestion.fecha}T${suggestion.horaInicio}`);
    const dateLabel = suggestionFormatter.format(date);
    return `${dateLabel.toUpperCase()} · ${suggestion.horaInicio}`;
  };

  const handleToggleService = (serviceId: number) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleCreateClient = async () => {
    if (!leadForm.nombres.trim() || !leadForm.numero.trim() || !leadForm.documentNumber.trim()) {
      setError('Completa nombre, teléfono y documento para registrar al cliente.');
      return;
    }
    setIsSavingLead(true);
    try {
      const base = defaultLeadTemplate(new Date());
      const newLead: Lead = {
        ...base,
        nombres: leadForm.nombres.trim(),
        apellidos: leadForm.apellidos.trim(),
        numero: leadForm.numero.trim(),
        email: leadForm.email.trim(),
        documentType: leadForm.documentType,
        documentNumber: leadForm.documentNumber.trim(),
        notas: leadForm.notas,
        servicios: []
      } as Lead;
      await onSaveLead(newLead);
      setSelectedLead(newLead);
      setError(null);
    } catch (err) {
      console.error('Error guardando cliente', err);
      setError('No pudimos guardar el cliente. Intenta nuevamente.');
    } finally {
      setIsSavingLead(false);
    }
  };

  const canContinueCliente = !!selectedLead;
  const canContinueServicios = selectedServiceIds.length > 0;
  const canContinueAgenda = Boolean(
    selectedDate && startTime && selectedProfesionalId && availabilityState !== 'conflict'
  );

  const currentStepIndex = stepList.findIndex(step => step.id === activeStep);
  const activeStepInfo = stepList[currentStepIndex] ?? stepList[0];
  const canProceed =
    activeStep === 'cliente'
      ? canContinueCliente
      : activeStep === 'servicios'
        ? canContinueServicios
        : activeStep === 'agenda'
          ? canContinueAgenda
          : true;
  const stepHelperText = stepGuidance[activeStep];

  const goNext = () => {
    if (activeStep === 'cliente' && !canContinueCliente) return;
    if (activeStep === 'servicios' && !canContinueServicios) return;
    if (activeStep === 'agenda' && !canContinueAgenda) return;
    const currentIndex = stepList.findIndex(step => step.id === activeStep);
    if (currentIndex < stepList.length - 1) {
      setActiveStep(stepList[currentIndex + 1].id);
    }
  };

  const goBack = () => {
    const currentIndex = stepList.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(stepList[currentIndex - 1].id);
    }
  };

  const handleChannelsChange = (channel: ChannelOption) => {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(ch => ch !== channel) : [...prev, channel]
    );
  };

  const handleOrigenChange = (value: string) => {
    setOrigen(value);
    const mapped = sourceStateMap[value];
    if (mapped) {
      setEstadoInicial(mapped);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLead) {
      setError('Selecciona o crea un cliente.');
      return;
    }
    if (emitirComprobante && (!selectedLead.documentNumber && !leadForm.documentNumber.trim())) {
      setError('El documento es obligatorio para emitir comprobante.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      // Construir la fecha y hora de agenda
      const fechaHoraAgenda = new Date(`${selectedDate}T${startTime}:00`);
      
      // Obtener nombres de servicios seleccionados
      const serviciosSeleccionados = selectedServiceIds
        .map(id => services.find(s => s.id === id)?.nombre)
        .filter((nombre): nombre is string => Boolean(nombre));

      // Actualizar el lead con los datos de agenda
      const updatedLead: Lead = {
        ...selectedLead,
        fechaHoraAgenda: fechaHoraAgenda.toISOString(),
        recursoId: selectedProfesionalId || '',
        servicios: serviciosSeleccionados.length > 0 ? serviciosSeleccionados : selectedLead.servicios,
        estado: LeadStatus.Agendado,
        notas: notas || selectedLead.notas,
        documentType: selectedLead.documentType || leadForm.documentType,
        documentNumber: selectedLead.documentNumber || leadForm.documentNumber || undefined,
      };

      await onSaveLead(updatedLead);
      onClose();
    } catch (err) {
      console.error('Error agendando cita', err);
      setError('No pudimos agendar la cita. Verifica los datos o intenta más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderClienteStep = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold text-slate-600">Buscar cliente existente</label>
        <div className="mt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Nombre, teléfono o documento"
            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
          />
        </div>
        {isSearching && <p className="text-xs text-slate-400 mt-1">Buscando...</p>}
        <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
          {searchResults.map(result => (
            <button
              key={result.id}
              onClick={() => setSelectedLead(result)}
              className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${
                selectedLead?.id === result.id
                  ? 'border-[#aa632d] bg-[#fff5ef]'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-semibold text-slate-800">
                {result.nombres} {result.apellidos}
              </p>
              <p className="text-xs text-slate-500">{result.numero}</p>
              {result.documentNumber && (
                <p className="text-xs text-slate-400">Doc: {result.documentNumber}</p>
              )}
            </button>
          ))}
          {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
            <p className="text-xs text-slate-400">Sin coincidencias</p>
          )}
        </div>
      </div>

      <div className="border border-dashed border-slate-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-700">Nuevo cliente</p>
        <p className="text-xs text-slate-400">Recuerda que el documento es obligatorio para emitir comprobante.</p>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <input
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Nombres"
            value={leadForm.nombres}
            onChange={e => handleLeadFormChange('nombres', e.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Apellidos"
            value={leadForm.apellidos}
            onChange={e => handleLeadFormChange('apellidos', e.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Teléfono"
            value={leadForm.numero}
            onChange={e => handleLeadFormChange('numero', e.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Correo"
            value={leadForm.email}
            onChange={e => handleLeadFormChange('email', e.target.value)}
          />
          <select
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            value={leadForm.documentType}
            onChange={e => handleLeadFormChange('documentType', e.target.value as DocumentType)}
          >
            {Object.values(DocumentType).map(doc => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>
          <input
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Número de documento"
            value={leadForm.documentNumber}
            onChange={e => handleLeadFormChange('documentNumber', e.target.value)}
          />
        </div>
        <textarea
          className="w-full mt-3 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Notas internas"
          rows={2}
          value={leadForm.notas}
          onChange={e => handleLeadFormChange('notas', e.target.value)}
        />
        <button
          type="button"
          onClick={handleCreateClient}
          disabled={isSavingLead}
          className="mt-3 rounded-2xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a2846] disabled:opacity-60"
        >
          {isSavingLead ? 'Guardando...' : 'Registrar cliente'}
        </button>
      </div>
    </div>
  );

  const renderServiciosStep = () => (
    <div className="space-y-4">
      {services.map(service => (
        <label
          key={service.id}
          className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
            selectedServiceIds.includes(service.id)
              ? 'border-[#aa632d] bg-[#fff3eb]'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-slate-800">{service.nombre}</p>
            <p className="text-xs text-slate-500">
              {service.categoria} · {(service.duracionMinutos || 60)} min · S/ {service.precio.toFixed(2)}
            </p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={selectedServiceIds.includes(service.id)}
            onChange={() => handleToggleService(service.id)}
          />
        </label>
      ))}
      <div className="border-t pt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Duración total</label>
          <p className="text-lg font-semibold text-slate-800">{totalDuration} minutos</p>
          <input
            type="number"
            min={30}
            step={15}
            value={manualDuration}
            onChange={e => setManualDuration(e.target.value ? Number(e.target.value) : '')}
            placeholder="Sobrescribir duración (min)"
            className="mt-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
          <p className="text-[11px] text-slate-400 mt-1">La duración mínima acepta bloques de 15 minutos.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Subtotal estimado</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">S/ {totalPrecio.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">
              Se actualizará automáticamente si ajustas servicios o precios promocionales.
            </p>
          </div>
          <div className="border-t pt-3">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Descuentos</label>
            <div className="mt-2 flex flex-col gap-2">
              <select
                value={discountType}
                onChange={e => {
                  const value = e.target.value as 'none' | 'percent' | 'amount';
                  setDiscountType(value);
                  if (value === 'none') setDiscountValue(0);
                }}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="none">Sin descuento</option>
                <option value="percent">% Porcentaje</option>
                <option value="amount">Monto fijo</option>
              </select>
              {discountType !== 'none' && (
                <input
                  type="number"
                  min={0}
                  max={discountType === 'percent' ? 100 : undefined}
                  value={discountValue}
                  onChange={e => setDiscountValue(Number(e.target.value) || 0)}
                  placeholder={discountType === 'percent' ? 'Ej. 15 (15%)' : 'Ej. 50 (S/ 50)'}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                />
              )}
            </div>
            {descuentoAplicado > 0 && (
              <p className="text-xs text-emerald-600 mt-2">
                Descuento aplicado: S/ {descuentoAplicado.toFixed(2)}
              </p>
            )}
          </div>
          <div className="border-t pt-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total estimado</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">S/ {totalConDescuento.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgendaStep = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <select
          value={selectedProfesionalId ?? ''}
          onChange={e => setSelectedProfesionalId(e.target.value || undefined)}
          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Selecciona profesional</option>
          {profesionalOptions.map(pro => (
            <option key={pro} value={pro}>{pro}</option>
          ))}
        </select>
        <select
          value={selectedAmbienteId ?? ''}
          onChange={e => setSelectedAmbienteId(e.target.value ? Number(e.target.value) : null)}
          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Ambiente disponible</option>
          {ambientes.map(ambiente => (
            <option key={ambiente.id} value={ambiente.id}>{ambiente.nombre} · {ambiente.tipo}</option>
          ))}
        </select>
      </div>
      <div className={`rounded-2xl border px-4 py-3 text-sm ${
        availabilityState === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : availabilityState === 'conflict'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        {availabilityState === 'checking' && 'Verificando disponibilidad...'}
        {availabilityState !== 'checking' && availabilityMessage}
        {availabilityState === 'conflict' && (
          <p className="mt-1 text-xs text-slate-500">
            Ajusta hora o profesional, o aplica una de las sugerencias recomendadas abajo.
          </p>
        )}
      </div>
      {availabilitySlots.length > 0 && (
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Profesionales evaluados</p>
          <div className="mt-3 space-y-2">
            {availabilitySlots.map(slot => {
              const key = `${slot.profesionalId || 'sin-prof'}-${slot.ambienteId ?? 'libre'}`;
              const isSelected =
                slot.profesionalId === selectedProfesionalId &&
                (slot.ambienteId ?? null) === (selectedAmbienteId ?? null);
              const ambienteName = slot.ambienteId ? ambientesMap.get(slot.ambienteId)?.nombre : 'Ambiente flexible';
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                    slot.disponible
                      ? 'border-emerald-100 bg-emerald-50'
                      : 'border-rose-100 bg-rose-50'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-slate-800">{slot.profesionalId || 'Sin profesional asignado'}</p>
                    <p className="text-xs text-slate-500">{ambienteName}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${slot.disponible ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {slot.disponible ? 'Disponible' : slot.motivo || 'Ocupado'}
                    </p>
                    {isSelected && <p className="text-[11px] text-slate-400">Selección actual</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {availabilitySuggestions.length > 0 && (
        <div className="rounded-2xl border border-dashed border-[#aa632d]/50 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Sugerencias rápidas</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {availabilitySuggestions.map((suggestion, index) => {
              const isActive = suggestion.fecha === selectedDate && suggestion.horaInicio === startTime;
              return (
                <button
                  type="button"
                  key={`${suggestion.fecha}-${suggestion.horaInicio}-${index}`}
                  onClick={() => handleApplySuggestion(suggestion)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    isActive ? 'border-[#aa632d] bg-[#fff4ea]' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold text-slate-800">{describeSuggestionWindow(suggestion)}</p>
                  <p className="text-xs text-slate-500">
                    {suggestion.profesionalId ? `Profesional: ${suggestion.profesionalId}` : 'Profesional por asignar'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {suggestion.ambienteId
                      ? `Ambiente: ${ambientesMap.get(suggestion.ambienteId)?.nombre || suggestion.ambienteId}`
                      : 'Ambiente flexible'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderConfirmacionStep = () => (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Resumen</p>
        <ul className="mt-2 text-sm text-slate-600 space-y-1">
          <li><strong>Cliente:</strong> {selectedLead?.nombres} {selectedLead?.apellidos}</li>
          <li><strong>Servicios:</strong> {selectedServiceIds.map(id => services.find(s => s.id === id)?.nombre).join(', ')}</li>
          <li><strong>Profesional:</strong> {selectedProfesionalId || 'Por asignar'}</li>
          <li><strong>Ambiente:</strong> {ambientes.find(a => a.id === selectedAmbienteId)?.nombre || 'Pendiente'}</li>
          <li><strong>Fecha/Hora:</strong> {selectedDate} · {startTime}</li>
          <li><strong>Duración:</strong> {totalDuration} min</li>
          <li><strong>Subtotal:</strong> S/ {totalPrecio.toFixed(2)}</li>
          {descuentoAplicado > 0 && (
            <li><strong>Descuento:</strong> -S/ {descuentoAplicado.toFixed(2)}</li>
          )}
          <li><strong>Total estimado:</strong> S/ {totalConDescuento.toFixed(2)}</li>
        </ul>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Origen</label>
          <select
            value={origen}
            onChange={e => handleOrigenChange(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          >
            {sourceOptions.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Estado inicial</label>
          <select
            value={estadoInicial}
            onChange={e => setEstadoInicial(e.target.value as AppointmentStatus)}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="Booked">Programada</option>
            <option value="Confirmed">Confirmada</option>
            <option value="Completed">Completada</option>
            <option value="Cancelled">Cancelada</option>
            <option value="NoShow">No asistió</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Notas</label>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          rows={3}
          placeholder="Observaciones internas, instrucciones de preparación, etc."
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Confirmaciones</label>
        <div className="mt-2 flex gap-3">
          {channels.whatsapp && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={selectedChannels.includes('whatsapp')}
                onChange={() => handleChannelsChange('whatsapp')}
              />
              WhatsApp
            </label>
          )}
          {channels.email && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={selectedChannels.includes('email')}
                onChange={() => handleChannelsChange('email')}
              />
              Correo
            </label>
          )}
          {!channels.whatsapp && !channels.email && (
            <p className="text-xs text-slate-400">Sin canales activos. Se registrará como pendiente.</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="emitir-comprobante"
          type="checkbox"
          checked={emitirComprobante}
          onChange={e => setEmitirComprobante(e.target.checked)}
        />
        <label htmlFor="emitir-comprobante" className="text-sm text-slate-600">Emitir comprobante inmediato</label>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (activeStep) {
      case 'cliente':
        return renderClienteStep();
      case 'servicios':
        return renderServiciosStep();
      case 'agenda':
        return renderAgendaStep();
      case 'confirmacion':
        return renderConfirmacionStep();
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Añadir cita"
      customMaxWidth="1100px"
      footer={(
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={activeStep === 'cliente'}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
          >
            Atrás
          </button>
          <div className="flex items-center gap-2">
            {error && <p className="text-xs text-rose-500 mr-3">{error}</p>}
            {activeStep !== 'confirmacion' && (
              <div className="flex flex-col items-end gap-1">
                {!canProceed && (
                  <p className="text-[11px] text-slate-400 max-w-xs text-right">{stepHelperText}</p>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canProceed}
                  className="rounded-2xl bg-[#aa632d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8e5225] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            )}
            {activeStep === 'confirmacion' && (
              <div className="flex flex-col items-end gap-1">
                <p className="text-[11px] text-slate-400 max-w-xs text-right">{stepHelperText}</p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-2xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a2846] disabled:opacity-60"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar cita'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] h-[70vh]">
        <aside className="border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/70 p-6 space-y-4 overflow-y-auto">
          {stepList.map((step, index) => {
            const currentIndex = stepList.findIndex(item => item.id === activeStep);
            const status =
              index < currentIndex ? 'complete' : index === currentIndex ? 'active' : 'pending';
            return (
              <div key={step.id} className="flex items-start gap-3">
                <div
                  className={`h-8 w-8 rounded-full border text-xs font-semibold flex items-center justify-center ${
                    status === 'complete'
                      ? 'bg-[#aa632d] text-white'
                      : status === 'active'
                        ? 'border-[#aa632d] text-[#aa632d]'
                        : 'border-slate-200 text-slate-400'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${status === 'active' ? 'text-[#0f172a]' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-400 leading-snug max-w-[160px]">{step.hint}</p>
                </div>
              </div>
            );
          })}
        </aside>
        <section className="p-6 overflow-y-auto">
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
              Paso {currentStepIndex + 1} de {stepList.length}
            </p>
            <h3 className="text-xl font-semibold text-slate-900 mt-1">{activeStepInfo.label}</h3>
            <p className="text-sm text-slate-500">{activeStepInfo.hint}</p>
          </div>
          {renderStep()}
        </section>
      </div>
    </Modal>
  );
};

export default AppointmentWizard;
