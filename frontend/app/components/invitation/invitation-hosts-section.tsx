'use client'

import Image, { type StaticImageData } from 'next/image'
import { m } from 'motion/react'
import type { FadeInMotionProps, InvitationEventConfig } from '@/lib/invitation/types'

type InvitationHostsSectionProps = {
	fadeIn: FadeInMotionProps
	hosts: InvitationEventConfig['hosts']
	backgroundImage: StaticImageData
}

export function InvitationHostsSection({
	fadeIn,
	hosts,
	backgroundImage,
}: InvitationHostsSectionProps) {
	return (
		<section className="relative w-full overflow-hidden">
			<m.div className="relative w-full" {...fadeIn}>
				<Image
					src={backgroundImage}
					alt=""
					width={1414}
					height={3000}
					className="block h-auto w-full max-w-none"
					sizes="100vw"
				/>
				<div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white sm:px-8">
					<p className="mb-3 font-serif text-xl font-semibold tracking-[0.2em] uppercase md:text-2xl">
						{hosts.label}
					</p>
					<p className="invitation-title text-3xl md:text-5xl">{hosts.names}</p>
				</div>
			</m.div>
		</section>
	)
}
