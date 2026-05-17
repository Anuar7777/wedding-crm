'use client'

import Image from 'next/image'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { invitationImages } from '@/lib/invitation/assets'
import type { FadeInMotionProps } from '@/lib/invitation/types'

const PALETTE = [
	'#1a1a1a',
	'#3d2914',
	'#8b7355',
	'#e8dcc8',
	'#e8d5ce',
	'#8fa396',
	'#4a5c3a',
	'#fde9f6',
]

type DressCodeSectionProps = {
	fadeIn: FadeInMotionProps
}

export function DressCodeSection({ fadeIn }: DressCodeSectionProps) {
	return (
		<section className="relative overflow-hidden bg-white px-6 py-10 md:py-14">
			<LazyMotion features={domAnimation}>
				<m.div className="relative z-10 mx-auto max-w-3xl text-center" {...fadeIn}>
					<h2 className="invitation-title mb-4 text-3xl tracking-[0.35em] text-stone-800 md:text-4xl">
						ДРЕСС-КОД
					</h2>
					<p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-stone-600 md:text-base">
						Мерекенің түстер үйлесімін қолдасаңыздар өте қуанышты боламыз:
					</p>
					<div className="mb-8 flex flex-wrap items-center justify-center gap-4 md:gap-5">
						{PALETTE.map((color) => (
							<div
								key={color}
								className="h-12 w-12 shrink-0 rounded-full border border-stone-200 shadow-sm md:h-14 md:w-14"
								style={{ backgroundColor: color }}
								aria-hidden
							/>
						))}
					</div>
					<div className="mx-auto max-w-4xl">
						<Image
							src={invitationImages.dress}
							alt="Мерекенің түстер үйлесімі"
							width={1200}
							height={480}
							className="h-auto w-full rounded-xl object-contain"
							sizes="(max-width: 896px) 100vw, 896px"
						/>
					</div>
				</m.div>
			</LazyMotion>
		</section>
	)
}
