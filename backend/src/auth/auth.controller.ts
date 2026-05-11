import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { AccessTokenResponseDto } from './dto/access-token-response.dto'
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '../common/types/authenticated-user.interface'
import {
	refreshCookieClearOptions,
	refreshCookieName,
	refreshCookieOptions,
} from './refresh-cookie.util'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Current authenticated user' })
	me(@CurrentUser() user: AuthenticatedUser) {
		return {
			id: user.id,
			email: user.email,
			role: user.role,
			scope: user.scope,
		}
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Login with email and password',
		description:
			'Returns access JWT in JSON and sets HttpOnly refresh cookie (Secure in production, SameSite per REFRESH_COOKIE_SAMESITE).',
	})
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response
	): Promise<AccessTokenResponseDto> {
		const { accessToken, refreshToken } = await this.authService.login(dto)
		const name = refreshCookieName(this.configService)
		res.cookie(name, refreshToken, refreshCookieOptions(this.configService))
		return { accessToken }
	}

	@Post('refresh')
	@UseGuards(JwtRefreshGuard)
	@ApiCookieAuth('refresh')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Refresh access token',
		description:
			'Reads refresh JWT from HttpOnly cookie; returns new access token and rotates refresh cookie.',
	})
	async refresh(
		@CurrentUser('sub') userId: string,
		@CurrentUser('refreshToken') refreshToken: string,
		@Res({ passthrough: true }) res: Response
	): Promise<AccessTokenResponseDto> {
		const { accessToken, refreshToken: nextRefresh } = await this.authService.refreshTokens(
			userId,
			refreshToken
		)
		const name = refreshCookieName(this.configService)
		res.cookie(name, nextRefresh, refreshCookieOptions(this.configService))
		return { accessToken }
	}

	@Post('logout')
	@UseGuards(JwtRefreshGuard)
	@ApiCookieAuth('refresh')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Logout and invalidate refresh token',
		description: 'Clears refresh cookie and revokes stored refresh hash.',
	})
	async logout(
		@CurrentUser('sub') userId: string,
		@CurrentUser('refreshToken') refreshToken: string,
		@Res({ passthrough: true }) res: Response
	): Promise<void> {
		await this.authService.logout(userId, refreshToken)
		const name = refreshCookieName(this.configService)
		res.clearCookie(name, refreshCookieClearOptions(this.configService))
	}
}
