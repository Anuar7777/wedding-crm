'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

type TimeLeft = {
	days: number
	hours: number
	minutes: number
	seconds: number
}

const targetDate = new Date('2026-07-18T13:00:00')

function calculateTimeLeft(): TimeLeft {
	const difference = targetDate.getTime() - new Date().getTime()
	if (difference <= 0) {
		return { days: 0, hours: 0, minutes: 0, seconds: 0 }
	}

	return {
		days: Math.floor(difference / (1000 * 60 * 60 * 24)),
		hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
		minutes: Math.floor((difference / 1000 / 60) % 60),
		seconds: Math.floor((difference / 1000) % 60),
	}
}

export function Countdown() {
	const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(calculateTimeLeft())
		}, 1000)

		return () => clearInterval(timer)
	}, [])

	return (
		<div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
			<TimeUnit value={timeLeft.days} label="Күн" />
			<TimeUnit value={timeLeft.hours} label="Сағат" />
			<TimeUnit value={timeLeft.minutes} label="Минут" />
			<TimeUnit value={timeLeft.seconds} label="Секунд" />
		</div>
	)
}

function TimeUnit({ value, label }: { value: number; label: string }) {
	return (
		<div className="flex min-w-16 flex-col items-center gap-2 md:min-w-20">
			<div className="linen-surface flex h-14 w-14 items-center justify-center rounded-full border border-gold sm:h-16 sm:w-16 md:h-20 md:w-20">
				<AnimatePresence mode="wait">
					<motion.span
						key={value}
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.25, ease: 'easeOut' }}
						className="text-2xl sm:text-3xl md:text-4xl"
						style={{ fontFamily: 'var(--font-serif)' }}
					>
						{value.toString().padStart(2, '0')}
					</motion.span>
				</AnimatePresence>
			</div>
			<span className="text-xs uppercase tracking-[0.2em] opacity-70 md:text-sm">{label}</span>
		</div>
	)
}
