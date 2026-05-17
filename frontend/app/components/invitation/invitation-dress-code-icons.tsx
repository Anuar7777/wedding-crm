type IconProps = {
	className?: string
}

export function DressCodeTuxedoIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 64 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden
		>
			<path
				d="M32 4L20 14v4l12-7 12 7v-4L32 4Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path
				d="M14 24c0-2 4-6 18-6s18 4 18 6v36c0 2-6 4-18 4s-18-2-18-4V24Z"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path d="M32 24v40" stroke="currentColor" strokeWidth="1.5" />
			<path d="M14 34h36M14 44h36" stroke="currentColor" strokeWidth="1.5" />
			<path
				d="M26 58c2 3 10 3 12 0"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<ellipse cx="32" cy="18" rx="5" ry="3" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	)
}

export function DressCodeDressIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 64 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden
		>
			<path
				d="M32 8c-6 0-10 4-10 8v4c0 2 2 4 10 4s10-2 10-4v-4c0-4-4-8-10-8Z"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path
				d="M18 24h28l-4 8H22l-4-8Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path
				d="M22 32h20l-6 40H28L22 32Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path d="M32 32v40" stroke="currentColor" strokeWidth="1.5" />
			<path
				d="M28 44h8M26 54h12M24 64h16"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path d="M28 28c2-2 6-2 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	)
}
