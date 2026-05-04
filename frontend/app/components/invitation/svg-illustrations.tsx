export function GalleryIllustration1() {
	return (
		<svg viewBox="0 0 1200 800" fill="none" className="h-full w-full">
			<defs>
				<linearGradient id="gallery1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#E8DDD1" />
					<stop offset="50%" stopColor="#C8816C" stopOpacity="0.4" />
					<stop offset="100%" stopColor="#8B6F5C" stopOpacity="0.3" />
				</linearGradient>
			</defs>

			<rect width="1200" height="800" fill="url(#gallery1Grad)" />
			<path
				d="M200 800 L200 300 Q200 100 400 100 L800 100 Q1000 100 1000 300 L1000 800"
				stroke="#B8936E"
				strokeWidth="4"
				fill="none"
				opacity="0.5"
			/>
			<circle
				cx="600"
				cy="400"
				r="100"
				fill="none"
				stroke="#A8392E"
				strokeWidth="3"
				opacity="0.4"
			/>
			{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
				const angle = (i * Math.PI * 2) / 8
				const x = 600 + Math.cos(angle) * 80
				const y = 400 + Math.sin(angle) * 80
				return <circle key={i} cx={x} cy={y} r="20" fill="#A8392E" opacity="0.3" />
			})}
		</svg>
	)
}

export function GalleryIllustration2() {
	return (
		<svg viewBox="0 0 1200 800" fill="none" className="h-full w-full">
			<defs>
				<radialGradient id="gallery2Grad">
					<stop offset="0%" stopColor="#FAF7F2" />
					<stop offset="100%" stopColor="#C8816C" stopOpacity="0.3" />
				</radialGradient>
			</defs>

			<rect width="1200" height="800" fill="url(#gallery2Grad)" />
			<circle
				cx="600"
				cy="400"
				r="250"
				fill="none"
				stroke="#8B6F5C"
				strokeWidth="2"
				opacity="0.3"
			/>
			<circle
				cx="600"
				cy="400"
				r="200"
				fill="none"
				stroke="#8B6F5C"
				strokeWidth="2"
				opacity="0.4"
			/>
			<circle
				cx="600"
				cy="400"
				r="150"
				fill="none"
				stroke="#B8936E"
				strokeWidth="3"
				opacity="0.5"
			/>
			{Array.from({ length: 16 }).map((_, i) => {
				const angle = (i * Math.PI * 2) / 16
				const x1 = 600 + Math.cos(angle) * 150
				const y1 = 400 + Math.sin(angle) * 150
				const x2 = 600 + Math.cos(angle) * 250
				const y2 = 400 + Math.sin(angle) * 250
				return (
					<line
						key={i}
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
						stroke="#B8936E"
						strokeWidth="1"
						opacity="0.3"
					/>
				)
			})}
		</svg>
	)
}

export function FooterIllustration() {
	return (
		<svg viewBox="0 0 1200 800" fill="none" className="h-full w-full">
			<defs>
				<linearGradient id="footerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stopColor="#8B6F5C" stopOpacity="0.7" />
					<stop offset="100%" stopColor="#3A2E2A" stopOpacity="0.9" />
				</linearGradient>
			</defs>

			<rect width="1200" height="800" fill="url(#footerGrad)" />
			<path
				d="M600 650 C600 650 450 500 450 400 C450 350 480 320 520 320 C560 320 590 350 600 400 C610 350 640 320 680 320 C720 320 750 350 750 400 C750 500 600 650 600 650 Z"
				fill="none"
				stroke="#B8936E"
				strokeWidth="4"
				opacity="0.6"
			/>
			{Array.from({ length: 12 }).map((_, i) => {
				const angle = (i * Math.PI * 2) / 12 - Math.PI / 2
				const x = 600 + Math.cos(angle) * 280
				const y = 450 + Math.sin(angle) * 200
				return <circle key={i} cx={x} cy={y} r="4" fill="#B8936E" opacity="0.5" />
			})}
		</svg>
	)
}
