'use client'

import Image from 'next/image'
import { motion } from 'motion/react'

const PALETTE = ['#1a1a1a', '#3d2914', '#8b7355', '#e8dcc8', '#e8d5ce', '#8fa396', '#4a5c3a']

type DressCodeSectionProps = {
	fadeIn: Record<string, unknown>
}

export function DressCodeSection({ fadeIn }: DressCodeSectionProps) {
	return (
		<section className="relative overflow-hidden bg-white px-6 py-20 md:py-28">
			<motion.div className="relative z-10 mx-auto max-w-3xl text-center" {...fadeIn}>
				<h2
					className="mb-6 text-3xl tracking-[0.35em] text-stone-800 md:text-4xl"
					style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
				>
					ДРЕСС-КОД
				</h2>
				<p className="mx-auto mb-10 max-w-xl text-sm leading-relaxed text-stone-600 md:text-base">
					Мы будем очень рады, если вы поддержите цветовую гамму праздника:
				</p>
				<div className="mb-12 flex flex-wrap items-center justify-center gap-4 md:gap-5">
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
						src="/invitation/dress-code-reference.jpeg"
						alt="Примеры нарядов в палитре торжества"
						width={1200}
						height={480}
						className="h-auto w-full rounded-xl object-contain"
						sizes="(max-width: 896px) 100vw, 896px"
					/>
				</div>
			</motion.div>
		</section>
	)
}
