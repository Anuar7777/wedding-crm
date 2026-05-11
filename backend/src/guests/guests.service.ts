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
import { DUPLICATE_GUEST_TAG_NAME } from './guests.constants'
import { namesSimilar, normalizePersonName } from './duplicate-name.util'
import { TablesService } from '../tables/tables.service'

type GuestForDupScan = {
	id: string
	fullName: string
	partnerFullName: string | null
	tags: { id: string; name: string }[]
}

@Injectable()
export class GuestsService {
	constructor(
		private prisma: PrismaService,
		private tablesService: TablesService
	) {}

	private buildTypeWhere(userScope: EventType | null, type?: EventType): Prisma.GuestWhereInput {
		const where: Prisma.GuestWhereInput = {}
		if (userScope) {
			where.type = userScope
		} else if (type) {
			where.type = type
		}
		return where
	}

	private tokensForGuest(g: Pick<GuestForDupScan, 'fullName' | 'partnerFullName'>): string[] {
		const a = normalizePersonName(g.fullName)
		const b = normalizePersonName(g.partnerFullName)
		const out: string[] = []
		if (a) out.push(a)
		if (b) out.push(b)
		return out
	}

	private guestsAreDuplicatePair(a: GuestForDupScan, b: GuestForDupScan): boolean {
		const ta = this.tokensForGuest(a)
		const tb = this.tokensForGuest(b)
		for (const x of ta) {
			for (const y of tb) {
				if (namesSimilar(x, y)) return true
			}
		}
		return false
	}

