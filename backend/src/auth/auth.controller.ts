import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { TokensResponseDto } from './dto/tokens-response.dto'
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '../common/types/authenticated-user.interface'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

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
	@ApiOperation({ summary: 'Login with email and password' })
	async login(@Body() dto: LoginDto): Promise<TokensResponseDto> {
		return this.authService.login(dto)
	}

	@Post('refresh')
	@UseGuards(JwtRefreshGuard)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Refresh access token using refresh token' })
	async refresh(
		@CurrentUser('sub') userId: string,
		@Body() dto: RefreshDto
	): Promise<TokensResponseDto> {
		return this.authService.refreshTokens(userId, dto.refreshToken)
	}

	@Post('logout')
	@UseGuards(JwtRefreshGuard)
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Logout and invalidate refresh token' })
	async logout(@CurrentUser('sub') userId: string, @Body() dto: RefreshDto): Promise<void> {
		return this.authService.logout(userId, dto.refreshToken)
	}
}
