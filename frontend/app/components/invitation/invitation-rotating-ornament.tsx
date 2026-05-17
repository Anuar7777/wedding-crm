import Image from 'next/image'

type InvitationRotatingOrnamentProps = {
	className?: string
}

export function InvitationRotatingOrnament({ className }: InvitationRotatingOrnamentProps) {
	return (
		<div
			className={`relative overflow-x-clip bg-background py-5 md:py-6 ${className ?? ''}`}
			aria-hidden
		>
			<div className="pointer-events-none absolute top-1/2 right-0 z-0 w-[min(72vw,320px)] translate-x-1/2 -translate-y-1/2">
				<div className="invitation-ornament-spin">
					<Image
						src="/invitation/thread_rotating_red.webp"
						alt=""
						width={400}
						height={400}
						className="h-auto w-full"
					/>
				</div>
			</div>
		</div>
	)
}
