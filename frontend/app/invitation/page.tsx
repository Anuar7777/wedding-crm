import type { Metadata } from 'next'
import { InvitationPageClient } from './invitation-page-client'

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
	metadataBase: new URL(site),
	title: 'Қыз ұзату — шақыру (тест)',
	description: 'Цифрлық шақыру және RSVP (тесттік Open Graph).',
	openGraph: {
		title: 'Қыз ұзату — шақыру (тест)',
		description: 'Цифрлық шақыру және RSVP (тесттік Open Graph).',
		url: '/invitation',
		type: 'website',
		locale: 'kk_KZ',
		images: [{ url: '/invitation/birds.webp', width: 1000, height: 1000, alt: 'Шақыру' }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Қыз ұзату — шақыру (тест)',
		description: 'Цифрлық шақыру және RSVP (тесттік Open Graph).',
		images: ['/invitation/birds.webp'],
	},
}

export default function InvitationRoute() {
	return <InvitationPageClient />
}
