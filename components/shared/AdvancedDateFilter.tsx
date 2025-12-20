import React, { useState } from 'react';

interface AdvancedDateFilterProps {
  onApply: (filters: {
    creadoEl?: { from: string; to: string };
    actualizadoEl?: { from: string; to: string };
    agendadoEl?: { from: string; to: string };
  }) => void;
}

const AdvancedDateFilter: React.FC<AdvancedDateFilterProps> = ({ onApply }) => {
  const [creado, setCreado] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [actualizado, setActualizado] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [agendado, setAgendado] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const handleApply = () => {
    onApply({
      creadoEl: creado.from || creado.to ? creado : undefined,
      actualizadoEl: actualizado.from || actualizado.to ? actualizado : undefined,
      agendadoEl: agendado.from || agendado.to ? agendado : undefined,
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div>
        <label className="block text-xs font-semibold mb-1">Creado el</label>
        <div className="flex gap-2">
          <input type="date" value={creado.from} onChange={e => setCreado(v => ({ ...v, from: e.target.value }))} className="border rounded px-2 py-1" />
          <span className="text-gray-500">a</span>
          <input type="date" value={creado.to} onChange={e => setCreado(v => ({ ...v, to: e.target.value }))} className="border rounded px-2 py-1" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Actualizado el</label>
        <div className="flex gap-2">
          <input type="date" value={actualizado.from} onChange={e => setActualizado(v => ({ ...v, from: e.target.value }))} className="border rounded px-2 py-1" />
          <span className="text-gray-500">a</span>
          <input type="date" value={actualizado.to} onChange={e => setActualizado(v => ({ ...v, to: e.target.value }))} className="border rounded px-2 py-1" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Agendado el</label>
        <div className="flex gap-2">
          <input type="date" value={agendado.from} onChange={e => setAgendado(v => ({ ...v, from: e.target.value }))} className="border rounded px-2 py-1" />
          <span className="text-gray-500">a</span>
          <input type="date" value={agendado.to} onChange={e => setAgendado(v => ({ ...v, to: e.target.value }))} className="border rounded px-2 py-1" />
        </div>
      </div>
      <button onClick={handleApply} className="bg-[#aa632d] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#8e5225]">Aplicar</button>
    </div>
  );
};

export default AdvancedDateFilter;
