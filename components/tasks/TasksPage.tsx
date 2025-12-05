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

type NewTaskForm = {
	title: string;
	owner: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate: string;
	area: TaskItem['area'];
	tags: string;
};

const statusMeta: Record<TaskStatus, { label: string; dot: string; palette: string }> = {
	backlog: {
		label: 'Descubrir',
		dot: 'bg-slate-300',
		palette: 'bg-white/70 border-slate-100'
	},
	'in-progress': {
		label: 'En curso',
		dot: 'bg-[#ffb347]',
		palette: 'bg-white border-[#ffe7cc]'
	},
	review: {
		label: 'Revisión',
		dot: 'bg-[#6d5dfc]',
		palette: 'bg-white border-[#ded7ff]'
	},
	done: {
		label: 'Listo',
		dot: 'bg-emerald-400',
		palette: 'bg-white border-emerald-100'
	}
};

const priorityMeta: Record<TaskPriority, { label: string; classes: string }> = {
	alta: { label: 'Alta', classes: 'bg-red-50 text-red-600' },
	media: { label: 'Media', classes: 'bg-amber-50 text-amber-600' },
	baja: { label: 'Baja', classes: 'bg-emerald-50 text-emerald-600' }
};

const statusOptions: { value: TaskStatus; label: string }[] = [
	{ value: 'backlog', label: 'Descubrir' },
	{ value: 'in-progress', label: 'En curso' },
	{ value: 'review', label: 'Revisión' },
	{ value: 'done', label: 'Listo' }
];

const areaOptions: { value: TaskItem['area']; label: string }[] = [
	{ value: 'Producto', label: 'Producto' },
	{ value: 'Crecimiento', label: 'Crecimiento' },
	{ value: 'Experiencia', label: 'Experiencia Paciente' }
];

const initialNewTaskState: NewTaskForm = {
	title: '',
	owner: '',
	status: 'backlog',
	priority: 'media',
	dueDate: '',
	area: 'Producto',
	tags: ''
};

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

const heroTexture = {
	backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 183, 77, 0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(99, 102, 241, 0.2), transparent 45%)',
	backgroundSize: '140% 140%'
};

