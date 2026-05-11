'use client'

import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, MoreHorizontal, Trash2, Users, UserMinus } from 'lucide-react'
import { apiJson, buildQuery } from '@/lib/crm/api'
import { useCrmEvent } from '@/lib/crm/event-context'
import type { GuestEntity, GuestStatus, PaginatedGuests, TableEntity } from '@/lib/crm/types'
import { toast } from '@/lib/crm/toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type TableFilter = 'all' | 'empty' | 'partial' | 'full'

function SeatingGuestBlock({
	fullName,
	status,
	partnerFullName,
	compact,
}: {
	fullName: string
	status: GuestStatus
	partnerFullName: string | null | undefined
	compact?: boolean
}) {
	const isPair = status === 'ATTENDING_WITH_SPOUSE'
	const partner = partnerFullName?.trim()
	return (
		<div className="flex min-w-0 flex-col gap-0.5">
			<span className={cn('wrap-break-word', compact ? 'text-xs' : 'text-sm', 'font-medium')}>
				{fullName}
			</span>
			{isPair && partner ? (
				<span
					className={cn(
						'wrap-break-word text-muted-foreground',
						compact ? 'text-[11px] leading-snug' : 'text-xs'
					)}
				>
					Пара: {partner}
				</span>
			) : isPair && !partner ? (
				<span className="text-xs text-muted-foreground">Пара (+1), имя не указано</span>
			) : null}
			{isPair ? (
				<Badge variant="secondary" className="w-fit text-[10px] font-normal">
					2 места
				</Badge>
			) : null}
		</div>
	)
}

