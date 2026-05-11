'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { MapPin } from 'lucide-react'

const heroImage = '/invitation/wedding.webp'
import { Countdown } from '@/app/components/invitation/countdown'
import { RSVPForm } from '@/app/components/invitation/rsvp-form'
import { Ornament } from '@/app/components/invitation/ornament'
import { CalendarWithHeart } from '@/app/components/invitation/calendar-with-heart'
import { MapEmbed } from '@/app/components/invitation/map-embed'
import { PetalBackground } from '@/app/components/invitation/petal-background'

export function InvitationPageClient() {
	const fadeIn = {
		initial: { opacity: 0, y: 30 },
		whileInView: { opacity: 1, y: 0 },
		viewport: { once: true, margin: '-100px' },
		transition: { duration: 0.8, ease: 'easeOut' as const },
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<section className="relative min-h-svh overflow-hidden">
				<Image
					src={heroImage}
					alt="Kazakh wedding invitation hero"
					fill
					priority
					className="object-cover object-center"
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/25 to-black/45" />
				<div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-background to-transparent" />
				<motion.div
					className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white"
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: 'easeOut' }}
				>
					<Ornament />
					<h1
						className="text-5xl tracking-wide sm:text-6xl md:text-8xl"
						style={{ fontFamily: 'var(--font-script)' }}
					>
						Қарақат
					</h1>
					<p className="mt-4 text-xl tracking-[0.22em] sm:text-2xl sm:tracking-[0.3em] md:text-3xl">
						Қыз ұзату
					</p>
					<Ornament />
				</motion.div>
			</section>

			<section className="relative overflow-hidden px-6 py-20 md:py-24">
				<PetalBackground />
				<motion.div
					className="linen-surface luxury-card relative z-10 mx-auto max-w-3xl px-6 py-11 text-center sm:px-8 md:px-14 md:py-16"
					{...fadeIn}
				>
					<Ornament />
					<p
						className="mb-8 text-lg leading-relaxed md:text-2xl"
						style={{ fontFamily: 'var(--font-serif)' }}
					>
						Құрметті қонақтар!
					</p>
					<p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed opacity-85 md:text-lg">
						Біз сіздерді қызымыздың қыз ұзату тойына шақырамыз. Бұл маңызды күнде бізбен бірге
						болып, қуаныш пен бақытты бөлісуіңізді өтінеміз.
					</p>
					<p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed opacity-80 md:text-lg">
						Сіздерді дәстүрлі &quot;Қыз ұзату&quot; салтанатына шақырамыз. Отбасымыз үшін ерекше осы
						күні қуанышымызды бірге бөліссеңіздер, біз үшін үлкен мәртебе.
					</p>
					<Ornament />
				</motion.div>
			</section>

			<section className="relative overflow-hidden px-6 py-20 md:py-24">
				<PetalBackground />
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
				<PetalBackground />
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
						<p className="mb-8 text-lg opacity-70 md:text-xl">Сатыбалдина көшесі, 11/4</p>
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

			<section className="relative overflow-hidden bg-linear-to-b from-background via-[#f4ece2] to-secondary px-6 py-24 md:py-28">
				<PetalBackground />
				<motion.div className="relative z-10 mx-auto max-w-4xl text-center" {...fadeIn}>
					<SectionTitle title="Тойға дейін" />
					<Countdown />
				</motion.div>
			</section>

			<section className="relative overflow-hidden px-6 py-20 md:py-24">
				<PetalBackground />
				<motion.div className="relative z-10 mx-auto max-w-2xl text-center" {...fadeIn}>
					<Ornament />
					<p className="mb-4 text-lg opacity-60 md:text-xl">Той иелері</p>
					<p
						className="text-4xl md:text-5xl"
						style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}
					>
						Ата-анасы Ерболды — Жанылсын және ағалары
					</p>
					<p className="mt-4 text-xl opacity-80 md:text-2xl">Ұзату: Аяулым — Қарақат</p>
					<Ornament />
				</motion.div>
			</section>

			<section className="relative overflow-hidden bg-linear-to-b from-background to-secondary px-6 py-24 md:py-28">
				<PetalBackground />
				<motion.div className="relative z-10 mx-auto max-w-2xl" {...fadeIn}>
					<SectionTitle title="Қатысуыңызды растаңыз" />
					<p className="mb-12 text-center text-lg opacity-70">Қатысатыныңызды растаңыз</p>
					<RSVPForm eventType="BRIDE_FAREWELL" />
				</motion.div>
			</section>
		</div>
	)
}

function SectionTitle({ title }: { title: string }) {
	return (
		<h2
			className="mb-10 text-4xl md:text-5xl"
			style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
		>
			{title}
		</h2>
	)
}
