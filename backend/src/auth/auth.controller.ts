import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { TokensResponseDto } from './dto/tokens-response.dto'
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

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
