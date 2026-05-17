'use client'

import Image from 'next/image'
import { m } from 'motion/react'

const heroImage = '/images/invitation/hero_invitation.webp'

export function InvitationHero() {
	return (
		<section className="relative bg-background">
			<m.div
				className="relative mx-auto w-full max-w-lg"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, ease: 'easeOut' }}
			>
				<div className="invitation-hero-frame relative aspect-923/1152 w-full overflow-visible">
					<Image
						src={heroImage}
						alt=""
						fill
						priority
						sizes="(max-width: 512px) 100vw, 512px"
						className="object-cover object-center"
					/>
					<div
						className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/30"
						aria-hidden
					/>
					<div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center text-white">
						<h1 className="invitation-title text-5xl drop-shadow-md sm:text-6xl md:text-7xl">
							Қарақат
						</h1>
						<p className="mt-3 text-sm font-medium tracking-[0.35em] drop-shadow-sm sm:text-base sm:tracking-[0.4em]">
							СЫРҒА САЛУ
						</p>
						<p className="mt-3 text-sm font-medium tracking-[0.35em] drop-shadow-sm sm:text-base sm:tracking-[0.4em]">
							ҚЫЗ ҰЗАТУ
						</p>
					</div>
					<div className="invitation-torn-edge invitation-torn-edge--hero" aria-hidden />
				</div>
			</m.div>
		</section>
	)
}
