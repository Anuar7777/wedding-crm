import {
	Injectable,
	NotFoundException,
	ConflictException,
	ForbiddenException,
} from '@nestjs/common'
import { EventType, GuestStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTableDto } from './dto/create-table.dto'
import { UpdateTableDto } from './dto/update-table.dto'

@Injectable()
export class TablesService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateTableDto, userScope: EventType | null) {
		if (userScope && dto.type !== userScope) {
			throw new ForbiddenException('You can only create tables for your event scope')
		}

		const existing = await this.prisma.table.findUnique({
			where: { number_type: { number: dto.number, type: dto.type } },
		})

		if (existing) {
			throw new ConflictException(`Table #${dto.number} already exists for this event type`)
		}

		return this.prisma.table.create({
			data: {
				number: dto.number,
				capacity: dto.capacity ?? 12,
				type: dto.type,
			},
			include: { guests: true },
		})
	}

	async findAll(userScope: EventType | null, type?: EventType) {
		const effectiveType = userScope ?? type
		const where = effectiveType ? { type: effectiveType } : {}

		const tables = await this.prisma.table.findMany({
			where,
			include: {
				guests: { select: { id: true, fullName: true, status: true, partnerFullName: true } },
			},
			orderBy: { number: 'asc' },
		})

		return tables.map((table) => {
			const occupiedSeats = this.calculateOccupiedSeats(table.guests)
			return {
				...table,
				occupiedSeats,
				availableSeats: table.capacity - occupiedSeats,
			}
		})
	}

	async findOne(id: string, userScope: EventType | null) {
		const table = await this.prisma.table.findUnique({
			where: { id },
			include: {
				guests: { select: { id: true, fullName: true, status: true, partnerFullName: true } },
			},
		})

		if (!table) {
			throw new NotFoundException('Table not found')
		}

		if (userScope && table.type !== userScope) {
			throw new ForbiddenException('You do not have access to this table')
		}

		const occupiedSeats = this.calculateOccupiedSeats(table.guests)
		return {
			...table,
			occupiedSeats,
			availableSeats: table.capacity - occupiedSeats,
		}
	}

	async update(id: string, dto: UpdateTableDto, userScope: EventType | null) {
		const table = await this.findOne(id, userScope)

		if (dto.number !== undefined) {
			const duplicate = await this.prisma.table.findUnique({
				where: {
					number_type: { number: dto.number, type: table.type },
				},
			})
			if (duplicate && duplicate.id !== id) {
				throw new ConflictException(`Table #${dto.number} already exists for this event type`)
			}
		}

		return this.prisma.table.update({
			where: { id },
			data: dto,
			include: { guests: true },
		})
	}

	async remove(id: string, userScope: EventType | null) {
		await this.findOne(id, userScope)
		await this.prisma.table.delete({ where: { id } })
		return { message: 'Table deleted' }
	}

	async assignGuest(tableId: string, guestId: string, userScope: EventType | null) {
		const table = await this.findOne(tableId, userScope)

		const guest = await this.prisma.guest.findUnique({
			where: { id: guestId },
		})

		if (!guest) {
			throw new NotFoundException('Guest not found')
		}

		if (userScope && guest.type !== userScope) {
			throw new ForbiddenException('You do not have access to this guest')
		}

		if (guest.type !== table.type) {
			throw new ConflictException('Guest and table must belong to the same event type')
		}

		if (guest.tableId === tableId) {
			return this.prisma.guest.findUniqueOrThrow({
				where: { id: guestId },
				include: { table: true, tags: true },
			})
		}

		const neededSeats = guest.status === GuestStatus.ATTENDING_WITH_SPOUSE ? 2 : 1

		if (table.availableSeats < neededSeats) {
			throw new ConflictException(
				`Not enough seats. Available: ${table.availableSeats}, needed: ${neededSeats}`
			)
		}

		return this.prisma.guest.update({
			where: { id: guestId },
			data: { tableId },
			include: { table: true, tags: true },
		})
	}

	async unassignGuest(tableId: string, guestId: string, userScope: EventType | null) {
		await this.findOne(tableId, userScope)

		const guest = await this.prisma.guest.findUnique({
			where: { id: guestId },
		})

		if (!guest) {
			throw new NotFoundException('Guest not found')
		}

		if (guest.tableId !== tableId) {
			throw new ConflictException('Guest is not seated at this table')
		}

		return this.prisma.guest.update({
			where: { id: guestId },
			data: { tableId: null },
			include: { table: true, tags: true },
		})
	}

	private calculateOccupiedSeats(guests: { status: string }[]): number {
		return guests.reduce(
			(sum, g) => sum + (g.status === GuestStatus.ATTENDING_WITH_SPOUSE ? 2 : 1),
			0
		)
	}
}
