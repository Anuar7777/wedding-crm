'use client'

import * as React from 'react'
import { useClientMounted } from '@/lib/use-client-mounted'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { EventType } from '@/lib/crm/types'

function resolveInvitePath(type: EventType): string {
	const wedding = process.env.NEXT_PUBLIC_INVITE_URL_WEDDING
	const bride = process.env.NEXT_PUBLIC_INVITE_URL_BRIDE
	if (type === 'WEDDING' && wedding?.trim()) return wedding.trim()
	if (type === 'BRIDE_FAREWELL' && bride?.trim()) return bride.trim()
	return type === 'WEDDING' ? '/wedding' : '/invitation'
}

function toAbsolute(urlOrPath: string): string {
	if (urlOrPath.startsWith('http')) return urlOrPath
	if (typeof window === 'undefined') return urlOrPath
	return `${window.location.origin}${urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`}`
}

export function InvitationsPageClient() {
	const [qrSrc, setQrSrc] = React.useState<Record<EventType, string | null>>({
		BRIDE_FAREWELL: null,
		WEDDING: null,
	})
	const mounted = useClientMounted()

	React.useEffect(() => {
		if (!mounted) return
		let cancelled = false
		void (async () => {
			const QR = await import('qrcode')
			const types: EventType[] = ['WEDDING', 'BRIDE_FAREWELL']
			const entries = await Promise.all(
				types.map(async (t) => {
					const abs = toAbsolute(resolveInvitePath(t))
					try {
						return [t, await QR.toDataURL(abs, { margin: 1, width: 220 })] as const
					} catch {
						return [t, null] as const
					}
				})
			)
			const next = Object.fromEntries(entries) as Record<EventType, string | null>
			if (!cancelled) setQrSrc(next)
		})()
		return () => {
			cancelled = true
		}
	}, [mounted])

	if (!mounted) {
		return <p className="text-muted-foreground">Загрузка…</p>
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-serif text-3xl font-semibold">Приглашения</h1>
				<p className="text-muted-foreground">Публичные ссылки и QR-коды для гостей</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{(['WEDDING', 'BRIDE_FAREWELL'] as const).map((t) => {
					const label = t === 'WEDDING' ? 'Той' : 'Қыз ұзату'
					const abs = toAbsolute(resolveInvitePath(t))
					return (
						<Card key={t}>
							<CardHeader>
								<CardTitle className="font-serif text-xl">{label}</CardTitle>
								<CardDescription>Скопируйте ссылку или сохраните QR</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="break-all rounded-lg border border-border bg-muted/40 p-2 text-sm">
									{abs}
								</div>
								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										variant="secondary"
										onClick={() => void navigator.clipboard.writeText(abs)}
									>
										Копировать ссылку
									</Button>
									{qrSrc[t] ? (
										<a href={qrSrc[t]!} download={`qr-${t}.png`}>
											<Button type="button" variant="outline">
												Скачать QR
											</Button>
										</a>
									) : null}
								</div>
								{qrSrc[t] ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={qrSrc[t]!}
										alt={`QR ${label}`}
										className="mx-auto mt-2 rounded-lg border border-border bg-white p-2"
									/>
								) : (
									<p className="text-center text-sm text-muted-foreground">Генерация QR…</p>
								)}
							</CardContent>
						</Card>
					)
				})}
			</div>
		</div>
	)
}
