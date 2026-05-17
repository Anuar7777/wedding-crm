'use client'

import { m } from 'motion/react'
import type { FadeInMotionProps, InvitationEventConfig } from '@/lib/invitation/types'

type InvitationGreetingProps = {
	fadeIn: FadeInMotionProps
	greeting: InvitationEventConfig['greeting']
}

export function InvitationGreeting({ fadeIn, greeting }: InvitationGreetingProps) {
	return (
		<section className="relative bg-background px-6 pb-10 md:pb-12">
			<m.div className="relative z-10 mx-auto max-w-lg" {...fadeIn}>
				<h2 className="invitation-title mb-5 text-center text-3xl md:text-4xl">
					{greeting.heading}
				</h2>

				<div className="linen-surface luxury-card px-6 py-8 text-center sm:px-8 md:px-10 md:py-10">
					<p className="mx-auto mb-6 text-sm font-medium uppercase tracking-wide leading-loose opacity-90 md:text-base">
						{greeting.guestList}
					</p>

					<p className="mx-auto text-base leading-relaxed opacity-85 md:text-lg">
						{greeting.body ? (
							greeting.body
						) : (
							<>
								{greeting.bodyBeforeHighlight}
								<span style={{ fontFamily: 'var(--font-script)' }} className="text-xl md:text-2xl">
									{greeting.highlightName}
								</span>
								{greeting.bodyAfterHighlight}
							</>
						)}
					</p>
				</div>
			</m.div>
		</section>
	)
}
