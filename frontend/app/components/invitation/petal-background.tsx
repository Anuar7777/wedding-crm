'use client'

import { useMemo } from 'react'

type PetalSpec = {
	leftPercent: number
	sizePx: number
	opacity: number
	fallDurationSec: number
	fallDelaySec: number
	driftPx: number
	spinDurationSec: number
	spinDelaySec: number
	spinDirection: 1 | -1
	blurPx: number
}

type PetalStyle = React.CSSProperties & {
	'--petal-drift'?: string
	'--petal-spin-dir'?: number
}

function mulberry32(seed: number) {
	return function () {
		let t = (seed += 0x6d2b79f5)
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

function clamp(min: number, value: number, max: number) {
	return Math.min(max, Math.max(min, value))
}

function makePetalSpec(index: number): PetalSpec {
	const rng = mulberry32(0x2f6b3d11 + index * 9973)

	const leftPercent = rng() * 100
	const sizePx = 10 + rng() * 16 // 10..26
	const opacity = clamp(0.12, 0.18 + rng() * 0.26, 0.44)
	const fallDurationSec = 12 + rng() * 16 // 12..28
	const fallDelaySec = rng() * 10 * -1 // start mid-flight
	const driftPx = (rng() * 2 - 1) * (16 + rng() * 34) // -50..50-ish
	const spinDurationSec = 6 + rng() * 10 // 6..16
	const spinDelaySec = rng() * 6 * -1
	const spinDirection: 1 | -1 = rng() > 0.5 ? 1 : -1
	const blurPx = clamp(0, rng() * 1.4 - 0.2, 1.2)

	return {
		leftPercent,
		sizePx,
		opacity,
		fallDurationSec,
		fallDelaySec,
		driftPx,
		spinDurationSec,
		spinDelaySec,
		spinDirection,
		blurPx,
	}
}

export function PetalBackground({ count = 22 }: { count?: number }) {
	const petals = useMemo(() => {
		return Array.from({ length: count }, (_, index) => makePetalSpec(index))
	}, [count])

	return (
		<div className="petal-layer" aria-hidden="true">
			{petals.map((p, i) => (
				<span
					key={[
						i,
						p.leftPercent.toFixed(3),
						p.sizePx.toFixed(1),
						p.fallDurationSec.toFixed(2),
						p.spinDirection,
					].join(':')}
					className="petal"
					style={
						{
							left: `${p.leftPercent}%`,
							width: `${p.sizePx}px`,
							height: `${Math.round(p.sizePx * 1.35)}px`,
							opacity: p.opacity,
							filter: p.blurPx > 0 ? `blur(${p.blurPx}px)` : undefined,
							'--petal-drift': `${p.driftPx}px`,
							animationDuration: `${p.fallDurationSec}s, ${p.spinDurationSec}s`,
							animationDelay: `${p.fallDelaySec}s, ${p.spinDelaySec}s`,
							'--petal-spin-dir': p.spinDirection,
						} as PetalStyle
					}
				/>
			))}
		</div>
	)
}
