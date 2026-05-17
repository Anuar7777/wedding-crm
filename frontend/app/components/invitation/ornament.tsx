type OrnamentProps = {
	compact?: boolean
}

export function Ornament({ compact = false }: OrnamentProps) {
	return (
		<div className={`flex items-center justify-center gap-4 ${compact ? 'my-4' : 'my-8'}`}>
			<div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--gold)]" />
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
				<path
					d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
					fill="var(--gold)"
					opacity="0.6"
				/>
			</svg>
			<div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--gold)]" />
		</div>
	)
}
