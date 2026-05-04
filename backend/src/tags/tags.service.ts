import {
	Injectable,
	NotFoundException,
	ConflictException,
	ForbiddenException,
} from '@nestjs/common'
import { EventType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTagDto } from './dto/create-tag.dto'
import { UpdateTagDto } from './dto/update-tag.dto'

@Injectable()
export class TagsService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateTagDto, userScope: EventType | null) {
		if (userScope && dto.type !== userScope) {
			throw new ForbiddenException('You can only create tags for your event scope')
		}

		const existing = await this.prisma.tag.findUnique({
			where: { name_type: { name: dto.name, type: dto.type } },
		})

		if (existing) {
			throw new ConflictException(`Tag "${dto.name}" already exists for this event type`)
		}

		return this.prisma.tag.create({
			data: { name: dto.name, type: dto.type },
		})
	}

	async findAll(userScope: EventType | null, type?: EventType) {
		const effectiveType = userScope ?? type

		const where = effectiveType ? { type: effectiveType } : {}

		return this.prisma.tag.findMany({
			where,
			include: { _count: { select: { guests: true } } },
			orderBy: { name: 'asc' },
		})
	}

	async findOne(id: string, userScope: EventType | null) {
		const tag = await this.prisma.tag.findUnique({
			where: { id },
			include: { _count: { select: { guests: true } } },
		})

		if (!tag) {
			throw new NotFoundException('Tag not found')
		}

		if (userScope && tag.type !== userScope) {
			throw new ForbiddenException('You do not have access to this tag')
		}

		return tag
	}

	async update(id: string, dto: UpdateTagDto, userScope: EventType | null) {
		const tag = await this.findOne(id, userScope)

		const duplicate = await this.prisma.tag.findUnique({
			where: { name_type: { name: dto.name, type: tag.type } },
		})

		if (duplicate && duplicate.id !== id) {
			throw new ConflictException(`Tag "${dto.name}" already exists for this event type`)
		}

		return this.prisma.tag.update({
			where: { id },
			data: { name: dto.name },
		})
	}

	async remove(id: string, userScope: EventType | null) {
		await this.findOne(id, userScope)
		await this.prisma.tag.delete({ where: { id } })
		return { message: 'Tag deleted' }
	}
}
