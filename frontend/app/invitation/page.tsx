import type { Metadata } from 'next'
import { InvitationPageClient } from './invitation-page-client'

export const metadata: Metadata = {
	title: 'Kazakh Wedding Invitation',
	description: 'Digital invitation and RSVP page.',
}

export default function InvitationRoute() {
	return <InvitationPageClient />
}
