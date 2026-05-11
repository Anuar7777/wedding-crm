'use client'

import * as React from 'react'
import type { EventType, MeResponse } from '@/lib/crm/types'

const THEME_KEY = 'crm_theme'
const EVENT_KEY = 'crm_selected_event'

const ThemeCtx = React.createContext<{
	theme: 'light' | 'dark'
	setTheme: (t: 'light' | 'dark') => void
} | null>(null)

export function CrmThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = React.useState<'light' | 'dark'>(() => {
		if (typeof window === 'undefined') return 'light'
		return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
	})

	const setTheme = React.useCallback((t: 'light' | 'dark') => {
		setThemeState(t)
		localStorage.setItem(THEME_KEY, t)
	}, [])

	const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])
	return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useCrmTheme() {
	const v = React.useContext(ThemeCtx)
	if (!v) throw new Error('useCrmTheme must be used within CrmThemeProvider')
	return v
}

const EventCtx = React.createContext<{
	me: MeResponse | null
	effectiveEventType: EventType
	setSelectedEventType: (t: EventType) => void
	canSwitchEvent: boolean
} | null>(null)

export function CrmEventProvider({
	children,
	me,
}: {
	children: React.ReactNode
	me: MeResponse | null
}) {
	const canSwitchEvent = me?.role === 'SUPERADMIN' && !me.scope

	const [selected, setSelected] = React.useState<EventType>(() => {
		if (typeof window === 'undefined') return 'WEDDING'
		if (me?.scope) return me.scope
		const stored = localStorage.getItem(EVENT_KEY) as EventType | null
		if (stored === 'BRIDE_FAREWELL' || stored === 'WEDDING') return stored
		return 'WEDDING'
	})

	/* eslint-disable react-hooks/set-state-in-effect -- sync server scope and persisted tab with React state */
	React.useEffect(() => {
		if (me?.scope) {
			setSelected(me.scope)
			return
		}
		const stored = localStorage.getItem(EVENT_KEY) as EventType | null
		if (stored === 'BRIDE_FAREWELL' || stored === 'WEDDING') setSelected(stored)
	}, [me?.scope])
	/* eslint-enable react-hooks/set-state-in-effect */

	const setSelectedEventType = React.useCallback(
		(t: EventType) => {
			setSelected(t)
			if (canSwitchEvent) localStorage.setItem(EVENT_KEY, t)
		},
		[canSwitchEvent]
	)

	const effectiveEventType = me?.scope ?? selected

	const value = React.useMemo(
		() => ({ me, effectiveEventType, setSelectedEventType, canSwitchEvent }),
		[me, effectiveEventType, setSelectedEventType, canSwitchEvent]
	)

	return <EventCtx.Provider value={value}>{children}</EventCtx.Provider>
}

export function useCrmEvent() {
	const v = React.useContext(EventCtx)
	if (!v) throw new Error('useCrmEvent outside CrmEventProvider')
	return v
}
