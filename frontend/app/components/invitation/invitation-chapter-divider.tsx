import Image from 'next/image'
import { invitationImages } from '@/lib/invitation/assets'

type InvitationChapterDividerProps = {
	withTornEdge?: boolean
}

export function InvitationChapterDivider({ withTornEdge = true }: InvitationChapterDividerProps) {
	return (
		<div className={`relative z-20 bg-background py-4 md:py-5 ${withTornEdge ? '-mt-px' : ''}`}>
			{withTornEdge ? (
				<div className="invitation-torn-edge invitation-torn-edge--top" aria-hidden />
			) : null}
			<div className="flex w-full justify-center px-6">
				<Image
					src={invitationImages.carving}
					alt=""
					width={320}
					height={90}
					style={{ width: 'auto', height: 'auto' }}
					className="h-auto w-[min(320px,88vw)]"
				/>
			</div>
		</div>
	)
}
