'use client'

import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { ReportsCharts as ReportsChartsComponent } from './reports-charts'
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

const ReportsCharts = dynamic<ComponentProps<typeof ReportsChartsComponent>>(
	() => import('./reports-charts').then((m) => m.ReportsCharts),
	{ ssr: false, loading: () => <p className="text-sm text-muted-foreground">Загрузка…</p> }
)

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

			<ReportsCharts
				seatingPieData={seatingPieData}
				statusPieData={statusPieData}
				lineData={lineData}
				tagPie={tagPie}
				totalRecords={s?.total}
				occPct={occPct}
				totalOcc={totalOcc}
				totalCap={totalCap}
			/>

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
