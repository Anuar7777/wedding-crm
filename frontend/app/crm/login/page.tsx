import { Suspense } from 'react'
import { CrmLoginForm } from './login-form'

export default function CrmLoginPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center text-muted-foreground">
					Загрузка…
				</div>
			}
		>
			<CrmLoginForm />
		</Suspense>
	)
}
