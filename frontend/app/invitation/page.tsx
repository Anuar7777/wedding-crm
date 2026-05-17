import type { Metadata } from 'next'
import { InvitationPageClient } from './invitation-page-client'
import { brideFarewellConfig, buildEventMetadata } from '@/lib/invitation'

export const metadata: Metadata = buildEventMetadata(brideFarewellConfig)

export default function InvitationRoute() {
	return <InvitationPageClient />
}
