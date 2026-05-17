'use client'

import { MapPin } from 'lucide-react'
import { m } from 'motion/react'
import { MapEmbed } from '@/app/components/invitation/map-embed'
import { SectionTitle } from '@/app/components/invitation/section-title'
import type { FadeInMotionProps, InvitationEventConfig } from '@/lib/invitation/types'

const invitationButtonClass =
	'invitation-btn ui-focus mt-8 w-full gap-2 px-7 py-4 sm:w-auto sm:px-8'

type InvitationVenueSectionProps = {
	fadeIn: FadeInMotionProps
	venue: InvitationEventConfig['venue']
}

export function InvitationVenueSection({ fadeIn, venue }: InvitationVenueSectionProps) {
	return (
		<section className="relative overflow-hidden px-6 py-10 md:py-12">
			<m.div className="relative z-10 mx-auto max-w-4xl text-center" {...fadeIn}>
				<SectionTitle title="Мекен-жайы" />
				<div className="linen-surface luxury-card space-y-6 p-6 sm:p-7 md:p-10">
					<p
						className="invitation-title text-3xl md:text-4xl"
						style={{ color: 'var(--terracotta)' }}
					>
						{venue.name}
					</p>
					<p className="text-lg opacity-70 md:text-xl">{venue.address}</p>
					<MapEmbed longitude={venue.longitude} latitude={venue.latitude} title={venue.mapTitle} />
					<button
						type="button"
						onClick={() => window.open(venue.gisUrl, '_blank')}
						className={invitationButtonClass}
					>
						<MapPin className="h-5 w-5" />
						<span>2GIS арқылы ашу</span>
					</button>
				</div>
			</m.div>
		</section>
	)
}
