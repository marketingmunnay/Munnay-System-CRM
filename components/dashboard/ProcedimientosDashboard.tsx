import React, { useMemo } from 'react';
import type { Lead, VentaExtra, Incidencia } from '../../types';
import StatCard from './StatCard.tsx';
import MonthlySalesChart from './MonthlySalesChart';

const GoogleIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface ProcedimientosDashboardProps {
  leads: Lead[];
  ventasExtra: VentaExtra[];
  incidencias: Incidencia[];
  dateRange?: { from: string; to: string };
}

const ProcedimientosDashboard: React.FC<ProcedimientosDashboardProps> = ({ leads, ventasExtra, incidencias }) => {
  const stats = useMemo(() => {
    const totalIncidencias = incidencias?.length || 0;
    const patientsWithInflamacion = new Set<number>();
    (leads || []).forEach(lead => {
      if (lead.seguimientos?.some(s => s.inflamacion)) patientsWithInflamacion.add(lead.id as number);
    });
    return {
      totalIncidencias,
      totalConInflamacion: patientsWithInflamacion.size,
    };
  }, [leads, incidencias]);

  const salesSummary = useMemo(() => {
    type SaleEntry = { servicio: string; montoPagado: number; deuda: number; vendedor?: string; fecha?: string };
    const entries: SaleEntry[] = [];

    (leads || []).forEach(l => {
      (l.tratamientos || []).forEach(t => {
        entries.push({
          servicio: t.nombre || 'Sin Nombre',
          montoPagado: Number(t.montoPagado || 0),
          deuda: Number(t.deuda || 0),
          vendedor: (l.vendedor as unknown as string) || 'Sin Vendedor',
          fecha: (l.fechaHoraAgenda as unknown as string) || (l.fechaLead as unknown as string) || undefined,
        });
      });
    });

    (ventasExtra || []).forEach(v => {
      entries.push({ servicio: v.servicio || 'Sin Nombre', montoPagado: Number(v.montoPagado || 0), deuda: Number(v.deuda || 0), vendedor: v.vendedor || 'Sin Vendedor', fecha: v.fechaVenta });
    });

    const totalCount = entries.length;
    const totalVentas = entries.reduce((s, e) => s + (e.montoPagado || 0), 0);
    const totalDeuda = entries.reduce((s, e) => s + (e.deuda || 0), 0);

    const byService: Record<string, { count: number; monto: number }> = {};
    entries.forEach(e => {
      const key = e.servicio || 'Sin Nombre';
      if (!byService[key]) byService[key] = { count: 0, monto: 0 };
      byService[key].count += 1;
      byService[key].monto += e.montoPagado || 0;
    });

    const serviceList = Object.entries(byService)
      .map(([servicio, data]) => ({ servicio, cantidad: data.count, monto: data.monto, porcentaje: totalCount > 0 ? (data.count / totalCount) * 100 : 0 }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const sellerMap: Record<string, Record<string, number>> = {};
    entries.forEach(e => {
      const seller = e.vendedor || 'Sin Vendedor';
      sellerMap[seller] = sellerMap[seller] || {};
      sellerMap[seller][e.servicio] = (sellerMap[seller][e.servicio] || 0) + 1;
    });

    return { totalCount, totalVentas, totalDeuda, serviceList, sellerMap };
  }, [leads, ventasExtra]);

  const ListCard: React.FC<{ title: string; items: { name: string; value: string }[]; bgColor: string }> = ({ title, items, bgColor }) => (
    <div className={`${bgColor} p-4 rounded-lg shadow h-full`}>
      <h4 className="font-semibold text-gray-700 text-base mb-3">{title}</h4>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex justify-between items-center text-sm bg-white/50 p-2 rounded-md">
              <span className="text-gray-600">{item.name}</span>
              <span className="font-semibold text-gray-800">{item.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center pt-4">No hay datos.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Incidencias" value={String(stats.totalIncidencias)} icon={<GoogleIcon name="report" className="text-red-600" />} iconBgClass="bg-red-100" />
        <StatCard title="Total Pacientes con Inflamación" value={String(stats.totalConInflamacion)} icon={<GoogleIcon name="local_fire_department" className="text-orange-600" />} iconBgClass="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListCard
          title="Pacientes por N° de Sesiones"
          items={[{ name: 'Total Ventas (entradas)', value: `${salesSummary.totalCount}` }]}
          bgColor="bg-yellow-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 text-base mb-3">Ventas por Servicio</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-3 py-2">Servicio</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">%</th>
                  <th className="px-3 py-2">Monto</th>
                </tr>
              </thead>
              <tbody>
                {salesSummary.serviceList.slice(0, 10).map((s, i) => (
                  <tr key={i} className="border-b bg-white">
                    <td className="px-3 py-2">{s.servicio}</td>
                    <td className="px-3 py-2 font-semibold">{s.cantidad}</td>
                    <td className="px-3 py-2">{s.porcentaje.toFixed(1)}%</td>
                    <td className="px-3 py-2">S/ {s.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <MonthlySalesChart leads={leads} ventasExtra={ventasExtra} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 text-base mb-3">Atenciones por Servicio por Vendedor</h4>
          <div className="overflow-x-auto">
            {Object.keys(salesSummary.sellerMap).length === 0 ? (
              <p className="text-sm text-gray-500">No hay datos disponibles.</p>
            ) : (
              Object.entries(salesSummary.sellerMap).map(([seller, services]) => (
                <div key={seller} className="mb-4">
                  <h5 className="font-medium text-gray-800 mb-2">{seller}</h5>
                  <table className="w-full text-sm text-left text-gray-600 mb-2">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-3 py-2">Servicio</th>
                        <th className="px-3 py-2">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(services).map(([serv, cnt]) => (
                        <tr key={serv} className="border-b bg-white">
                          <td className="px-3 py-2">{serv}</td>
                          <td className="px-3 py-2 font-semibold">{cnt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 text-base mb-3">Totales</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Ventas:</span>
              <span className="font-semibold">S/ {salesSummary.totalVentas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Deuda:</span>
              <span className="font-semibold">S/ {salesSummary.totalDeuda.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcedimientosDashboard;
import React, { useMemo } from 'react';
import type { Lead, VentaExtra, Incidencia } from '../../types';
import StatCard from './StatCard.tsx';
import MonthlySalesChart from './MonthlySalesChart';

const GoogleIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface ProcedimientosDashboardProps {
  leads: Lead[];
  ventasExtra: VentaExtra[];
  incidencias: Incidencia[];
  dateRange?: { from: string; to: string };
}

const ProcedimientosDashboard: React.FC<ProcedimientosDashboardProps> = ({ leads, ventasExtra, incidencias }) => {
  const stats = useMemo(() => {
    const totalIncidencias = incidencias?.length || 0;
    const patientsWithInflamacion = new Set<number>();
    (leads || []).forEach(lead => {
      if (lead.seguimientos?.some(s => s.inflamacion)) patientsWithInflamacion.add(lead.id as number);
    });
    return {
      totalIncidencias,
      totalConInflamacion: patientsWithInflamacion.size,
    };
  }, [leads, incidencias]);

  const salesSummary = useMemo(() => {
    type SaleEntry = { servicio: string; montoPagado: number; deuda: number; vendedor?: string; fecha?: string };
    const entries: SaleEntry[] = [];

    (leads || []).forEach(l => {
      (l.tratamientos || []).forEach(t => {
        entries.push({
          servicio: t.nombre || 'Sin Nombre',
          montoPagado: Number(t.montoPagado || 0),
          deuda: Number(t.deuda || 0),
          vendedor: (l.vendedor as unknown as string) || 'Sin Vendedor',
          fecha: (l.fechaHoraAgenda as unknown as string) || (l.fechaLead as unknown as string) || undefined,
        });
      });
    });

    (ventasExtra || []).forEach(v => {
      entries.push({ servicio: v.servicio || 'Sin Nombre', montoPagado: Number(v.montoPagado || 0), deuda: Number(v.deuda || 0), vendedor: v.vendedor || 'Sin Vendedor', fecha: v.fechaVenta });
    });

    const totalCount = entries.length;
    const totalVentas = entries.reduce((s, e) => s + (e.montoPagado || 0), 0);
    const totalDeuda = entries.reduce((s, e) => s + (e.deuda || 0), 0);

    const byService: Record<string, { count: number; monto: number }> = {};
    entries.forEach(e => {
      const key = e.servicio || 'Sin Nombre';
      if (!byService[key]) byService[key] = { count: 0, monto: 0 };
      byService[key].count += 1;
      byService[key].monto += e.montoPagado || 0;
    });

    const serviceList = Object.entries(byService)
      .map(([servicio, data]) => ({ servicio, cantidad: data.count, monto: data.monto, porcentaje: totalCount > 0 ? (data.count / totalCount) * 100 : 0 }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const sellerMap: Record<string, Record<string, number>> = {};
    entries.forEach(e => {
      const seller = e.vendedor || 'Sin Vendedor';
      sellerMap[seller] = sellerMap[seller] || {};
      sellerMap[seller][e.servicio] = (sellerMap[seller][e.servicio] || 0) + 1;
    });

    return { totalCount, totalVentas, totalDeuda, serviceList, sellerMap };
  }, [leads, ventasExtra]);

  const ListCard: React.FC<{ title: string; items: { name: string; value: string }[]; bgColor: string }> = ({ title, items, bgColor }) => (
    <div className={`${bgColor} p-4 rounded-lg shadow h-full`}>
      <h4 className="font-semibold text-gray-700 text-base mb-3">{title}</h4>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex justify-between items-center text-sm bg-white/50 p-2 rounded-md">
              <span className="text-gray-600">{item.name}</span>
              <span className="font-semibold text-gray-800">{item.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center pt-4">No hay datos.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Incidencias" value={String(stats.totalIncidencias)} icon={<GoogleIcon name="report" className="text-red-600" />} iconBgClass="bg-red-100" />
        <StatCard title="Total Pacientes con Inflamación" value={String(stats.totalConInflamacion)} icon={<GoogleIcon name="local_fire_department" className="text-orange-600" />} iconBgClass="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListCard
          title="Pacientes por N° de Sesiones"
          items={[{ name: 'Total Ventas (entradas)', value: `${salesSummary.totalCount}` }]}
          bgColor="bg-yellow-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 text-base mb-3">Ventas por Servicio</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-3 py-2">Servicio</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">%</th>
                  <th className="px-3 py-2">Monto</th>
                </tr>
              </thead>
              <tbody>
                {salesSummary.serviceList.slice(0, 10).map((s, i) => (
                  <tr key={i} className="border-b bg-white">
                    <td className="px-3 py-2">{s.servicio}</td>
                    <td className="px-3 py-2 font-semibold">{s.cantidad}</td>
                    <td className="px-3 py-2">{s.porcentaje.toFixed(1)}%</td>
                    <td className="px-3 py-2">S/ {s.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <MonthlySalesChart leads={leads} ventasExtra={ventasExtra} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 text-base mb-3">Atenciones por Servicio por Vendedor</h4>
          <div className="overflow-x-auto">
            {Object.keys(salesSummary.sellerMap).length === 0 ? (
              <p className="text-sm text-gray-500">No hay datos disponibles.</p>
            ) : (
              Object.entries(salesSummary.sellerMap).map(([seller, services]) => (
                <div key={seller} className="mb-4">
                  <h5 className="font-medium text-gray-800 mb-2">{seller}</h5>
                  <table className="w-full text-sm text-left text-gray-600 mb-2">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-3 py-2">Servicio</th>
                        <th className="px-3 py-2">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(services).map(([serv, cnt]) => (
                        <tr key={serv} className="border-b bg-white">
                          <td className="px-3 py-2">{serv}</td>
                          <td className="px-3 py-2 font-semibold">{cnt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 text-base mb-3">Totales</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Ventas:</span>
              <span className="font-semibold">S/ {salesSummary.totalVentas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Deuda:</span>
              <span className="font-semibold">S/ {salesSummary.totalDeuda.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcedimientosDashboard;
import React from 'react';
import type { Lead, VentaExtra, Incidencia } from '../../types';
import StatCard from './StatCard.tsx';
import MonthlySalesChart from './MonthlySalesChart';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface Props {
    leads: Lead[];
    ventasExtra: VentaExtra[];
    incidencias: Incidencia[];
}

const ProcedimientosDashboard: React.FC<Props> = ({ leads, ventasExtra, incidencias }) => {
    const stats = React.useMemo(() => {
        const totalIncidencias = incidencias.length;
        const patientsWithInflamacion = new Set<number>();
        leads.forEach(lead => { if (lead.seguimientos?.some(s => s.inflamacion)) patientsWithInflamacion.add(lead.id); });
        const totalVentasExtraProcedimientos = ventasExtra.filter(v => v.categoria !== 'Productos').reduce((s, v) => s + v.montoPagado, 0);
        return { totalIncidencias, totalConInflamacion: patientsWithInflamacion.size, totalVentasExtraProcedimientos };
    }, [leads, ventasExtra, incidencias]);

    const salesSummary = React.useMemo(() => {
        type SaleEntry = { servicio: string; montoPagado: number; deuda: number; vendedor?: string; fecha?: string };
        const entries: SaleEntry[] = [];
        leads.forEach(l => (l.tratamientos || []).forEach(t => entries.push({ servicio: t.nombre, montoPagado: t.montoPagado || 0, deuda: t.deuda || 0, vendedor: String(l.vendedor || 'Sin Vendedor'), fecha: l.fechaHoraAgenda || l.fechaLead })));
        ventasExtra.forEach(v => entries.push({ servicio: v.servicio, montoPagado: v.montoPagado || 0, deuda: v.deuda || 0, fecha: v.fechaVenta }));
        const totalCount = entries.length;
        const totalVentas = entries.reduce((s, e) => s + (e.montoPagado || 0), 0);
        const totalDeuda = entries.reduce((s, e) => s + (e.deuda || 0), 0);
        const byService: Record<string, { count: number; monto: number }> = {};
        entries.forEach(e => { const key = e.servicio || 'Sin Nombre'; if (!byService[key]) byService[key] = { count: 0, monto: 0 }; byService[key].count += 1; byService[key].monto += e.montoPagado || 0; });
        const serviceList = Object.entries(byService).map(([servicio, data]) => ({ servicio, cantidad: data.count, monto: data.monto, porcentaje: totalCount > 0 ? (data.count / totalCount) * 100 : 0 })).sort((a, b) => b.cantidad - a.cantidad);
        const sellerMap: Record<string, Record<string, number>> = {};
        entries.forEach(e => { const seller = e.vendedor || 'Sin Vendedor'; sellerMap[seller] = sellerMap[seller] || {}; sellerMap[seller][e.servicio] = (sellerMap[seller][e.servicio] || 0) + 1; });
        return { totalCount, totalVentas, totalDeuda, serviceList, sellerMap };
    }, [leads, ventasExtra]);

    const patientLists = React.useMemo(() => {
        const patientsWithProcedures = leads.filter(l => l.procedimientos && l.procedimientos.length > 0);
        const masDe10 = patientsWithProcedures.filter(p => p.procedimientos!.length > 10);
        const menosDe3 = patientsWithProcedures.filter(p => p.procedimientos!.length < 3);
        const entre4y9 = patientsWithProcedures.filter(p => p.procedimientos!.length >= 4 && p.procedimientos!.length <= 9);
        const conComplicaciones = leads.map(lead => { const complications = (lead.seguimientos || []).reduce((count, seg) => count + (seg.inflamacion ? 1 : 0) + (seg.ampollas ? 1 : 0) + (seg.alergias ? 1 : 0) + (seg.malestarGeneral ? 1 : 0) + (seg.brote ? 1 : 0) + (seg.dolorDeCabeza ? 1 : 0) + (seg.moretones ? 1 : 0), 0); return { lead, complications }; }).filter(item => item.complications > 0).sort((a, b) => b.complications - a.complications).slice(0, 5);
        return { masDe10, menosDe3, entre4y9, conComplicaciones };
    }, [leads]);

    const ListCard: React.FC<{title: string, items: {name: string, value: string}[], bgColor: string}> = ({title, items, bgColor}) => (
        <div className={`${bgColor} p-4 rounded-lg shadow h-full`}>
            <h4 className="font-semibold text-gray-700 text-base mb-3">{title}</h4>
            {items.length > 0 ? (
                <ul className="space-y-2">
                    {items.map((item, index) => (
                         <li key={index} className="flex justify-between items-center text-sm bg-white/50 p-2 rounded-md">
                            <span className="text-gray-600">{item.name}</span>
                            <span className="font-semibold text-gray-800">{item.value}</span>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-gray-500 text-center pt-4">No hay datos.</p>}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Incidencias"
                    value={String(stats.totalIncidencias)}
                    icon={<GoogleIcon name="report" className="text-red-600" />}
                    iconBgClass="bg-red-100"
                />
                <StatCard
                    title="Total Pacientes con Inflamación"
                    value={String(stats.totalConInflamacion)}
                    icon={<GoogleIcon name="local_fire_department" className="text-orange-600" />}
                    iconBgClass="bg-orange-100"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ListCard 
                   title="Pacientes con Más Complicaciones" 
                   items={patientLists.conComplicaciones.map(p => ({name: `${p.lead.nombres} ${p.lead.apellidos}`, value: `${p.complications} síntoma(s)`}))} 
                   bgColor="bg-red-50"
                />
                <div>
                     <ListCard 
                        title="Pacientes por N° de Sesiones" 
                        items={[
                            { name: 'Más de 10 sesiones', value: `${patientLists.masDe10.length} paciente(s)`},
                            { name: 'Entre 4 y 9 sesiones', value: `${patientLists.entre4y9.length} paciente(s)`},
                            { name: 'Menos de 3 sesiones', value: `${patientLists.menosDe3.length} paciente(s)`},
                        ]}
                        bgColor="bg-yellow-50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-gray-700 text-base mb-3">Ventas por Servicio (Top)</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2">Servicio</th>
                                    <th className="px-3 py-2">Cantidad</th>
                                    <th className="px-3 py-2">%</th>
                                    <th className="px-3 py-2">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesSummary.serviceList.slice(0,10).map((s, i) => (
                                    <tr key={i} className="border-b bg-white">
                                        <td className="px-3 py-2">{s.servicio}</td>
                                        <td className="px-3 py-2 font-semibold">{s.cantidad}</td>
                                        <td className="px-3 py-2">{s.porcentaje.toFixed(1)}%</td>
                                        <td className="px-3 py-2">S/ {s.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <MonthlySalesChart leads={leads} ventasExtra={ventasExtra} />
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-gray-700 text-base mb-3">Atenciones por Servicio por Vendedor</h4>
                    <div className="overflow-x-auto">
                        {Object.keys(salesSummary.sellerMap).length === 0 ? (
                            <p className="text-sm text-gray-500">No hay datos disponibles.</p>
                        ) : (
                            Object.entries(salesSummary.sellerMap).map(([seller, services]) => (
                                <div key={seller} className="mb-4">
                                    <h5 className="font-medium text-gray-800 mb-2">{seller}</h5>
                                    <table className="w-full text-sm text-left text-gray-600 mb-2">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2">Servicio</th>
                                                <th className="px-3 py-2">Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(services).map(([serv, cnt]) => (
                                                <tr key={serv} className="border-b bg-white">
                                                    <td className="px-3 py-2">{serv}</td>
                                                    <td className="px-3 py-2 font-semibold">{cnt}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProcedimientosDashboard;
import React, { useMemo } from 'react';
import type { Lead, VentaExtra, Incidencia } from '../../types';
import StatCard from './StatCard.tsx';
import MonthlySalesChart from './MonthlySalesChart';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface ProcedimientosDashboardProps {
    leads: Lead[];
    ventasExtra: VentaExtra[];
    incidencias: Incidencia[];
    dateRange: { from: string; to: string };
}

const ProcedimientosDashboard: React.FC<ProcedimientosDashboardProps> = ({ leads, ventasExtra, incidencias, dateRange }) => {
    const stats = useMemo(() => {
        const totalIncidencias = incidencias.length;

        const patientsWithInflamacion = new Set<number>();
        leads.forEach(lead => {
            if (lead.seguimientos?.some(s => s.inflamacion)) {
                patientsWithInflamacion.add(lead.id);
            }
        });
        
        const totalVentasExtraProcedimientos = ventasExtra
            .filter(v => v.categoria !== 'Productos')
            .reduce((sum, v) => sum + v.montoPagado, 0);

        return {
            totalIncidencias,
            totalConInflamacion: patientsWithInflamacion.size,
            totalVentasExtraProcedimientos,
        };
    }, [leads, ventasExtra, incidencias]);

    const salesSummary = useMemo(() => {
        type SaleEntry = { servicio: string; montoPagado: number; deuda: number; vendedor?: string; fecha?: string };
        const entries: SaleEntry[] = [];

        leads.forEach(l => {
            (l.tratamientos || []).forEach(t => {
                entries.push({
                    servicio: t.nombre,
                    montoPagado: t.montoPagado || 0,
                    deuda: t.deuda || 0,
                    vendedor: String(l.vendedor || 'Sin Vendedor'),
                    fecha: l.fechaHoraAgenda || l.fechaLead,
                });
            });
        });

        ventasExtra.forEach(v => {
            entries.push({ servicio: v.servicio, montoPagado: v.montoPagado || 0, deuda: v.deuda || 0, fecha: v.fechaVenta });
        });

        const totalCount = entries.length;
        const totalVentas = entries.reduce((s, e) => s + (e.montoPagado || 0), 0);
        const totalDeuda = entries.reduce((s, e) => s + (e.deuda || 0), 0);

        const byService: Record<string, { count: number; monto: number }> = {};
        entries.forEach(e => {
            const key = e.servicio || 'Sin Nombre';
            if (!byService[key]) byService[key] = { count: 0, monto: 0 };
            byService[key].count += 1;
            byService[key].monto += e.montoPagado || 0;
        });

        const serviceList = Object.entries(byService)
            .map(([servicio, data]) => ({ servicio, cantidad: data.count, monto: data.monto, porcentaje: totalCount > 0 ? (data.count / totalCount) * 100 : 0 }))
            .sort((a, b) => b.cantidad - a.cantidad);

        const sellerMap: Record<string, Record<string, number>> = {};
        entries.forEach(e => {
            const seller = e.vendedor || 'Sin Vendedor';
            sellerMap[seller] = sellerMap[seller] || {};
            sellerMap[seller][e.servicio] = (sellerMap[seller][e.servicio] || 0) + 1;
        });

        return { totalCount, totalVentas, totalDeuda, serviceList, sellerMap };
    }, [leads, ventasExtra]);

    const patientLists = useMemo(() => {
        const patientsWithProcedures = leads.filter(l => l.procedimientos && l.procedimientos.length > 0);

        const masDe10 = patientsWithProcedures.filter(p => p.procedimientos!.length > 10);
        const menosDe3 = patientsWithProcedures.filter(p => p.procedimientos!.length < 3);
        const entre4y9 = patientsWithProcedures.filter(p => p.procedimientos!.length >= 4 && p.procedimientos!.length <= 9);

        const conComplicaciones = leads.map(lead => {
            const complications = (lead.seguimientos || []).reduce((count, seg) => {
                return count + (seg.inflamacion ? 1 : 0) + (seg.ampollas ? 1 : 0) + (seg.alergias ? 1 : 0) + (seg.malestarGeneral ? 1 : 0) + (seg.brote ? 1 : 0) + (seg.dolorDeCabeza ? 1 : 0) + (seg.moretones ? 1 : 0);
            }, 0);
            return { lead, complications };
        })
        .filter(item => item.complications > 0)
        .sort((a, b) => b.complications - a.complications)
        .slice(0, 5);

        return { masDe10, menosDe3, entre4y9, conComplicaciones };
    }, [leads]);

    const ListCard: React.FC<{title: string, items: {name: string, value: string}[], bgColor: string}> = ({title, items, bgColor}) => (
        <div className={`${bgColor} p-4 rounded-lg shadow h-full`}>
            <h4 className="font-semibold text-gray-700 text-base mb-3">{title}</h4>
            {items.length > 0 ? (
                <ul className="space-y-2">
                    {items.map((item, index) => (
                         <li key={index} className="flex justify-between items-center text-sm bg-white/50 p-2 rounded-md">
                            <span className="text-gray-600">{item.name}</span>
                            <span className="font-semibold text-gray-800">{item.value}</span>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-gray-500 text-center pt-4">No hay datos.</p>}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Incidencias"
                    value={String(stats.totalIncidencias)}
                    icon={<GoogleIcon name="report" className="text-red-600" />}
                    iconBgClass="bg-red-100"
                />
                <StatCard
                    title="Total Pacientes con Inflamación"
                    value={String(stats.totalConInflamacion)}
                    icon={<GoogleIcon name="local_fire_department" className="text-orange-600" />}
                    iconBgClass="bg-orange-100"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ListCard 
                   title="Pacientes con Más Complicaciones" 
                   items={patientLists.conComplicaciones.map(p => ({name: `${p.lead.nombres} ${p.lead.apellidos}`, value: `${p.complications} síntoma(s)`}))} 
                   bgColor="bg-red-50"
                />
                <div>
                     <ListCard 
                        title="Pacientes por N° de Sesiones" 
                        items={[
                            { name: 'Más de 10 sesiones', value: `${patientLists.masDe10.length} paciente(s)`},
                            { name: 'Entre 4 y 9 sesiones', value: `${patientLists.entre4y9.length} paciente(s)`},
                            { name: 'Menos de 3 sesiones', value: `${patientLists.menosDe3.length} paciente(s)`},
                        ]}
                        bgColor="bg-yellow-50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-gray-700 text-base mb-3">Ventas por Servicio (Top)</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2">Servicio</th>
                                    <th className="px-3 py-2">Cantidad</th>
                                    <th className="px-3 py-2">%</th>
                                    <th className="px-3 py-2">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesSummary.serviceList.slice(0,10).map((s, i) => (
                                    <tr key={i} className="border-b bg-white">
                                        <td className="px-3 py-2">{s.servicio}</td>
                                        <td className="px-3 py-2 font-semibold">{s.cantidad}</td>
                                        <td className="px-3 py-2">{s.porcentaje.toFixed(1)}%</td>
                                        <td className="px-3 py-2">S/ {s.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <MonthlySalesChart leads={leads} ventasExtra={ventasExtra} />
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-gray-700 text-base mb-3">Atenciones por Servicio por Vendedor</h4>
                    <div className="overflow-x-auto">
                        {Object.keys(salesSummary.sellerMap).length === 0 ? (
                            <p className="text-sm text-gray-500">No hay datos disponibles.</p>
                        ) : (
                            Object.entries(salesSummary.sellerMap).map(([seller, services]) => (
                                <div key={seller} className="mb-4">
                                    <h5 className="font-medium text-gray-800 mb-2">{seller}</h5>
                                    <table className="w-full text-sm text-left text-gray-600 mb-2">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2">Servicio</th>
                                                <th className="px-3 py-2">Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(services).map(([serv, cnt]) => (
                                                <tr key={serv} className="border-b bg-white">
                                                    <td className="px-3 py-2">{serv}</td>
                                                    <td className="px-3 py-2 font-semibold">{cnt}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProcedimientosDashboard;
import React, { useMemo } from 'react';
import type { Lead, VentaExtra, Incidencia } from '../../types';
import StatCard from './StatCard.tsx';
import MonthlySalesChart from './MonthlySalesChart';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface ProcedimientosDashboardProps {
    leads: Lead[];
    ventasExtra: VentaExtra[];
    incidencias: Incidencia[];
    dateRange: { from: string; to: string };
}

const ProcedimientosDashboard: React.FC<ProcedimientosDashboardProps> = ({ leads, ventasExtra, incidencias, dateRange }) => {
    const stats = useMemo(() => {
        const totalIncidencias = incidencias.length;

        const patientsWithInflamacion = new Set<number>();
        leads.forEach(lead => {
            if (lead.seguimientos?.some(s => s.inflamacion)) {
                patientsWithInflamacion.add(lead.id);
            }
        });
        
        const totalVentasExtraProcedimientos = ventasExtra
            .filter(v => v.categoria !== 'Productos')
            .reduce((sum, v) => sum + v.montoPagado, 0);

        return {
            totalIncidencias,
            totalConInflamacion: patientsWithInflamacion.size,
            totalVentasExtraProcedimientos,
        };
    }, [leads, ventasExtra, incidencias]);
    
    const serviceStats = useMemo(() => {
        const serviceCount: Record<string, number> = {};
        leads.forEach(lead => {
            lead.tratamientos?.forEach(trat => {
                serviceCount[trat.nombre] = (serviceCount[trat.nombre] || 0) + 1;
            });
        });
        return Object.entries(serviceCount)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5);
    }, [leads]);

    const salesSummary = useMemo(() => {
        // Build a unified list of sales from treatments and ventasExtra
        type SaleEntry = { servicio: string; montoPagado: number; deuda: number; vendedor?: string; fecha?: string };
        const entries: SaleEntry[] = [];

        // Treatments from leads
        leads.forEach(l => {
            (l.tratamientos || []).forEach(t => {
                entries.push({
                    servicio: t.nombre,
                    montoPagado: t.montoPagado || 0,
                    deuda: t.deuda || 0,
                    vendedor: l.vendedor as unknown as string,
                    fecha: l.fechaHoraAgenda || l.fechaLead,
                });
            });
        });

        // ventasExtra provided separately
        ventasExtra.forEach(v => {
            entries.push({ servicio: v.servicio, montoPagado: v.montoPagado || 0, deuda: v.deuda || 0, fecha: v.fechaVenta });
        });

        const totalCount = entries.length;
        const totalVentas = entries.reduce((s, e) => s + (e.montoPagado || 0), 0);
        const totalDeuda = entries.reduce((s, e) => s + (e.deuda || 0), 0);

        const byService: Record<string, { count: number; monto: number }> = {};
        import React, { useMemo } from 'react';
        import type { Lead, VentaExtra, Incidencia } from '../../types';
        import StatCard from './StatCard.tsx';
        import MonthlySalesChart from './MonthlySalesChart';

        const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
            <span className={`material-symbols-outlined ${className}`}>{name}</span>
        );

        interface ProcedimientosDashboardProps {
            leads: Lead[];
            ventasExtra: VentaExtra[];
            incidencias: Incidencia[];
            dateRange: { from: string; to: string };
        }

        const ProcedimientosDashboard: React.FC<ProcedimientosDashboardProps> = ({ leads, ventasExtra, incidencias, dateRange }) => {
            const stats = useMemo(() => {
                const totalIncidencias = incidencias.length;

                const patientsWithInflamacion = new Set<number>();
                leads.forEach(lead => {
                    if (lead.seguimientos?.some(s => s.inflamacion)) {
                        patientsWithInflamacion.add(lead.id);
                    }
                });
        
                const totalVentasExtraProcedimientos = ventasExtra
                    .filter(v => v.categoria !== 'Productos')
                    .reduce((sum, v) => sum + v.montoPagado, 0);

                return {
                    totalIncidencias,
                    totalConInflamacion: patientsWithInflamacion.size,
                    totalVentasExtraProcedimientos,
                };
            }, [leads, ventasExtra, incidencias]);

            const salesSummary = useMemo(() => {
                type SaleEntry = { servicio: string; montoPagado: number; deuda: number; vendedor?: string; fecha?: string };
                const entries: SaleEntry[] = [];

                leads.forEach(l => {
                    (l.tratamientos || []).forEach(t => {
                        entries.push({
                            servicio: t.nombre,
                            montoPagado: t.montoPagado || 0,
                            deuda: t.deuda || 0,
                            vendedor: String(l.vendedor || 'Sin Vendedor'),
                            fecha: l.fechaHoraAgenda || l.fechaLead,
                        });
                    });
                });

                ventasExtra.forEach(v => {
                    entries.push({ servicio: v.servicio, montoPagado: v.montoPagado || 0, deuda: v.deuda || 0, fecha: v.fechaVenta });
                });

                const totalCount = entries.length;
                const totalVentas = entries.reduce((s, e) => s + (e.montoPagado || 0), 0);
                const totalDeuda = entries.reduce((s, e) => s + (e.deuda || 0), 0);

                const byService: Record<string, { count: number; monto: number }> = {};
                entries.forEach(e => {
                    const key = e.servicio || 'Sin Nombre';
                    if (!byService[key]) byService[key] = { count: 0, monto: 0 };
                    byService[key].count += 1;
                    byService[key].monto += e.montoPagado || 0;
                });

                const serviceList = Object.entries(byService)
                    .map(([servicio, data]) => ({ servicio, cantidad: data.count, monto: data.monto, porcentaje: totalCount > 0 ? (data.count / totalCount) * 100 : 0 }))
                    .sort((a, b) => b.cantidad - a.cantidad);

                const sellerMap: Record<string, Record<string, number>> = {};
                entries.forEach(e => {
                    const seller = e.vendedor || 'Sin Vendedor';
                    sellerMap[seller] = sellerMap[seller] || {};
                    sellerMap[seller][e.servicio] = (sellerMap[seller][e.servicio] || 0) + 1;
                });

                return { totalCount, totalVentas, totalDeuda, serviceList, sellerMap };
            }, [leads, ventasExtra]);

            const patientLists = useMemo(() => {
                const patientsWithProcedures = leads.filter(l => l.procedimientos && l.procedimientos.length > 0);

                const masDe10 = patientsWithProcedures.filter(p => p.procedimientos!.length > 10);
                const menosDe3 = patientsWithProcedures.filter(p => p.procedimientos!.length < 3);
                const entre4y9 = patientsWithProcedures.filter(p => p.procedimientos!.length >= 4 && p.procedimientos!.length <= 9);

                const conComplicaciones = leads.map(lead => {
                    const complications = (lead.seguimientos || []).reduce((count, seg) => {
                        return count + (seg.inflamacion ? 1 : 0) + (seg.ampollas ? 1 : 0) + (seg.alergias ? 1 : 0) + (seg.malestarGeneral ? 1 : 0) + (seg.brote ? 1 : 0) + (seg.dolorDeCabeza ? 1 : 0) + (seg.moretones ? 1 : 0);
                    }, 0);
                    return { lead, complications };
                })
                .filter(item => item.complications > 0)
                .sort((a, b) => b.complications - a.complications)
                .slice(0, 5);

                return { masDe10, menosDe3, entre4y9, conComplicaciones };
            }, [leads]);

            const ListCard: React.FC<{title: string, items: {name: string, value: string}[], bgColor: string}> = ({title, items, bgColor}) => (
                <div className={`${bgColor} p-4 rounded-lg shadow h-full`}>
                    <h4 className="font-semibold text-gray-700 text-base mb-3">{title}</h4>
                    {items.length > 0 ? (
                        <ul className="space-y-2">
                            {items.map((item, index) => (
                                 <li key={index} className="flex justify-between items-center text-sm bg-white/50 p-2 rounded-md">
                                    <span className="text-gray-600">{item.name}</span>
                                    <span className="font-semibold text-gray-800">{item.value}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-gray-500 text-center pt-4">No hay datos.</p>}
                </div>
            );

            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Incidencias"
                            value={String(stats.totalIncidencias)}
                            icon={<GoogleIcon name="report" className="text-red-600" />}
                            iconBgClass="bg-red-100"
                        />
                        <StatCard
                            title="Total Pacientes con Inflamación"
                            value={String(stats.totalConInflamacion)}
                            icon={<GoogleIcon name="local_fire_department" className="text-orange-600" />}
                            iconBgClass="bg-orange-100"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ListCard 
                           title="Pacientes con Más Complicaciones" 
                           items={patientLists.conComplicaciones.map(p => ({name: `${p.lead.nombres} ${p.lead.apellidos}`, value: `${p.complications} síntoma(s)`}))} 
                           bgColor="bg-red-50"
                        />
                        <div>
                             <ListCard 
                                title="Pacientes por N° de Sesiones" 
                                items={[
                                    { name: 'Más de 10 sesiones', value: `${patientLists.masDe10.length} paciente(s)`},
                                    { name: 'Entre 4 y 9 sesiones', value: `${patientLists.entre4y9.length} paciente(s)`},
                                    { name: 'Menos de 3 sesiones', value: `${patientLists.menosDe3.length} paciente(s)`},
                                ]}
                                bgColor="bg-yellow-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h4 className="font-semibold text-gray-700 text-base mb-3">Ventas por Servicio (Top)</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2">Servicio</th>
                                            <th className="px-3 py-2">Cantidad</th>
                                            <th className="px-3 py-2">%</th>
                                            <th className="px-3 py-2">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesSummary.serviceList.slice(0,10).map((s, i) => (
                                            <tr key={i} className="border-b bg-white">
                                                <td className="px-3 py-2">{s.servicio}</td>
                                                <td className="px-3 py-2 font-semibold">{s.cantidad}</td>
                                                <td className="px-3 py-2">{s.porcentaje.toFixed(1)}%</td>
                                                <td className="px-3 py-2">S/ {s.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <MonthlySalesChart leads={leads} ventasExtra={ventasExtra} />
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <h4 className="font-semibold text-gray-700 text-base mb-3">Atenciones por Servicio por Vendedor</h4>
                            <div className="overflow-x-auto">
                                {Object.keys(salesSummary.sellerMap).length === 0 ? (
                                    <p className="text-sm text-gray-500">No hay datos disponibles.</p>
                                ) : (
                                    Object.entries(salesSummary.sellerMap).map(([seller, services]) => (
                                        <div key={seller} className="mb-4">
                                            <h5 className="font-medium text-gray-800 mb-2">{seller}</h5>
                                            <table className="w-full text-sm text-left text-gray-600 mb-2">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                                    <tr>
                                                        <th className="px-3 py-2">Servicio</th>
                                                        <th className="px-3 py-2">Cantidad</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(services).map(([serv, cnt]) => (
                                                        <tr key={serv} className="border-b bg-white">
                                                            <td className="px-3 py-2">{serv}</td>
                                                            <td className="px-3 py-2 font-semibold">{cnt}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        export default ProcedimientosDashboard;