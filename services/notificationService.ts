import type { Lead, Egreso, Notification, Seguimiento } from '../types.ts';
import { parseDate } from '../utils/time.ts';

interface NotificationData {
    leads: Lead[];
    egresos: Egreso[];
}

const hasComplications = (seguimiento: Seguimiento): boolean => {
    return seguimiento.inflamacion || seguimiento.ampollas || seguimiento.alergias ||
           seguimiento.malestarGeneral || seguimiento.brote || seguimiento.dolorDeCabeza ||
           seguimiento.moretones;
};

export const generateNotifications = (data: NotificationData): Notification[] => {
    const notifications: Notification[] = [];
    const now = new Date();
    // Use UTC midnights for date-only comparisons to match backend ISO UTC dates
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setUTCDate(today.getUTCDate() + 2);

    // 1. Egresos por vencer
    data.egresos.forEach(egreso => {
        if (egreso.deuda > 0) {
            const fechaPagoDate = parseDate(egreso.fechaPago);
            const fechaPago = fechaPagoDate ? fechaPagoDate : new Date(egreso.fechaPago);
            if (fechaPago >= today && fechaPago <= twoDaysFromNow) {
                notifications.push({
                    id: Date.now() + egreso.id,
                    type: 'pago_por_vencer',
                    message: `Pago a proveedor por vencer`,
                    details: `El pago a ${egreso.proveedor} de S/ ${egreso.deuda} vence pronto.`,
                    relatedId: egreso.id,
                    relatedPage: 'finanzas-egresos',
                    timestamp: now.toISOString(),
                    isRead: false,
                });
            }
        }
    });

    // 2. Pacientes con complicaciones (en los últimos 7 días)
    data.leads.forEach(lead => {
        lead.seguimientos?.forEach(seguimiento => {
            const fechaSeguimientoDate = parseDate(seguimiento.fechaSeguimiento);
            const fechaSeguimiento = fechaSeguimientoDate ? fechaSeguimientoDate : new Date(seguimiento.fechaSeguimiento);
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setUTCDate(now.getUTCDate() - 7);

            if (hasComplications(seguimiento) && fechaSeguimiento >= sevenDaysAgo) {
                notifications.push({
                    id: Date.now() + lead.id + seguimiento.id,
                    type: 'complicacion_paciente',
                    message: `Complicación en paciente`,
                    details: `${lead.nombres} ${lead.apellidos} reportó complicaciones.`,
                    relatedId: lead.id,
                    relatedPage: 'pacientes-historia',
                    timestamp: now.toISOString(),
                    isRead: false,
                });
            }
        });
    });
    
    // 3. Nuevos Leads
    data.leads.forEach(lead => {
        const fechaLeadDate = parseDate(lead.fechaLead);
        const fechaLead = fechaLeadDate ? fechaLeadDate : new Date(lead.fechaLead);
        if (fechaLead.getTime() === today.getTime()) {
             notifications.push({
                id: Date.now() + lead.id,
                type: 'nuevo_lead',
                message: `Nuevo Lead Registrado`,
                details: `${lead.nombres} ${lead.apellidos} de ${lead.redSocial}.`,
                relatedId: lead.id,
                relatedPage: 'marketing-leads',
                timestamp: now.toISOString(),
                isRead: false,
            });
        }
    });

    // 4. Citas Próximas
    data.leads.forEach(lead => {
        if (lead.fechaHoraAgenda) {
            const fechaCita = new Date(lead.fechaHoraAgenda);
             if (
                fechaCita.getUTCFullYear() === today.getUTCFullYear() &&
                fechaCita.getUTCMonth() === today.getUTCMonth() &&
                fechaCita.getUTCDate() === today.getUTCDate()
            ) {
                 notifications.push({
                    id: Date.now() + lead.id + 1000,
                    type: 'cita_proxima',
                    message: `Cita agendada para hoy`,
                    details: `Cita con ${lead.nombres} a las ${fechaCita.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}.`,
                    relatedId: lead.id,
                    relatedPage: 'recepcion-agendados',
                    timestamp: now.toISOString(),
                    isRead: false,
                });
            }
        }
    });

    // 5. Recordatorios de Llamadas
    data.leads.forEach(lead => {
        if (lead.fechaVolverLlamar && lead.horaVolverLlamar) {
            // Build UTC datetime from stored date and time (both expected in UTC or date-only)
            const fechaDate = parseDate(lead.fechaVolverLlamar);
            let fechaLlamada: Date | null = null;
            if (fechaDate) {
                const [hh, mm] = lead.horaVolverLlamar.split(':').map(Number);
                fechaLlamada = new Date(Date.UTC(fechaDate.getUTCFullYear(), fechaDate.getUTCMonth(), fechaDate.getUTCDate(), hh || 0, mm || 0));
            } else {
                fechaLlamada = new Date(lead.fechaVolverLlamar + 'T' + lead.horaVolverLlamar + ':00Z');
            }
            const diffMinutes = Math.floor((fechaLlamada.getTime() - now.getTime()) / (1000 * 60));
            
            // Notificar si la llamada es en los próximos 30 minutos o ya pasó (hasta 2 horas atrás)
            if (diffMinutes >= -120 && diffMinutes <= 30) {
                const mensaje = diffMinutes > 0 
                    ? `Llamar a ${lead.nombres} ${lead.apellidos} en ${diffMinutes} minutos`
                    : `Llamar a ${lead.nombres} ${lead.apellidos} (pendiente desde hace ${Math.abs(diffMinutes)} minutos)`;
                
                notifications.push({
                    id: Date.now() + lead.id + 2000,
                    type: 'recordatorio_llamada',
                    message: `Recordatorio de Llamada`,
                    details: mensaje,
                    relatedId: lead.id,
                    relatedPage: 'marketing-leads',
                    timestamp: now.toISOString(),
                    isRead: false,
                });
            }
        }
    });


    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};