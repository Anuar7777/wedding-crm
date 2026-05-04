import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import * as argon2 from 'argon2'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateUserDto) {
		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
		})

		if (existing) {
			throw new ConflictException('User with this email already exists')
		}

		const hashedPassword = await argon2.hash(dto.password)

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				password: hashedPassword,
				role: dto.role,
				scope: dto.scope,
			},
			select: {
				id: true,
				email: true,
				role: true,
				scope: true,
				telegramChatId: true,
				createdAt: true,
			},
		})

		return user
	}

	async findAll() {
		return this.prisma.user.findMany({
			select: {
				id: true,
				email: true,
				role: true,
				scope: true,
				telegramChatId: true,
				createdAt: true,
			},
			orderBy: { createdAt: 'desc' },
		})
	}

	async findOne(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				role: true,
				scope: true,
				telegramChatId: true,
				createdAt: true,
			},
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		return user
	}

	async update(id: string, dto: UpdateUserDto) {
		await this.findOne(id)

		return this.prisma.user.update({
			where: { id },
			data: dto,
			select: {
				id: true,
				email: true,
				role: true,
				scope: true,
				telegramChatId: true,
				createdAt: true,
			},
		})
	}

	async remove(id: string) {
		await this.findOne(id)

		await this.prisma.user.delete({ where: { id } })
		return { message: 'User deleted' }
	}

	async resetPassword(id: string, newPassword: string) {
		await this.findOne(id)

		const hashedPassword = await argon2.hash(newPassword)

		await this.prisma.$transaction([
			this.prisma.user.update({
				where: { id },
				data: { password: hashedPassword },
			}),
			this.prisma.refreshToken.deleteMany({ where: { userId: id } }),
		])

		return { message: 'Password reset successfully' }
	}
}
