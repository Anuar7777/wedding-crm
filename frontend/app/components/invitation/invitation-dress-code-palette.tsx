import Image from 'next/image'
import { InvitationScriptHeading } from '@/app/components/invitation/invitation-script-heading'
import { invitationImages } from '@/lib/invitation/assets'
import type { DressCodePaletteConfig } from '@/lib/invitation/types'

const DEFAULT_COLORS = [
	'#1a1a1a',
	'#3d2914',
	'#8b7355',
	'#e8dcc8',
	'#e8d5ce',
	'#8fa396',
	'#4a5c3a',
	'#fde9f6',
]

type InvitationDressCodePaletteProps = {
	config: DressCodePaletteConfig
}

export function InvitationDressCodePalette({ config }: InvitationDressCodePaletteProps) {
	const colors = config.colors ?? DEFAULT_COLORS

	return (
		<>
			<InvitationScriptHeading variant={config.titleVariant ?? 'cyrillic'} className="mb-4 md:mb-6">
				{config.title}
			</InvitationScriptHeading>
			<p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-stone-600 md:text-base">
				{config.lead}
			</p>
			<div className="mb-8 flex flex-wrap items-center justify-center gap-4 md:gap-5">
				{colors.map((color) => (
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
		</>
	)
}
