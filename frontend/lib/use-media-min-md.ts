'use client'

import * as React from 'react'

const QUERY = '(min-width: 768px)'

function subscribe(onStoreChange: () => void) {
	const mq = window.matchMedia(QUERY)
	const handler = () => onStoreChange()
	mq.addEventListener('change', handler)
	return () => mq.removeEventListener('change', handler)
}

function getSnapshot() {
	return window.matchMedia(QUERY).matches
}

function getServerSnapshot() {
	return false
}

/** Matches Tailwind `md` — desktop sidebar breakpoint. SSR/hydration: false until client. */
export function useMediaMinMd(): boolean {
	return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
