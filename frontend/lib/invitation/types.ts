import type { StaticImageData } from 'next/image'
import type { EventType } from '@/lib/guests-api'
import type { HeroImageKey } from './assets'

export type DressCodeSide = {
	icon: 'tuxedo' | 'dress'
	label: string
	lines: string[]
}

export type DressCodePaletteConfig = {
	layout: 'palette'
	title: string
	lead: string
	titleVariant?: 'latin' | 'cyrillic'
	colors?: string[]
}

export type DressCodeAttireConfig = {
	layout: 'attire'
	title?: string
	titleImage?: boolean
	titleVariant?: 'latin' | 'cyrillic'
	sides: DressCodeSide[]
}

export type DressCodeConfig = DressCodePaletteConfig | DressCodeAttireConfig

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
		highlightNames?: string[]
		highlightSeparator?: string
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
		mapOpenLabel?: string
		gisUrl: string
	}
	hosts: {
		label: string
		nameParts: Array<{
			text: string
			nowrap?: boolean
		}>
	}
	rsvp: {
		sectionTitle: string
		showHalalBadge?: boolean
	}
	closing: {
		title: string
	}
	audioSrc: string
	dressCode?: DressCodeConfig
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
