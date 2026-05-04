import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from '@nestjs/common'
import { EventType, Prisma, GuestStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateGuestDto } from './dto/create-guest.dto'
import { UpdateGuestDto } from './dto/update-guest.dto'
import { FilterGuestsDto } from './dto/filter-guests.dto'

@Injectable()
export class GuestsService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateGuestDto, userScope: EventType | null) {
		if (userScope && dto.type !== userScope) {
			throw new ForbiddenException('You can only create guests for your event scope')
		}
		if (dto.status === GuestStatus.ATTENDING_WITH_SPOUSE && !dto.partnerFullName?.trim()) {
			throw new BadRequestException('Partner full name is required when attending with spouse')
		}

		const guest = await this.prisma.guest.create({
			data: {
				fullName: dto.fullName.trim(),
				type: dto.type,
				status: dto.status,
				partnerFullName:
					dto.status === GuestStatus.ATTENDING_WITH_SPOUSE
						? dto.partnerFullName?.trim()
						: undefined,
				tags: dto.tagIds?.length ? { connect: dto.tagIds.map((id) => ({ id })) } : undefined,
			},
			include: { tags: true, table: true },
		})

		return guest
	}

	async findAll(filters: FilterGuestsDto, userScope: EventType | null) {
		const where: Prisma.GuestWhereInput = {}

		if (userScope) {
			where.type = userScope
		} else if (filters.type) {
			where.type = filters.type
		}

		if (filters.status) {
			where.status = filters.status
		}

		if (filters.search) {
			where.fullName = { contains: filters.search, mode: 'insensitive' }
		}

		if (filters.tagIds?.length) {
			where.tags = { some: { id: { in: filters.tagIds } } }
		}

		const [data, total] = await Promise.all([
			this.prisma.guest.findMany({
				where,
				include: { tags: true, table: true },
				orderBy: { createdAt: 'desc' },
				skip: filters.skip,
				take: filters.limit,
			}),
			this.prisma.guest.count({ where }),
		])

		return {
			data,
			meta: {
				total,
				page: filters.page,
				limit: filters.limit,
				totalPages: Math.ceil(total / (filters.limit ?? 20)),
			},
		}
	}

	async findOne(id: string, userScope: EventType | null) {
		const guest = await this.prisma.guest.findUnique({
			where: { id },
			include: { tags: true, table: true },
		})

		if (!guest) {
			throw new NotFoundException('Guest not found')
		}

		if (userScope && guest.type !== userScope) {
			throw new ForbiddenException('You do not have access to this guest')
		}

		return guest
	}

	async update(id: string, dto: UpdateGuestDto, userScope: EventType | null) {
		const guest = await this.findOne(id, userScope)

		const data: Prisma.GuestUpdateInput = {}
		if (dto.fullName !== undefined) data.fullName = dto.fullName
		if (dto.status !== undefined) data.status = dto.status
		if (dto.partnerFullName !== undefined) data.partnerFullName = dto.partnerFullName
		if (dto.isDuplicate !== undefined) data.isDuplicate = dto.isDuplicate

		if (dto.tagIds !== undefined) {
			data.tags = { set: dto.tagIds.map((id) => ({ id })) }
		}

		const updated = await this.prisma.guest.update({
			where: { id },
			data,
			include: { tags: true, table: true },
		})

		if (dto.fullName && dto.fullName !== guest.fullName) {
			await this.detectDuplicates(updated.fullName, updated.type, updated.id)
		}

		return updated
	}

	async remove(id: string, userScope: EventType | null) {
		await this.findOne(id, userScope)
		await this.prisma.guest.delete({ where: { id } })
		return { message: 'Guest deleted' }
	}

	async getStats(userScope: EventType | null) {
		const where: Prisma.GuestWhereInput = {}
		if (userScope) {
			where.type = userScope
		}

		const [total, pending, attending, attendingWithSpouse, declined] = await Promise.all([
			this.prisma.guest.count({ where }),
			this.prisma.guest.count({ where: { ...where, status: 'PENDING' } }),
			this.prisma.guest.count({ where: { ...where, status: 'ATTENDING' } }),
			this.prisma.guest.count({
				where: { ...where, status: 'ATTENDING_WITH_SPOUSE' },
			}),
			this.prisma.guest.count({ where: { ...where, status: 'DECLINED' } }),
		])

		const totalAttendees = attending + attendingWithSpouse * 2

		return {
			total,
			pending,
			attending,
			attendingWithSpouse,
			declined,
			totalAttendees,
		}
	}

	async getDuplicates(userScope: EventType | null) {
		const where: Prisma.GuestWhereInput = { isDuplicate: true }
		if (userScope) {
			where.type = userScope
		}

		return this.prisma.guest.findMany({
			where,
			include: { tags: true },
			orderBy: { fullName: 'asc' },
		})
	}

	async detectDuplicatesForAll(userScope: EventType | null) {
		const where: Prisma.GuestWhereInput = {}
		if (userScope) {
			where.type = userScope
		}

		const guests = await this.prisma.guest.findMany({
			where,
			select: { id: true, fullName: true, type: true },
		})

		const groups = new Map<string, string[]>()
		for (const guest of guests) {
			const normalizedName = guest.fullName.trim().toLowerCase()
			const key = `${guest.type}:${normalizedName}`
			const ids = groups.get(key) ?? []
			ids.push(guest.id)
			groups.set(key, ids)
		}

		const duplicateIds = Array.from(groups.values())
			.filter((ids) => ids.length > 1)
			.flat()

		await this.prisma.guest.updateMany({
			where,
			data: { isDuplicate: false },
		})

		if (duplicateIds.length > 0) {
			await this.prisma.guest.updateMany({
				where: { id: { in: duplicateIds } },
				data: { isDuplicate: true },
			})
		}

		return {
			message: 'Duplicate detection completed',
			totalChecked: guests.length,
			duplicatesFound: duplicateIds.length,
		}
	}

	private async detectDuplicates(fullName: string, type: EventType, excludeId: string) {
		const duplicates = await this.prisma.guest.findMany({
			where: {
				fullName: { equals: fullName, mode: 'insensitive' },
				type,
				id: { not: excludeId },
			},
		})

		if (duplicates.length > 0) {
			const allIds = [excludeId, ...duplicates.map((d) => d.id)]
			await this.prisma.guest.updateMany({
				where: { id: { in: allIds } },
				data: { isDuplicate: true },
			})
		}
	}
}
