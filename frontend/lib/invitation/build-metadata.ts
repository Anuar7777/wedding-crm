import type { Metadata } from 'next'
import type { InvitationEventConfig } from './types'

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export function buildEventMetadata(config: InvitationEventConfig): Metadata {
	const ogImagePath =
		typeof config.ogImage.src === 'string'
			? config.ogImage.src
			: '/images/invitation/hero_invitation.webp'
	const imageUrl = ogImagePath.startsWith('http') ? ogImagePath : `${site}${ogImagePath}`
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
					width: config.ogImage.width,
					height: config.ogImage.height,
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
