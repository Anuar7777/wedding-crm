'use client'

import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Pencil, Trash2, Download } from 'lucide-react'
import { apiJson, buildQuery } from '@/lib/crm/api'
import { useCrmEvent } from '@/lib/crm/event-context'
import type {
	GuestEntity,
	GuestStatus,
	PaginatedGuests,
	TagEntity,
	TableEntity,
} from '@/lib/crm/types'
import { toast } from '@/lib/crm/toast'
import { downloadGuestsExcel } from '@/lib/crm/excel-guests'
import { guestStatusBadgeVariant, guestStatusLabel } from '@/lib/crm/guest-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
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
import { MoreHorizontal } from 'lucide-react'

const statuses: GuestStatus[] = ['PENDING', 'ATTENDING', 'ATTENDING_WITH_SPOUSE', 'DECLINED']

export function GuestsPageClient() {
	const { effectiveEventType } = useCrmEvent()
	const qc = useQueryClient()
	const router = useRouter()
	const searchParams = useSearchParams()

	const [page, setPage] = React.useState(1)
	const [searchInput, setSearchInput] = React.useState('')
	const [search, setSearch] = React.useState('')
	const [status, setStatus] = React.useState<GuestStatus | ''>('')
	const [tagId, setTagId] = React.useState('')
	const [tableId, setTableId] = React.useState('')
	const [selected, setSelected] = React.useState<Set<string>>(() => new Set())

	const [createOpen, setCreateOpen] = React.useState(false)
	const [editGuest, setEditGuest] = React.useState<GuestEntity | null>(null)
	const [bulkTagsOpen, setBulkTagsOpen] = React.useState(false)
	const [bulkTagSelection, setBulkTagSelection] = React.useState<Set<string>>(() => new Set())

	const [formFullName, setFormFullName] = React.useState('')
	const [formStatus, setFormStatus] = React.useState<GuestStatus>('PENDING')
	const [formPartner, setFormPartner] = React.useState('')
	const [formTags, setFormTags] = React.useState<Set<string>>(() => new Set())

	React.useEffect(() => {
		if (searchParams.get('create') !== '1') return
		const id = requestAnimationFrame(() => {
			setCreateOpen(true)
			router.replace('/crm/guests')
		})
		return () => cancelAnimationFrame(id)
	}, [searchParams, router])

	const guestsQuery = useQuery({
		queryKey: ['crm', 'guests', effectiveEventType, page, search, status, tagId, tableId],
		queryFn: () =>
			apiJson<PaginatedGuests>(
				`/api/guests${buildQuery({
					type: effectiveEventType,
					page,
					limit: 20,
					search: search || undefined,
					status: status || undefined,
					tagIds: tagId || undefined,
					tableId: tableId || undefined,
				})}`
			),
	})

	const tagsQuery = useQuery({
		queryKey: ['crm', 'tags', effectiveEventType],
		queryFn: () => apiJson<TagEntity[]>(`/api/tags${buildQuery({ type: effectiveEventType })}`),
	})

	const tablesQuery = useQuery({
		queryKey: ['crm', 'tables', effectiveEventType],
		queryFn: () => apiJson<TableEntity[]>(`/api/tables${buildQuery({ type: effectiveEventType })}`),
	})

	const resetForm = React.useCallback(() => {
		setFormFullName('')
		setFormStatus('PENDING')
		setFormPartner('')
		setFormTags(new Set())
	}, [])

	const createMutation = useMutation({
		mutationFn: (body: Record<string, unknown>) =>
			apiJson<GuestEntity>('/api/guests', { method: 'POST', body: JSON.stringify(body) }),
		onSuccess: () => {
			toast({ title: 'Гость добавлен' })
			setCreateOpen(false)
			resetForm()
			void qc.invalidateQueries({ queryKey: ['crm'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	const updateMutation = useMutation({
		mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
			apiJson<GuestEntity>(`/api/guests/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
		onSuccess: () => {
			toast({ title: 'Сохранено' })
			setEditGuest(null)
			resetForm()
			void qc.invalidateQueries({ queryKey: ['crm'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: string) => apiJson(`/api/guests/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
			toast({ title: 'Удалено' })
			void qc.invalidateQueries({ queryKey: ['crm'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	const bulkDeleteMutation = useMutation({
		mutationFn: (ids: string[]) =>
			apiJson('/api/guests/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
		onSuccess: () => {
			toast({ title: 'Удалено' })
			setSelected(new Set())
			void qc.invalidateQueries({ queryKey: ['crm'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	const bulkTagsMutation = useMutation({
		mutationFn: (payload: { ids: string[]; tagIds: string[] }) =>
			apiJson('/api/guests/bulk-tags', { method: 'PATCH', body: JSON.stringify(payload) }),
		onSuccess: () => {
			toast({ title: 'Теги обновлены' })
			setBulkTagsOpen(false)
			setBulkTagSelection(new Set())
			setSelected(new Set())
			void qc.invalidateQueries({ queryKey: ['crm'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	function openCreate() {
		resetForm()
		setCreateOpen(true)
	}

	function openEdit(g: GuestEntity) {
		setEditGuest(g)
		setFormFullName(g.fullName)
		setFormStatus(g.status)
		setFormPartner(g.partnerFullName ?? '')
		setFormTags(new Set(g.tags.map((t) => t.id)))
	}

	function submitGuest(mode: 'create' | 'edit') {
		const tagIds = Array.from(formTags)
		const body: Record<string, unknown> = {
			fullName: formFullName.trim(),
			type: effectiveEventType,
			status: formStatus,
			partnerFullName:
				formStatus === 'ATTENDING_WITH_SPOUSE' ? formPartner.trim() || undefined : undefined,
			tagIds: tagIds.length ? tagIds : undefined,
		}
		if (mode === 'create') createMutation.mutate(body)
		else if (editGuest) updateMutation.mutate({ id: editGuest.id, body })
	}

	function toggleRow(id: string) {
		const n = new Set(selected)
		if (n.has(id)) n.delete(id)
		else n.add(id)
		setSelected(n)
	}

	async function exportExcel() {
		try {
			const all: GuestEntity[] = []
			let p = 1
			let totalPages = 1
			do {
				const res = await apiJson<PaginatedGuests>(
					`/api/guests${buildQuery({
						type: effectiveEventType,
						page: p,
						limit: 100,
						search: search || undefined,
						status: status || undefined,
						tagIds: tagId || undefined,
						tableId: tableId || undefined,
					})}`
				)
				all.push(...res.data)
				totalPages = res.meta.totalPages
				p++
			} while (p <= totalPages)
			await downloadGuestsExcel(all, `guests-${effectiveEventType}.xlsx`)
			toast({ title: 'Файл скачан' })
		} catch (e) {
			toast({
				title: 'Экспорт не удался',
				description: e instanceof Error ? e.message : '',
				variant: 'destructive',
			})
		}
	}

	const meta = guestsQuery.data?.meta
	const rows = guestsQuery.data?.data ?? []

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-serif text-3xl font-semibold">Управление списком гостей</h1>
					<p className="text-muted-foreground">Поиск, фильтры и массовые действия</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant="outline" onClick={exportExcel}>
						<Download className="h-4 w-4" />
						Excel
					</Button>
					<Button onClick={openCreate}>+ Добавить гостя</Button>
				</div>
			</div>

			<div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card/80 p-4">
				<div className="min-w-[200px] flex-1 space-y-1">
					<Label>Поиск</Label>
					<Input
						placeholder="Поиск гостя…"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
				</div>
				<div className="space-y-1">
					<Label>Статус</Label>
					<select
						className="flex h-10 rounded-lg border border-border bg-card px-2 text-sm"
						value={status}
						onChange={(e) => setStatus((e.target.value || '') as GuestStatus | '')}
					>
						<option value="">Все статусы</option>
						{statuses.map((s) => (
							<option key={s} value={s}>
								{guestStatusLabel(s)}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-1">
					<Label>Тег</Label>
					<select
						className="flex h-10 rounded-lg border border-border bg-card px-2 text-sm"
						value={tagId}
						onChange={(e) => setTagId(e.target.value)}
					>
						<option value="">Все теги</option>
						{(tagsQuery.data ?? []).map((t) => (
							<option key={t.id} value={t.id}>
								{t.name}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-1">
					<Label>Стол</Label>
					<select
						className="flex h-10 rounded-lg border border-border bg-card px-2 text-sm"
						value={tableId}
						onChange={(e) => setTableId(e.target.value)}
					>
						<option value="">Все столы</option>
						{(tablesQuery.data ?? []).map((t) => (
							<option key={t.id} value={t.id}>
								Стол {t.number}
							</option>
						))}
					</select>
				</div>
				<Button
					type="button"
					variant="secondary"
					onClick={() => {
						setSearch(searchInput.trim())
						setPage(1)
					}}
				>
					Применить
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						setSearchInput('')
						setSearch('')
						setStatus('')
						setTagId('')
						setTableId('')
						setPage(1)
					}}
				>
					Сбросить
				</Button>
			</div>

			{selected.size > 0 ? (
				<div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
					<span>Выбрано: {selected.size}</span>
					<Button size="sm" variant="outline" onClick={() => setBulkTagsOpen(true)}>
						Назначить теги
					</Button>
					<Button
						size="sm"
						variant="destructive"
						onClick={() => {
							if (confirm('Удалить выбранных гостей?'))
								bulkDeleteMutation.mutate(Array.from(selected))
						}}
					>
						Удалить
					</Button>
				</div>
			) : null}

			<div className="overflow-x-auto rounded-xl border border-border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-10">
								<Checkbox
									checked={rows.length > 0 && selected.size === rows.length}
									onCheckedChange={(v) => {
										if (v === true) setSelected(new Set(rows.map((r) => r.id)))
										else setSelected(new Set())
									}}
									aria-label="Выбрать всех"
								/>
							</TableHead>
							<TableHead>Гость</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead>Пара</TableHead>
							<TableHead>Стол</TableHead>
							<TableHead>Теги</TableHead>
							<TableHead>Добавлен</TableHead>
							<TableHead className="w-12" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((g) => (
							<TableRow key={g.id}>
								<TableCell>
									<Checkbox
										checked={selected.has(g.id)}
										onCheckedChange={() => toggleRow(g.id)}
										aria-label={`Выбрать ${g.fullName}`}
									/>
								</TableCell>
								<TableCell className="font-medium">{g.fullName}</TableCell>
								<TableCell>
									<Badge variant={guestStatusBadgeVariant(g.status)}>
										{guestStatusLabel(g.status)}
									</Badge>
								</TableCell>
								<TableCell className="max-w-[220px] truncate text-muted-foreground">
									{g.status === 'ATTENDING_WITH_SPOUSE' && g.partnerFullName?.trim()
										? g.partnerFullName.trim()
										: '—'}
								</TableCell>
								<TableCell>{g.table ? `Стол ${g.table.number}` : '—'}</TableCell>
								<TableCell>
									<div className="flex flex-wrap gap-1">
										{g.tags.map((t) => (
											<Badge key={t.id} variant="secondary">
												{t.name}
											</Badge>
										))}
									</div>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{new Date(g.createdAt).toLocaleDateString('ru-RU')}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" aria-label="Действия">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => openEdit(g)}>
												<Pencil className="mr-2 h-4 w-4" />
												Изменить
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => {
													if (confirm(`Удалить ${g.fullName}?`)) deleteMutation.mutate(g.id)
												}}
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Удалить
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
				<span>
					Показано {(meta?.total ?? 0) === 0 ? 0 : (page - 1) * (meta?.limit ?? 20) + 1}–
					{Math.min(page * (meta?.limit ?? 20), meta?.total ?? 0)} из {meta?.total ?? 0} гостей
				</span>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
					>
						Назад
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={!meta || page >= meta.totalPages}
						onClick={() => setPage((p) => p + 1)}
					>
						Вперёд
					</Button>
				</div>
			</div>

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Новый гость</DialogTitle>
						<DialogDescription>Заполните данные гостя для выбранного события.</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 py-2">
						<div className="space-y-1">
							<Label>ФИО</Label>
							<Input value={formFullName} onChange={(e) => setFormFullName(e.target.value)} />
						</div>
						<div className="space-y-1">
							<Label>Статус</Label>
							<select
								className="h-10 w-full rounded-lg border border-border bg-card px-2 text-sm"
								value={formStatus}
								onChange={(e) => setFormStatus(e.target.value as GuestStatus)}
							>
								{statuses.map((s) => (
									<option key={s} value={s}>
										{guestStatusLabel(s)}
									</option>
								))}
							</select>
						</div>
						{formStatus === 'ATTENDING_WITH_SPOUSE' ? (
							<div className="space-y-1">
								<Label>ФИО пары</Label>
								<Input value={formPartner} onChange={(e) => setFormPartner(e.target.value)} />
							</div>
						) : null}
						<div className="space-y-1">
							<Label>Теги</Label>
							<div className="flex max-h-32 flex-col gap-2 overflow-y-auto rounded-lg border border-border p-2">
								{(tagsQuery.data ?? []).map((t) => (
									<label key={t.id} className="flex items-center gap-2 text-sm">
										<Checkbox
											checked={formTags.has(t.id)}
											onCheckedChange={() => {
												const n = new Set(formTags)
												if (n.has(t.id)) n.delete(t.id)
												else n.add(t.id)
												setFormTags(n)
											}}
										/>
										{t.name}
									</label>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateOpen(false)}>
							Отмена
						</Button>
						<Button
							onClick={() => submitGuest('create')}
							disabled={!formFullName.trim() || createMutation.isPending}
						>
							Сохранить
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={!!editGuest} onOpenChange={(o) => !o && setEditGuest(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Редактирование</DialogTitle>
					</DialogHeader>
					<div className="space-y-3 py-2">
						<div className="space-y-1">
							<Label>ФИО</Label>
							<Input value={formFullName} onChange={(e) => setFormFullName(e.target.value)} />
						</div>
						<div className="space-y-1">
							<Label>Статус</Label>
							<select
								className="h-10 w-full rounded-lg border border-border bg-card px-2 text-sm"
								value={formStatus}
								onChange={(e) => setFormStatus(e.target.value as GuestStatus)}
							>
								{statuses.map((s) => (
									<option key={s} value={s}>
										{guestStatusLabel(s)}
									</option>
								))}
							</select>
						</div>
						{formStatus === 'ATTENDING_WITH_SPOUSE' ? (
							<div className="space-y-1">
								<Label>ФИО пары</Label>
								<Input value={formPartner} onChange={(e) => setFormPartner(e.target.value)} />
							</div>
						) : null}
						<div className="space-y-1">
							<Label>Теги</Label>
							<div className="flex max-h-32 flex-col gap-2 overflow-y-auto rounded-lg border border-border p-2">
								{(tagsQuery.data ?? []).map((t) => (
									<label key={t.id} className="flex items-center gap-2 text-sm">
										<Checkbox
											checked={formTags.has(t.id)}
											onCheckedChange={() => {
												const n = new Set(formTags)
												if (n.has(t.id)) n.delete(t.id)
												else n.add(t.id)
												setFormTags(n)
											}}
										/>
										{t.name}
									</label>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditGuest(null)}>
							Отмена
						</Button>
						<Button
							onClick={() => submitGuest('edit')}
							disabled={!formFullName.trim() || updateMutation.isPending}
						>
							Сохранить
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={bulkTagsOpen} onOpenChange={setBulkTagsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Теги для выбранных</DialogTitle>
						<DialogDescription>Текущие теги будут заменены на выбранный набор.</DialogDescription>
					</DialogHeader>
					<div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
						{(tagsQuery.data ?? []).map((t) => (
							<label key={t.id} className="flex items-center gap-2 text-sm">
								<Checkbox
									checked={bulkTagSelection.has(t.id)}
									onCheckedChange={() => {
										const n = new Set(bulkTagSelection)
										if (n.has(t.id)) n.delete(t.id)
										else n.add(t.id)
										setBulkTagSelection(n)
									}}
								/>
								{t.name}
							</label>
						))}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setBulkTagsOpen(false)}>
							Отмена
						</Button>
						<Button
							onClick={() =>
								bulkTagsMutation.mutate({
									ids: Array.from(selected),
									tagIds: Array.from(bulkTagSelection),
								})
							}
							disabled={bulkTagsMutation.isPending}
						>
							Применить
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
