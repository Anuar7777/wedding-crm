'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useClientMounted } from '@/lib/use-client-mounted'

export type ToastVariant = 'default' | 'destructive'

type ToastItem = {
	id: string
	title: string
	description?: string
	variant?: ToastVariant
}

let memory: ToastItem[] = []
const listeners = new Set<() => void>()

function notify() {
	listeners.forEach((l) => l())
}

export function toast(opts: Omit<ToastItem, 'id'>) {
	const id =
		typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
	memory = [...memory, { ...opts, id }]
	notify()
	window.setTimeout(() => {
		memory = memory.filter((t) => t.id !== id)
		notify()
	}, 4500)
	return id
}

function subscribe(cb: () => void) {
	listeners.add(cb)
	return () => {
		listeners.delete(cb)
	}
}

function getSnapshot() {
	return memory
}

function getServerSnapshot() {
	return [] as ToastItem[]
}

export function Toaster() {
	const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
	const mounted = useClientMounted()

	if (!mounted) return null

	return createPortal(
		<div className="fixed bottom-4 right-4 z-[100] flex w-[min(100vw-2rem,22rem)] flex-col gap-2">
			{list.map((t) => (
				<div
					key={t.id}
					role="status"
					className={cn(
						'rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-lg',
						t.variant === 'destructive' &&
							'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100'
					)}
				>
					<p className="font-medium">{t.title}</p>
					{t.description ? (
						<p className="mt-1 text-muted-foreground text-xs">{t.description}</p>
					) : null}
				</div>
			))}
		</div>,
		document.body
	)
}