const getDaysUntil = (isoDate: string) => {
	const today = new Date();
	const target = new Date(isoDate);
	return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatShortDate = (isoDate: string) => {
	return new Date(isoDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

const TasksPage: React.FC = () => {
	const [tasks, setTasks] = useState<TaskItem[]>(sampleTasks);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
	const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
	const [insightView, setInsightView] = useState<'impacto' | 'capacidad'>('impacto');
	const [activeView, setActiveView] = useState<'tablero' | 'insights'>('tablero');
	const [newTask, setNewTask] = useState<NewTaskForm>({ ...initialNewTaskState });
	const [creationMessage, setCreationMessage] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const handleNewTaskChange = (field: keyof NewTaskForm, value: string) => {
		setNewTask(prev => ({ ...prev, [field]: value }));
	};

	const handleCreateTask = (event: React.FormEvent) => {
		event.preventDefault();
		setFormError(null);
		if (!newTask.title.trim() || !newTask.owner.trim()) {
			setFormError('Completa al menos el título y el responsable.');
			return;
		}

		const parsedTags = newTask.tags
			.split(',')
			.map(tag => tag.trim())
			.filter(Boolean);

		const dueDate = newTask.dueDate || new Date().toISOString().split('T')[0];

		const payload: TaskItem = {
			id: `TKS-${Math.floor(Date.now() / 1000)}`,
			title: newTask.title.trim(),
			owner: newTask.owner.trim(),
			status: newTask.status,
			priority: newTask.priority,
			dueDate,
			tags: parsedTags,
			progress: 0,
			area: newTask.area
		};

		setTasks(prev => [payload, ...prev]);
		setNewTask({ ...initialNewTaskState });
		setCreationMessage('Tarea registrada');
		setTimeout(() => setCreationMessage(null), 2500);
	};

	const filteredTasks = useMemo(() => {
		const term = search.trim().toLowerCase();
		return tasks.filter(task => {
			const matchesTerm =
				term.length === 0 || `${task.title} ${task.owner} ${task.tags.join(' ')}`.toLowerCase().includes(term);
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
		return { dueSoon, active, completed };
	}, [tasks]);

	const upcoming = useMemo(() => {
		return [...tasks]
			.filter(task => task.status !== 'done')
			.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
			.slice(0, 5);
	}, [tasks]);

	const teamLoad = useMemo(() => {
		return baseLoad.map(member => {
			const owned = tasks.filter(task => task.owner === member.name && task.status !== 'done');
			const soonest = owned.length > 0 ? owned.reduce((prev, curr) => (new Date(curr.dueDate).getTime() < new Date(prev.dueDate).getTime() ? curr : prev)) : null;
			return {
				...member,
				activeTasks: owned.length,
				hasCritical: owned.some(task => task.priority === 'alta'),
				nextDueDate: soonest?.dueDate ?? null
			};
		});
	}, [tasks]);

	const reviewCount = useMemo(() => tasks.filter(task => task.status === 'review').length, [tasks]);
	const backlogHighPriority = useMemo(() => tasks.filter(task => task.status === 'backlog' && task.priority === 'alta').length, [tasks]);
	const activePipeline = useMemo(() => tasks.filter(task => task.status !== 'done').length, [tasks]);
	const averageLoad = useMemo(() => baseLoad.reduce((sum, member) => sum + member.load, 0) / baseLoad.length, []);
	const highPressure = useMemo(() => baseLoad.filter(member => member.load >= 0.75).length, []);

	const impactSignals = [
		{
			label: 'Entregas críticas',
			value: metrics.dueSoon,
			caption: 'Vencen en ≤5 días',
			trend: '3 requieren QA',
			icon: 'bolt',
			accent: 'text-rose-500'
		},
		{
			label: 'Flujo activo',
			value: metrics.active,
			caption: 'Misiones en curso',
			trend: '+12% vs semana',
			icon: 'timeline',
			accent: 'text-indigo-500'
		},
		{
			label: 'Listas este sprint',
			value: metrics.completed,
			caption: 'Últimos 7 días',
			trend: 'Sin bloqueos críticos',
			icon: 'workspace_premium',
			accent: 'text-emerald-500'
		}
	];

	const capacitySignals = [
		{
			label: 'Carga promedio',
			value: `${Math.round(averageLoad * 100)}%`,
			caption: 'Equipo núcleo',
			trend: `${highPressure} en zona crítica`,
			icon: 'deployed_code',
			accent: 'text-amber-500'
		},
		{
			label: 'Pendientes QA',
			value: reviewCount,
			caption: 'En revisión',
			trend: 'Coordina con compliance',
			icon: 'rule',
			accent: 'text-sky-500'
		},
		{
			label: 'Backlog prioritario',
			value: backlogHighPriority,
			caption: 'Alta urgencia',
			trend: `${activePipeline} tareas activas`,
			icon: 'flag',
			accent: 'text-slate-500'
		}
	];

	return (
		<div className="space-y-6">
			<section
				className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fffaf4] via-[#f3f4ff] to-[#fef7eb] text-[#0f172a] shadow-[0px_35px_70px_rgba(15,23,42,0.08)]"
				style={heroTexture}
			>
				<div className="relative flex flex-col gap-6 p-8">
					<div className="space-y-4 max-w-2xl">
						<div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-1 text-xs uppercase tracking-[0.35em] text-[#0f172a]">
							<span className="material-symbols-outlined text-base">pace</span>
							Sprint táctico
						</div>
						<div>
							<h1 className="text-3xl font-semibold leading-tight md:text-4xl text-[#0f172a]">Tablero de Tareas Orquestadas</h1>
							<p className="mt-3 text-base text-[#0f172a] md:text-lg">
								Visualiza prioridades, velocidad del equipo y bloqueos antes de que impacten al paciente.
								Las señales se actualizan con los últimos movimientos operativos.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-sm">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.35em] text-slate-400">Modo</p>
						<h2 className="text-2xl font-semibold text-slate-900">
							{activeView === 'tablero' ? 'Ejecución diaria' : 'Radar operativo'}
						</h2>
						<p className="text-sm text-slate-500">
							{activeView === 'tablero'
								? 'Gestiona backlog, responsables y carga del equipo en una sola vista.'
								: 'Revisa señales tempranas, entregas críticas y capacidad disponible.'}
						</p>
					</div>
					<div className="flex items-center gap-2 self-start rounded-2xl bg-slate-100/70 p-1">
						{(['tablero', 'insights'] as const).map(view => (
							<button
								key={view}
								onClick={() => setActiveView(view)}
								className={`rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
									activeView === view ? 'bg-white shadow text-slate-900' : 'text-slate-500'
								}`}
							>
								{view}
							</button>
						))}
					</div>
				</div>

				<div className="mt-6">
					{activeView === 'tablero' ? (
						<div className="grid gap-6 lg:grid-cols-[4fr_1fr]">
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
									</div>
									<div className="mt-5 flex flex-wrap gap-2">
										{[{ label: 'Todos', value: 'all' }, ...Object.entries(statusMeta).map(([value, meta]) => ({ label: meta.label, value }))].map(({ label, value }) => (
											<button
												key={value}
												onClick={() => setStatusFilter(value as TaskStatus | 'all')}
												className={`rounded-full px-4 py-1.5 text-sm ${
													statusFilter === value ? 'bg-[#aa632d] text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
													priorityFilter === filter.value ? 'border-[#aa632d] bg-[#fef3eb] text-[#aa632d]' : 'border-slate-200 text-slate-500 hover:text-slate-700'
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
													<div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">Sin tareas filtradas</div>
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
																<span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">{tag}</span>
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
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</section>

							<aside className="space-y-4">
								<div className="rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-sm">
									<h3 className="text-lg font-semibold text-[#0f172a]">Registrar nueva tarea</h3>
									<p className="text-sm text-slate-500">Crea misiones tácticas y aparecerán inmediatamente en el tablero.</p>
									<form className="mt-4 space-y-3" onSubmit={handleCreateTask}>
										{creationMessage && (
											<p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{creationMessage}</p>
										)}
										{formError && (
											<p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{formError}</p>
										)}
										<input
											type="text"
											placeholder="Título de la tarea"
											value={newTask.title}
											onChange={e => handleNewTaskChange('title', e.target.value)}
											className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-[#0f172a] focus:outline-none"
										/>
										<input
											type="text"
											placeholder="Responsable"
											value={newTask.owner}
											onChange={e => handleNewTaskChange('owner', e.target.value)}
											className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-[#0f172a] focus:outline-none"
										/>
										<div className="grid grid-cols-2 gap-3">
											<select
												value={newTask.priority}
												onChange={e => handleNewTaskChange('priority', e.target.value)}
												className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#0f172a] focus:outline-none"
											>
												{Object.entries(priorityMeta).map(([value, meta]) => (
													<option key={value} value={value}>{meta.label}</option>
												))}
											</select>
											<select
												value={newTask.status}
												onChange={e => handleNewTaskChange('status', e.target.value)}
												className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#0f172a] focus:outline-none"
											>
												{statusOptions.map(option => (
													<option key={option.value} value={option.value}>{option.label}</option>
												))}
											</select>
										</div>
										<div className="grid grid-cols-2 gap-3">
											<input
												type="date"
												value={newTask.dueDate}
												onChange={e => handleNewTaskChange('dueDate', e.target.value)}
												className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#0f172a] focus:outline-none"
											/>
											<select
												value={newTask.area}
												onChange={e => handleNewTaskChange('area', e.target.value)}
												className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#0f172a] focus:outline-none"
											>
												{areaOptions.map(option => (
													<option key={option.value} value={option.value}>{option.label}</option>
												))}
											</select>
										</div>
										<textarea
											placeholder="Etiquetas separadas por coma"
											value={newTask.tags}
											onChange={e => handleNewTaskChange('tags', e.target.value)}
											rows={2}
											className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-[#0f172a] focus:outline-none"
										/>
										<button
											type="submit"
											className="w-full rounded-2xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15213b]"
										>
											Guardar tarea
										</button>
									</form>
								</div>
								<div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
									<p className="font-semibold text-slate-700">Sugerencias rápidas</p>
									<ul className="mt-2 space-y-1">
										<li>• Usa etiquetas para agrupar rituales.</li>
										<li>• Cambia el estado a "Revisión" cuando dependa de QA.</li>
										<li>• Mantén due dates cortos para priorizar ejecución.</li>
									</ul>
								</div>
							</aside>
						</div>
					) : (
						<div className="space-y-6">
							<div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm">
								<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
									<div>
										<p className="text-xs uppercase tracking-[0.35em] text-slate-400">Radar</p>
										<h3 className="text-xl font-semibold text-slate-900">
											{insightView === 'impacto' ? 'Señales de impacto' : 'Salud de capacidad'}
										</h3>
										<p className="text-sm text-slate-500">
											{insightView === 'impacto'
												? 'Detecta entregas calientes y velocidad de ejecución.'
												: 'Evalúa la carga del equipo y los cuellos de botella.'}
										</p>
									</div>
									<div className="flex items-center gap-2 rounded-2xl bg-slate-100/70 p-1">
										{(['impacto', 'capacidad'] as const).map(view => (
											<button
												key={view}
												onClick={() => setInsightView(view)}
												className={`rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
													insightView === view ? 'bg-white shadow text-slate-900' : 'text-slate-500'
												}`}
											>
												{view === 'impacto' ? 'Impacto' : 'Capacidad'}
											</button>
										))}
									</div>
								</div>
								<div className="mt-6 grid gap-4 md:grid-cols-3">
									{(insightView === 'impacto' ? impactSignals : capacitySignals).map(signal => (
										<div key={signal.label} className="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{signal.label}</p>
													<p className="text-3xl font-semibold text-slate-900">{signal.value}</p>
												</div>
												<span className={`material-symbols-outlined text-2xl ${signal.accent}`}>{signal.icon}</span>
											</div>
											<p className="mt-2 text-sm text-slate-500">{signal.caption}</p>
											<p className="text-xs font-semibold text-slate-400">{signal.trend}</p>
										</div>
									))}
								</div>
							</div>

							<div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm">
								<h3 className="text-lg font-semibold text-slate-900">Carga del equipo</h3>
								<p className="text-sm text-slate-500">Visibilidad rápida de foco y saturación</p>
								<div className="mt-4 space-y-4">
									{teamLoad.map(member => (
										<div key={member.name} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm font-semibold text-slate-900">{member.name}</p>
													<p className="text-xs text-slate-400">{member.role}</p>
												</div>
												<p className="text-xs font-semibold text-slate-500">{Math.round(member.load * 100)}%</p>
											</div>
											<div className="mt-3 h-2 rounded-full bg-slate-100">
												<div
													className={`h-2 rounded-full ${member.load >= 0.75 ? 'bg-rose-400' : 'bg-emerald-400'}`}
													style={{ width: `${Math.min(100, member.load * 100)}%` }}
												/>
											</div>
											<div className="mt-3 flex items-center justify-between text-xs text-slate-500">
												<span>{member.activeTasks} tareas activas</span>
												<span>{member.hasCritical ? 'En riesgo' : 'Estable'}</span>
											</div>
											{member.nextDueDate && (
												<p className="mt-1 text-xs text-slate-400">Entrega {formatShortDate(member.nextDueDate)}</p>
											)}
											<p className="mt-2 text-xs text-slate-500">Foco: {member.focus}</p>
										</div>
									))}
								</div>
							</div>

							<div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm">
								<h3 className="text-lg font-semibold text-slate-900">Observaciones accionables</h3>
								<div className="mt-4 grid gap-4 md:grid-cols-3">
									<div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-slate-600">
										<p className="font-semibold text-slate-900">QA concentra {reviewCount} piezas.</p>
										<p className="mt-2 text-xs text-slate-500">Agenda sesión express con QA para liberar capacidad.</p>
									</div>
									<div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-slate-600">
										<p className="font-semibold text-slate-900">{backlogHighPriority} tareas críticas siguen en backlog.</p>
										<p className="mt-2 text-xs text-slate-500">Define responsables y due dates hoy mismo.</p>
									</div>
									<div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-600">
										<p className="font-semibold text-slate-900">Pipeline activo: {activePipeline} iniciativas.</p>
										<p className="mt-2 text-xs text-slate-500">Comparte actualización semanal con dirección.</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

export default TasksPage;
