import type { Metadata } from 'next'
import { InvitationPageClient } from './wedding-page-client'

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
	metadataBase: new URL(site),
	title: 'Үйлену тойы — шақыру (тест)',
	description: 'Үйлену тойына цифрлық шақыру және RSVP (тесттік Open Graph).',
	openGraph: {
		title: 'Үйлену тойы — шақыру (тест)',
		description: 'Үйлену тойына цифрлық шақыру және RSVP (тесттік Open Graph).',
		url: '/wedding',
		type: 'website',
		locale: 'kk_KZ',
		images: [{ url: '/invitation/wedding.webp', width: 1920, height: 1080, alt: 'Той шақыруы' }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Үйлену тойы — шақыру (тест)',
		description: 'Үйлену тойына цифрлық шақыру және RSVP (тесттік Open Graph).',
		images: ['/invitation/wedding.webp'],
	},
}

export default function WeddingInvitationRoute() {
	return <InvitationPageClient />
}
