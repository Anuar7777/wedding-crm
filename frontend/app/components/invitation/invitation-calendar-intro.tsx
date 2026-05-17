'use client'

import Image from 'next/image'
import { m } from 'motion/react'
import { CalendarWithHeart } from '@/app/components/invitation/calendar-with-heart'
import { Ornament } from '@/app/components/invitation/ornament'
import { invitationImages } from '@/lib/invitation/assets'
import type { FadeInMotionProps, InvitationEventConfig } from '@/lib/invitation/types'

type InvitationCalendarIntroProps = {
	fadeIn: FadeInMotionProps
	calendar: InvitationEventConfig['calendar']
}

export function InvitationCalendarIntro({ fadeIn, calendar }: InvitationCalendarIntroProps) {
	return (
		<section className="relative overflow-x-clip px-6 py-10 md:py-12">
			<div
				className="pointer-events-none absolute top-6 left-0 z-0 w-[min(72vw,320px)] -translate-x-1/2"
				aria-hidden
			>
				<div className="invitation-ornament-spin">
					<Image
						src={invitationImages.thread}
						alt=""
						width={400}
						height={400}
						className="h-auto w-full"
					/>
				</div>
			</div>

			<m.div className="relative z-10 mx-auto max-w-lg" {...fadeIn}>
				<h2 className="invitation-title mb-6 pt-2 text-center text-3xl md:text-4xl">
					Той салтанаты:
				</h2>

				<div className="text-center">
					<CalendarWithHeart
						monthLabel={calendar.monthLabel}
						yearLabel={calendar.yearLabel}
						firstDayOfMonth={calendar.firstDayOfMonth}
						daysInMonth={calendar.daysInMonth}
						highlightedDay={calendar.highlightedDay}
						weekdayLabel={calendar.weekdayLabel}
						timeLabel={calendar.timeLabel}
					/>
					<Ornament compact />
				</div>
			</m.div>
		</section>
	)
}
