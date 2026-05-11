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
import { StatusTimelineQueryDto } from './dto/status-timeline-query.dto'
import { BulkDeleteGuestsDto } from './dto/bulk-delete-guests.dto'
import { BulkTagsGuestsDto } from './dto/bulk-tags-guests.dto'

@Injectable()
export class GuestsService {
	constructor(private prisma: PrismaService) {}

	private buildTypeWhere(userScope: EventType | null, type?: EventType): Prisma.GuestWhereInput {
		const where: Prisma.GuestWhereInput = {}
		if (userScope) {
			where.type = userScope
		} else if (type) {
			where.type = type
		}
		return where
	}

	async create(dto: CreateGuestDto, userScope: EventType | null) {
		if (userScope && dto.type !== userScope) {
			throw new ForbiddenException('You can only create guests for your event scope')
		}
		const status = dto.status ?? GuestStatus.PENDING
		if (status === GuestStatus.ATTENDING_WITH_SPOUSE && !dto.partnerFullName?.trim()) {
			throw new BadRequestException('Partner full name is required when attending with spouse')
		}

		return this.prisma.$transaction(async (tx) => {
			const guest = await tx.guest.create({
				data: {
					fullName: dto.fullName.trim(),
					type: dto.type,
					status,
					partnerFullName:
						status === GuestStatus.ATTENDING_WITH_SPOUSE ? dto.partnerFullName?.trim() : undefined,
					tags: dto.tagIds?.length ? { connect: dto.tagIds.map((id) => ({ id })) } : undefined,
				},
				include: { tags: true, table: true },
			})

			await tx.guestStatusEvent.create({
				data: { guestId: guest.id, status: guest.status },
			})

			return guest
		})
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

		if (filters.unassigned) {
			where.tableId = null
		} else if (filters.tableId) {
			where.tableId = filters.tableId
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

		const nextStatus = dto.status ?? guest.status
		if (nextStatus === GuestStatus.ATTENDING_WITH_SPOUSE) {
			const partner = dto.partnerFullName ?? guest.partnerFullName
			if (!partner?.trim()) {
				throw new BadRequestException('Partner full name is required when attending with spouse')
			}
		}

		const data: Prisma.GuestUpdateInput = {}
		if (dto.fullName !== undefined) data.fullName = dto.fullName
		if (dto.status !== undefined) data.status = dto.status
		if (dto.partnerFullName !== undefined) data.partnerFullName = dto.partnerFullName
		if (dto.isDuplicate !== undefined) data.isDuplicate = dto.isDuplicate

		if (dto.tagIds !== undefined) {
			data.tags = { set: dto.tagIds.map((tid) => ({ id: tid })) }
		}

		const statusChanged = dto.status !== undefined && dto.status !== guest.status

		const updated = await this.prisma.$transaction(async (tx) => {
			const g = await tx.guest.update({
				where: { id },
				data,
				include: { tags: true, table: true },
			})

			if (statusChanged && dto.status !== undefined) {
				await tx.guestStatusEvent.create({
					data: { guestId: id, status: dto.status },
				})
			}

			return g
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

	async getStats(userScope: EventType | null, type?: EventType) {
		const where = this.buildTypeWhere(userScope, type)

		const [total, pending, attending, attendingWithSpouse, declined, duplicates] =
			await Promise.all([
				this.prisma.guest.count({ where }),
				this.prisma.guest.count({ where: { ...where, status: 'PENDING' } }),
				this.prisma.guest.count({ where: { ...where, status: 'ATTENDING' } }),
				this.prisma.guest.count({
					where: { ...where, status: 'ATTENDING_WITH_SPOUSE' },
				}),
				this.prisma.guest.count({ where: { ...where, status: 'DECLINED' } }),
				this.prisma.guest.count({ where: { ...where, isDuplicate: true } }),
			])

		const totalAttendees = attending + attendingWithSpouse * 2

		return {
			total,
			pending,
			attending,
			attendingWithSpouse,
			declined,
			totalAttendees,
			duplicates,
		}
	}

	async getStatusTimeline(userScope: EventType | null, query: StatusTimelineQueryDto) {
		const effectiveType = userScope ?? query.type
		if (!effectiveType) {
			throw new BadRequestException(
				'Query parameter "type" is required when user has no event scope'
			)
		}

		const to = query.to ? new Date(query.to) : new Date()
		const from = query.from ? new Date(query.from) : new Date(to.getTime() - 90 * 86400000)

		if (from > to) {
			throw new BadRequestException('"from" must be before "to"')
		}

		const events = await this.prisma.guestStatusEvent.findMany({
			where: {
				recordedAt: { gte: from, lte: to },
				status: { in: [GuestStatus.ATTENDING, GuestStatus.ATTENDING_WITH_SPOUSE] },
				guest: { type: effectiveType },
			},
			select: { recordedAt: true },
		})

		const countsByDay = new Map<string, number>()
		for (const e of events) {
			const key = e.recordedAt.toISOString().slice(0, 10)
			countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1)
		}

		const series: { date: string; confirmations: number }[] = []
		const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
		const endDay = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()))
		while (cursor <= endDay) {
			const key = cursor.toISOString().slice(0, 10)
			series.push({ date: key, confirmations: countsByDay.get(key) ?? 0 })
			cursor.setUTCDate(cursor.getUTCDate() + 1)
		}

		return { type: effectiveType, from: from.toISOString(), to: to.toISOString(), series }
	}

	async bulkDelete(dto: BulkDeleteGuestsDto, userScope: EventType | null) {
		const guests = await this.prisma.guest.findMany({
			where: { id: { in: dto.ids } },
			select: { id: true, type: true },
		})

		if (guests.length !== dto.ids.length) {
			throw new NotFoundException('One or more guests were not found')
		}

		if (userScope) {
			for (const g of guests) {
				if (g.type !== userScope) {
					throw new ForbiddenException('You can only delete guests in your event scope')
				}
			}
		}

		await this.prisma.guest.deleteMany({ where: { id: { in: dto.ids } } })
		return { deleted: dto.ids.length }
	}

	async bulkSetTags(dto: BulkTagsGuestsDto, userScope: EventType | null) {
		const guests = await this.prisma.guest.findMany({
			where: { id: { in: dto.ids } },
			select: { id: true, type: true },
		})

		if (guests.length !== dto.ids.length) {
			throw new NotFoundException('One or more guests were not found')
		}

		const eventType = guests[0].type
		for (const g of guests) {
			if (userScope && g.type !== userScope) {
				throw new ForbiddenException('You can only update guests in your event scope')
			}
			if (g.type !== eventType) {
				throw new BadRequestException('All selected guests must belong to the same event type')
			}
		}

		if (dto.tagIds.length > 0) {
			const tags = await this.prisma.tag.findMany({
				where: { id: { in: dto.tagIds } },
				select: { id: true, type: true },
			})
			if (tags.length !== dto.tagIds.length) {
				throw new NotFoundException('One or more tags were not found')
			}
			for (const t of tags) {
				if (t.type !== eventType) {
					throw new BadRequestException('All tags must belong to the same event type as the guests')
				}
			}
		}

		await this.prisma.$transaction(
			dto.ids.map((guestId) =>
				this.prisma.guest.update({
					where: { id: guestId },
					data: { tags: { set: dto.tagIds.map((tid) => ({ id: tid })) } },
				})
			)
		)

		return { updated: dto.ids.length }
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
