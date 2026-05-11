'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
} from 'recharts'
import { apiJson, buildQuery } from '@/lib/crm/api'
import { useCrmEvent } from '@/lib/crm/event-context'
import type {
	GuestStats,
	GuestStatus,
	StatusTimelineResponse,
	TableEntity,
	TagEntity,
} from '@/lib/crm/types'
import { guestStatusLabel } from '@/lib/crm/guest-ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SEATING_PIE_COLORS = ['#22c55e', '#eab308']
const STATUS_PIE_COLORS = ['#22c55e', '#3b82f6', '#ef4444']
const statusesForPie: GuestStatus[] = ['ATTENDING', 'ATTENDING_WITH_SPOUSE', 'DECLINED']

export function ReportsPageClient() {
	const { effectiveEventType, me } = useCrmEvent()

	const statsSelf = useQuery({
		queryKey: ['crm', 'stats', effectiveEventType],
		queryFn: () =>
			apiJson<GuestStats>(`/api/guests/stats${buildQuery({ type: effectiveEventType })}`),
	})

	const statsBride = useQuery({
		queryKey: ['crm', 'stats', 'BRIDE_FAREWELL'],
		queryFn: () =>
			apiJson<GuestStats>(`/api/guests/stats${buildQuery({ type: 'BRIDE_FAREWELL' })}`),
		enabled: me?.role === 'SUPERADMIN',
	})

	const statsWedding = useQuery({
		queryKey: ['crm', 'stats', 'WEDDING'],
		queryFn: () => apiJson<GuestStats>(`/api/guests/stats${buildQuery({ type: 'WEDDING' })}`),
		enabled: me?.role === 'SUPERADMIN',
	})

	const timeline = useQuery({
		queryKey: ['crm', 'timeline', effectiveEventType],
		queryFn: () =>
			apiJson<StatusTimelineResponse>(
				`/api/guests/status-timeline${buildQuery({
					type: effectiveEventType,
				})}`
			),
	})

	const tags = useQuery({
		queryKey: ['crm', 'tags', effectiveEventType],
		queryFn: () => apiJson<TagEntity[]>(`/api/tags${buildQuery({ type: effectiveEventType })}`),
	})

	const tables = useQuery({
		queryKey: ['crm', 'tables', effectiveEventType],
		queryFn: () => apiJson<TableEntity[]>(`/api/tables${buildQuery({ type: effectiveEventType })}`),
	})

	const s = statsSelf.data
	const seatedConfirmedSeats = s ? Math.max(0, s.totalAttendees - s.unassignedConfirmedSeats) : 0
	const seatingPieData =
		s && s.totalAttendees > 0
			? [
					{ name: 'Со столом (мест)', value: seatedConfirmedSeats },
					{ name: 'Без стола (мест)', value: s.unassignedConfirmedSeats },
				]
			: []
	const statusPieData = s
		? statusesForPie.map((st) => ({
				name: guestStatusLabel(st),
				value:
					st === 'ATTENDING'
						? s.attending
						: st === 'ATTENDING_WITH_SPOUSE'
							? s.attendingWithSpouse
							: s.declined,
			}))
		: []

	const tagPie =
		tags.data?.map((t) => ({
			name: t.name,
			value: t._count?.guests ?? 0,
		})) ?? []

	const totalCap = (tables.data ?? []).reduce((a, t) => a + t.capacity, 0)
	const totalOcc = (tables.data ?? []).reduce((a, t) => a + t.occupiedSeats, 0)
	const occPct = totalCap ? Math.round((totalOcc / totalCap) * 100) : 0

	const lineData = timeline.data?.series ?? []

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-serif text-3xl font-semibold">Отчёты</h1>
				<p className="text-muted-foreground">Аналитика и статистика по вашему мероприятию</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
				<MiniStat
					label="Ожидается гостей"
					value={s?.totalAttendees}
					hint={s ? `Записей в списке: ${s.total}` : undefined}
				/>
				<MiniStat
					label="Ответ «да» (пригл.)"
					value={s ? s.attending + s.attendingWithSpouse : undefined}
					hint={s ? `${s.totalAttendees} чел.` : undefined}
				/>
				<MiniStat label="С парой" value={s?.attendingWithSpouse} />
				<MiniStat
					label="Без стола (мест)"
					value={s?.unassignedConfirmedSeats}
					hint={s ? `Записей без стола: ${s.unassigned}` : undefined}
				/>
				<MiniStat label="Отказались" value={s?.declined} />
				<MiniStat label="Дубликаты" value={s?.duplicates} />
			</div>

			<div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="font-serif text-lg">Рассажка</CardTitle>
						<p className="text-xs text-muted-foreground">
							Ожидаемые гости (места): подтвердившие с ответом «да»; сумма сегментов = ожидаемое
							число гостей.
						</p>
					</CardHeader>
					<CardContent className="h-72">
						{seatingPieData.length === 0 ? (
							<p className="flex h-full items-center justify-center text-sm text-muted-foreground">
								Нет подтверждённых гостей для рассадки
							</p>
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={seatingPieData}
										dataKey="value"
										nameKey="name"
										innerRadius={50}
										outerRadius={80}
										paddingAngle={2}
									>
										{seatingPieData.map((_, i) => (
											<Cell key={i} fill={SEATING_PIE_COLORS[i % SEATING_PIE_COLORS.length]} />
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="font-serif text-lg">Ответы в списке</CardTitle>
						<p className="text-xs text-muted-foreground">
							Записи в CRM по статусу (всего {s?.total ?? '—'}).
						</p>
					</CardHeader>
					<CardContent className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={statusPieData}
									dataKey="value"
									nameKey="name"
									innerRadius={50}
									outerRadius={80}
									paddingAngle={2}
								>
									{statusPieData.map((_, i) => (
										<Cell key={i} fill={STATUS_PIE_COLORS[i % STATUS_PIE_COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className="lg:col-span-2 xl:col-span-1">
					<CardHeader>
						<CardTitle className="font-serif text-lg">Подтверждения по дням</CardTitle>
					</CardHeader>
					<CardContent className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={lineData}>
								<XAxis dataKey="date" tick={{ fontSize: 10 }} />
								<YAxis allowDecimals={false} />
								<Tooltip />
								<Line
									type="monotone"
									dataKey="confirmations"
									name="Новые подтверждения"
									stroke="#22c55e"
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="font-serif text-lg">По тегам</CardTitle>
					</CardHeader>
					<CardContent className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie data={tagPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
									{tagPie.map((_, i) => (
										<Cell
											key={i}
											fill={['#c4a574', '#7e9ab8', '#a890c8', '#e8b86d', '#8ab8a0'][i % 5]}
										/>
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="font-serif text-lg">Занятость столов</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-3xl font-bold">{occPct}%</p>
						<p className="text-sm text-muted-foreground">
							{totalOcc} / {totalCap} мест
						</p>
						<div className="h-3 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary transition-all"
								style={{ width: `${occPct}%` }}
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			{me?.role === 'SUPERADMIN' && statsBride.data && statsWedding.data ? (
				<Card>
					<CardHeader>
						<CardTitle className="font-serif text-lg">Сводка по событиям</CardTitle>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border text-left text-muted-foreground">
									<th className="p-2">Событие</th>
									<th className="p-2">Записей</th>
									<th className="p-2">Ожид. чел.</th>
									<th className="p-2">Да (пригл.)</th>
									<th className="p-2">С парой</th>
									<th className="p-2">Без стола (мест)</th>
									<th className="p-2">Зап. без стола</th>
									<th className="p-2">Отказ</th>
									<th className="p-2">Дубликаты</th>
								</tr>
							</thead>
							<tbody>
								{[
									{ label: 'Қыз ұзату', s: statsBride.data },
									{ label: 'Той', s: statsWedding.data },
								].map((row) => (
									<tr key={row.label} className="border-b border-border">
										<td className="p-2 font-medium">{row.label}</td>
										<td className="p-2">{row.s.total}</td>
										<td className="p-2">{row.s.totalAttendees}</td>
										<td className="p-2">{row.s.attending + row.s.attendingWithSpouse}</td>
										<td className="p-2">{row.s.attendingWithSpouse}</td>
										<td className="p-2">{row.s.unassignedConfirmedSeats}</td>
										<td className="p-2">{row.s.unassigned}</td>
										<td className="p-2">{row.s.declined}</td>
										<td className="p-2">{row.s.duplicates}</td>
									</tr>
								))}
							</tbody>
						</table>
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}

function MiniStat({ label, value, hint }: { label: string; value?: number; hint?: string }) {
	return (
		<Card>
			<CardContent className="p-4">
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className="text-2xl font-semibold">{value ?? '—'}</p>
				{hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
			</CardContent>
		</Card>
	)
}
