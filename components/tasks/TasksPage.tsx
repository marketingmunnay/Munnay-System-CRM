import React, { useMemo, useState } from 'react';

type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';
type TaskPriority = 'alta' | 'media' | 'baja';

interface TaskItem {
	id: string;
	title: string;
	owner: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate: string;
	tags: string[];
	progress: number;
	area: 'Producto' | 'Crecimiento' | 'Experiencia';
}

const statusMeta: Record<TaskStatus, { label: string; dot: string; palette: string; accent: string; bar: string }> = {
	backlog: {
		label: 'Descubrir',
		dot: 'bg-slate-300',
		palette: 'bg-white/70 border-slate-100',
		accent: 'text-slate-500',
		bar: 'bg-slate-400'
	},
	'in-progress': {
		label: 'En curso',
		dot: 'bg-[#ffb347]',
		palette: 'bg-white border-[#ffe7cc]',
		accent: 'text-[#b06700]',
		bar: 'bg-gradient-to-r from-[#ffb347] to-[#ffcc33]'
	},
	review: {
		label: 'Revisión',
		dot: 'bg-[#6d5dfc]',
		palette: 'bg-white border-[#ded7ff]',
		accent: 'text-[#4c31d8]',
		bar: 'bg-gradient-to-r from-[#8b6dfc] to-[#c49bff]'
	},
	done: {
		label: 'Listo',
		dot: 'bg-emerald-400',
		palette: 'bg-white border-emerald-100',
		accent: 'text-emerald-600',
		bar: 'bg-gradient-to-r from-emerald-400 to-emerald-500'
	}
};

const priorityMeta: Record<TaskPriority, { label: string; classes: string }> = {
	alta: { label: 'Alta', classes: 'bg-red-50 text-red-600 border border-red-100' },
	media: { label: 'Media', classes: 'bg-amber-50 text-amber-600 border border-amber-100' },
	baja: { label: 'Baja', classes: 'bg-emerald-50 text-emerald-600 border border-emerald-100' }
};

const heroTexture = {
	backgroundImage:
		'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12), transparent 35%), linear-gradient(120deg, rgba(255,255,255,0.05), rgba(0,0,0,0))'
};

const focusTags = ['Sprint 12 · Automatización', 'Customer Health', 'Roadmap Q4'];

const sampleTasks: TaskItem[] = [
	{
		id: 'TKS-241',
		title: 'Activar checklist inteligente para egresos',
		owner: 'Vanesa',
		status: 'in-progress',
		priority: 'alta',
		dueDate: '2025-12-06',
		tags: ['Operaciones', 'Compliance'],
		progress: 62,
		area: 'Producto'
	},
	{
		id: 'TKS-242',
		title: 'Rediseñar panel diario de recepciones',
		owner: 'Liz',
		status: 'review',
		priority: 'media',
		dueDate: '2025-12-08',
		tags: ['UI Kit', 'Testing'],
		progress: 88,
		area: 'Experiencia'
	},
	{
		id: 'TKS-239',
		title: 'Modelar automatización de leads fríos',
		owner: 'Elvira',
		status: 'backlog',
		priority: 'alta',
		dueDate: '2025-12-15',
		tags: ['Growth', 'IA'],
		progress: 12,
		area: 'Crecimiento'
	},
	{
		id: 'TKS-237',
		title: 'Playbook de tareas para membresías',
		owner: 'Janela',
		status: 'in-progress',
		priority: 'media',
		dueDate: '2025-12-11',
		tags: ['Operaciones'],
		progress: 45,
		area: 'Experiencia'
	},
	{
		id: 'TKS-236',
		title: 'Monitor de capacidad de cabinas',
		owner: 'Luz',
		status: 'done',
		priority: 'media',
		dueDate: '2025-12-02',
		tags: ['Infraestructura'],
		progress: 100,
		area: 'Producto'
	},
	{
		id: 'TKS-235',
		title: 'Mapa de dependencias de inventario',
		owner: 'Keila',
		status: 'review',
		priority: 'alta',
		dueDate: '2025-12-05',
		tags: ['Data', 'Inventario'],
		progress: 76,
		area: 'Producto'
	},
	{
		id: 'TKS-233',
		title: 'Bandeja proactiva para incidencias',
		owner: 'Dra. Sofía',
		status: 'backlog',
		priority: 'baja',
		dueDate: '2025-12-18',
		tags: ['Calidad', 'UX Research'],
		progress: 5,
		area: 'Experiencia'
	},
	{
		id: 'TKS-230',
		title: 'Secuencia educativa post-procedimiento',
		owner: 'Vanesa',
		status: 'done',
		priority: 'media',
		dueDate: '2025-12-01',
		tags: ['Content', 'Paciente'],
		progress: 100,
		area: 'Crecimiento'
	}
];

