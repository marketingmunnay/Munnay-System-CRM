import React, { useState } from 'react';

interface TaskCard {
  id: number;
  title: string;
  description?: string;
  assignee?: string;
  priority?: 'Alta' | 'Media' | 'Baja';
  dueDate?: string | null;
  tags?: string[];
  members?: string[];
}

const initialColumns = [
  { id: 'todo', title: 'Por Hacer' },
  { id: 'inprogress', title: 'En Progreso' },
  { id: 'review', title: 'En Revisión' },
  { id: 'done', title: 'Hecho' },
];

const demoCards: Record<string, TaskCard[]> = {
  todo: [
    { id: 1, title: 'Crear nueva tarjeta', description: 'Qué tarea se debe realizar', assignee: 'Samantha' },
    { id: 2, title: 'Icon en sección nuestros servicios', assignee: 'Samantha' },
  ],
  inprogress: [
    { id: 3, title: 'Membuat konsep ilustrasi', description: 'Concepto de ilustración para About us', assignee: 'Andres' },
  ],
  review: [
    { id: 4, title: 'Revisar copywriting', assignee: 'Lucia' },
  ],
  done: [
    { id: 5, title: 'Illustration concept', assignee: 'Mario' },
  ],
};

export default function TasksPage() {
  const [columns] = useState(initialColumns);
  const [cards, setCards] = useState<Record<string, TaskCard[]>>(demoCards);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [addTags, setAddTags] = useState(false);
  const [addChecklist, setAddChecklist] = useState(false);
  const [addDate, setAddDate] = useState(false);
  const [addMembers, setAddMembers] = useState(false);
  const [newPriority, setNewPriority] = useState<'Alta'|'Media'|'Baja'>('Media');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newAssignee, setNewAssignee] = useState('');

  const addCardTo = (colId: string) => {
    if (!newTitle.trim()) return;
    const nextId = Date.now();
    const newCard: TaskCard = {
      id: nextId,
      title: newTitle.trim(),
      description: newDescription || undefined,
      assignee: newAssignee || undefined,
      priority: newPriority,
      dueDate: addDate && newDueDate ? newDueDate : null,
      tags: addTags ? ['Etiqueta'] : undefined,
      members: addMembers && newAssignee ? [newAssignee] : undefined,
    };
    setCards(prev => ({ ...prev, [colId]: [newCard, ...(prev[colId] || [])] }));
    setNewTitle('');
    setNewDescription('');
    setAddTags(false);
    setAddChecklist(false);
    setAddDate(false);
    setAddMembers(false);
    setNewPriority('Media');
    setNewDueDate('');
    setNewAssignee('');
    setCreating(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tareas</h1>
          <p className="text-sm text-gray-500">Gestión visual de tareas — tablero Kanban ligero</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-white px-2 py-1 rounded-full shadow-sm">Project: Homepage Design</span>
          <span className="text-xs bg-white px-2 py-1 rounded-full shadow-sm">Sprint 12</span>
          <span className="text-xs text-gray-400">• 8 members</span>
          <button className="px-4 py-2 bg-white border rounded-md text-sm shadow-sm hover:bg-gray-50">Filter</button>
          <button className="px-4 py-2 bg-[#aa632d] text-white rounded-md shadow-md hover:bg-[#8e5225]">+ New Board</button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))` }}>
          {columns.map(col => (
            <div key={col.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold">{col.title}</div>
                  <div className="text-xs text-gray-400">{(cards[col.id] || []).length} cards</div>
                </div>
                <div className="text-xs text-gray-400">...</div>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-auto">
                {(cards[col.id] || []).map(card => (
                  <div key={card.id} className="p-3 bg-gradient-to-br from-white to-gray-50 rounded-md border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                          {card.assignee ? card.assignee.split(' ').map(n=>n[0]).slice(0,2).join('') : 'NA'}
                        </div>
                        <div>
                              <div className="font-semibold text-sm truncate">{card.title}</div>
                              {card.description && <div className="text-xs text-gray-500 mt-1">{card.description}</div>}
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                {card.priority && <span className={`px-2 py-0.5 rounded text-white ${card.priority === 'Alta' ? 'bg-red-500' : card.priority === 'Media' ? 'bg-yellow-500' : 'bg-green-500'}`}>{card.priority}</span>}
                                {card.dueDate && <span className="text-gray-400">📅 {card.dueDate}</span>}
                                {card.tags && <span className="text-gray-400">🏷️ {card.tags.length}</span>}
                                {card.members && <span className="text-gray-400">👥 {card.members.length}</span>}
                              </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 ml-2">{card.assignee}</div>
                    </div>
                  </div>
                ))}

                {col.id === 'todo' && (
                  <div>
                      {!creating ? (
                      <button onClick={() => setCreating(true)} className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">+ Añadir tarjeta</button>
                    ) : (
                      <div className="p-3 bg-white border rounded-md">
                        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título" className="w-full p-2 border rounded mb-2" />
                        <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Descripción" className="w-full p-2 border rounded mb-2" />
                        <input value={newAssignee} onChange={e => setNewAssignee(e.target.value)} placeholder="Miembro (opcional)" className="w-full p-2 border rounded mb-2" />

                        <div className="mb-2">
                          <div className="text-sm font-semibold mb-1">Añadir a la tarjeta</div>
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addTags} onChange={e => setAddTags(e.target.checked)} /> Etiquetas</label>
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addChecklist} onChange={e => setAddChecklist(e.target.checked)} /> Checklist</label>
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addDate} onChange={e => setAddDate(e.target.checked)} /> Fecha</label>
                          {addDate && <input type="date" value={newDueDate} onChange={e=>setNewDueDate(e.target.value)} className="w-full p-2 border rounded mt-1" />}
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addMembers} onChange={e => setAddMembers(e.target.checked)} /> Miembros</label>
                        </div>

                        <div className="mb-3">
                          <div className="text-sm font-semibold mb-1">Prioridad</div>
                          <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)} className="w-full p-2 border rounded">
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                            <option value="Baja">Baja</option>
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => addCardTo('todo')} className="px-3 py-1 bg-[#aa632d] text-white rounded">Crear</button>
                          <button onClick={() => { setCreating(false); setNewTitle(''); setNewAssignee(''); setNewDescription(''); setAddTags(false); setAddChecklist(false); setAddDate(false); setAddMembers(false); setNewPriority('Media'); setNewDueDate(''); }} className="px-3 py-1 border rounded">Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        <aside className="w-80 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Progreso de tareas</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Copywriting</span><span>3/8</span></div>
              <div className="w-full bg-gray-100 rounded h-2"><div className="h-2 bg-pink-400 rounded" style={{ width: '40%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Illustrations</span><span>6/10</span></div>
              <div className="w-full bg-gray-100 rounded h-2"><div className="h-2 bg-green-400 rounded" style={{ width: '60%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>UI Design</span><span>2/7</span></div>
              <div className="w-full bg-gray-100 rounded h-2"><div className="h-2 bg-indigo-400 rounded" style={{ width: '28%' }}></div></div>
            </div>
          </div>

          <h4 className="text-sm font-semibold mt-6 mb-2">Recent Activity</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Andrea uploaded 3 documents</li>
            <li>Karen left some comments</li>
            <li>Karen changed project description</li>
          </ul>
        </aside>
      </div>

    </div>
  );
}
