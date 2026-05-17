'use client'

import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { apiJson } from '@/lib/crm/api'
import { useCrmEvent } from '@/lib/crm/event-context'
import type { EventType, UserEntity, UserRole } from '@/lib/crm/types'
import { toast } from '@/lib/crm/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

export function UsersPageClient() {
	const { me } = useCrmEvent()
	const qc = useQueryClient()
	const [createOpen, setCreateOpen] = React.useState(false)
	const [resetUser, setResetUser] = React.useState<UserEntity | null>(null)
	const [email, setEmail] = React.useState('')
	const [password, setPassword] = React.useState('')
	const [role, setRole] = React.useState<UserRole>('ADMIN')
	const [scope, setScope] = React.useState<EventType | ''>('')
	const [newPassword, setNewPassword] = React.useState('')

	const usersQuery = useQuery({
		queryKey: ['crm', 'users'],
		queryFn: () => apiJson<UserEntity[]>('/api/users'),
		enabled: me?.role === 'SUPERADMIN',
	})

	const createMutation = useMutation({
		mutationFn: () =>
			apiJson('/api/users', {
				method: 'POST',
				body: JSON.stringify({
					email: email.trim(),
					password,
					role,
					scope: scope || undefined,
				}),
			}),
		onSuccess: () => {
			toast({ title: 'Пользователь создан' })
			setCreateOpen(false)
			setEmail('')
			setPassword('')
			setRole('ADMIN')
			setScope('')
			void qc.invalidateQueries({ queryKey: ['crm', 'users'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	const resetMutation = useMutation({
		mutationFn: () =>
			apiJson(`/api/users/${resetUser!.id}/reset-password`, {
				method: 'POST',
				body: JSON.stringify({ newPassword }),
			}),
		onSuccess: () => {
			toast({ title: 'Пароль обновлён' })
			setResetUser(null)
			setNewPassword('')
			void qc.invalidateQueries({ queryKey: ['crm', 'users'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: string) => apiJson(`/api/users/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
			toast({ title: 'Пользователь удалён' })
			void qc.invalidateQueries({ queryKey: ['crm', 'users'] })
		},
		onError: (e: Error) =>
			toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }),
	})

	async function openResetPassword(u: UserEntity) {
		setResetUser(u)
		setNewPassword('')
		try {
			const d = await apiJson<{ defaultPassword: string | null }>(
				'/api/users/reset-password-default'
			)
			if (d.defaultPassword && d.defaultPassword.length >= 6) {
				setNewPassword(d.defaultPassword)
			}
		} catch {
			// optional env not set or network
		}
	}

	if (me?.role !== 'SUPERADMIN') {
		return <p className="text-muted-foreground">Раздел доступен только суперадминистратору.</p>
	}

	const rows = usersQuery.data ?? []

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="font-serif text-3xl font-semibold">Пользователи</h1>
					<p className="text-muted-foreground">Администраторы и область события</p>
				</div>
				<Button onClick={() => setCreateOpen(true)}>+ Создать</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="font-serif text-lg">Список</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Роль</TableHead>
								<TableHead>Область</TableHead>
								<TableHead className="w-[5.5rem] text-right">Действия</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((u) => (
								<TableRow key={u.id}>
									<TableCell className="font-medium">{u.email}</TableCell>
									<TableCell>{u.role}</TableCell>
									<TableCell>{u.scope ?? 'Все'}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-1">
											<Button
												size="icon"
												variant="ghost"
												type="button"
												aria-label={`Сбросить пароль: ${u.email}`}
												onClick={() => void openResetPassword(u)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												size="icon"
												variant="ghost"
												type="button"
												className="text-destructive hover:bg-destructive/10 hover:text-destructive"
												disabled={u.id === me.id}
												aria-label={`Удалить ${u.email}`}
												onClick={() => {
													if (confirm(`Удалить ${u.email}?`)) deleteMutation.mutate(u.id)
												}}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Новый пользователь</DialogTitle>
					</DialogHeader>
					<div className="space-y-3">
						<div className="space-y-1">
							<Label>Email</Label>
							<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div className="space-y-1">
							<Label>Пароль</Label>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<div className="space-y-1">
							<Label>Роль</Label>
							<select
								className="h-10 w-full rounded-lg border border-border bg-card px-2 text-sm"
								value={role}
								onChange={(e) => setRole(e.target.value as UserRole)}
							>
								<option value="ADMIN">ADMIN</option>
								<option value="SUPERADMIN">SUPERADMIN</option>
							</select>
						</div>
						<div className="space-y-1">
							<Label>Область (пусто = все)</Label>
							<select
								className="h-10 w-full rounded-lg border border-border bg-card px-2 text-sm"
								value={scope}
								onChange={(e) => setScope((e.target.value || '') as EventType | '')}
							>
								<option value="">Все события</option>
								<option value="WEDDING">WEDDING</option>
								<option value="BRIDE_FAREWELL">BRIDE_FAREWELL</option>
							</select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateOpen(false)}>
							Отмена
						</Button>
						<Button
							disabled={!email || password.length < 6 || createMutation.isPending}
							onClick={() => createMutation.mutate()}
						>
							Создать
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!resetUser}
				onOpenChange={(o) => {
					if (!o) {
						setResetUser(null)
						setNewPassword('')
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Сброс пароля</DialogTitle>
					</DialogHeader>
					<div className="space-y-2">
						<Label>Новый пароль</Label>
						<Input
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setResetUser(null)}>
							Отмена
						</Button>
						<Button
							disabled={newPassword.length < 6 || resetMutation.isPending}
							onClick={() => resetMutation.mutate()}
						>
							Сохранить
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
