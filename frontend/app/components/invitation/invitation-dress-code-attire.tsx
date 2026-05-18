import Image from 'next/image'
import { InvitationScriptHeading } from '@/app/components/invitation/invitation-script-heading'
import { invitationImages } from '@/lib/invitation/assets'
import type { DressCodeAttireConfig } from '@/lib/invitation/types'
import { cn } from '@/lib/utils'

type InvitationDressCodeAttireProps = {
	config: DressCodeAttireConfig
	className?: string
}

export function InvitationDressCodeAttire({ config, className }: InvitationDressCodeAttireProps) {
	const showTitleImage = config.titleImage === true

	return (
		<div className={cn('flex flex-col items-center', className)}>
			{showTitleImage ? (
				<div className="relative mx-auto w-full max-w-xs md:max-w-sm">
					<Image
						src={invitationImages.dressWedding}
						alt={config.title ?? 'Дресс-код'}
						width={2160}
						height={2298}
						className="h-auto w-full object-contain"
						sizes="(max-width: 640px) 320px, 384px"
					/>
					{config.lead ? (
						<p className="absolute top-[34%] left-1/2 w-[82%] -translate-x-1/2 -translate-y-1/2 text-center text-sm leading-relaxed text-stone-600 md:text-base">
							{config.lead}
						</p>
					) : null}
				</div>
			) : (
				<InvitationScriptHeading
					variant={config.titleVariant ?? 'cyrillic'}
					className="mb-8 md:mb-10"
				>
					{config.title ?? 'Дресс-код'}
				</InvitationScriptHeading>
			)}
		</div>
	)
}
