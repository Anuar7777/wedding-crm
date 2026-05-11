'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { MapPin } from 'lucide-react'
import { RSVPForm } from '@/app/components/invitation/rsvp-form'
import { Ornament } from '@/app/components/invitation/ornament'
import { CalendarWithHeart } from '@/app/components/invitation/calendar-with-heart'
import { MapEmbed } from '@/app/components/invitation/map-embed'
import dynamic from 'next/dynamic'

const Countdown = dynamic(
	() => import('@/app/components/invitation/countdown').then((m) => m.Countdown),
	{ ssr: false }
)

import birdsImage from '@/public/invitation/birds.webp'
import { DressCodeSection } from '@/app/components/invitation/dress-code-section'

export function InvitationPageClient() {
	const fadeIn = {
		initial: { opacity: 0, y: 30 },
		whileInView: { opacity: 1, y: 0 },
		viewport: { once: true, margin: '-100px' },
		transition: { duration: 0.8, ease: 'easeOut' as const },
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<section className="relative h-screen overflow-hidden">
				<div className="absolute bottom-0 left-0 w-full flex flex-col items-center text-center pb-10 z-20 md:gap-3">
					<Ornament />
					<h1
						className="text-5xl md:text-8xl text-luxury-gold"
						style={{ fontFamily: 'var(--font-script)' }}
					>
						Қарақат
					</h1>
					<p className="mt-4 text-xl tracking-widest">Қыз ұзату</p>
					<Ornament />
				</div>
			</section>

			<section className="relative overflow-hidden px-6 py-20 md:py-24">
				<motion.div
					className="linen-surface luxury-card relative z-10 mx-auto max-w-3xl px-6 py-11 text-center sm:px-8 md:px-14 md:py-16"
					{...fadeIn}
				>
					<Ornament />
					<p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed opacity-85 md:text-lg">
						Құрметті ағайын-туыс, бауырлар, құда-жекжат, нағашы-жиен, бөлелер, дос-жаран, әріптестер
						және көршілер!
					</p>
					<p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed opacity-85 md:text-lg">
						Сіздерді қызымыз Қарақаттың ұзату тойына арналған салтанатты ақ дастарханымыздың қадірлі
						қонағы болуға шақырамыз.
					</p>
					<Ornament />
				</motion.div>
			</section>

			<section className="relative overflow-hidden px-6 py-20 md:py-24">
				<motion.div className="relative z-10 mx-auto max-w-3xl text-center" {...fadeIn}>
					<SectionTitle title="Қай күні?" />
					<p className="mb-10 text-lg opacity-70">Уақыты: 13:00</p>
					<CalendarWithHeart
						monthLabel="Шілде"
						yearLabel="2026"
						firstDayOfMonth={2}
						daysInMonth={31}
						highlightedDay={18}
						weekdayLabel="Сенбі"
						timeLabel="13:00"
					/>
					<Ornament />
				</motion.div>
			</section>

			<section className="relative overflow-hidden px-6 py-20 md:py-24">
				<motion.div className="relative z-10 mx-auto max-w-4xl text-center" {...fadeIn}>
					<SectionTitle title="Мекен-жайы" />
					<div className="linen-surface luxury-card space-y-6 p-6 sm:p-7 md:p-10">
						<p
							className="text-3xl md:text-4xl"
							style={{
								fontFamily: 'var(--font-serif)',
								color: 'var(--terracotta)',
							}}
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
							className="ui-button ui-button-primary ui-interactive ui-focus mt-8 w-full gap-2 px-7 py-4 sm:w-auto sm:px-8"
						>
							<MapPin className="h-5 w-5" />
							<span>2GIS арқылы ашу</span>
						</button>
					</div>
				</motion.div>
			</section>

			<DressCodeSection fadeIn={fadeIn} />

			<section className="relative overflow-hidden from-background via-[#f4ece2] to-secondary px-6 py-24 md:py-28">
				<motion.div className="relative z-10 mx-auto max-w-4xl text-center" {...fadeIn}>
					<SectionTitle title="Тойға дейін" />
					<Countdown />
				</motion.div>
			</section>

			<section className="relative overflow-hidden px-6 py-20 md:py-24">
				<motion.div className="relative z-10 mx-auto max-w-2xl text-center" {...fadeIn}>
					<Ornament />
					<p className="mb-4 text-lg opacity-60 md:text-xl">Той иелері</p>
					<p
						className="text-4xl md:text-5xl"
						style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}
					>
						Ата-анасы Ерболды — Жанылсын және ағалары
					</p>
					<Ornament />
				</motion.div>
			</section>

			<section className="relative overflow-hidden px-6 py-24 md:py-28">
				<motion.div className="relative z-10 mx-auto max-w-2xl" {...fadeIn}>
					<SectionTitle title="Тойға қатысатыныңызды растауыңызды сұраймыз!" />
					<RSVPForm eventType="BRIDE_FAREWELL" />
				</motion.div>
			</section>

			<section className="relative overflow-hidden px-6 pb-20 md:py-24">
				<h3
					className="text-4xl md:text-5xl text-luxury-gold text-center mb-10"
					style={{ fontFamily: 'var(--font-script)' }}
				>
					Келіңіздер, тойымыздың қадірлі қонағы болыңыздар!
				</h3>
				<Image src={birdsImage} alt="birds" width={1000} height={1000} className="w-full h-auto" />
			</section>
		</div>
	)
}

function SectionTitle({ title }: { title: string }) {
	return (
		<h2
			className="mb-10 text-4xl md:text-5xl text-center"
			style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
		>
			{title}
		</h2>
	)
}
