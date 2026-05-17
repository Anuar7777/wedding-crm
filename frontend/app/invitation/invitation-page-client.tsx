'use client'

import Image from 'next/image'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { MapPin } from 'lucide-react'
import { RSVPForm } from '@/app/components/invitation/rsvp-form'
import { InvitationHero } from '@/app/components/invitation/invitation-hero'
import { InvitationChapterDivider } from '@/app/components/invitation/invitation-chapter-divider'
import { InvitationRotatingOrnament } from '@/app/components/invitation/invitation-rotating-ornament'
import { InvitationGreeting } from '@/app/components/invitation/invitation-greeting'
import { InvitationCalendarIntro } from '@/app/components/invitation/invitation-calendar-intro'
import { MapEmbed } from '@/app/components/invitation/map-embed'
import dynamic from 'next/dynamic'

const Countdown = dynamic(
	() => import('@/app/components/invitation/countdown').then((m) => m.Countdown),
	{ ssr: false }
)

import birdsImage from '@/public/images/invitation/birds.webp'
import ownersBackground from '@/public/images/invitation/owners_background.webp'
import { DressCodeSection } from '@/app/components/invitation/dress-code-section'
import { InvitationAudioPlayer } from '@/app/components/invitation/invitation-audio-player'

const invitationButtonClass =
	'invitation-btn ui-focus mt-8 w-full gap-2 px-7 py-4 sm:w-auto sm:px-8'

export function InvitationPageClient() {
	const fadeIn = {
		initial: { opacity: 0, y: 30 },
		whileInView: { opacity: 1, y: 0 },
		viewport: { once: true, margin: '-100px' },
		transition: { duration: 0.8, ease: 'easeOut' as const },
	}

	return (
		<LazyMotion features={domAnimation}>
			<div className="invitation-page min-h-screen bg-background text-foreground">
				<InvitationHero />
				<InvitationChapterDivider />
				<InvitationGreeting fadeIn={fadeIn} />
				<InvitationCalendarIntro fadeIn={fadeIn} />

				<section className="relative overflow-hidden from-background via-[#f4ece2] to-secondary px-6 py-12 md:py-14">
					<m.div className="relative z-10 mx-auto max-w-4xl text-center" {...fadeIn}>
						<SectionTitle title="Той салтанатына дейін" />
						<Countdown />
					</m.div>
				</section>

				<InvitationRotatingOrnament />

				<section className="relative overflow-hidden px-6 py-10 md:py-12">
					<m.div className="relative z-10 mx-auto max-w-4xl text-center" {...fadeIn}>
						<SectionTitle title="Мекен-жайы" />
						<div className="linen-surface luxury-card space-y-6 p-6 sm:p-7 md:p-10">
							<p
								className="invitation-title text-3xl md:text-4xl"
								style={{ color: 'var(--terracotta)' }}
							>
								Береке
							</p>
							<p className="text-lg opacity-70 md:text-xl">
								Қарағанды қаласы, Сатыбалдина көшесі, 11/4
							</p>
							<MapEmbed
								longitude={73.143865}
								latitude={49.776987}
								title="Береке банкет залы на карте Яндекс"
							/>
							<button
								type="button"
								onClick={() =>
									window.open(
										'https://2gis.kz/karaganda/firm/70000001037715386/73.143865%2C49.776987?m=73.143816%2C49.776999%2F20',
										'_blank'
									)
								}
								className={invitationButtonClass}
							>
								<MapPin className="h-5 w-5" />
								<span>2GIS арқылы ашу</span>
							</button>
						</div>
					</m.div>
				</section>

				<InvitationChapterDivider withTornEdge={false} />
				<DressCodeSection fadeIn={fadeIn} />

				<section className="relative w-full overflow-hidden">
					<m.div className="relative w-full" {...fadeIn}>
						<Image
							src={ownersBackground}
							alt=""
							width={1414}
							height={3000}
							className="block h-auto w-full max-w-none"
							sizes="100vw"
						/>
						<div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white sm:px-8">
							<p className="mb-3 font-serif text-xl font-semibold tracking-[0.2em] uppercase md:text-2xl">
								Той иелері:
							</p>
							<p className="invitation-title text-3xl md:text-5xl">
								Ата-анасы <span className="whitespace-nowrap">Ерболды - Жанылсын</span> және ағалары
							</p>
						</div>
					</m.div>
				</section>

				<section className="relative overflow-hidden px-6 py-12 md:py-14">
					<m.div className="relative z-10 mx-auto max-w-2xl" {...fadeIn}>
						<SectionTitle title="Тойға келуіңізді растауыңызды сұраймыз!" />
						<RSVPForm
							eventType="BRIDE_FAREWELL"
							submitButtonClassName="invitation-btn ui-focus w-full py-4 disabled:cursor-not-allowed disabled:opacity-60"
						/>
					</m.div>
				</section>

				<section className="relative overflow-hidden px-6 pb-12 pt-8 md:pb-14 md:pt-10">
					<h3 className="invitation-title mb-6 text-center text-4xl text-luxury-gold md:text-5xl leading-relaxed">
						Келіңіздер, тойымыздың қадірлі қонағы болыңыздар!
					</h3>
					<Image
						src={birdsImage}
						alt="birds"
						width={1000}
						height={1000}
						className="h-auto w-full"
					/>
				</section>

				<InvitationAudioPlayer src="/audio/invitation.mp3" />
			</div>
		</LazyMotion>
	)
}

function SectionTitle({ title }: { title: string }) {
	return <h2 className="invitation-title mb-6 text-center text-4xl md:text-5xl">{title}</h2>
}
