import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { UnauthorizedException } from '@nestjs/common'
interface RefreshTokenBody {
	refreshToken?: string
}

interface JwtRefreshPayload {
	sub: string
	email: string
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
			passReqToCallback: true,
		})
	}

	validate(
		req: Request<Record<string, never>, unknown, RefreshTokenBody>,
		payload: JwtRefreshPayload
	) {
		const refreshToken = req.body.refreshToken
		if (!refreshToken) {
			throw new UnauthorizedException('Refresh token is required')
		}
		return { ...payload, refreshToken }
	}
}
