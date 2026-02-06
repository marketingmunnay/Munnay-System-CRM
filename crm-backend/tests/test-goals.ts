/**
 * ═══════════════════════════════════════════════════════════════
 * TEST INTERNO: Sistema de Metas y Progreso
 * Verifica la lógica de cálculo sin necesidad de base de datos.
 * Ejecutar: npx ts-node tests/test-goals.ts
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Replicas locales de las funciones del controller ──────

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
    const dayOfWeek = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  }
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

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
    case 'ConversionLeads': {
      const total = filtered.length;
      const agendados = filtered.filter(l => l.estado === 'Agendado').length;
      return total > 0 ? Math.round((agendados / total) * 100) : 0;
    }
    case 'PacientesDeudores':
      return filtered.filter(l => (l.deudaCita || 0) > 0 && (l.montoPagado || 0) > 0).length;
    case 'Recuperados':
    case 'PacientesNoCerraron':
      return filtered.filter(l => l.estado === 'Perdido' && (l.montoPagado || 0) > 0).length;
    default:
      return 0;
  }
};

// ─── Framework de testing mínimo ──────────────────────────

let passed = 0;
let failed = 0;
const errors: string[] = [];

function assert(condition: boolean, testName: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    errors.push(testName);
    console.log(`  ❌ ${testName}`);
  }
}

function assertEqual(actual: any, expected: any, testName: string) {
  if (actual === expected) {
    passed++;
    console.log(`  ✅ ${testName} (${actual})`);
  } else {
    failed++;
    errors.push(`${testName}: esperado ${expected}, obtuvo ${actual}`);
    console.log(`  ❌ ${testName}: esperado ${expected}, obtuvo ${actual}`);
  }
}

// ═══════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════

console.log('\n══════════════════════════════════════════════');
console.log(' TEST SISTEMA DE METAS Y PROGRESO - MUNNAY CRM');
console.log('══════════════════════════════════════════════\n');

// ──────────────────────────────────────────────────────
// 1. PERIOD RANGE
// ──────────────────────────────────────────────────────
console.log('📅 1. periodRange()');

// 1.1 Diario
const diario = periodRange('diario', new Date('2026-02-05T15:30:00'));
assertEqual(diario.start.toISOString().slice(0, 10), '2026-02-05', 'Diario: start = mismo día');
assertEqual(diario.end.getHours(), 23, 'Diario: end = 23:59');
assert(diario.start.getHours() === 0 && diario.start.getMinutes() === 0, 'Diario: start a medianoche');

// 1.2 Semanal (5 Feb 2026 es jueves)
const semanal = periodRange('semanal', new Date('2026-02-05T10:00:00'));
assertEqual(semanal.start.getDay(), 1, 'Semanal: start es lunes');
assertEqual(semanal.end.getDay(), 0, 'Semanal: end es domingo');
assert(semanal.start <= new Date('2026-02-05'), 'Semanal: lunes <= referencia');
assert(semanal.end >= new Date('2026-02-05'), 'Semanal: domingo >= referencia');

// 1.3 Mensual
const mensual = periodRange('mensual', new Date('2026-02-15'));
assertEqual(mensual.start.getDate(), 1, 'Mensual: start = día 1');
assertEqual(mensual.end.getDate(), 28, 'Mensual: end = 28 Feb 2026');
assertEqual(mensual.start.getMonth(), 1, 'Mensual: mes = febrero');

// 1.4 Mensual marzo (31 días)
const marzo = periodRange('mensual', new Date('2026-03-10'));
assertEqual(marzo.end.getDate(), 31, 'Mensual: marzo tiene 31 días');

console.log('');

// ──────────────────────────────────────────────────────
// 2. CALCULATE STARS
// ──────────────────────────────────────────────────────
console.log('⭐ 2. calculateStars()');

assertEqual(calculateStars(0, 100), 0, '0% = 0 estrellas');
assertEqual(calculateStars(30, 100), 0, '30% = 0 estrellas');
assertEqual(calculateStars(40, 100), 1, '40% = 1 estrella');
assertEqual(calculateStars(55, 100), 1, '55% = 1 estrella');
assertEqual(calculateStars(60, 100), 2, '60% = 2 estrellas');
assertEqual(calculateStars(75, 100), 2, '75% = 2 estrellas');
assertEqual(calculateStars(80, 100), 3, '80% = 3 estrellas');
assertEqual(calculateStars(95, 100), 3, '95% = 3 estrellas');
assertEqual(calculateStars(100, 100), 4, '100% = 4 estrellas');
assertEqual(calculateStars(110, 100), 4, '110% sin óptimo = 4 estrellas');
assertEqual(calculateStars(110, 100, 110), 5, '110% = óptimo → 5 estrellas');
assertEqual(calculateStars(120, 100, 110), 5, 'Supera óptimo → 5 estrellas');
assertEqual(calculateStars(50, 100, 150), 1, 'Con óptimo, no lo alcanza → 1');
assertEqual(calculateStars(0, 0), 0, 'Target 0 → 0 estrellas');

console.log('');

// ──────────────────────────────────────────────────────
// 3. COMPUTE CURRENT VALUE - Metas comerciales
// ──────────────────────────────────────────────────────
console.log('💰 3. computeCurrentValue() - Comercial');

const mockLeads = [
  { fechaLead: '2026-02-05T10:00:00', montoPagado: 1500, estado: 'Agendado', estadoRecepcion: 'Atendido', vendedor: 'María', servicios: ['Evaluación Médica'], deudaCita: 0 },
  { fechaLead: '2026-02-05T11:00:00', montoPagado: 2000, estado: 'Agendado', estadoRecepcion: 'Atendido', vendedor: 'María', servicios: ['Hydrafacial'], deudaCita: 500 },
  { fechaLead: '2026-02-05T14:00:00', montoPagado: 500, estado: 'SinAgenda', estadoRecepcion: null, vendedor: 'María', servicios: [], deudaCita: 0 },
  { fechaLead: '2026-02-05T16:00:00', montoPagado: 3000, estado: 'Agendado', estadoRecepcion: 'NoAsistio', vendedor: 'Juan', servicios: ['Limpieza Facial'], deudaCita: 0 },
  { fechaLead: '2026-02-04T09:00:00', montoPagado: 1000, estado: 'Agendado', estadoRecepcion: 'Atendido', vendedor: 'María', servicios: ['Evaluación Médica'], deudaCita: 0 },
  { fechaLead: '2026-02-05T12:00:00', montoPagado: 800, estado: 'Perdido', estadoRecepcion: null, vendedor: 'María', servicios: [], deudaCita: 200 },
];

const dayStart = new Date('2026-02-05T00:00:00');
const dayEnd = new Date('2026-02-05T23:59:59.999');

// VentasServicios del día
const ventasDia = computeCurrentValue(mockLeads, 'VentasServicios', dayStart, dayEnd, 'María');
assertEqual(ventasDia, 1500 + 2000 + 500 + 3000 + 800, 'VentasServicios del día = S/.7,800');

// Leads del día
const leadsDia = computeCurrentValue(mockLeads, 'Leads', dayStart, dayEnd, 'María');
assertEqual(leadsDia, 5, 'Leads del día = 5');

// Agendados del día
const agendadosDia = computeCurrentValue(mockLeads, 'Agendados', dayStart, dayEnd, 'María');
assertEqual(agendadosDia, 3, 'Agendados del día = 3');

// Asistidos (Atendidos) del día
const asistidosDia = computeCurrentValue(mockLeads, 'Asistidos', dayStart, dayEnd, 'María');
assertEqual(asistidosDia, 2, 'Asistidos del día = 2 (solo Atendidos)');

// CierreEvaluaciones
const cierres = computeCurrentValue(mockLeads, 'CierreEvaluaciones', dayStart, dayEnd, 'María');
assertEqual(cierres, 2, 'Cierre Evaluaciones = 2');

// PorcentajeCierre (atendidos / agendados * 100)
const pctCierre = computeCurrentValue(mockLeads, 'PorcentajeCierre', dayStart, dayEnd, 'María');
assertEqual(pctCierre, 67, 'PorcentajeCierre = 67% (2/3)');

// ConversionLeads (agendados / total * 100)
const conversion = computeCurrentValue(mockLeads, 'ConversionLeads', dayStart, dayEnd, 'María');
assertEqual(conversion, 60, 'ConversionLeads = 60% (3/5)');

// PacientesDeudores (deuda > 0 y pagó algo)
const deudores = computeCurrentValue(mockLeads, 'PacientesDeudores', dayStart, dayEnd, 'María');
assertEqual(deudores, 2, 'PacientesDeudores cobrados = 2 (deuda>0 y pagado>0)');

// Recuperados (estado Perdido pero pagaron)
const recuperados = computeCurrentValue(mockLeads, 'Recuperados', dayStart, dayEnd, 'María');
assertEqual(recuperados, 1, 'Recuperados = 1 (Perdido con pago)');

console.log('');

// ──────────────────────────────────────────────────────
// 4. ESCENARIOS DE METAS POR ROL
// ──────────────────────────────────────────────────────
console.log('👩‍💼 4. Escenarios de Metas por Rol');

// Asesora Senior: meta S/.3,500/día, óptimo S/.4,000/día
const asesoraVentas = 3800;
const asesoraStars = calculateStars(asesoraVentas, 3500, 4000);
assertEqual(asesoraStars, 4, 'Asesora Senior S/.3,800 → 4 estrellas (cumplió mínimo, no óptimo)');

const asesoraOptimo = calculateStars(4500, 3500, 4000);
assertEqual(asesoraOptimo, 5, 'Asesora Senior S/.4,500 → 5 estrellas (superó óptimo)');

const asesoraBaja = calculateStars(2100, 3500, 4000);
assertEqual(asesoraBaja, 2, 'Asesora Senior S/.2,100 → 2 estrellas (60%)');

// Asesora Junior: mínimo S/.1,000/día, óptimo S/.2,000/día
const juniorStars = calculateStars(1500, 1000, 2000);
assertEqual(juniorStars, 4, 'Asesora Junior S/.1,500 → 4 estrellas (cumplió mínimo)');

const juniorOptimo = calculateStars(2200, 1000, 2000);
assertEqual(juniorOptimo, 5, 'Asesora Junior S/.2,200 → 5 estrellas (superó óptimo)');

// Call Center: 85-95 evaluaciones médicas/mes
const ccStars = calculateStars(90, 85, 95);
assertEqual(ccStars, 4, 'Call Center 90 eval → 4 estrellas (cumplió meta, no óptimo)');

const ccBajo = calculateStars(70, 85, 95);
assertEqual(ccBajo, 3, 'Call Center 70 eval → 3 estrellas (82%)');

// Recepción: 65-70% cierre
const recepStars = calculateStars(68, 65, 70);
assertEqual(recepStars, 4, 'Recepción 68% cierre → 4 estrellas');

const recepOptimo = calculateStars(72, 65, 70);
assertEqual(recepOptimo, 5, 'Recepción 72% cierre → 5 estrellas (≥ óptimo)');

// Procedimientos: 40-50% fidelización
const procStars = calculateStars(45, 40, 50);
assertEqual(procStars, 4, 'Procedimientos 45% fidel. → 4 estrellas');

// Médico: 80-90% efectividad, S/.1,500/día skincare
const medStars = calculateStars(85, 80, 90);
assertEqual(medStars, 4, 'Médico 85% efectividad → 4 estrellas');

const medSkincare = calculateStars(1600, 1500);
assertEqual(medSkincare, 4, 'Médico S/.1,600 skincare → 4 estrellas (100%+)');

// Marketing: >=900 leads, <=S/.3.5 costo
const mktLeads = calculateStars(950, 900, 1000);
assertEqual(mktLeads, 4, 'Marketing 950 leads → 4 estrellas (cumplió meta, no óptimo)');

console.log('');

// ──────────────────────────────────────────────────────
// 5. RANGO SEMANAL (prueba de borde)
// ──────────────────────────────────────────────────────
console.log('📊 5. Rangos semanales y mensuales');

const weekLeads = [
  { fechaLead: '2026-02-02T10:00:00', montoPagado: 3500, estado: 'Agendado', estadoRecepcion: 'Atendido', vendedor: 'Ana', servicios: [] },
  { fechaLead: '2026-02-03T10:00:00', montoPagado: 4000, estado: 'Agendado', estadoRecepcion: 'Atendido', vendedor: 'Ana', servicios: [] },
  { fechaLead: '2026-02-04T10:00:00', montoPagado: 3200, estado: 'Agendado', estadoRecepcion: 'Atendido', vendedor: 'Ana', servicios: [] },
  { fechaLead: '2026-02-05T10:00:00', montoPagado: 5000, estado: 'Agendado', estadoRecepcion: 'Atendido', vendedor: 'Ana', servicios: [] },
  { fechaLead: '2026-02-06T10:00:00', montoPagado: 2800, estado: 'Agendado', estadoRecepcion: 'Atendido', vendedor: 'Ana', servicios: [] },
  // Lead fuera de la semana
  { fechaLead: '2026-02-09T10:00:00', montoPagado: 1000, estado: 'Agendado', estadoRecepcion: 'Atendido', vendedor: 'Ana', servicios: [] },
];

const semana = periodRange('semanal', new Date('2026-02-05'));
const ventasSemana = computeCurrentValue(weekLeads, 'VentasServicios', semana.start, semana.end, 'Ana');
// 2 Feb es lunes, 8 Feb es domingo. Leads: 3500+4000+3200+5000+2800 = 18500 (excluye 9 Feb)
assertEqual(ventasSemana, 18500, 'Ventas semanales = S/.18,500 (excluye fuera de semana)');

const leadsSemana = computeCurrentValue(weekLeads, 'Leads', semana.start, semana.end, 'Ana');
assertEqual(leadsSemana, 5, 'Leads semanales = 5');

// Semanal con meta S/.21,000 
const semanStars = calculateStars(18500, 21000, 25000);
assertEqual(semanStars, 3, 'S/.18,500 vs meta S/.21,000 → 3 estrellas (88%)');

console.log('');

// ──────────────────────────────────────────────────────
// 6. EDGE CASES
// ──────────────────────────────────────────────────────
console.log('🔧 6. Casos borde');

// Sin leads
const sinLeads = computeCurrentValue([], 'VentasServicios', dayStart, dayEnd, 'María');
assertEqual(sinLeads, 0, 'Sin leads → ventas = 0');

const sinLeadsStars = calculateStars(0, 3500, 4000);
assertEqual(sinLeadsStars, 0, 'Sin ventas → 0 estrellas');

// PorcentajeCierre sin agendados
const pctSinAgendados = computeCurrentValue([], 'PorcentajeCierre', dayStart, dayEnd, 'María');
assertEqual(pctSinAgendados, 0, 'PorcentajeCierre sin agendados = 0 (no divide por 0)');

// ConversionLeads sin leads
const convSin = computeCurrentValue([], 'ConversionLeads', dayStart, dayEnd, 'María');
assertEqual(convSin, 0, 'ConversionLeads sin leads = 0 (no divide por 0)');

// Target negativo o cero
assertEqual(calculateStars(100, 0), 0, 'Target=0 → 0 estrellas');
assertEqual(calculateStars(100, -5), 0, 'Target negativo → 0 estrellas');

// Objetivo desconocido
const desconocido = computeCurrentValue(mockLeads, 'ObjetivoInventado', dayStart, dayEnd, 'María');
assertEqual(desconocido, 0, 'Objetivo desconocido → 0');

// Periodo default (mensual) en periodRange
const defPeriod = periodRange('mensual', new Date('2026-01-15'));
assertEqual(defPeriod.start.getDate(), 1, 'Default mensual: start = 1');
assertEqual(defPeriod.end.getDate(), 31, 'Default mensual enero: end = 31');

console.log('');

// ═══════════════════════════════════════════════════════════
// RESULTADOS
// ═══════════════════════════════════════════════════════════

console.log('══════════════════════════════════════════════');
console.log(` RESULTADOS: ${passed} pasaron ✅  |  ${failed} fallaron ❌`);
console.log('══════════════════════════════════════════════');

if (failed > 0) {
  console.log('\nFallas:');
  errors.forEach(e => console.log(`  → ${e}`));
  process.exit(1);
} else {
  console.log('\n🎉 ¡Todos los tests pasaron correctamente!');
  process.exit(0);
}
