import type { Metadata } from 'next'
import { WeddingPageClient } from './wedding-page-client'
import { buildEventMetadata, weddingConfig } from '@/lib/invitation'

export const metadata: Metadata = buildEventMetadata(weddingConfig)

export default function WeddingInvitationRoute() {
	return <WeddingPageClient />
}
