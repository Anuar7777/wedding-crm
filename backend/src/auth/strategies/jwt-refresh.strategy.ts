import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { Request } from 'express'
import { refreshCookieName } from '../refresh-cookie.util'

interface JwtRefreshPayload {
	sub: string
	email: string
}

function readRefreshCookie(req: Request, cookieName: string): string | null {
	const jar: unknown = req.cookies
	if (!jar || typeof jar !== 'object') return null
	const raw: unknown = (jar as Record<string, unknown>)[cookieName]
	return typeof raw === 'string' && raw.length > 0 ? raw : null
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	private readonly cookieName: string

	constructor(private readonly configService: ConfigService) {
		const cookieName = refreshCookieName(configService)
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => readRefreshCookie(req, cookieName),
			]),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
			passReqToCallback: true,
		})
		this.cookieName = cookieName
	}

	validate(req: Request, payload: JwtRefreshPayload) {
		const refreshToken = readRefreshCookie(req, this.cookieName)
		if (!refreshToken) {
			throw new UnauthorizedException('Refresh token is required')
		}
		return { ...payload, refreshToken }
	}
}
