'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { logoutCrm } from '@/lib/crm/api'
import { useCrmTheme } from '@/lib/crm/event-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function SettingsPageClient() {
	const router = useRouter()
	const { theme, setTheme } = useCrmTheme()

	return (
		<div className="mx-auto max-w-lg space-y-6">
			<div>
				<h1 className="font-serif text-3xl font-semibold">Настройки</h1>
				<p className="text-muted-foreground">Тема и выход из CRM</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="font-serif text-lg">Оформление</CardTitle>
					<CardDescription>Светлая или тёмная тема в зоне CRM</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<Label className="w-full">Тема</Label>
						<Button
							type="button"
							variant={theme === 'light' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setTheme('light')}
						>
							Светлая
						</Button>
						<Button
							type="button"
							variant={theme === 'dark' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setTheme('dark')}
						>
							Тёмная
						</Button>
					</div>
					<Separator />
					<Button
						variant="destructive"
						className="w-full"
						type="button"
						onClick={() => {
							void (async () => {
								await logoutCrm()
								router.replace('/crm/login')
							})()
						}}
					>
						Выйти
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
