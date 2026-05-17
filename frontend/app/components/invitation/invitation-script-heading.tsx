import { cn } from '@/lib/utils'

type InvitationScriptHeadingProps = {
	children: string
	className?: string
	/** Latin display titles (e.g. Wedding). Cyrillic uses invitation script font. */
	variant?: 'latin' | 'cyrillic'
	as?: 'h2' | 'h3' | 'p' | 'span'
}

export function InvitationScriptHeading({
	children,
	className,
	variant = 'cyrillic',
	as: Tag = 'h2',
}: InvitationScriptHeadingProps) {
	return (
		<Tag
			className={cn(
				'invitation-script-heading text-balance leading-none text-stone-900',
				variant === 'latin' && 'invitation-script-heading--latin',
				className
			)}
		>
			{children}
		</Tag>
	)
}