const baseLoad = [
	{ name: 'Vanesa', role: 'Growth Lead', load: 0.82, trend: '+6%', focus: 'Secuencias automáticas' },
	{ name: 'Liz', role: 'Product Designer', load: 0.68, trend: '+2%', focus: 'Panel diario' },
	{ name: 'Keila', role: 'Ops Strategist', load: 0.55, trend: '-4%', focus: 'Inventario' },
	{ name: 'Luz', role: 'Data', load: 0.73, trend: '+1%', focus: 'Capacidad cabinas' }
];

const getDaysUntil = (isoDate: string) => {
	const today = new Date();
	const target = new Date(isoDate);
	return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatShortDate = (isoDate: string) => {
	return new Date(isoDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

const TasksPage: React.FC = () => {
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
	const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
	const [insightView, setInsightView] = useState<'impacto' | 'capacidad'>('impacto');

	const tasks = useMemo(() => sampleTasks, []);

	const filteredTasks = useMemo(() => {
		const term = search.trim().toLowerCase();
		return tasks.filter(task => {
			const matchesTerm = term.length === 0 ||
				`${task.title} ${task.owner} ${task.tags.join(' ')}`.toLowerCase().includes(term);
			const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
			const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
			return matchesTerm && matchesStatus && matchesPriority;
		});
	}, [tasks, search, statusFilter, priorityFilter]);

	const grouped = useMemo(() => {
		return (Object.keys(statusMeta) as TaskStatus[]).reduce((acc, status) => {
			acc[status] = filteredTasks.filter(task => task.status === status);
			return acc;
		}, {} as Record<TaskStatus, TaskItem[]>);
	}, [filteredTasks]);

	const metrics = useMemo(() => {
		const dueSoon = tasks.filter(task => {
			const delta = getDaysUntil(task.dueDate);
			return delta >= 0 && delta <= 5 && task.status !== 'done';
		}).length;
		const active = tasks.filter(task => task.status === 'in-progress').length;
		const completed = tasks.filter(task => task.status === 'done').length;
		const focus = tasks.filter(task => task.priority === 'alta' && task.status !== 'done').length;
		return { dueSoon, active, completed, focus };
	}, [tasks]);

	const upcoming = useMemo(() => {
		return [...tasks]
			.filter(task => task.status !== 'done')
			.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
			.slice(0, 5);
	}, [tasks]);

	return (
		<div className="space-y-6">
			<section
				className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#18113b] via-[#24194e] to-[#3a1762] text-white shadow-[0px_30px_60px_rgba(19,8,53,0.35)]"
				style={heroTexture}
			>
				{/* Soft glow background keeps hero vivid without heavy assets */}
				<div className="relative flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">
					<div className="space-y-4 max-w-2xl">
						<div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/80">
							<span className="material-symbols-outlined text-base">pace</span>
							Sprint táctico
						</div>
						<div>
							<h1 className="text-3xl font-semibold leading-tight md:text-4xl">Tablero de Tareas Orquestadas</h1>
							<p className="mt-3 text-base text-white/80 md:text-lg">
								Visualiza prioridades, velocidad del equipo y bloqueos antes de que impacten al paciente.
								Las señales se actualizan con los últimos movimientos operativos.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							{focusTags.map(tag => (
								<span key={tag} className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm text-white/80">
									{tag}
								</span>
							))}
						</div>
					</div>
					<div className="grid w-full max-w-md grid-cols-2 gap-4 text-center text-slate-900">
						<div className="rounded-2xl bg-white/95 p-5 shadow-xl">
							<p className="text-xs uppercase tracking-widest text-slate-400">Prioridades críticas</p>
							<p className="mt-2 text-4xl font-semibold text-slate-900">{metrics.focus}</p>
							<p className="text-sm text-slate-500">tareas alta prioridad abiertas</p>
						</div>
						<div className="rounded-2xl bg-white/90 p-5 shadow-xl">
							<p className="text-xs uppercase tracking-widest text-slate-400">Velocidad semanal</p>
							<p className="mt-2 text-4xl font-semibold text-slate-900">{metrics.completed}</p>
							<p className="text-sm text-slate-500">entregas listas esta semana</p>
						</div>
					</div>
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
				<section className="space-y-4">
					<div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm backdrop-blur">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
							<div className="relative flex-1">
								<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">search</span>
								<input
									className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-700 shadow-inner focus:border-[#aa632d] focus:outline-none"
									placeholder="Buscar por responsable, etiqueta o título"
									value={search}
									onChange={e => setSearch(e.target.value)}
								/>
							</div>
							<div className="flex items-center gap-2 self-start rounded-2xl bg-slate-100/60 p-1">
								{(['impacto', 'capacidad'] as const).map(view => (
									<button
										key={view}
										onClick={() => setInsightView(view)}
										className={`rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
											insightView === view ? 'bg-white shadow text-slate-900' : 'text-slate-500'
										}`}
									>
										{view}
									</button>
								))}
							</div>
						</div>
						<div className="mt-5 flex flex-wrap gap-2">
							{[{ label: 'Todos', value: 'all' }, ...Object.entries(statusMeta).map(([value, meta]) => ({ label: meta.label, value }))].map(({ label, value }) => (
								<button
									key={value}
									onClick={() => setStatusFilter(value as TaskStatus | 'all')}
									className={`rounded-full px-4 py-1.5 text-sm ${
										statusFilter === value
											? 'bg-[#aa632d] text-white shadow'
											: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
									}`}
								>
									{label}
								</button>
							))}
						</div>
						<div className="mt-3 flex flex-wrap gap-2">
							{[{ label: 'Cualquier prioridad', value: 'all' }, ...Object.entries(priorityMeta).map(([value, meta]) => ({ label: meta.label, value }))].map(filter => (
								<button
									key={filter.value}
									onClick={() => setPriorityFilter(filter.value as TaskPriority | 'all')}
									className={`rounded-full border px-3 py-1 text-sm ${
										priorityFilter === filter.value
											? 'border-[#aa632d] bg-[#fef3eb] text-[#aa632d]'
											: 'border-slate-200 text-slate-500 hover:text-slate-700'
									}`}
								>
									{filter.label}
								</button>
							))}
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{(Object.keys(statusMeta) as TaskStatus[]).map(status => (
							<div key={status} className={`rounded-3xl border p-4 ${statusMeta[status].palette}`}>
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{statusMeta[status].label}</p>
										<p className="text-2xl font-semibold text-slate-900">{grouped[status]?.length || 0}</p>
									</div>
									<span className={`h-3 w-3 rounded-full ${statusMeta[status].dot}`} />
								</div>
								<div className="mt-4 space-y-3">
									{(grouped[status] || []).length === 0 && (
										<div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
											Sin tareas filtradas
										</div>
									)}
									{(grouped[status] || []).map(task => (
										<div key={task.id} className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
											<div className="flex items-center justify-between gap-3">
												<div>
													<p className="text-xs uppercase tracking-[0.4em] text-slate-300">{task.id}</p>
													<p className="text-base font-semibold text-slate-900">{task.title}</p>
												</div>
												<span className="text-xs font-semibold text-slate-400">{formatShortDate(task.dueDate)}</span>
											</div>
											<div className="mt-3 flex flex-wrap gap-2">
												{task.tags.map(tag => (
													<span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
														{tag}
													</span>
												))}
											</div>
											<div className="mt-4 flex items-center justify-between text-sm text-slate-500">
												<div className="flex items-center gap-2">
													<span className="material-symbols-outlined text-base text-slate-400">person</span>
													<span>{task.owner}</span>
												</div>
												<span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityMeta[task.priority].classes}`}>
													{priorityMeta[task.priority].label}
												</span>
											</div>
											<div className="mt-4">
												<div className="mb-1 flex items-center justify-between text-xs text-slate-400">
													<span>Progreso</span>
													<span className="font-semibold text-slate-600">{task.progress}%</span>
												</div>
												<div className="h-2 w-full rounded-full bg-slate-100">
													<div className={`h-full rounded-full ${statusMeta[status].bar}`} style={{ width: `${task.progress}%` }} />
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="space-y-4">
					<div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Radar</p>
								<h2 className="text-2xl font-semibold text-slate-900">{insightView === 'impacto' ? 'Impacto inmediato' : 'Capacidad disponible'}</h2>
								<p className="mt-1 text-sm text-slate-500">
									{insightView === 'impacto'
										? 'Enfócate en tareas que desbloquean facturación y experiencia paciente.'
										: 'Evalúa la carga actual antes de sumar nuevas iniciativas.'}
								</p>
							</div>
							<span className="material-symbols-outlined text-3xl text-slate-300">insights</span>
						</div>
						<div className="mt-6 grid gap-3">
							{[{ label: 'Due pronto', value: metrics.dueSoon, tone: 'from-red-100 via-orange-50 to-white' },
							  { label: 'Activas', value: metrics.active, tone: 'from-amber-50 via-yellow-50 to-white' },
							  { label: 'Listas', value: metrics.completed, tone: 'from-emerald-50 via-green-50 to-white' }].map(cell => (
								<div key={cell.label} className={`rounded-2xl border border-slate-100 bg-gradient-to-r ${cell.tone} p-4`}
								>
									<div className="flex items-center justify-between text-sm text-slate-500">
										<span>{cell.label}</span>
										<span className="text-lg font-semibold text-slate-900">{cell.value}</span>
									</div>
									<div className="mt-2 h-2 rounded-full bg-white/80">
										<div className="h-full rounded-full bg-slate-900/10" style={{ width: `${Math.min(cell.value * 12, 100)}%` }} />
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-slate-900">Próximas entregas</h3>
							<span className="text-xs uppercase tracking-[0.4em] text-slate-400">Timeline</span>
						</div>
						<div className="mt-4 space-y-4">
							{upcoming.map(task => {
								const days = getDaysUntil(task.dueDate);
								return (
									<div key={task.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
										<div className="text-center">
											<p className="text-xs uppercase text-slate-400">{formatShortDate(task.dueDate)}</p>
											<p className="text-lg font-semibold text-slate-900">{days <= 0 ? 'Hoy' : `${days}d`}</p>
										</div>
										<div className="flex-1">
											<p className="text-sm font-semibold text-slate-900">{task.title}</p>
											<p className="text-xs text-slate-500">{task.owner} · {statusMeta[task.status].label}</p>
										</div>
										<span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityMeta[task.priority].classes}`}>
											{priorityMeta[task.priority].label}
										</span>
									</div>
								);
							})}
						</div>
					</div>

					<div className="rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-slate-900">Carga del equipo</h3>
							<span className="material-symbols-outlined text-slate-300">group_work</span>
						</div>
						<div className="mt-4 space-y-4">
							{baseLoad.map(member => (
								<div key={member.name} className="rounded-2xl border border-slate-100 bg-white/80 p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-semibold text-slate-900">{member.name}</p>
											<p className="text-xs text-slate-500">{member.role}</p>
										</div>
										<span className="text-xs font-semibold text-emerald-500">{member.trend}</span>
									</div>
									<p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">{member.focus}</p>
									<div className="mt-3 h-2 rounded-full bg-slate-100">
										<div
											className="h-full rounded-full bg-gradient-to-r from-[#ffb347] via-[#ffcc33] to-[#fed049]"
											style={{ width: `${member.load * 100}%` }}
										/>
									</div>
									<div className="mt-1 text-right text-xs text-slate-500">{Math.round(member.load * 100)}% de capacidad</div>
								</div>
							))}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default TasksPage;
