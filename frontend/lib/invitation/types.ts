import type { StaticImageData } from 'next/image'
import type { EventType } from '@/lib/guests-api'
import type { HeroImageKey } from './assets'

export type InvitationEventConfigJson = {
	id: EventType
	routePath: '/invitation' | '/wedding'
	metadata: {
		title: string
		description: string
		ogImageKey: HeroImageKey
		twitterDescription?: string
	}
	hero: {
		title: string
		subtitleLines: string[]
		imageKey: HeroImageKey
	}
	greeting: {
		heading: string
		guestList: string
		body?: string
		bodyBeforeHighlight?: string
		highlightName?: string
		bodyAfterHighlight?: string
	}
	calendar: {
		monthLabel: string
		yearLabel: string
		firstDayOfMonth: number
		daysInMonth: number
		highlightedDay: number
		weekdayLabel: string
		timeLabel: string
	}
	countdown: {
		targetIso: string
	}
	venue: {
		name: string
		address: string
		latitude: number
		longitude: number
		mapTitle: string
		gisUrl: string
	}
	hosts: {
		label: string
		names: string
	}
	rsvp: {
		sectionTitle: string
	}
	closing: {
		title: string
	}
	audioSrc: string
	sections?: {
		showDressCode?: boolean
	}
}

export type InvitationEventConfig = InvitationEventConfigJson & {
	heroImage: StaticImageData
	ogImage: StaticImageData
}

export type FadeInMotionProps = {
	initial: { opacity: number; y: number }
	whileInView: { opacity: number; y: number }
	viewport: { once: boolean; margin: string }
	transition: { duration: number; ease: 'easeOut' }
}
