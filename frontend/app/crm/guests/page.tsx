import { Suspense } from 'react'
import { GuestsPageClient } from './guests-page-client'

export default function Page() {
	return (
		<Suspense fallback={<div className="text-muted-foreground">Загрузка…</div>}>
			<GuestsPageClient />
		</Suspense>
	)
}
