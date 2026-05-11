import { Suspense } from 'react'
import { HomePageClient } from './home-page-client'

export default function Page() {
	return (
		<Suspense fallback={<div className="text-muted-foreground">Загрузка…</div>}>
			<HomePageClient />
		</Suspense>
	)
}
