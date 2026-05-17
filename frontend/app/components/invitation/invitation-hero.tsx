'use client'

import Image, { type StaticImageData } from 'next/image'
import { m } from 'motion/react'

type InvitationHeroProps = {
	title: string
	subtitleLines: string[]
	image: StaticImageData
}

export function InvitationHero({ title, subtitleLines, image }: InvitationHeroProps) {
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
						src={image}
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
							{title}
						</h1>
						{subtitleLines.map((line) => (
							<p
								key={line}
								className="mt-3 text-sm font-medium tracking-[0.35em] drop-shadow-sm sm:text-base sm:tracking-[0.4em]"
							>
								{line}
							</p>
						))}
					</div>
					<div className="invitation-torn-edge invitation-torn-edge--hero" aria-hidden />
				</div>
			</m.div>
		</section>
	)
}