	async create(dto: CreateGuestDto, userScope: EventType | null) {
		if (userScope && dto.type !== userScope) {
			throw new ForbiddenException('You can only create guests for your event scope')
		}
		const status = dto.status ?? GuestStatus.ATTENDING
		if (status === GuestStatus.ATTENDING_WITH_SPOUSE && !dto.partnerFullName?.trim()) {
			throw new BadRequestException('Partner full name is required when attending with spouse')
		}

		if (dto.tagIds?.length) {
			const tags = await this.prisma.tag.findMany({
				where: { id: { in: dto.tagIds } },
				select: { id: true, type: true },
			})
			if (tags.length !== dto.tagIds.length) {
				throw new NotFoundException('One or more tags were not found')
			}
			for (const t of tags) {
				if (t.type !== dto.type) {
					throw new BadRequestException('All tags must belong to the same event type as the guest')
				}
			}
		}

		const created = await this.prisma.guest.create({
			data: {
				fullName: dto.fullName.trim(),
				type: dto.type,
				status,
				partnerFullName:
					status === GuestStatus.ATTENDING_WITH_SPOUSE ? dto.partnerFullName?.trim() : undefined,
				tags: dto.tagIds?.length ? { connect: dto.tagIds.map((id) => ({ id })) } : undefined,
				statusEvents: {
					create: [{ status }],
				},
			},
			include: { tags: true, table: true },
		})

		if (dto.tableId) {
			return this.tablesService.assignGuest(dto.tableId, created.id, userScope)
		}

		return created
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

		if (filters.search?.trim()) {
			const q = filters.search.trim()
			where.OR = [
				{ fullName: { contains: q, mode: 'insensitive' } },
				{ partnerFullName: { contains: q, mode: 'insensitive' } },
			]
		}

		if (filters.tagIds?.length) {
			where.tags = { some: { id: { in: filters.tagIds } } }
		}

		if (filters.unassigned) {
			where.tableId = null
			if (filters.seatingPicklist) {
				where.status = { in: [GuestStatus.ATTENDING, GuestStatus.ATTENDING_WITH_SPOUSE] }
			}
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

		if (dto.tagIds !== undefined) {
			data.tags = { set: dto.tagIds.map((tid) => ({ id: tid })) }
		}

		if (dto.tableId === null) {
			data.table = { disconnect: true }
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

		if (dto.tableId !== undefined && dto.tableId !== null && dto.tableId !== guest.tableId) {
			return this.tablesService.assignGuest(dto.tableId, id, userScope)
		}

		return updated
	}

	async remove(id: string, userScope: EventType | null) {
		const guest = await this.prisma.guest.findUnique({
			where: { id },
			select: { id: true, type: true },
		})
		if (!guest) {
			throw new NotFoundException('Guest not found')
		}
		if (userScope && guest.type !== userScope) {
			throw new ForbiddenException('You do not have access to this guest')
		}
		await this.prisma.guest.delete({ where: { id } })
		return { message: 'Guest deleted' }
	}

	async getStats(userScope: EventType | null, type?: EventType) {
		const where = this.buildTypeWhere(userScope, type)
		const effectiveType = userScope ?? type
		const duplicateTagFilter: Prisma.TagWhereInput = { name: DUPLICATE_GUEST_TAG_NAME }
		if (effectiveType) {
			duplicateTagFilter.type = effectiveType
		}

		const duplicateGuestWhere: Prisma.GuestWhereInput = {
			...where,
			tags: { some: duplicateTagFilter },
		}

		const [
			total,
			unassigned,
			attending,
			attendingWithSpouse,
			declined,
			duplicates,
			unassignedAttending,
			unassignedWithSpouse,
		] = await Promise.all([
			this.prisma.guest.count({ where }),
			this.prisma.guest.count({ where: { ...where, tableId: null } }),
			this.prisma.guest.count({ where: { ...where, status: 'ATTENDING' } }),
			this.prisma.guest.count({
				where: { ...where, status: 'ATTENDING_WITH_SPOUSE' },
			}),
			this.prisma.guest.count({ where: { ...where, status: 'DECLINED' } }),
			this.prisma.guest.count({ where: duplicateGuestWhere }),
			this.prisma.guest.count({
				where: {
					...where,
					tableId: null,
					status: GuestStatus.ATTENDING,
				},
			}),
			this.prisma.guest.count({
				where: {
					...where,
					tableId: null,
					status: GuestStatus.ATTENDING_WITH_SPOUSE,
				},
			}),
		])

		const totalAttendees = attending + attendingWithSpouse * 2
		const unassignedConfirmedSeats = unassignedAttending + unassignedWithSpouse * 2

		return {
			total,
			unassigned,
			unassignedConfirmedSeats,
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

		const rows = await this.prisma.$queryRaw<Array<{ day: Date; count: number }>>(
			Prisma.sql`
				SELECT (e.recorded_at AT TIME ZONE 'UTC')::date AS day,
					COUNT(*)::int AS count
				FROM guest_status_events e
				INNER JOIN guests g ON g.id = e.guest_id
				WHERE e.recorded_at >= ${from}
					AND e.recorded_at <= ${to}
					AND e.status IN ('ATTENDING'::"GuestStatus", 'ATTENDING_WITH_SPOUSE'::"GuestStatus")
					AND g.type = ${effectiveType}::"EventType"
				GROUP BY 1
				ORDER BY 1
			`
		)

		const countsByDay = new Map<string, number>()
		for (const row of rows) {
			const key = row.day.toISOString().slice(0, 10)
			countsByDay.set(key, Number(row.count))
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
		const whereGuest: Prisma.GuestWhereInput = {
			tags: { some: { name: DUPLICATE_GUEST_TAG_NAME } },
		}
		if (userScope) {
			whereGuest.type = userScope
		}

		return this.prisma.guest.findMany({
			where: whereGuest,
			include: { tags: true },
			orderBy: { fullName: 'asc' },
		})
	}

	async detectDuplicatesForAll(userScope: EventType | null) {
		const types: EventType[] = userScope
			? [userScope]
			: [EventType.WEDDING, EventType.BRIDE_FAREWELL]

		let totalChecked = 0
		let guestsTagged = 0

		for (const type of types) {
			const tag = await this.prisma.tag.upsert({
				where: {
					name_type: { name: DUPLICATE_GUEST_TAG_NAME, type },
				},
				create: { name: DUPLICATE_GUEST_TAG_NAME, type },
				update: {},
			})

			const guests = await this.prisma.guest.findMany({
				where: { type },
				select: {
					id: true,
					fullName: true,
					partnerFullName: true,
					tags: { select: { id: true, name: true } },
				},
			})

			totalChecked += guests.length

			const flagged = new Set<string>()
			for (let i = 0; i < guests.length; i++) {
				for (let j = i + 1; j < guests.length; j++) {
					if (this.guestsAreDuplicatePair(guests[i], guests[j])) {
						flagged.add(guests[i].id)
						flagged.add(guests[j].id)
					}
				}
			}

			for (const id of flagged) {
				const already = await this.prisma.guest.count({
					where: { id, tags: { some: { id: tag.id } } },
				})
				if (already > 0) continue
				await this.prisma.guest.update({
					where: { id },
					data: { tags: { connect: { id: tag.id } } },
				})
				guestsTagged += 1
			}
		}

		return {
			message: 'Duplicate detection completed',
			totalChecked,
			guestsTagged,
		}
	}
}
