import { z } from 'zod'
import type { InvitationEventConfig, InvitationEventConfigJson } from './types'
import { resolveHeroImage } from './assets'

const heroImageKeySchema = z.enum(['heroInvitation', 'heroWedding'])

const invitationEventConfigSchema = z.object({
	id: z.enum(['BRIDE_FAREWELL', 'WEDDING']),
	routePath: z.enum(['/invitation', '/wedding']),
	metadata: z.object({
		title: z.string().min(1),
		description: z.string().min(1),
		ogImageKey: heroImageKeySchema,
		twitterDescription: z.string().optional(),
	}),
	hero: z.object({
		title: z.string().min(1),
		subtitleLines: z.array(z.string()),
		imageKey: heroImageKeySchema,
	}),
	greeting: z.object({
		heading: z.string().min(1),
		guestList: z.string().min(1),
		body: z.string().optional(),
		bodyBeforeHighlight: z.string().optional(),
		highlightName: z.string().optional(),
		bodyAfterHighlight: z.string().optional(),
	}),
	calendar: z.object({
		monthLabel: z.string().min(1),
		yearLabel: z.string().min(1),
		firstDayOfMonth: z.number().int().min(0).max(6),
		daysInMonth: z.number().int().min(28).max(31),
		highlightedDay: z.number().int().min(1).max(31),
		weekdayLabel: z.string().min(1),
		timeLabel: z.string().min(1),
	}),
	countdown: z.object({
		targetIso: z.string().min(1),
	}),
	venue: z.object({
		name: z.string().min(1),
		address: z.string().min(1),
		latitude: z.number(),
		longitude: z.number(),
		mapTitle: z.string().min(1),
		mapOpenLabel: z.string().min(1).optional(),
		gisUrl: z.string().url(),
	}),
	hosts: z.object({
		label: z.string().min(1),
		nameParts: z.array(
			z.object({
				text: z.string(),
				nowrap: z.boolean().optional(),
			})
		),
	}),
	rsvp: z.object({
		sectionTitle: z.string().min(1),
		showHalalBadge: z.boolean().optional(),
	}),
	closing: z.object({
		title: z.string().min(1),
	}),
	audioSrc: z.string().min(1),
	dressCode: z
		.discriminatedUnion('layout', [
			z.object({
				layout: z.literal('palette'),
				title: z.string().min(1),
				lead: z.string().min(1),
				titleVariant: z.enum(['latin', 'cyrillic']).optional(),
				colors: z.array(z.string()).optional(),
			}),
			z.object({
				layout: z.literal('attire'),
				title: z.string().min(1).optional(),
				titleImage: z.boolean().optional(),
				titleVariant: z.enum(['latin', 'cyrillic']).optional(),
				sides: z
					.array(
						z.object({
							icon: z.enum(['tuxedo', 'dress']),
							label: z.string().min(1),
							lines: z.array(z.string().min(1)).min(1),
						})
					)
					.min(2),
			}),
		])
		.optional(),
	sections: z
		.object({
			showDressCode: z.boolean().optional(),
		})
		.optional(),
})

export function parseInvitationEventConfig(raw: unknown): InvitationEventConfigJson {
	return invitationEventConfigSchema.parse(raw)
}

export function enrichInvitationEventConfig(
	json: InvitationEventConfigJson
): InvitationEventConfig {
	const heroImage = resolveHeroImage(json.hero.imageKey)
	const ogImage = resolveHeroImage(json.metadata.ogImageKey)

	return {
		...json,
		heroImage,
		ogImage,
	}
}
