'use client'

import Image, { type StaticImageData } from 'next/image'

type InvitationClosingSectionProps = {
	title: string
	birdsImage: StaticImageData
}

export function InvitationClosingSection({ title, birdsImage }: InvitationClosingSectionProps) {
	return (
		<section className="relative overflow-hidden px-6 pb-12 pt-8 md:pb-14 md:pt-10">
			<h3 className="invitation-title mb-6 text-center text-4xl leading-relaxed text-luxury-gold md:text-5xl">
				{title}
			</h3>
			<Image src={birdsImage} alt="" width={1000} height={1000} className="h-auto w-full" />
		</section>
	)
}
