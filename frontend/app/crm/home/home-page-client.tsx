'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Armchair, CheckCircle2, UserX, Users2 } from 'lucide-react'
import { apiJson, buildQuery } from '@/lib/crm/api'
import { useCrmEvent } from '@/lib/crm/event-context'
import type { GuestEntity, GuestStats, PaginatedGuests } from '@/lib/crm/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { guestStatusBadgeVariant, guestStatusLabel } from '@/lib/crm/guest-ui'
import { useMediaMinMd } from '@/lib/use-media-min-md'

function StatCard({
	title,
	value,
	hint,
	icon: Icon,
}: {
	title: string
	value: string | number
	hint?: string
	icon: React.ComponentType<{ className?: string }>
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
			</CardContent>
		</Card>
	)
}

export function HomePageClient() {
	const { effectiveEventType } = useCrmEvent()
	const isMd = useMediaMinMd()
	const previewLimit = isMd ? 10 : 5

	const statsQuery = useQuery({
		queryKey: ['crm', 'stats', effectiveEventType],
		queryFn: () =>
			apiJson<GuestStats>(`/api/guests/stats${buildQuery({ type: effectiveEventType })}`),
	})

	const guestsQuery = useQuery({
		queryKey: ['crm', 'guests-preview', effectiveEventType, previewLimit],
		queryFn: () =>
			apiJson<PaginatedGuests>(
				`/api/guests${buildQuery({ type: effectiveEventType, page: 1, limit: previewLimit })}`
			),
	})

	const s = statsQuery.data

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-serif text-3xl font-semibold">Главная</h1>
				<p className="text-muted-foreground">Обзор гостей и ответов по выбранному событию</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
				<StatCard
					title="Ожидается гостей"
					value={s?.totalAttendees ?? '—'}
					hint={s ? `Записей в списке: ${s.total}` : undefined}
					icon={Users2}
				/>
				<StatCard
					title="Подтвердили"
					value={s ? s.attending + s.attendingWithSpouse : '—'}
					hint={
						s && s.total
							? `${s.totalAttendees} чел. · ${Math.round(((s.attending + s.attendingWithSpouse) / s.total) * 100)}% от списка (приглаш.)`
							: undefined
					}
					icon={CheckCircle2}
				/>
				<StatCard title="С парой" value={s?.attendingWithSpouse ?? '—'} icon={Users2} />
				<StatCard
					title="Без стола (мест)"
					value={s?.unassignedConfirmedSeats ?? '—'}
					hint={s ? `Записей без стола: ${s.unassigned}` : undefined}
					icon={Armchair}
				/>
				<StatCard title="Отказались" value={s?.declined ?? '—'} icon={UserX} />
			</div>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="font-serif text-xl">Последние гости</CardTitle>
					<Button variant="outline" asChild>
						<Link href="/crm/guests">Все гости</Link>
					</Button>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Гость</TableHead>
								<TableHead>Статус</TableHead>
								<TableHead>Стол</TableHead>
								<TableHead>Добавлен</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{(guestsQuery.data?.data ?? []).map((g: GuestEntity) => (
								<TableRow key={g.id}>
									<TableCell className="max-w-[14rem] min-w-0 whitespace-normal break-words font-medium">
										{g.fullName}
									</TableCell>
									<TableCell>
										<Badge variant={guestStatusBadgeVariant(g.status)}>
											{guestStatusLabel(g.status)}
										</Badge>
									</TableCell>
									<TableCell>{g.table ? `${g.table.number}` : '—'}</TableCell>
									<TableCell className="text-muted-foreground">
										{new Date(g.createdAt).toLocaleDateString('ru-RU')}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
