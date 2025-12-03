import type { Lead, Egreso, Notification, Seguimiento } from '../types.ts';

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);

    // 1. Egresos por vencer
    data.egresos.forEach(egreso => {
        if (egreso.deuda > 0) {
            const fechaPago = new Date(egreso.fechaPago + 'T00:00:00');
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
            const fechaSeguimiento = new Date(seguimiento.fechaSeguimiento + 'T00:00:00');
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            
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
        const fechaLead = new Date(lead.fechaLead + 'T00:00:00');
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
                fechaCita.getFullYear() === today.getFullYear() &&
                fechaCita.getMonth() === today.getMonth() &&
                fechaCita.getDate() === today.getDate()
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
            const fechaLlamada = new Date(lead.fechaVolverLlamar + 'T' + lead.horaVolverLlamar);
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