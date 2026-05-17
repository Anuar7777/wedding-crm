'use client'

import { LazyMotion, domAnimation, m } from 'motion/react'
import dynamic from 'next/dynamic'
import { DressCodeSection } from '@/app/components/invitation/dress-code-section'
import { InvitationAudioPlayer } from '@/app/components/invitation/invitation-audio-player'
import { InvitationCalendarIntro } from '@/app/components/invitation/invitation-calendar-intro'
import { InvitationChapterDivider } from '@/app/components/invitation/invitation-chapter-divider'
import { InvitationClosingSection } from '@/app/components/invitation/invitation-closing-section'
import { InvitationGreeting } from '@/app/components/invitation/invitation-greeting'
import { InvitationHero } from '@/app/components/invitation/invitation-hero'
import { InvitationHostsSection } from '@/app/components/invitation/invitation-hosts-section'
import { InvitationRotatingOrnament } from '@/app/components/invitation/invitation-rotating-ornament'
import { InvitationVenueSection } from '@/app/components/invitation/invitation-venue-section'
import { RSVPForm } from '@/app/components/invitation/rsvp-form'
import { SectionTitle } from '@/app/components/invitation/section-title'
import { invitationImages } from '@/lib/invitation/assets'
import type { FadeInMotionProps, InvitationEventConfig } from '@/lib/invitation/types'

const Countdown = dynamic(
	() => import('@/app/components/invitation/countdown').then((mod) => mod.Countdown),
	{ ssr: false }
)

const fadeIn: FadeInMotionProps = {
	initial: { opacity: 0, y: 30 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: '-100px' },
	transition: { duration: 0.8, ease: 'easeOut' },
}

const rsvpButtonClassName =
	'invitation-btn ui-focus w-full py-4 disabled:cursor-not-allowed disabled:opacity-60'

type EventInvitationPageProps = {
	config: InvitationEventConfig
}

export function EventInvitationPage({ config }: EventInvitationPageProps) {
	const showDressCode = config.sections?.showDressCode !== false

	return (
		<LazyMotion features={domAnimation}>
			<div className="invitation-page min-h-screen bg-background text-foreground">
				<InvitationHero
					title={config.hero.title}
					subtitleLines={config.hero.subtitleLines}
					image={config.heroImage}
				/>
				<InvitationChapterDivider />
				<InvitationGreeting fadeIn={fadeIn} greeting={config.greeting} />
				<InvitationCalendarIntro fadeIn={fadeIn} calendar={config.calendar} />

				<section className="relative overflow-hidden from-background via-[#f4ece2] to-secondary px-6 py-12 md:py-14">
					<m.div className="relative z-10 mx-auto max-w-4xl text-center" {...fadeIn}>
						<SectionTitle title="Той салтанатына дейін" />
						<Countdown targetIso={config.countdown.targetIso} />
					</m.div>
				</section>

				<InvitationRotatingOrnament />
				<InvitationVenueSection fadeIn={fadeIn} venue={config.venue} />
				<InvitationChapterDivider withTornEdge={false} />

				{showDressCode ? <DressCodeSection fadeIn={fadeIn} /> : null}

				<InvitationHostsSection
					fadeIn={fadeIn}
					hosts={config.hosts}
					backgroundImage={invitationImages.ownersBackground}
				/>

				<section className="relative overflow-hidden px-6 py-12 md:py-14">
					<m.div className="relative z-10 mx-auto max-w-2xl" {...fadeIn}>
						<SectionTitle title={config.rsvp.sectionTitle} />
						<RSVPForm eventType={config.id} submitButtonClassName={rsvpButtonClassName} />
					</m.div>
				</section>

				<InvitationClosingSection
					title={config.closing.title}
					birdsImage={invitationImages.birds}
				/>
				<InvitationAudioPlayer src={config.audioSrc} />
			</div>
		</LazyMotion>
	)
}
