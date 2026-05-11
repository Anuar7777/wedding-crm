const ACCESS_KEY = 'crm_access_token'
/** Legacy keys when refresh lived in localStorage */
const LEGACY_ACCESS_KEY = 'crm_access_token'
const LEGACY_REFRESH_KEY = 'crm_refresh_token'

export function getApiBase(): string {
	const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
	if (!raw) return ''
	return raw.replace(/\/$/, '')
}

function migrateLegacyAuthOnce(): void {
	if (typeof window === 'undefined') return
	localStorage.removeItem(LEGACY_REFRESH_KEY)
	const legacyAccess = localStorage.getItem(LEGACY_ACCESS_KEY)
	if (legacyAccess && !sessionStorage.getItem(ACCESS_KEY)) {
		sessionStorage.setItem(ACCESS_KEY, legacyAccess)
	}
	if (legacyAccess) localStorage.removeItem(LEGACY_ACCESS_KEY)
}

export function getAccessToken(): string | null {
	if (typeof window === 'undefined') return null
	migrateLegacyAuthOnce()
	return sessionStorage.getItem(ACCESS_KEY)
}

export function setAccessToken(access: string): void {
	if (typeof window === 'undefined') return
	migrateLegacyAuthOnce()
	sessionStorage.setItem(ACCESS_KEY, access)
}

function clearClientAuth(): void {
	if (typeof window === 'undefined') return
	migrateLegacyAuthOnce()
	sessionStorage.removeItem(ACCESS_KEY)
	localStorage.removeItem(LEGACY_ACCESS_KEY)
	localStorage.removeItem(LEGACY_REFRESH_KEY)
}

export function clearTokens(): void {
	clearClientAuth()
}

/** Revokes refresh on server (clears HttpOnly cookie) and drops client access token. */
export async function logoutCrm(): Promise<void> {
	if (typeof window === 'undefined') return
	migrateLegacyAuthOnce()
	const base = getApiBase()
	const url = base ? `${base}/api/auth/logout` : '/api/auth/logout'
	try {
		await fetch(url, { method: 'POST', credentials: 'include' })
	} catch {
		// still clear client state
	}
	clearClientAuth()
}

async function tryRefresh(): Promise<boolean> {
	if (typeof window === 'undefined') return false
	migrateLegacyAuthOnce()
	const base = getApiBase()
	const refreshUrl = base ? `${base}/api/auth/refresh` : '/api/auth/refresh'
	const res = await fetch(refreshUrl, {
		method: 'POST',
		credentials: 'include',
	})
	if (!res.ok) return false
	const body = (await res.json()) as { accessToken: string }
	if (!body.accessToken) return false
	setAccessToken(body.accessToken)
	return true
}

export type ApiOptions = RequestInit & {
	skipAuth?: boolean
}

function withCredentials(init?: ApiOptions): RequestInit {
	if (typeof window === 'undefined') return init ?? {}
	return { ...init, credentials: 'include' }
}

export async function apiJson<T>(path: string, init?: ApiOptions): Promise<T> {
	const base = getApiBase()
	const rel = path.startsWith('/') ? path : `/${path}`
	const url = path.startsWith('http') ? path : `${base}${rel}`

	const headers = new Headers(init?.headers ?? {})
	if (typeof window !== 'undefined') {
		migrateLegacyAuthOnce()
	}
	if (!init?.skipAuth && typeof window !== 'undefined') {
		const access = sessionStorage.getItem(ACCESS_KEY)
		if (access) headers.set('Authorization', `Bearer ${access}`)
	}
	if (
		init?.body !== undefined &&
		!(init.body instanceof FormData) &&
		!headers.has('Content-Type')
	) {
		headers.set('Content-Type', 'application/json')
	}

	let res = await fetch(url, withCredentials({ ...init, headers }))

	if (res.status === 401 && !init?.skipAuth) {
		const refreshed = await tryRefresh()
		if (refreshed) {
			const h2 = new Headers(init?.headers ?? {})
			const access2 = sessionStorage.getItem(ACCESS_KEY)
			if (access2) h2.set('Authorization', `Bearer ${access2}`)
			if (init?.body !== undefined && !(init.body instanceof FormData) && !h2.has('Content-Type')) {
				h2.set('Content-Type', 'application/json')
			}
			res = await fetch(url, withCredentials({ ...init, headers: h2 }))
		}
	}

	if (!res.ok) {
		let message = res.statusText
		try {
			const body = (await res.json()) as { message?: string | string[] }
			if (Array.isArray(body.message)) message = body.message.join(', ')
			else if (body.message) message = body.message
		} catch {
			// ignore
		}
		throw new Error(message)
	}

	if (res.status === 204) return undefined as T

	const text = await res.text()
	if (!text) return undefined as T
	return JSON.parse(text) as T
}

export function buildQuery(
	params: Record<string, string | number | boolean | undefined | null>
): string {
	const sp = new URLSearchParams()
	for (const [k, v] of Object.entries(params)) {
		if (v === undefined || v === null || v === '') continue
		if (typeof v === 'boolean') {
			if (!v) continue
			sp.set(k, 'true')
			continue
		}
		sp.set(k, String(v))
	}
	const s = sp.toString()
	return s ? `?${s}` : ''
}
