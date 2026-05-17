'use client'

import { EventInvitationPage } from '@/app/components/invitation/event-invitation-page'
import { weddingConfig } from '@/lib/invitation'

export function WeddingPageClient() {
	return <EventInvitationPage config={weddingConfig} />
}
