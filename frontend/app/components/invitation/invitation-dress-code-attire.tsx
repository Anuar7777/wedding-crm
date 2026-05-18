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
				<Image
					src={invitationImages.dressWedding}
					alt={config.title ?? 'Дресс-код'}
					width={480}
					height={120}
					className="mb-8 h-auto w-full max-w-xs object-contain md:mb-10 md:max-w-sm"
				/>
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
