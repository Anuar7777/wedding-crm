'use client'

import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { apiJson, buildQuery } from '@/lib/crm/api'
import { useCrmEvent } from '@/lib/crm/event-context'
import type { TagEntity } from '@/lib/crm/types'
import { toast } from '@/lib/crm/toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { visibleTags } from '@/lib/crm/hidden-tags'

const palette = [
	'bg-emerald-100 text-emerald-800',
	'bg-sky-100 text-sky-800',
	'bg-violet-100 text-violet-800',
	'bg-amber-100 text-amber-900',
]

export function TagsPageClient() {
	const { effectiveEventType } = useCrmEvent()
	const qc = useQueryClient()
	const [q, setQ] = React.useState('')
	const [createOpen, setCreateOpen] = React.useState(false)
	const [editTag, setEditTag] = React.useState<TagEntity | null>(null)
	const [name, setName] = React.useState('')

	const tagsQuery = useQuery({
		queryKey: ['crm', 'tags', effectiveEventType],
		queryFn: () => apiJson<TagEntity[]>(`/api/tags${buildQuery({ type: effectiveEventType })}`),
	})

	const list = visibleTags(tagsQuery.data ?? []).filter((t) =>
		t.name.toLowerCase().includes(q.toLowerCase())
	)

	const createMutation = useMutation({
		mutationFn: () =>
			apiJson('/api/tags', {
				method: 'POST',
				body: JSON.stringify({ name: name.trim(), type: effectiveEventType }),
			}),
		onSuccess: () => {
			toast({ title: 'Тег создан' })
			setCreateOpen(false)
			setName('')
			void qc.invalidateQueries({ queryKey: ['crm', 'tags'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	const updateMutation = useMutation({
		mutationFn: () =>
			apiJson(`/api/tags/${editTag!.id}`, {
				method: 'PATCH',
				body: JSON.stringify({ name: name.trim() }),
			}),
		onSuccess: () => {
			toast({ title: 'Тег обновлён' })
			setEditTag(null)
			setName('')
			void qc.invalidateQueries({ queryKey: ['crm', 'tags'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: string) => apiJson(`/api/tags/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
			toast({ title: 'Тег удалён' })
			void qc.invalidateQueries({ queryKey: ['crm', 'tags'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-serif text-3xl font-semibold">Теги</h1>
					<p className="text-muted-foreground">Категории гостей для выбранного события</p>
				</div>
				<Button
					onClick={() => {
						setName('')
						setCreateOpen(true)
					}}
				>
					<Plus className="h-4 w-4" /> Добавить тег
				</Button>
			</div>
			<div className="max-w-md space-y-1">
				<Label>Поиск</Label>
				<Input placeholder="Поиск тега…" value={q} onChange={(e) => setQ(e.target.value)} />
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{list.map((t, i) => (
					<Card key={t.id}>
						<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
							<div
								className={cn(
									'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold',
									palette[i % palette.length]
								)}
							>
								#
							</div>
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="icon"
									aria-label="Редактировать"
									onClick={() => {
										setEditTag(t)
										setName(t.name)
									}}
								>
									<Pencil className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Удалить"
									onClick={() => {
										if (confirm(`Удалить тег «${t.name}»?`)) deleteMutation.mutate(t.id)
									}}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<p className="font-serif text-xl font-semibold">{t.name}</p>
							<p className="mt-2 text-sm text-muted-foreground">{t._count?.guests ?? 0} гостей</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Новый тег</DialogTitle>
					</DialogHeader>
					<div className="space-y-2">
						<Label>Название</Label>
						<Input value={name} onChange={(e) => setName(e.target.value)} />
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateOpen(false)}>
							Отмена
						</Button>
						<Button
							disabled={!name.trim() || createMutation.isPending}
							onClick={() => createMutation.mutate()}
						>
							Создать
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={!!editTag} onOpenChange={(o) => !o && setEditTag(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Редактировать тег</DialogTitle>
					</DialogHeader>
					<div className="space-y-2">
						<Label>Название</Label>
						<Input value={name} onChange={(e) => setName(e.target.value)} />
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditTag(null)}>
							Отмена
						</Button>
						<Button
							disabled={!name.trim() || updateMutation.isPending}
							onClick={() => updateMutation.mutate()}
						>
							Сохранить
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
