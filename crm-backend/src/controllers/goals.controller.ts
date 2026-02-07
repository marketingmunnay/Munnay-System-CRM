import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest, isAdmin } from '../middleware/auth';

// ─── Helpers para calcular progreso ───────────────────────────

/** Inicio/fin del día, semana y mes de una fecha */
const periodRange = (period: string, referenceDate: Date) => {
  const d = new Date(referenceDate);
  d.setHours(0, 0, 0, 0);
  if (period === 'diario') {
    const start = new Date(d);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (period === 'semanal') {
    const dayOfWeek = d.getDay(); // 0=dom
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  }
  // mensual
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

/** Calcula cuántas estrellas (0-5) merece un resultado */
const calculateStars = (current: number, target: number, optimo?: number | null): number => {
  if (target <= 0) return 0;
  const ratio = current / target;
  if (optimo && optimo > 0 && current >= optimo) return 5;
  if (ratio >= 1) return 4;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio >= 0.4) return 1;
  return 0;
};

/** Genera array de evolución diaria dentro de un rango */
const buildDailyEvolution = (
  leads: any[],
  objective: string,
  startDate: Date,
  endDate: Date,
  userName: string
) => {
  const points: { date: string; value: number }[] = [];
  const today = new Date();
  const limit = endDate < today ? endDate : today;

  for (let d = new Date(startDate); d <= limit; d.setDate(d.getDate() + 1)) {
    const dayStr = d.toISOString().split('T')[0];
    const dayStart = new Date(dayStr + 'T00:00:00');
    const dayEnd = new Date(dayStr + 'T23:59:59.999');
    let value = 0;

    if (objective === 'VentasServicios' || objective === 'VentasSkinCare' || objective === 'MontoRecaudadoDia') {
      value = leads
        .filter(l => {
          if (!l.fechaLead) return false;
          const fLead = new Date(l.fechaLead);
          return fLead >= dayStart && fLead <= dayEnd;
        })
        .reduce((sum: number, l: any) => sum + (l.montoPagado || 0), 0);
    } else if (objective === 'EvaluacionesMedicas' || objective === 'LimpiezaFacial' || objective === 'Hydrafacial' || objective === 'EvaluacionesEspecificas') {
      const serviceMap: Record<string, string[]> = {
        EvaluacionesMedicas: ['evaluaci', 'evaluacion medica'],
        LimpiezaFacial: ['limpieza facial'],
        Hydrafacial: ['hydrafacial'],
        EvaluacionesEspecificas: ['evaluaci', 'especif'],
      };
      const keywords = serviceMap[objective] || [];
      value = leads.filter(l => {
        if (!l.fechaHoraAgenda) return false;
        const fAgenda = new Date(l.fechaHoraAgenda);
        if (fAgenda < dayStart || fAgenda > dayEnd) return false;
        if (l.estado !== 'Agendado') return false;
        const servicios = (l.servicios || []).join(' ').toLowerCase();
        return keywords.some((kw: string) => servicios.includes(kw));
      }).length;
    } else if (objective === 'Leads') {
      value = leads.filter(l => {
        const fLead = new Date(l.fechaLead);
        return fLead >= dayStart && fLead <= dayEnd;
      }).length;
    } else if (objective === 'Agendados') {
      value = leads.filter(l => {
        if (!l.fechaHoraAgenda) return false;
        const fAgenda = new Date(l.fechaHoraAgenda);
        return fAgenda >= dayStart && fAgenda <= dayEnd && l.estado === 'Agendado';
      }).length;
    } else if (objective === 'CierreEvaluaciones' || objective === 'CantidadCierre') {
      value = leads.filter(l => {
        if (!l.fechaHoraAgenda) return false;
        const fAgenda = new Date(l.fechaHoraAgenda);
        return fAgenda >= dayStart && fAgenda <= dayEnd && l.estadoRecepcion === 'Atendido';
      }).length;
    } else if (objective === 'PacientesDeudores') {
      value = leads.filter(l => {
        const fLead = new Date(l.fechaLead);
        return fLead >= dayStart && fLead <= dayEnd && (l.deudaCita || 0) > 0 && (l.montoPagado || 0) > 0;
      }).length;
    }

    points.push({ date: dayStr, value });
  }
  return points;
};

/** Calcula el valor acumulado para un objetivo en un rango */
const computeCurrentValue = (
  leads: any[],
  objective: string,
  start: Date,
  end: Date,
  userName: string
): number => {
  const filtered = leads.filter(l => {
    const fLead = new Date(l.fechaLead);
    return fLead >= start && fLead <= end;
  });

  switch (objective) {
    case 'VentasServicios':
    case 'VentasSkinCare':
    case 'VentasProductos':
    case 'MontoRecaudadoDia':
      return filtered.reduce((sum, l) => sum + (l.montoPagado || 0), 0);

    case 'Leads':
      return filtered.length;

    case 'Agendados':
      return filtered.filter(l => l.estado === 'Agendado').length;

    case 'Asistidos':
      return filtered.filter(l => l.estadoRecepcion === 'Atendido').length;

    case 'CierreEvaluaciones':
    case 'CantidadCierre':
      return filtered.filter(l => l.estadoRecepcion === 'Atendido').length;

    case 'PorcentajeCierre': {
      const agendados = filtered.filter(l => l.estado === 'Agendado').length;
      const atendidos = filtered.filter(l => l.estadoRecepcion === 'Atendido').length;
      return agendados > 0 ? Math.round((atendidos / agendados) * 100) : 0;
    }

    case 'Recuperados':
    case 'PacientesNoCerraron':
      return filtered.filter(l => l.estado === 'Perdido' && (l.montoPagado || 0) > 0).length;

    case 'PacientesDeudores':
      return filtered.filter(l => (l.deudaCita || 0) > 0 && (l.montoPagado || 0) > 0).length;

    case 'EvaluacionesMedicas':
      return leads.filter(l => {
        if (!l.fechaHoraAgenda) return false;
        const f = new Date(l.fechaHoraAgenda);
        if (f < start || f > end) return false;
        const servicios = (l.servicios || []).join(' ').toLowerCase();
        return servicios.includes('evaluaci');
      }).length;

    case 'LimpiezaFacial':
      return leads.filter(l => {
        if (!l.fechaHoraAgenda) return false;
        const f = new Date(l.fechaHoraAgenda);
        if (f < start || f > end) return false;
        const servicios = (l.servicios || []).join(' ').toLowerCase();
        return servicios.includes('limpieza facial');
      }).length;

    case 'Hydrafacial':
      return leads.filter(l => {
        if (!l.fechaHoraAgenda) return false;
        const f = new Date(l.fechaHoraAgenda);
        if (f < start || f > end) return false;
        const servicios = (l.servicios || []).join(' ').toLowerCase();
        return servicios.includes('hydrafacial');
      }).length;

    case 'ConversionLeads': {
      const total = filtered.length;
      const agendados = filtered.filter(l => l.estado === 'Agendado').length;
      return total > 0 ? Math.round((agendados / total) * 100) : 0;
    }

    case 'CostoPorResultado':
      return 0; // Requiere datos de campañas, no de leads

    default:
      return 0;
  }
};

// ─── CRUD ─────────────────────────────────────────────────────

export const getGoals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, area, isActive } = req.query;
    const where: any = {};
    if (userId) where.userId = parseInt(userId as string);
    if (area) where.area = area;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (!isAdmin(req.authUser)) {
      where.createdById = req.authUser?.id;
    }
    const goals = await prisma.goal.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals', error: (error as Error).message });
  }
};

