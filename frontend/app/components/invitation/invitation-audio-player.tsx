'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

const DEFAULT_SRC = '/invitation/music.mp3'

type InvitationAudioPlayerProps = {
	src?: string
}

export function InvitationAudioPlayer({ src = DEFAULT_SRC }: InvitationAudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null)
	const [playing, setPlaying] = useState(false)

	const toggle = useCallback(async () => {
		const audio = audioRef.current
		if (!audio) return

		if (audio.paused) {
			try {
				await audio.play()
			} catch {
				setPlaying(false)
			}
		} else {
			audio.pause()
		}
	}, [])

	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return

		const syncPlaying = () => setPlaying(!audio.paused)

		audio.addEventListener('play', syncPlaying)
		audio.addEventListener('pause', syncPlaying)
		audio.addEventListener('ended', syncPlaying)

		return () => {
			audio.removeEventListener('play', syncPlaying)
			audio.removeEventListener('pause', syncPlaying)
			audio.removeEventListener('ended', syncPlaying)
		}
	}, [])

	return (
		<>
			<audio ref={audioRef} src={src} loop preload="none" autoPlay={true} />
			<button
				type="button"
				onClick={toggle}
				className="invitation-audio-btn ui-focus"
				aria-label={playing ? 'Музыканы тоқтату' : 'Музыканы ойнату'}
				aria-pressed={playing}
			>
				{playing ? (
					<Pause className="h-6 w-6 shrink-0" strokeWidth={2.25} aria-hidden />
				) : (
					<Play className="h-6 w-6 shrink-0 pl-0.5" strokeWidth={2.25} aria-hidden />
				)}
			</button>
		</>
	)
}
