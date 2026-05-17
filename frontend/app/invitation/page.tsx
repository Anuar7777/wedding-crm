import type { Metadata } from 'next'
import { InvitationPageClient } from './invitation-page-client'

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const imageUrl = `${site}/images/invitation/hero_invitation.webp`

export const metadata: Metadata = {
	metadataBase: new URL(site),
	title: 'Қарақат & Қыз ұзату тойы',
	description: 'Қарақат & Қыз ұзату тойына шақыру',
	openGraph: {
		title: 'Қарақат & Қыз ұзату тойы',
		description: 'Қарақат & Қыз ұзату тойына шақыру',
		url: `${site}/images/invitation/hero_invitation.webp`,
		type: 'website',
		locale: 'kk_KZ',
		images: [{ url: imageUrl, width: 1000, height: 1000, alt: 'Шақыру' }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Қарақат & Қыз ұзату тойы',
		description: 'Сіздерді ақ дастарханымыздың қадірлі қонағы болуға шақырамыз',
		images: [{ url: imageUrl, width: 1000, height: 1000, alt: 'Шақыру' }],
	},
}

export default function InvitationRoute() {
	return <InvitationPageClient />
}
