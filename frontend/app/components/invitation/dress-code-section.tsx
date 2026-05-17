'use client'

import { LazyMotion, domAnimation, m } from 'motion/react'
import { InvitationDressCodeAttire } from '@/app/components/invitation/invitation-dress-code-attire'
import { InvitationDressCodePalette } from '@/app/components/invitation/invitation-dress-code-palette'
import type { DressCodeConfig, FadeInMotionProps } from '@/lib/invitation/types'

const DEFAULT_DRESS_CODE: DressCodeConfig = {
	layout: 'palette',
	title: 'Дресс-код',
	lead: 'Мерекенің түстер үйлесімін қолдасаңыздар өте қуанышты боламыз:',
	titleVariant: 'cyrillic',
}

type DressCodeSectionProps = {
	fadeIn: FadeInMotionProps
	dressCode?: DressCodeConfig
}

export function DressCodeSection({ fadeIn, dressCode }: DressCodeSectionProps) {
	const config = dressCode ?? DEFAULT_DRESS_CODE

	return (
		<section className="relative overflow-hidden bg-white px-6 py-10 md:py-14">
			<LazyMotion features={domAnimation}>
				<m.div
					className={
						config.layout === 'attire'
							? 'relative z-10 mx-auto max-w-4xl text-center'
							: 'relative z-10 mx-auto max-w-3xl text-center'
					}
					{...fadeIn}
				>
					{config.layout === 'attire' ? (
						<InvitationDressCodeAttire config={config} />
					) : (
						<InvitationDressCodePalette config={config} />
					)}
				</m.div>
			</LazyMotion>
		</section>
	)
}
