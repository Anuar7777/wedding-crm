const ACCESS_KEY = 'crm_access_token'
const REFRESH_KEY = 'crm_refresh_token'

function getApiBase(): string {
	const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
	if (!raw) {
		throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured')
	}
	return raw.replace(/\/$/, '')
}

export function getAccessToken(): string | null {
	if (typeof window === 'undefined') return null
	return localStorage.getItem(ACCESS_KEY)
}

export function setTokens(access: string, refresh: string) {
	localStorage.setItem(ACCESS_KEY, access)
	localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
	localStorage.removeItem(ACCESS_KEY)
	localStorage.removeItem(REFRESH_KEY)
}

async function tryRefresh(): Promise<boolean> {
	if (typeof window === 'undefined') return false
	const refresh = localStorage.getItem(REFRESH_KEY)
	if (!refresh) return false
	const res = await fetch(`${getApiBase()}/api/auth/refresh`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ refreshToken: refresh }),
	})
	if (!res.ok) return false
	const body = (await res.json()) as { accessToken: string; refreshToken: string }
	setTokens(body.accessToken, body.refreshToken)
	return true
}

export type ApiOptions = RequestInit & {
	skipAuth?: boolean
}

export async function apiJson<T>(path: string, init?: ApiOptions): Promise<T> {
	const base = getApiBase()
	const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`

	const headers = new Headers(init?.headers ?? {})
	if (!init?.skipAuth && typeof window !== 'undefined') {
		const access = localStorage.getItem(ACCESS_KEY)
		if (access) headers.set('Authorization', `Bearer ${access}`)
	}
	if (
		init?.body !== undefined &&
		!(init.body instanceof FormData) &&
		!headers.has('Content-Type')
	) {
		headers.set('Content-Type', 'application/json')
	}

	let res = await fetch(url, { ...init, headers })

	if (res.status === 401 && !init?.skipAuth) {
		const refreshed = await tryRefresh()
		if (refreshed) {
			const h2 = new Headers(init?.headers ?? {})
			const access2 = localStorage.getItem(ACCESS_KEY)
			if (access2) h2.set('Authorization', `Bearer ${access2}`)
			if (init?.body !== undefined && !(init.body instanceof FormData) && !h2.has('Content-Type')) {
				h2.set('Content-Type', 'application/json')
			}
			res = await fetch(url, { ...init, headers: h2 })
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
