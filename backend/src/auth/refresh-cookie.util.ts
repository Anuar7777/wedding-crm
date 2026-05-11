import { ConfigService } from '@nestjs/config'
import type { CookieOptions } from 'express'
import ms from 'ms'
import type { StringValue } from 'ms'

export function refreshCookieName(config: ConfigService): string {
	return config.get<string>('REFRESH_COOKIE_NAME') || 'crm_refresh'
}

function cookieSecure(config: ConfigService): boolean {
	if (config.get<string>('NODE_ENV') === 'production') return true
	return config.get<string>('REFRESH_COOKIE_SECURE') === 'true'
}

function cookieSameSite(config: ConfigService): 'lax' | 'strict' {
	const raw = (config.get<string>('REFRESH_COOKIE_SAMESITE') || 'lax').toLowerCase()
	return raw === 'strict' ? 'strict' : 'lax'
}

export function refreshCookieMaxAgeMs(config: ConfigService): number {
	const exp = config.get<string>('JWT_REFRESH_EXPIRATION') || '7d'
	const value = ms(exp as StringValue)
	if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
		return ms('7d')
	}
	return value
}

export function refreshCookieOptions(config: ConfigService): CookieOptions {
	return {
		httpOnly: true,
		secure: cookieSecure(config),
		sameSite: cookieSameSite(config),
		path: config.get<string>('REFRESH_COOKIE_PATH') || '/api/auth',
		maxAge: refreshCookieMaxAgeMs(config),
	}
}

/** Options for `clearCookie` — must match path / sameSite / secure used when setting. */
export function refreshCookieClearOptions(config: ConfigService): CookieOptions {
	const { path, httpOnly, secure, sameSite } = refreshCookieOptions(config)
	return { path, httpOnly, secure, sameSite }
}
