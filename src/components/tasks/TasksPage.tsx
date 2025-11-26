import React, { useState } from 'react';

interface TaskCard {
  id: number;
  title: string;
  description?: string;
  assignee?: string;
}

const initialColumns = [
  { id: 'todo', title: 'Task Ready' },
  { id: 'inprogress', title: 'On Progress' },
  { id: 'review', title: 'Needs Review' },
  { id: 'done', title: 'Done' },
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
  const [newAssignee, setNewAssignee] = useState('');

  const addCardTo = (colId: string) => {
    if (!newTitle.trim()) return;
    const nextId = Date.now();
    const newCard: TaskCard = { id: nextId, title: newTitle.trim(), assignee: newAssignee || undefined };
    setCards(prev => ({ ...prev, [colId]: [newCard, ...(prev[colId] || [])] }));
    setNewTitle('');
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
          <button className="px-4 py-2 bg-white border rounded-md text-sm shadow-sm hover:bg-gray-50">Filter</button>
          <button className="px-4 py-2 bg-[#aa632d] text-white rounded-md shadow-sm hover:bg-[#8e5225]">+ New Board</button>
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
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 ml-2">{card.assignee}</div>
                    </div>
                  </div>
                ))}

                {col.id === 'todo' && (
                  <div>
                    {!creating ? (
                      <button onClick={() => setCreating(true)} className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">+ Add Card</button>
                    ) : (
                      <div className="p-3 bg-white border rounded-md">
                        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What is the task?" className="w-full p-2 border rounded mb-2" />
                        <input value={newAssignee} onChange={e => setNewAssignee(e.target.value)} placeholder="Assignee (optional)" className="w-full p-2 border rounded mb-2" />
                        <div className="flex gap-2">
                          <button onClick={() => addCardTo('todo')} className="px-3 py-1 bg-[#aa632d] text-white rounded">Done</button>
                          <button onClick={() => { setCreating(false); setNewTitle(''); setNewAssignee(''); }} className="px-3 py-1 border rounded">Cancel</button>
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
          <h3 className="text-sm font-semibold mb-3">Task Progress</h3>
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
