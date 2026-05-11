'use client'

import * as React from 'react'

/** True after hydration on the client; false on the server. */
export function useClientMounted() {
	return React.useSyncExternalStore(
		() => () => {},
		() => true,
		() => false
	)
}
