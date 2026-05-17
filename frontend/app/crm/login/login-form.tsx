'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { apiJson, setTokens } from '@/lib/crm/api'
import { toast } from '@/lib/crm/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
})

export function CrmLoginForm() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center text-muted-foreground">
					Загрузка…
				</div>
			}
		>
			<CrmLoginFormInner />
		</Suspense>
	)
}

function CrmLoginFormInner() {
	const { replace } = useRouter()
	const { get } = useSearchParams()
	const next = get('next') || '/crm/home'
	const [email, setEmail] = React.useState('')
	const [password, setPassword] = React.useState('')
	const [loading, setLoading] = React.useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		const parsed = schema.safeParse({ email, password })
		if (!parsed.success) {
			toast({ title: 'Проверьте поля', variant: 'destructive' })
			return
		}
		setLoading(true)
		try {
			const tokens = await apiJson<{ accessToken: string; refreshToken: string }>(
				'/api/auth/login',
				{
					method: 'POST',
					body: JSON.stringify(parsed.data),
					skipAuth: true,
				}
			)
			setTokens(tokens.accessToken, tokens.refreshToken)
			toast({ title: 'Добро пожаловать' })
			replace(next)
		} catch (err) {
			toast({
				title: 'Ошибка входа',
				description: err instanceof Error ? err.message : 'Не удалось войти',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="font-serif text-2xl">Event CRM</CardTitle>
					<CardDescription>Войдите, чтобы управлять гостями и приглашениями</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								autoComplete="username"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Пароль</Label>
							<Input
								id="password"
								type="password"
								autoComplete="current-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? 'Вход…' : 'Войти'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
