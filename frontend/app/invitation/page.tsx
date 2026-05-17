import type { Metadata } from 'next'
import { InvitationPageClient } from './invitation-page-client'

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const imageUrl = `${site}/invitation/birds.webp`

export const metadata: Metadata = {
	metadataBase: new URL(site),
	title: 'Қарақат & Қыз ұзату тойы',
	description: 'Қарақат & Қыз ұзату тойына шақыру',
	openGraph: {
		title: 'Қарақат & Қыз ұзату тойы',
		description: 'Қарақат & Қыз ұзату тойына шақыру',
		url: `${site}/invitation`,
		type: 'website',
		locale: 'kk_KZ',
		images: [
			{
				url: imageUrl,
				width: 1000,
				height: 1000,
				alt: 'Шақыру',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Қарақат & Қыз ұзату тойы',
		description: 'Цифрлық шақыру және RSVP (тесттік Open Graph).',
		images: [imageUrl],
	},
}

export default function InvitationRoute() {
	return <InvitationPageClient />
}
