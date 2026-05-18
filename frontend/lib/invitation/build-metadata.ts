import type { Metadata } from 'next'
import type { HeroImageKey } from './assets'
import type { InvitationEventConfig } from './types'

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** Public JPG paths for OG/Telegram/WhatsApp (WebP is not supported in link previews). */
const OG_HERO_IMAGES: Record<HeroImageKey, { path: string; width: number; height: number }> = {
	heroInvitation: {
		path: '/images/invitation/hero_invitation.jpg',
		width: 923,
		height: 1152,
	},
	heroWedding: {
		path: '/images/wedding/hero_wedding.jpg',
		width: 896,
		height: 1194,
	},
}

export function buildEventMetadata(config: InvitationEventConfig): Metadata {
	const og = OG_HERO_IMAGES[config.metadata.ogImageKey]
	const imageUrl = `${site}${og.path}`
	const pageUrl = `${site}${config.routePath}`

	return {
		metadataBase: new URL(site),
		title: config.metadata.title,
		description: config.metadata.description,
		openGraph: {
			title: config.metadata.title,
			description: config.metadata.description,
			url: pageUrl,
			type: 'website',
			locale: 'kk_KZ',
			images: [
				{
					url: imageUrl,
					width: og.width,
					height: og.height,
					type: 'image/jpeg',
					alt: config.metadata.title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: config.metadata.title,
			description: config.metadata.twitterDescription ?? config.metadata.description,
			images: [imageUrl],
		},
	}
}
