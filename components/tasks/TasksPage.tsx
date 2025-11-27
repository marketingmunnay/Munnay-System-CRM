import React, { useState } from 'react';

interface Tag {
  id: number;
  title: string;
  color: string;
}

interface TaskCard {
  id: number;
  title: string;
  description?: string;
  assignee?: string;
  priority?: 'Alta' | 'Media' | 'Baja';
  dueDate?: string | null;
  tags?: Tag[];
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
    { id: 1, title: 'Create New Card', description: 'What is the task?', assignee: 'Samantha', tags: [] },
    { id: 2, title: 'Icon in section our services', assignee: 'Samantha', tags: [] },
  ],
  inprogress: [
    { id: 3, title: 'Membuat konsep ilustrasi', description: 'Concept idea for about us', assignee: 'Andres' },
  ],
  review: [
    { id: 4, title: 'Review copywriting', assignee: 'Lucia' },
  ],
  done: [
    { id: 5, title: 'Illustration concept', assignee: 'Mario' },
  ],
};

const Avatar: React.FC<{ name?: string }> = ({ name }) => {
  const initials = name ? name.split(' ').map(n => n[0]).slice(0,2).join('') : 'NA';
  return (
    <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-xs font-semibold text-gray-700 shadow-sm">
      {initials}
    </div>
  );
};

export default function TasksPage() {
  const [columns] = useState(initialColumns);
  const [cards, setCards] = useState<Record<string, TaskCard[]>>(demoCards);
  const [tags, setTags] = useState<Tag[]>([
    { id: 1, title: 'Prioridad Baja', color: '#f6c23e' },
    { id: 2, title: 'Prioridad Media', color: '#f59e0b' },
    { id: 3, title: 'Urgente', color: '#ef4444' },
  ]);
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
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagTitle, setNewTagTitle] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4caf50');

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
      tags: addTags ? tags.filter(t => selectedTagIds.includes(t.id)) : undefined,
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

  const colorPalette = [
    '#a7f3d0','#fef3c7','#fce7f3','#fde68a','#fbcfe8','#c7f9cc','#fca5a5','#fda4af',
    '#34d399','#16a34a','#f97316','#ef4444','#7c3aed','#60a5fa','#38bdf8','#06b6d4',
    '#f59e0b','#ef9a9a','#c084fc','#34d399','#93c5fd','#b91c1c','#374151','#111827'
  ];

  const createNewTag = () => {
    if (!newTagTitle.trim()) return;
    const id = Date.now();
    const t: Tag = { id, title: newTagTitle.trim(), color: newTagColor };
    setTags(prev => [t, ...prev]);
    setNewTagTitle('');
    setNewTagColor('#4caf50');
    setShowTagModal(false);
  };

  const toggleSelectTag = (id: number) => {
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 via-white to-yellow-50 min-h-[70vh]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tareas</h1>
          <p className="text-sm text-gray-500">Tablero visual estilo kanban — organiza tu equipo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar name="Ana Maria" />
            <Avatar name="Lucia Lopez" />
            <Avatar name="Samantha" />
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">+3</div>
          </div>
          <button className="px-4 py-2 bg-white border rounded-md text-sm shadow-sm hover:bg-gray-50">Filter</button>
          <button className="px-4 py-2 bg-[#aa632d] text-white rounded-md shadow-md hover:bg-[#8e5225]">+ New Board</button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))` }}>
          {columns.map(col => (
            <div key={col.id} className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold">{col.title}</div>
                  <div className="text-xs text-gray-400">{(cards[col.id] || []).length} cards</div>
                </div>
                <div className="text-xs text-gray-400">...</div>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-auto">
                {(cards[col.id] || []).map(card => (
                  <div key={card.id} className="p-3 bg-white/90 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <div className="truncate">{card.members && card.members.length ? card.members.join(', ') : (card.assignee || '')}</div>
                        <div>{card.priority && <span className={`px-2 py-0.5 rounded text-white ${card.priority === 'Alta' ? 'bg-red-500' : card.priority === 'Media' ? 'bg-yellow-500' : 'bg-green-500'}`}>{card.priority}</span>}</div>
                      </div>

                      <div className="font-semibold text-sm truncate">{card.title}</div>
                      {card.description && <div className="text-xs text-gray-500 mt-1">{card.description}</div>}
                      {card.dueDate && <div className="text-xs text-gray-500 mt-2">📅 {card.dueDate}</div>}

                      {card.tags && card.tags.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {card.tags.map(t => (
                            <span key={t.id} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: t.color, color: '#fff' }}>{t.title}</span>
                          ))}
                        </div>
                      )}
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
                          <div className="flex flex-col gap-2 text-sm">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={addTags} onChange={e => setAddTags(e.target.checked)} /> Etiquetas</label>
                            {addTags && (
                              <div className="flex flex-wrap gap-2">
                                {tags.map(t => (
                                  <button key={t.id} onClick={() => toggleSelectTag(t.id)} className={`px-2 py-1 rounded text-xs font-medium border ${selectedTagIds.includes(t.id) ? 'ring-2 ring-offset-1' : ''}`} style={{ background: t.color, color: '#fff' }}>{t.title}</button>
                                ))}
                                <button onClick={() => setShowTagModal(true)} className="px-2 py-1 text-xs border rounded">+ Crear etiqueta</button>
                              </div>
                            )}
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addChecklist} onChange={e => setAddChecklist(e.target.checked)} /> Checklist</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addDate} onChange={e => setAddDate(e.target.checked)} /> Fecha</label>
                            {addDate && <input type="date" value={newDueDate} onChange={e=>setNewDueDate(e.target.value)} className="w-full p-2 border rounded mt-1" />}
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addMembers} onChange={e => setAddMembers(e.target.checked)} /> Miembros</label>
                          </div>
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
        {showTagModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-96 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Crear etiqueta</h3>
                <button onClick={() => setShowTagModal(false)} className="text-gray-500">X</button>
              </div>
              <input placeholder="Título" value={newTagTitle} onChange={e=>setNewTagTitle(e.target.value)} className="w-full p-2 border rounded mb-3" />
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-2">Seleccionar un color</div>
                <div className="grid grid-cols-6 gap-2">
                  {colorPalette.map(c => (
                    <button key={c} onClick={() => setNewTagColor(c)} className={`w-8 h-8 rounded`} style={{ background: c, border: newTagColor === c ? '3px solid #0ea5a4' : '1px solid rgba(0,0,0,0.08)' }} />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowTagModal(false)} className="px-3 py-1 border rounded">Cancelar</button>
                <button onClick={createNewTag} className="px-3 py-1 bg-[#0ea5a4] text-white rounded">Crear</button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
