const weekDays = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жс']

type CalendarWithHeartProps = {
	monthLabel: string
	yearLabel: string
	firstDayOfMonth: number
	daysInMonth: number
	highlightedDay: number
	weekdayLabel: string
	timeLabel: string
}

export function CalendarWithHeart({
	monthLabel,
	yearLabel,
	firstDayOfMonth,
	daysInMonth,
	highlightedDay,
	weekdayLabel,
	timeLabel,
}: CalendarWithHeartProps) {
	const calendarDays: Array<number | null> = []

	for (let i = 0; i < firstDayOfMonth; i += 1) {
		calendarDays.push(null)
	}
	for (let day = 1; day <= daysInMonth; day += 1) {
		calendarDays.push(day)
	}

	return (
		<div className="mx-auto max-w-md">
			<div className="mb-5 text-center">
				<h3 className="invitation-calendar-month mb-2 text-3xl md:text-4xl">{monthLabel}</h3>
				<p className="text-xl opacity-60">{yearLabel}</p>
			</div>

			<div className="rounded-3xl border-2 border-border bg-white p-6 shadow-lg md:p-8">
				<div className="mb-4 grid grid-cols-7 gap-2">
					{weekDays.map((day) => (
						<div key={day} className="text-center text-sm opacity-60">
							{day}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7 gap-2">
					{calendarDays.map((day, index) => (
						<div
							key={day != null ? `day-${day}` : `pad-${index}`}
							className="relative aspect-square flex items-center justify-center"
						>
							{day === highlightedDay ? (
								<div className="relative flex h-full w-full items-center justify-center">
									<div className="absolute inset-0 origin-center scale-[1.35]">
										<svg
											className="invitation-heart-beat h-full w-full origin-center"
											viewBox="0 0 50 50"
											fill="none"
											aria-hidden
										>
											<path
												d="M25 42 C25 42 8 30 8 18 C8 13 11 10 15 10 C19 10 22 13 25 18 C28 13 31 10 35 10 C39 10 42 13 42 18 C42 30 25 42 25 42 Z"
												stroke="var(--accent)"
												strokeWidth="3"
												fill="var(--accent)"
												fillOpacity="0.15"
											/>
										</svg>
									</div>
									<span
										className="relative z-10 text-xl font-bold md:text-2xl"
										style={{ color: 'var(--accent)' }}
									>
										{day}
									</span>
								</div>
							) : day ? (
								<span className="flex h-full w-full items-center justify-center rounded-full text-base transition-colors hover:bg-secondary md:text-lg">
									{day}
								</span>
							) : (
								<span />
							)}
						</div>
					))}
				</div>
			</div>

			<div className="mt-4 space-y-2 text-center">
				<p className="text-lg opacity-70">{weekdayLabel}</p>
				<p className="invitation-calendar-time text-2xl" style={{ color: 'var(--accent)' }}>
					{timeLabel}
				</p>
			</div>
		</div>
	)
}
