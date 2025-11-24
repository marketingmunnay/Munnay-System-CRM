import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Resource {
  id: number;
  name: string;
  avatarUrl?: string;
  position?: string;
}

interface Appointment {
  id: number;
  startAt: string;
  endAt: string;
  resourceId: number;
  title?: string;
}

export default function CalendarPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    axios.get('/api/calendar/resources').then(r => setResources(r.data)).catch(() => {});
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    const from = new Date(date);
    from.setHours(0,0,0,0);
    const to = new Date(date);
    to.setHours(23,59,59,999);
    axios.get('/api/calendar/appointments', { params: { from: from.toISOString(), to: to.toISOString() } })
      .then(r => setAppointments(r.data))
      .catch(() => {});
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Calendario</h2>
      <div className="flex gap-4">
        <div className="w-56">
          <input type="date" value={date.toISOString().slice(0,10)} onChange={e => { setDate(new Date(e.target.value)); fetchAppointments(); }} className="w-full p-2 border" />
        </div>
        <div className="flex-1">
          <div className="overflow-x-auto">
            <div style={{ minWidth: Math.max(800, resources.length * 220) }}>
              <div className="flex">
                {resources.map(r => (
                  <div key={r.id} style={{ width: 220 }} className="p-2 border-r">
                    <div className="flex items-center gap-2">
                      <img src={r.avatarUrl || '/avatar.png'} alt="" className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-sm text-gray-500">{r.position}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1" style={{ gridTemplateColumns: `repeat(${resources.length}, 220px)` }}>
                {/* Hours rows */}
                <div className="mt-2">
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <div key={hour} className="h-16 border-b text-xs text-gray-500">{hour}:00</div>
                  ))}
                </div>
                {/* Appointments rendering per column */}
                <div style={{ position: 'relative' }}>
                  {appointments.map(a => {
                    const start = new Date(a.startAt);
                    const top = (start.getHours() * 60 + start.getMinutes()) * (16/60); // 16px per hour
                    const duration = (new Date(a.endAt).getTime() - start.getTime()) / (1000*60);
                    const height = duration * (16/60);
                    const colIndex = resources.findIndex(r => r.id === a.resourceId);
                    if (colIndex === -1) return null;
                    return (
                      <div key={a.id} style={{ position: 'absolute', left: colIndex * 220 + 8, top, width: 204, height }} className="bg-blue-200 border rounded p-1 text-sm">
                        <div className="font-semibold">{a.title}</div>
                        <div className="text-xs">{new Date(a.startAt).toLocaleTimeString()} - {new Date(a.endAt).toLocaleTimeString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
