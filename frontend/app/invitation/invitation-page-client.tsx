'use client'

import { EventInvitationPage } from '@/app/components/invitation/event-invitation-page'
import { brideFarewellConfig } from '@/lib/invitation'

export function InvitationPageClient() {
	return <EventInvitationPage config={brideFarewellConfig} />
}
