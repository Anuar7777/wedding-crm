import type { StaticImageData } from 'next/image'
import heroInvitation from '@/public/images/invitation/hero_invitation.webp'
import heroWedding from '@/public/images/wedding/hero_wedding.webp'
import carving from '@/public/images/share/carving_between_chapters.webp'
import thread from '@/public/images/share/thread_rotating_red.webp'
import dress from '@/public/images/invitation/dress.webp'
import dressWedding from '@/public/images/wedding/dress.webp'
import birds from '@/public/images/share/birds.webp'
import ownersBackground from '@/public/images/share/owners_background.webp'
import halal from '@/public/images/share/halal.webp'

export type HeroImageKey = 'heroInvitation' | 'heroWedding'

export const invitationImages = {
	heroInvitation,
	heroWedding,
	carving,
	thread,
	dress,
	dressWedding,
	birds,
	ownersBackground,
	halal,
} as const satisfies Record<string, StaticImageData>

export function resolveHeroImage(key: HeroImageKey): StaticImageData {
	return invitationImages[key]
}
