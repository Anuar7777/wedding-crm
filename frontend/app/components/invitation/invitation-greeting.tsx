'use client'

import { m } from 'motion/react'

const guestListText =
	'Құрметті ағайын-туыс, бауырлар, құда-жекжат, нағашы-жиен, бөлелер, дос-жаран, әріптестер және көршілер!'

type FadeInProps = {
	initial: { opacity: number; y: number }
	whileInView: { opacity: number; y: number }
	viewport: { once: boolean; margin: string }
	transition: { duration: number; ease: 'easeOut' }
}

type InvitationGreetingProps = {
	fadeIn: FadeInProps
}

export function InvitationGreeting({ fadeIn }: InvitationGreetingProps) {
	return (
		<section className="relative bg-background px-6 pb-10 md:pb-12">
			<m.div className="relative z-10 mx-auto max-w-lg" {...fadeIn}>
				<h2 className="invitation-title mb-5 text-center text-3xl md:text-4xl">
					Құрметті қонақтар!
				</h2>

				<div className="linen-surface luxury-card px-6 py-8 text-center sm:px-8 md:px-10 md:py-10">
					<p className="mx-auto mb-6 text-sm font-medium uppercase tracking-wide leading-loose opacity-90 md:text-base">
						{guestListText}
					</p>

					<p className="mx-auto text-base leading-relaxed opacity-85 md:text-lg">
						Сіздерді қызымыз{' '}
						<span style={{ fontFamily: 'var(--font-script)' }} className="text-xl md:text-2xl">
							Қарақаттың
						</span>{' '}
						ұзату тойына арналған салтанатты ақ дастарханымыздың қадірлі қонағы болуға шақырамыз.
					</p>
				</div>
			</m.div>
		</section>
	)
}
