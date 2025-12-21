import React, { useState } from 'react';

interface AdvancedDateFilterProps {
  onApply: (filters: {
    creadoEl?: { from: string; to: string };
    actualizadoEl?: { from: string; to: string };
    agendadoEl?: { from: string; to: string };
  }) => void;
}


const AdvancedDateFilter: React.FC<AdvancedDateFilterProps> = ({ onApply }) => {
  const [open, setOpen] = useState(false);
  const [creado, setCreado] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [actualizado, setActualizado] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [agendado, setAgendado] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const handleApply = () => {
    onApply({
      creadoEl: creado.from || creado.to ? creado : undefined,
      actualizadoEl: actualizado.from || actualizado.to ? actualizado : undefined,
      agendadoEl: agendado.from || agendado.to ? agendado : undefined,
    });
    setOpen(false);
  };

  return (
    <>
      {/* Botón de Filtros avanzados */}
      <button
        className="flex items-center gap-2 border border-[#e0e0e0] rounded-full px-4 py-2 bg-white hover:bg-gray-50 shadow-sm font-medium text-[#2d3a4a]"
        onClick={() => setOpen(true)}
      >
        <span className="material-symbols-outlined text-lg">filter_alt</span>
        Filtros avanzados
      </button>

      {/* Panel lateral (drawer) */}
      {open && (
        <div className="fixed inset-0 z-40 flex">
          {/* Fondo oscuro */}
          <div className="fixed inset-0 bg-black bg-opacity-20 transition-opacity" onClick={() => setOpen(false)} />
          {/* Drawer */}
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-xl flex flex-col animate-slideInRight">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#3b82f6]">filter_list</span>
                <div>
                  <div className="font-semibold text-base text-[#2d3a4a]">Filtros</div>
                  <div className="text-xs text-gray-500">Aplicar filtros a clientes potenciales</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Opciones de filtro */}
              <div className="space-y-3">
                <div className="font-semibold text-[#2d3a4a] text-sm">Creado el</div>
                <div className="flex gap-2 mb-4">
                  <input type="date" value={creado.from} onChange={e => setCreado(v => ({ ...v, from: e.target.value }))} className="border rounded px-2 py-1 w-full" />
                  <span className="text-gray-500 self-center">a</span>
                  <input type="date" value={creado.to} onChange={e => setCreado(v => ({ ...v, to: e.target.value }))} className="border rounded px-2 py-1 w-full" />
                </div>
                <div className="font-semibold text-[#2d3a4a] text-sm">Actualizado el</div>
                <div className="flex gap-2 mb-4">
                  <input type="date" value={actualizado.from} onChange={e => setActualizado(v => ({ ...v, from: e.target.value }))} className="border rounded px-2 py-1 w-full" />
                  <span className="text-gray-500 self-center">a</span>
                  <input type="date" value={actualizado.to} onChange={e => setActualizado(v => ({ ...v, to: e.target.value }))} className="border rounded px-2 py-1 w-full" />
                </div>
                <div className="font-semibold text-[#2d3a4a] text-sm">Agendado el</div>
                <div className="flex gap-2 mb-4">
                  <input type="date" value={agendado.from} onChange={e => setAgendado(v => ({ ...v, from: e.target.value }))} className="border rounded px-2 py-1 w-full" />
                  <span className="text-gray-500 self-center">a</span>
                  <input type="date" value={agendado.to} onChange={e => setAgendado(v => ({ ...v, to: e.target.value }))} className="border rounded px-2 py-1 w-full" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={handleApply}
                className="bg-[#aa632d] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#8e5225]"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvancedDateFilter;