export function TablesPageClient() {
	const { effectiveEventType } = useCrmEvent()
	const qc = useQueryClient()
	const [filter, setFilter] = React.useState<TableFilter>('all')
	const [addOpen, setAddOpen] = React.useState(false)
	const [number, setNumber] = React.useState('')
	const [capacity, setCapacity] = React.useState('12')

	const [seatingTableId, setSeatingTableId] = React.useState<string | null>(null)
	const [pickSearch, setPickSearch] = React.useState('')
	const [pickSearchDebounced, setPickSearchDebounced] = React.useState('')

	React.useEffect(() => {
		const tid = setTimeout(() => setPickSearchDebounced(pickSearch.trim()), 300)
		return () => clearTimeout(tid)
	}, [pickSearch])

	const tablesQuery = useQuery({
		queryKey: ['crm', 'tables', effectiveEventType],
		queryFn: () => apiJson<TableEntity[]>(`/api/tables${buildQuery({ type: effectiveEventType })}`),
	})

	const tables = tablesQuery.data ?? []
	const seatingTable = seatingTableId ? (tables.find((x) => x.id === seatingTableId) ?? null) : null

	const unassignedGuestsQuery = useQuery({
		queryKey: [
			'crm',
			'guests',
			'unassigned',
			'seating',
			effectiveEventType,
			pickSearchDebounced,
			seatingTableId,
		],
		queryFn: () =>
			apiJson<PaginatedGuests>(
				`/api/guests${buildQuery({
					type: effectiveEventType,
					unassigned: true,
					seatingPicklist: true,
					search: pickSearchDebounced || undefined,
					page: 1,
					limit: 40,
				})}`
			),
		enabled: !!seatingTableId,
	})

	const createMutation = useMutation({
		mutationFn: () =>
			apiJson('/api/tables', {
				method: 'POST',
				body: JSON.stringify({
					number: Number(number),
					capacity: Number(capacity) || 12,
					type: effectiveEventType,
				}),
			}),
		onSuccess: () => {
			toast({ title: 'Стол добавлен' })
			setAddOpen(false)
			setNumber('')
			setCapacity('12')
			void qc.invalidateQueries({ queryKey: ['crm', 'tables'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: string) => apiJson(`/api/tables/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
			toast({ title: 'Стол удалён' })
			void qc.invalidateQueries({ queryKey: ['crm', 'tables'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	const assignMutation = useMutation({
		mutationFn: ({ tableId, guestId }: { tableId: string; guestId: string }) =>
			apiJson(`/api/tables/${tableId}/assign/${guestId}`, { method: 'POST' }),
		onSuccess: () => {
			toast({ title: 'Гость назначен за стол' })
			void qc.invalidateQueries({ queryKey: ['crm', 'tables'] })
			void qc.invalidateQueries({ queryKey: ['crm', 'guests'] })
			void qc.invalidateQueries({ queryKey: ['crm', 'guests-preview'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Не удалось назначить', description: e.message, variant: 'destructive' }),
	})

	const unassignMutation = useMutation({
		mutationFn: ({ tableId, guestId }: { tableId: string; guestId: string }) =>
			apiJson(`/api/tables/${tableId}/assign/${guestId}`, { method: 'DELETE' }),
		onSuccess: () => {
			toast({ title: 'Гость убран со стола' })
			void qc.invalidateQueries({ queryKey: ['crm', 'tables'] })
			void qc.invalidateQueries({ queryKey: ['crm', 'guests'] })
			void qc.invalidateQueries({ queryKey: ['crm', 'guests-preview'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	function closeSeatingDialog() {
		setSeatingTableId(null)
		setPickSearch('')
		setPickSearchDebounced('')
	}

	const filtered = tables.filter((t) => {
		const full = t.occupiedSeats >= t.capacity
		const empty = t.occupiedSeats === 0
		if (filter === 'full') return full
		if (filter === 'empty') return empty
		if (filter === 'partial') return !empty && !full
		return true
	})

	const pickRows = unassignedGuestsQuery.data?.data ?? []

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="font-serif text-3xl font-semibold">Столы</h1>
					<p className="text-muted-foreground">Управляйте рассадкой гостей на вашем торжестве</p>
				</div>
				<Button onClick={() => setAddOpen(true)}>
					<Plus className="h-4 w-4" /> Добавить стол
				</Button>
			</div>

			<div className="flex flex-wrap gap-2 text-sm">
				<span className="text-muted-foreground">Показать:</span>
				{(['all', 'empty', 'partial', 'full'] as const).map((f) => (
					<Button
						key={f}
						size="sm"
						variant={filter === f ? 'default' : 'outline'}
						type="button"
						onClick={() => setFilter(f)}
					>
						{f === 'all'
							? 'Все'
							: f === 'empty'
								? 'Свободные'
								: f === 'partial'
									? 'Частично'
									: 'Заполненные'}
					</Button>
				))}
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{filtered.map((t) => {
					const ratio = t.capacity ? t.occupiedSeats / t.capacity : 0
					const full = t.occupiedSeats >= t.capacity
					const empty = t.occupiedSeats === 0
					const barColor = full ? 'bg-red-400' : empty ? 'bg-stone-300' : 'bg-amber-400'
					return (
						<Card key={t.id} className="relative overflow-hidden">
							<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
								<div>
									<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary font-serif text-xl font-semibold text-primary">
										{t.number}
									</div>
									<p className="mt-2 text-xs text-muted-foreground">
										Вместимость {t.capacity} мест
									</p>
								</div>
								<div className="flex shrink-0 items-start gap-1">
									<Button
										variant="outline"
										size="icon"
										type="button"
										aria-label="Рассадка за стол"
										onClick={() => setSeatingTableId(t.id)}
									>
										<Users className="h-4 w-4" />
									</Button>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" aria-label="Меню стола">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => setSeatingTableId(t.id)}>
												<Users className="mr-2 h-4 w-4" />
												Рассадка
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => {
													if (confirm('Удалить стол?')) deleteMutation.mutate(t.id)
												}}
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Удалить
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="text-sm font-medium">
									{t.occupiedSeats} / {t.capacity}
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
									<div
										className={cn('h-full rounded-full transition-all', barColor)}
										style={{ width: `${Math.min(100, ratio * 100)}%` }}
									/>
								</div>
								{t.guests.length === 0 ? (
									<p className="text-sm text-muted-foreground">Стол свободен</p>
								) : (
									<div className="flex flex-col gap-1.5">
										{t.guests.map((g) => (
											<div
												key={g.id}
												className="rounded-lg bg-secondary px-2 py-1.5 text-foreground"
											>
												<SeatingGuestBlock
													fullName={g.fullName}
													status={g.status}
													partnerFullName={g.partnerFullName}
													compact
												/>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					)
				})}
			</div>

			<Dialog open={addOpen} onOpenChange={setAddOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Новый стол</DialogTitle>
					</DialogHeader>
					<div className="space-y-3">
						<div className="space-y-1">
							<Label>Номер стола</Label>
							<Input
								inputMode="numeric"
								value={number}
								onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
							/>
						</div>
						<div className="space-y-1">
							<Label>Вместимость</Label>
							<Input
								inputMode="numeric"
								value={capacity}
								onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ''))}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setAddOpen(false)}>
							Отмена
						</Button>
						<Button
							disabled={!number || createMutation.isPending}
							onClick={() => createMutation.mutate()}
						>
							Создать
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!seatingTableId}
				onOpenChange={(o) => {
					if (!o) closeSeatingDialog()
				}}
			>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>
							Рассадка{seatingTable ? ` — стол ${seatingTable.number}` : ''}
						</DialogTitle>
						<DialogDescription>
							Уберите гостей со стола или назначьте свободных гостей с учётом вместимости (пара
							занимает два места).
						</DialogDescription>
					</DialogHeader>

					{seatingTable ? (
						<div className="space-y-4 py-2">
							<div>
								<p className="mb-2 text-sm font-medium">За столом</p>
								{seatingTable.guests.length === 0 ? (
									<p className="text-sm text-muted-foreground">Пока никого нет</p>
								) : (
									<ul className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
										{seatingTable.guests.map((g) => (
											<li key={g.id} className="flex items-start justify-between gap-2 text-sm">
												<div className="min-w-0 flex-1 pr-1">
													<SeatingGuestBlock
														fullName={g.fullName}
														status={g.status}
														partnerFullName={g.partnerFullName}
													/>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="shrink-0"
													aria-label={`Убрать ${g.fullName} со стола`}
													disabled={unassignMutation.isPending}
													onClick={() =>
														unassignMutation.mutate({
															tableId: seatingTable.id,
															guestId: g.id,
														})
													}
												>
													<UserMinus className="h-4 w-4" />
												</Button>
											</li>
										))}
									</ul>
								)}
							</div>

							<Separator />

							<div className="space-y-2">
								<Label htmlFor="seating-pick-search">Добавить гостя (без стола)</Label>
								<Input
									id="seating-pick-search"
									placeholder="Поиск по имени гостя или партнёра…"
									value={pickSearch}
									onChange={(e) => setPickSearch(e.target.value)}
								/>
								<div className="max-h-48 overflow-y-auto rounded-lg border border-border">
									{unassignedGuestsQuery.isLoading ? (
										<p className="p-3 text-sm text-muted-foreground">Загрузка…</p>
									) : pickRows.length === 0 ? (
										<p className="p-3 text-sm text-muted-foreground">Нет подходящих гостей</p>
									) : (
										<ul className="divide-y divide-border">
											{pickRows.map((g: GuestEntity) => (
												<li key={g.id}>
													<button
														type="button"
														className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-[transform,colors] duration-200 ease-out hover:bg-muted active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100"
														disabled={assignMutation.isPending}
														onClick={() =>
															assignMutation.mutate({
																tableId: seatingTable.id,
																guestId: g.id,
															})
														}
													>
														<SeatingGuestBlock
															fullName={g.fullName}
															status={g.status}
															partnerFullName={g.partnerFullName}
														/>
														<span className="shrink-0 self-center text-xs text-muted-foreground">
															Назначить
														</span>
													</button>
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
						</div>
					) : null}

					<DialogFooter>
						<Button type="button" variant="outline" onClick={closeSeatingDialog}>
							Закрыть
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