export const getGoalById = async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const goal = await prisma.goal.findUnique({ where: { id } });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goal', error: (error as Error).message });
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response) => {
  const { id, startDate, endDate, createdAt, updatedAt, ...data } = req.body;
  try {
    const newGoal = await prisma.goal.create({
      data: {
        ...data,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        value: Number(data.value),
        valueOptimo: data.valueOptimo != null ? Number(data.valueOptimo) : null,
        userId: data.userId ? Number(data.userId) : null,
        createdById: req.authUser?.id,
      },
    });
    res.status(201).json(newGoal);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ message: 'Error creating goal', error: (error as Error).message });
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const { id: _, startDate, endDate, createdAt, updatedAt, ...data } = req.body;
  try {
    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        value: data.value !== undefined ? Number(data.value) : undefined,
        valueOptimo: data.valueOptimo !== undefined ? (data.valueOptimo != null ? Number(data.valueOptimo) : null) : undefined,
        userId: data.userId !== undefined ? (data.userId ? Number(data.userId) : null) : undefined,
      },
    });
    res.status(200).json(updatedGoal);
  } catch (error) {
    console.error(`Error updating goal ${id}:`, error);
    res.status(500).json({ message: 'Error updating goal', error: (error as Error).message });
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.goal.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting goal ${id}:`, error);
    res.status(500).json({ message: 'Error deleting goal', error: (error as Error).message });
  }
};

// ─── PROGRESO ─────────────────────────────────────────────────

/**
 * GET /api/goals/progress/:userId
 * Calcula el progreso de todas las metas asignadas a un usuario.
 * Query params: ?period=diario|semanal|mensual&date=YYYY-MM-DD
 */
export const getGoalProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const periodFilter = (req.query.period as string) || undefined;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const referenceDate = new Date(dateStr + 'T12:00:00');

    // Buscar al usuario
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const fullName = `${user.nombres} ${user.apellidos}`.trim();

    // Buscar metas asignadas al usuario (por userId o por personal=fullName)
    const goals = await prisma.goal.findMany({
      where: {
        isActive: true,
        OR: [
          { userId },
          { personal: fullName },
        ],
        ...(periodFilter ? { period: periodFilter as any } : {}),
      },
    });

    if (goals.length === 0) {
      return res.status(200).json([]);
    }

    // Cargar leads relevantes (ventas del usuario o leads asignados)
    // Amplio rango para capturar leads del mes completo
    const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { vendedor: user.nombres as any },
          { profesionalAsignado: fullName },
          { profesionalAsignado: user.nombres },
        ],
        fechaLead: { gte: monthStart, lte: monthEnd },
      },
    });

    const results = goals.map(goal => {
      const period = goal.period || 'mensual';
      const { start, end } = periodRange(period, referenceDate);

      const currentValue = computeCurrentValue(leads, goal.objective, start, end, fullName);
      const targetValue = goal.value;
      const percentage = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0;
      const remaining = Math.max(0, targetValue - currentValue);
      const stars = calculateStars(currentValue, targetValue, goal.valueOptimo);
      const isAchieved = currentValue >= targetValue;

      const daysRemaining = Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

      // Evolución diaria dentro del periodo
      const evolution = buildDailyEvolution(leads, goal.objective, start, end, fullName);

      return {
        goalId: goal.id,
        goal,
        currentValue,
        targetValue,
        percentage: Math.min(percentage, 100),
        remaining,
        period,
        evolution,
        stars,
        isAchieved,
        daysRemaining,
      };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Error computing goal progress:', error);
    res.status(500).json({ message: 'Error computing goal progress', error: (error as Error).message });
  }
};