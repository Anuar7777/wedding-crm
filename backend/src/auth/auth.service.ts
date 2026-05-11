import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import ms, { type StringValue } from 'ms'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private configService: ConfigService
	) {}

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		})

		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const passwordValid = await argon2.verify(user.password, dto.password)
		if (!passwordValid) {
			throw new UnauthorizedException('Invalid credentials')
		}

		return this.generateTokens(user.id, user.email)
	}

	async refreshTokens(userId: string, refreshToken: string) {
		const tokenRecords = await this.prisma.refreshToken.findMany({
			where: { userId },
		})

		if (tokenRecords.length === 0) {
			throw new ForbiddenException('Access denied')
		}

		let matchedToken: (typeof tokenRecords)[number] | null = null
		for (const record of tokenRecords) {
			const isMatch = await argon2.verify(record.tokenHash, refreshToken)
			if (isMatch) {
				matchedToken = record
				break
			}
		}

		if (!matchedToken) {
			throw new ForbiddenException('Access denied')
		}

		if (matchedToken.expiresAt < new Date()) {
			await this.prisma.refreshToken.delete({
				where: { id: matchedToken.id },
			})
			throw new ForbiddenException('Refresh token expired')
		}

		await this.prisma.refreshToken.delete({
			where: { id: matchedToken.id },
		})

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			throw new ForbiddenException('Access denied')
		}

		return this.generateTokens(user.id, user.email)
	}

	async logout(userId: string, refreshToken: string) {
		const tokenRecords = await this.prisma.refreshToken.findMany({
			where: { userId },
		})

		for (const record of tokenRecords) {
			const isMatch = await argon2.verify(record.tokenHash, refreshToken)
			if (isMatch) {
				await this.prisma.refreshToken.delete({
					where: { id: record.id },
				})
				return
			}
		}
	}

	private async generateTokens(userId: string, email: string) {
		const payload = { sub: userId, email }

		const accessExpiration = this.configService.getOrThrow<StringValue>('JWT_ACCESS_EXPIRATION')
		const refreshExpiration = this.configService.getOrThrow<StringValue>('JWT_REFRESH_EXPIRATION')

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
				expiresIn: accessExpiration,
			}),
			this.jwtService.signAsync(payload, {
				secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
				expiresIn: refreshExpiration,
			}),
		])

		const tokenHash = await argon2.hash(refreshToken)
		const expiresAt = new Date()
		expiresAt.setTime(expiresAt.getTime() + ms(refreshExpiration))

		await this.prisma.refreshToken.create({
			data: {
				tokenHash,
				userId,
				expiresAt,
			},
		})

		return { accessToken, refreshToken }
	}
}
