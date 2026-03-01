import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../shared/Modal';
import type { Lead, Service, ClientSource, Ambiente, AvailabilitySlot, Appointment } from '../../types';
import { DocumentType, LeadStatus } from '../../types';
import { formatDateForInput } from '../../utils/time';
import { useDate } from '../../src/hooks/useDate';
import {
  searchLeads,
  getAmbientes,
  getAvailability,
  createAppointment,
  sendAppointmentConfirmation
} from '../../services/api';
import type { AppointmentStatus } from '../../types';
import type { CreateAppointmentPayload } from '../../types';
import { 
  User, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  Check, 
  Search, 
  FileText, 
  Mail, 
  Phone, 
  ArrowRight, 
  ChevronRight, 
  Info, 
  MapPin, 
  Grid,
  AlertTriangle,
  Briefcase 
} from 'lucide-react';

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
  resources?: { id: number | string; nombre: string; tipo: string; type?: string }[];
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

const defaultLeadTemplate = (fechaISO: string): Lead => ({
  id: Date.now(),
  fechaLead: fechaISO.split('T')[0],
  nombres: '',
  apellidos: '',
  numero: '',
  email: '',
  sexo: 'F',
  redSocial: 'Calendario',
  anuncio: '',
  vendedor: '',
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
  channels = defaultChannels,
  resources = []
}) => {
  const { toInputDateTimeLocal, fromInputDateTimeLocalToUTC } = useDate();
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
    if (resources && resources.length > 0) {
        return resources
            .filter(r => r.type === 'personal' || r.tipo === 'personal' || (!r.type && !r.tipo))
            .map(r => ({ value: String(r.id), label: r.nombre }));
    }
    const values = services
      .map(service => service.profesionalRequerido)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(values)).map(v => ({ value: v, label: v }));
  }, [services, resources]);

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
    // Interpretar sugerencias como hora local de negocio usando string directa
    const [year, month, day] = suggestion.fecha.split('-').map(Number);
    const [hour, minute] = suggestion.horaInicio.split(':').map(Number);
    const date = new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0);
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
      const nowUtcIso = new Date().toISOString();
      const base = defaultLeadTemplate(nowUtcIso);
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
      // Create Appointment via new Backend API
      const payload: CreateAppointmentPayload = {
        leadId: selectedLead.id,
        professionalId: selectedProfesionalId ? parseInt(selectedProfesionalId) : undefined,
        serviceId: selectedServiceIds.length > 0 ? selectedServiceIds[0] : undefined,
        date: selectedDate,
        time: startTime,
        notes: notas,
        // Optional: map resource/ambiente if needed in future
      };

      const createdAppt = await createAppointment(payload);

      if (onAppointmentCreated) {
        onAppointmentCreated(createdAppt);
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error agendando cita', err);
      // Show backend error message if available
      setError(err?.response?.data?.message || err.message || 'No pudimos agendar la cita. Verifica los datos o intenta más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderClienteStep = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-[#aa632d]" />
          Buscar cliente existente
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono o DNI..."
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all"
          />
        </div>
        
        {isSearching && (
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-2 pl-1">
            <span className="w-2 h-2 rounded-full bg-[#aa632d] animate-pulse"></span>
            Buscando...
          </p>
        )}

        {searchResults.length > 0 && (
           <div className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {searchResults.map(result => (
              <button
                key={result.id}
                onClick={() => setSelectedLead(result)}
                className={`w-full group text-left rounded-xl border p-3 transition-all duration-200 flex items-center justify-between ${
                  selectedLead?.id === result.id
                    ? 'border-[#aa632d] bg-[#fff5ef] shadow-sm ring-1 ring-[#aa632d]/20'
                    : 'border-slate-100 hover:border-[#aa632d]/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    selectedLead?.id === result.id ? 'bg-[#aa632d] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-[#aa632d]/10 group-hover:text-[#aa632d]'
                  }`}>
                    {result.nombres.charAt(0)}{result.apellidos.charAt(0)}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${selectedLead?.id === result.id ? 'text-[#aa632d]' : 'text-slate-700'}`}>
                      {result.nombres} {result.apellidos}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {result.numero}</span>
                      {result.documentNumber && <span>• Doc: {result.documentNumber}</span>}
                    </div>
                  </div>
                </div>
                {selectedLead?.id === result.id && <CheckCircle className="h-5 w-5 text-[#aa632d]" />}
              </button>
            ))}
          </div>
        )}
        
        {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
            <Search className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-600 font-medium">No encontramos coincidencias</p>
            <p className="text-xs text-slate-400">Intenta buscar con otros términos o registra un nuevo cliente.</p>
          </div>
        )}
      </div>

      {/* New Client Form */}
      <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <User className="h-4 w-4 text-[#aa632d]" />
              Nuevo cliente
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Completa los datos si el cliente no existe</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="Nombres"
              value={leadForm.nombres}
              onChange={e => handleLeadFormChange('nombres', e.target.value)}
            />
          </div>
          <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="Apellidos"
              value={leadForm.apellidos}
              onChange={e => handleLeadFormChange('apellidos', e.target.value)}
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="Teléfono"
              value={leadForm.numero}
              onChange={e => handleLeadFormChange('numero', e.target.value)}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="Correo"
              value={leadForm.email}
              onChange={e => handleLeadFormChange('email', e.target.value)}
            />
          </div>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              className="w-full appearance-none rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all bg-white text-slate-600"
              value={leadForm.documentType}
              onChange={e => handleLeadFormChange('documentType', e.target.value as DocumentType)}
            >
              {Object.values(DocumentType).map(doc => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90" />
          </div>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="Número de documento"
              value={leadForm.documentNumber}
              onChange={e => handleLeadFormChange('documentNumber', e.target.value)}
            />
          </div>
        </div>
        
        <textarea
          className="w-full mt-4 rounded-xl border border-slate-200 p-3 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all placeholder:text-slate-400 min-h-[80px]"
          placeholder="Notas internas opcionales..."
          value={leadForm.notas}
          onChange={e => handleLeadFormChange('notas', e.target.value)}
        />
        
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleCreateClient}
            disabled={isSavingLead}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 transition-all shadow-lg shadow-slate-900/10"
          >
            {isSavingLead ? (
              <>Guardando...</>
            ) : (
              <>
                <User className="h-4 w-4" />
                Registrar Cliente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderServiciosStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {services.map(service => {
          const isSelected = selectedServiceIds.includes(service.id);
          return (
            <label
              key={service.id}
              className={`relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-[#aa632d] bg-[#aa632d]/5 ring-1 ring-[#aa632d]'
                  : 'border-slate-200 hover:border-[#aa632d]/50 hover:bg-slate-50'
              }`}
            >
              <div className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                 isSelected ? 'bg-[#aa632d] border-[#aa632d] text-white' : 'border-slate-300 bg-white'
              }`}>
                {isSelected && <Check className="h-3 w-3" />}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={isSelected}
                onChange={() => handleToggleService(service.id)}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className={`text-sm font-semibold ${isSelected ? 'text-[#aa632d]' : 'text-slate-700'}`}>
                    {service.nombre}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    S/ {service.precio.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    <Clock className="h-3 w-3" />
                    {(service.duracionMinutos || 60)} min
                  </span>
                  <span className="text-xs text-slate-500">{service.categoria}</span>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 mt-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Duration Override */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
              Tiempo total estimado
            </label>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{totalDuration} min</p>
                <p className="text-xs text-slate-400">Calculado automáticamente</p>
              </div>
            </div>
            
            <div className="mt-4 relative">
              <input
                type="number"
                min={30}
                step={15}
                value={manualDuration}
                onChange={e => setManualDuration(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ajustar tiempo manualmente..."
                className="w-full rounded-xl border border-slate-200 pl-3 pr-3 py-2 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Mínimo recomendado: 30 min (intervalos de 15)
              </p>
            </div>
          </div>

          {/* Pricing & Discounts */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subtotal</span>
              <span className="text-base font-semibold text-slate-900">S/ {totalPrecio.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-slate-100 my-3 pt-3">
               <label className="text-xs font-medium text-slate-600 mb-2 block flex items-center gap-1">
                 <CreditCard className="h-3 w-3" /> Aplicar descuento
               </label>
               <div className="flex gap-2 mb-2">
                  <select
                    value={discountType}
                    onChange={e => {
                      const value = e.target.value as 'none' | 'percent' | 'amount';
                      setDiscountType(value);
                      if (value === 'none') setDiscountValue(0);
                    }}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-[#aa632d] focus:outline-none bg-slate-50"
                  >
                    <option value="none">Ninguno</option>
                    <option value="percent">% Porc.</option>
                    <option value="amount">Monto $</option>
                  </select>
                  {discountType !== 'none' && (
                    <input
                      type="number"
                      min={0}
                      max={discountType === 'percent' ? 100 : undefined}
                      value={discountValue}
                      onChange={e => setDiscountValue(Number(e.target.value) || 0)}
                      placeholder={discountType === 'percent' ? '%' : 'S/'}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#aa632d] focus:outline-none"
                    />
                  )}
               </div>
               {descuentoAplicado > 0 && (
                 <div className="flex justify-between items-center text-xs text-emerald-600 font-medium">
                   <span>Descuento</span>
                   <span>- S/ {descuentoAplicado.toFixed(2)}</span>
                 </div>
               )}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">Total a pagar</span>
              <span className="text-xl font-bold text-[#aa632d]">S/ {totalConDescuento.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgendaStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Date & Time Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">Fecha</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all"
            />
          </div>
        </div>
        <div className="relative">
           <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">Hora de inicio</label>
           <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              disabled={!selectedProfesionalId || !selectedDate}
              className="w-full appearance-none rounded-xl border border-slate-200 pl-10 pr-8 py-2.5 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar hora...</option>
              {(() => {
                // Generar opciones de tiempo filtradas por turno del profesional
                const timeOptions: string[] = [];
                const interval = 15; // Intervalos de 15 minutos
                
                // Rango completo 8:00 - 20:45 (backup si no hay turno)
                for (let h = 8; h <= 20; h++) {
                  for (let m = 0; m < 60; m += interval) {
                    if (h === 20 && m > 45) break; // Máximo 20:45
                    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    timeOptions.push(timeStr);
                  }
                }
                
                // TODO: Filtrar por turnos reales del profesional cuando selectedProfesionalId y selectedDate estén disponibles
                // Por ahora, mostrar todas las opciones
                return timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ));
              })()}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
          </div>
          {(!selectedProfesionalId || !selectedDate) && (
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Selecciona profesional y fecha primero
            </p>
          )}
        </div>
      </div>

      {/* Resource Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">Profesional</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedProfesionalId ?? ''}
              onChange={e => setSelectedProfesionalId(e.target.value || undefined)}
              className="w-full appearance-none rounded-xl border border-slate-200 pl-10 pr-8 py-2.5 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all bg-white"
            >
              <option value="">Selecciona profesional</option>
              {profesionalOptions.map(pro => (
                <option key={pro.value} value={pro.value}>{pro.label}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">Ambiente</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedAmbienteId ?? ''}
              onChange={e => setSelectedAmbienteId(e.target.value ? Number(e.target.value) : null)}
              className="w-full appearance-none rounded-xl border border-slate-200 pl-10 pr-8 py-2.5 text-sm focus:border-[#aa632d] focus:ring-4 focus:ring-[#aa632d]/10 focus:outline-none transition-all bg-white"
            >
              <option value="">Ambiente disponible</option>
              {ambientes.map(ambiente => (
                <option key={ambiente.id} value={ambiente.id}>{ambiente.nombre} · {ambiente.tipo}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90" />
          </div>
        </div>
      </div>

      {/* Availability Status */}
      <div className={`rounded-xl border px-4 py-4 text-sm flex items-start gap-3 transition-colors duration-300 ${
        availabilityState === 'ok' 
          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800' 
          : availabilityState === 'conflict'
          ? 'border-rose-200 bg-rose-50/50 text-rose-800'
          : 'border-slate-200 bg-slate-50 text-slate-600'
      }`}>
        {availabilityState === 'checking' && <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin flex-shrink-0" />}
        {availabilityState === 'ok' && <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />}
        {availabilityState === 'conflict' && <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />}
        {availabilityState === 'idle' && <Info className="h-5 w-5 text-slate-400 flex-shrink-0" />}
        
        <div>
          <p className="font-medium">
            {availabilityState === 'checking' ? 'Verificando disponibilidad...' : availabilityMessage || 'Selecciona fecha y hora para verificar'}
          </p>
          {availabilityState === 'conflict' && (
            <p className="mt-1 text-xs text-rose-600/80">
              Prueba un horario diferente o revisa las sugerencias abajo.
            </p>
          )}
        </div>
      </div>

      {/* Slots details */}
      {availabilitySlots.length > 0 && (
        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Grid className="h-3 w-3" />
            Detalle por profesional
          </p>
          <div className="space-y-2">
            {availabilitySlots.map(slot => {
              const key = `${slot.profesionalId || 'sin-prof'}-${slot.ambienteId ?? 'libre'}`;
              const isSelected =
                slot.profesionalId === selectedProfesionalId &&
                (slot.ambienteId ?? null) === (selectedAmbienteId ?? null);
              const ambienteName = slot.ambienteId ? ambientesMap.get(slot.ambienteId)?.nombre : 'Ambiente flexible';
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
                    slot.disponible
                      ? 'border-emerald-100 bg-emerald-50/30'
                      : 'border-rose-100 bg-rose-50/30 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        slot.disponible ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                     }`}>
                        {slot.profesionalId?.charAt(0) || '?'}
                     </div>
                     <div>
                      <p className="font-semibold text-slate-800">{slot.profesionalId || 'Sin profesional asignado'}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {ambienteName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isSelected && <span className="mb-1 inline-block rounded-full bg-[#aa632d] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">Seleccionado</span>}
                    <p className={`text-xs font-semibold ${slot.disponible ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {slot.disponible ? 'Disponible' : slot.motivo || 'Ocupado'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {availabilitySuggestions.length > 0 && (
        <div className="rounded-2xl border border-dashed border-[#aa632d]/40 bg-[#FFFBF7] p-5">
           <p className="text-xs font-bold uppercase tracking-wider text-[#aa632d] mb-3 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Sugerencias rápidas
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {availabilitySuggestions.map((suggestion, index) => {
              const isActive = suggestion.fecha === selectedDate && suggestion.horaInicio === startTime;
              return (
                <button
                  type="button"
                  key={`${suggestion.fecha}-${suggestion.horaInicio}-${index}`}
                  onClick={() => handleApplySuggestion(suggestion)}
                  className={`group relative rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                    isActive 
                      ? 'border-[#aa632d] bg-white shadow-md ring-1 ring-[#aa632d]/20' 
                      : 'border-[#aa632d]/20 bg-white hover:border-[#aa632d] hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-800">{describeSuggestionWindow(suggestion)}</p>
                    {isActive && <CheckCircle className="h-4 w-4 text-[#aa632d]" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {suggestion.profesionalId || 'Profesional por asignar'}
                  </p>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-[#aa632d]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderConfirmacionStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#aa632d]" />
                Resumen de la cita
            </p>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                Borrador
            </span>
        </div>
        <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-[#aa632d]/10 flex items-center justify-center text-[#aa632d]">
                    <User className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cliente</p>
                    <p className="font-semibold text-slate-800">{selectedLead?.nombres} {selectedLead?.apellidos}</p>
                    <p className="text-xs text-slate-500">{selectedLead?.numero}</p>
                </div>
            </div>
            
            <div className="border-t border-slate-100 my-2"></div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Fecha & Hora</p>
                        <p className="font-medium text-slate-800">{selectedDate}</p>
                        <p className="text-xs text-slate-500">{startTime} ({totalDuration} min)</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                         <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Profesional</p>
                         <p className="font-medium text-slate-800">{selectedProfesionalId || 'Pendiente'}</p>
                         <p className="text-xs text-slate-500 truncate max-w-[120px]">
                           {ambientes.find(a => a.id === selectedAmbienteId)?.nombre || 'Ambiente flexible'}
                         </p>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-slate-100 my-2"></div>

             <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Servicios</p>
                <div className="flex flex-wrap gap-2">
                    {selectedServiceIds.map(id => (
                        <span key={id} className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                            {services.find(s => s.id === id)?.nombre}
                        </span>
                    ))}
                </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Total estimado</span>
                <div className="text-right">
                    {descuentoAplicado > 0 && (
                        <p className="text-xs text-emerald-600 line-through mr-2 inline">S/ {totalPrecio.toFixed(2)}</p>
                    )}
                    <span className="text-lg font-bold text-[#aa632d]">S/ {totalConDescuento.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block ml-1">Origen</label>
          <select
            value={origen}
            onChange={e => handleOrigenChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
          >
            {sourceOptions.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block ml-1">Estado inicial</label>
          <select
            value={estadoInicial}
            onChange={e => setEstadoInicial(e.target.value as AppointmentStatus)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none"
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
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block ml-1">Notas</label>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#aa632d] focus:outline-none min-h-[60px]"
          rows={2}
          placeholder="Observaciones internas..."
        />
      </div>
      
      <div className="bg-[#fff9f5] border border-[#aa632d]/20 rounded-xl p-4">
        <label className="text-xs font-bold uppercase tracking-wider text-[#aa632d] mb-2 block">Notificaciones</label>
        <div className="space-y-3">
          <div className="flex gap-4">
             {channels.whatsapp && (
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedChannels.includes('whatsapp') ? 'bg-[#aa632d] border-[#aa632d] text-white' : 'border-slate-300 bg-white'}`}>
                      {selectedChannels.includes('whatsapp') && <Check className="h-3 w-3" />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedChannels.includes('whatsapp')}
                    onChange={() => handleChannelsChange('whatsapp')}
                  />
                  <span className="text-sm font-medium text-slate-700">WhatsApp</span>
                </label>
              )}
              {channels.email && (
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedChannels.includes('email') ? 'bg-[#aa632d] border-[#aa632d] text-white' : 'border-slate-300 bg-white'}`}>
                      {selectedChannels.includes('email') && <Check className="h-3 w-3" />}
                  </div>
                   <input
                    type="checkbox"
                     className="sr-only"
                    checked={selectedChannels.includes('email')}
                    onChange={() => handleChannelsChange('email')}
                  />
                  <span className="text-sm font-medium text-slate-700">Correo</span>
                </label>
              )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#aa632d]/10">
            <input
              id="emitir-comprobante"
              type="checkbox"
              className="accent-[#aa632d] w-4 h-4"
              checked={emitirComprobante}
              onChange={e => setEmitirComprobante(e.target.checked)}
            />
            <label htmlFor="emitir-comprobante" className="text-sm font-medium text-slate-700 cursor-pointer select-none"> Emitir comprobante inmediato</label>
          </div>
        </div>
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
      title="Agendar Nueva Cita"
      customMaxWidth="1150px"
      footer={(
        <div className="flex w-full items-center justify-between px-2">
          <button
            type="button"
            onClick={goBack}
            disabled={activeStep === 'cliente'}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
          >
            Atrás
          </button>
          
          <div className="flex items-center gap-4">
            {error && (
               <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-xs font-medium">{error}</p>
               </div>
            )}
            
            <div className="flex flex-col items-end gap-1">
               {!canProceed && activeStep !== 'confirmacion' && (
                  <p className="text-[11px] text-slate-400 font-medium">{stepHelperText}</p>
                )}
                
                {activeStep !== 'confirmacion' ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed}
                    className="flex items-center gap-2 rounded-xl bg-[#aa632d] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#aa632d]/20 hover:bg-[#8e5225] hover:shadow-[#aa632d]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all transform active:scale-95"
                  >
                    Continuar <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                   <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-[#0f172a] px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-[#1a2846] disabled:opacity-60 transition-all transform active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        Guardar Cita <Check className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] h-[65vh] md:h-[70vh] gap-0 bg-white">
        {/* Sidebar Stepper */}
        <aside className="border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 p-6 overflow-y-auto">
          <div className="space-y-0 relative">
             {/* Vertical Line for desktop */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 hidden md:block" />
            
            {stepList.map((step, index) => {
              const currentIndex = stepList.findIndex(item => item.id === activeStep);
              const status = index < currentIndex ? 'complete' : index === currentIndex ? 'active' : 'pending';
              
              return (
                <div key={step.id} className="group flex items-start gap-4 relative md:pb-8 last:pb-0 z-10">
                  <div
                    className={`h-10 w-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${
                      status === 'complete'
                        ? 'bg-[#aa632d] border-[#aa632d] text-white scale-100'
                        : status === 'active'
                          ? 'bg-white border-[#aa632d] text-[#aa632d] scale-110 ring-4 ring-[#aa632d]/10'
                          : 'bg-white border-slate-200 text-slate-300'
                    }`}
                  >
                    {status === 'complete' ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className={`transition-opacity duration-300 ${status === 'pending' ? 'opacity-50' : 'opacity-100'}`}>
                    <p className={`text-sm font-bold transition-colors ${status === 'active' ? 'text-slate-800' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-400 leading-snug max-w-[180px] mt-0.5 hidden md:block">
                      {step.hint}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
           <div className="mt-8 p-4 bg-[#aa632d]/5 rounded-xl border border-[#aa632d]/10 hidden md:block">
              <p className="text-xs font-bold text-[#aa632d] uppercase tracking-wider mb-1 flex items-center gap-2">
                 <Info className="h-3 w-3" />
                 Ayuda
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                 {activeStepInfo.hint}
              </p>
           </div>
        </aside>

        {/* Content Area */}
        <section className="p-6 md:p-8 overflow-y-auto bg-white relative">
          <div className="mb-6 pb-4 border-b border-slate-50 flex justify-between items-end">
             <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1">
                  Paso {currentStepIndex + 1} de {stepList.length}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{activeStepInfo.label}</h3>
             </div>
             
             {/* Progress bar on mobile */}
             <div className="md:hidden w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                   className="h-full bg-[#aa632d] transition-all duration-500 ease-out"
                   style={{ width: `${((currentStepIndex + 1) / stepList.length) * 100}%` }}
                />
             </div>
          </div>
          
          <div className="animate-in fade-in duration-300">
            {renderStep()}
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default AppointmentWizard;
