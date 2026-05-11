import Link from 'next/link'

export default function Home() {
	return (
		<div className="flex min-h-screen items-center justify-center px-6">
			<main className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-white p-10 text-center shadow-sm">
				<h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
					Wedding CRM Frontend
				</h1>
				<p className="mt-4 opacity-80">Invitation дизайн внедрен на отдельный маршрут.</p>
				<Link
					href="/invitation"
					className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-white transition-opacity hover:opacity-90"
				>
					Открыть приглашение5
				</Link>
			</main>
		</div>
	)
}
