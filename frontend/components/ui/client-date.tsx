'use client'

import { useClientMounted } from '@/lib/use-client-mounted'

export function ClientDate({ value }: { value: string }) {
	const mounted = useClientMounted()

	if (!mounted) return <>-</>

	return <span suppressHydrationWarning>{new Date(value).toLocaleDateString('ru-RU')}</span>
}
