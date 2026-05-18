import type { Metadata } from 'next'
import type { HeroImageKey } from './assets'
import type { InvitationEventConfig } from './types'

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** OG preview images (Telegram/WhatsApp). Google Drive direct view URLs. */
const OG_HERO_IMAGES: Record<HeroImageKey, { url: string; width: number; height: number }> = {
	heroInvitation: {
		url: 'https://drive.google.com/uc?export=view&id=1GJWMGmGgbvdYOCuGZZ8NIn1J3_k1N-2U',
		width: 923,
		height: 1152,
	},
	heroWedding: {
		url: 'https://drive.google.com/uc?export=view&id=1mpwF_h8fMCl_IF3vuoA5vPU_oj2ed-6d',
		width: 896,
		height: 1194,
	},
}

function resolveOgImageUrl(url: string): string {
	return url.startsWith('http') ? url : `${site}${url}`
}

export function buildEventMetadata(config: InvitationEventConfig): Metadata {
	const og = OG_HERO_IMAGES[config.metadata.ogImageKey]
	const imageUrl = resolveOgImageUrl(og.url)
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
